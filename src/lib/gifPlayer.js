/**
 * 内容导向的 GIF / APNG / Animated WebP 解析与播放器。
 *
 * 与「用副檔名猜測」不同，这里的判断依据全部来自档案实际内容：
 * 1. 读取文件的前几个字节，确认 magic header 是 "GIF87a"/"GIF89a"、PNG 签名，
 *    还是 WebP 的 "RIFF....WEBP" 签名（不管网址后缀写什么，都一律照实际内容判断）
 * 2. GIF：用 gifuct-js 把档案完整解压成一张一张的帧；
 *    PNG：用 UPNG.js 解析，若含有 acTL chunk（APNG 动画标记）才视为动图；
 *    WebP：交给浏览器原生的 ImageDecoder（WebCodecs API）解码每一帧——WebP
 *    的动画编码复杂度很高，不像前两者适合手刻或找现成的轻量纯 JS 解码库，
 *    改用浏览器内建解码器可以省去自己啃 VP8/VP8L 格式规范；不支持 ImageDecoder
 *    的浏览器（例如未支持前的 Firefox）会优雅降级为「解析失败」，交还静态图
 *    片管线处理，只是不会动，不会崩溃。
 *    三种格式都以帧数 > 1 才视为「动图」，只有 1 帧就当成一般静态图处理。
 *
 * 解码只会做一次：结果依网址缓存在 Map 里，之后同一个网址不会重复下载、
 * 不会重复解压缩。播放时只是从已经解码好的帧数组里，依时间挑出该显示的
 * 那一张帧（整数索引），并不会持续对图片做任何重新取样或反复的网络请求。
 *
 * 缓存不是永久的：每次某个网址被 getAnimatedImage 读取到都会刷新其 lastUsed
 * 戳记，若一张图片长时间不再被任何图层引用（道具移除、网址被改掉等，等同于
 * 「画面上已经不存在」），cacheGC 会自动把它的缓存条目（含解码出来的整批帧
 * canvas）清除掉，释放内存；详见 cacheGC.js。
 */
import { parseGIF, decompressFrames } from "gifuct-js";
import UPNG from "upng-js";
import { Logger, L } from "./utils.js";
import { registerPrunableCache } from "./cacheGC.js";

/** @type {Map<string, GifEntry>} */
const _gifCache = new Map();
registerPrunableCache(_gifCache, L("动图", "animated image"));

/**
 * @typedef {object} GifFrame
 * @property {HTMLCanvasElement} canvas - 该帧合成后的完整画面（尺寸等于 GIF 逻辑画布大小）
 * @property {number} delay - 此帧应显示的时间，单位毫秒
 */

/**
 * @typedef {object} GifEntry
 * @property {boolean} loaded - 是否已解码完成（含「确认不是 GIF」的情况）
 * @property {boolean} failed - 内容不是 GIF、或下载 / 解析失败时为 true（应改用一般静态图片管线）
 * @property {boolean} isAnimated - 解码后帧数 > 1，代表是真正的多帧动图
 * @property {GifFrame[]} frames
 * @property {number} totalDuration - 所有帧 delay 加总（毫秒），用来做循环播放的取模运算
 * @property {number} width
 * @property {number} height
 * @property {number} lastUsed - 最近一次被 getAnimatedImage 读取到的时间戳，
 *   供 cacheGC 判断这个网址是否已经「画面上看不到了」，进而释放解码出来的整批帧 canvas
 * @property {Set<Function>} _waiters - 「下载/解析还没完成前，想在完成时被通知一次」的回调集合，
 *   用途见 getAnimatedImage 的 onReady 参数说明
 */

/**
 * 通知所有正在等待这个 entry 完成的回调（图片就绪 / 确认失败时呼叫一次即清空）
 * @param {GifEntry} entry
 */
function notifyReady(entry) {
    entry._waiters.forEach((fn) => {
        try { fn(); } catch (err) { Logger.error("[ShuangAssets] 动图就绪回调执行失败", err); }
    });
    entry._waiters.clear();
}

// === 载入并发限制 + 分块解码 ===
//
// 背景：进入一个人多的聊天室时，很多角色的自定义贴图会在同一瞬间开始各自
// fetch + 解码，每一个都是主执行绪上的同步工作（parseGIF / decompressFrames /
// 逐帧 disposal 合成），大量同时发生时会叠加成一段肉眼可见的长任务卡顿。
// 这里做两件事来分摊这个负载：
// 1. 并发限制：同时间最多只有 MAX_CONCURRENT_DECODES 张 GIF 在做 fetch+解码，
//    其余排队；不影响正确性（谁先解码完不影响最终显示），只是把「同时挤在一起」
//    的负载摊开成「陆续完成」，避免瞬间尖峰。
// 2. 分块合成：单张 GIF 内部的逐帧 disposal 合成迴圈，每处理一小批帧就透过
//    setTimeout(0) 让出主执行绪一次，避免帧数很多、解析度很大的单一 GIF
//    自己就造成一次长任务。

/** 同时间最多允许几张 GIF 在做 fetch + 解码，其余排队等候 */
const MAX_CONCURRENT_DECODES = 3;
/** 分块合成时，每处理这么多帧就让出一次主执行绪 */
const COMPOSE_CHUNK_SIZE = 6;

let _activeDecodes = 0;
/** @type {(() => Promise<void>)[]} */
const _decodeQueue = [];

function _pumpDecodeQueue() {
    while (_activeDecodes < MAX_CONCURRENT_DECODES && _decodeQueue.length > 0) {
        const task = _decodeQueue.shift();
        _activeDecodes++;
        task().finally(() => {
            _activeDecodes--;
            _pumpDecodeQueue();
        });
    }
}

/**
 * 把一个 fetch+解码任务排进并发限制队列，返回其执行结果的 Promise
 * @param {() => Promise<void>} task
 * @returns {Promise<void>}
 */
function scheduleDecodeTask(task) {
    return new Promise((resolve, reject) => {
        _decodeQueue.push(() => task().then(resolve, reject));
        _pumpDecodeQueue();
    });
}

/** 一个 setTimeout(0) 包成 Promise，用于分块合成之间让出主执行绪 */
function _yieldToMainThread() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * 用 UPNG.js 解析 APNG，填入传入的 entry。
 *
 * 与 GIF 分支不同：UPNG.toRGBA8() 会依据每一帧 fcTL 里的 dispose_op / blend_op，
 * 直接吐出「合成好的完整画面」RGBA8 缓冲区数组，不需要像 GIF 那样自己手刻
 * disposal 合成逻辑（UPNG.js 内部已经做了等价的事）。
 *
 * 若该 PNG 没有 acTL chunk（代表只是普通静态 PNG，不是 APNG），或解压后只有
 * 1 帧，一律视为「不是动图」，交还给一般静态图片管线（entry.failed = true），
 * 行为与「不是 GIF 的一般图片」一致。
 * @param {ArrayBuffer} buffer
 * @param {GifEntry} entry
 */
async function decodeApng(buffer, entry) {
    const png = UPNG.decode(buffer);
    entry.width = png.width;
    entry.height = png.height;

    const frameCount = png.tabs && png.tabs.acTL ? png.frames.length : 1;
    entry.isAnimated = frameCount > 1;

    if (!entry.isAnimated) {
        entry.failed = true;
        return;
    }

    const rgbaFrames = UPNG.toRGBA8(png);

    for (let i = 0; i < rgbaFrames.length; i++) {
        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = entry.width || 1;
        frameCanvas.height = entry.height || 1;
        const ctx = frameCanvas.getContext("2d");
        const imageData = new ImageData(
            new Uint8ClampedArray(rgbaFrames[i]),
            entry.width,
            entry.height
        );
        ctx.putImageData(imageData, 0, 0);

        // fcTL 的 delay 已被 UPNG.js 换算成毫秒；0 或极短延迟比照 GIF 分支的惯例视为 100ms
        const rawDelay = png.frames[i].delay;
        const delay = rawDelay > 10 ? rawDelay : 100;

        entry.frames.push({ canvas: frameCanvas, delay });
        entry.totalDuration += delay;

        if ((i + 1) % COMPOSE_CHUNK_SIZE === 0 && i + 1 < rgbaFrames.length) {
            await _yieldToMainThread();
        }
    }
}

/**
 * 用浏览器原生 WebCodecs `ImageDecoder` API 解析 Animated WebP，填入传入的 entry。
 *
 * WebP 动画（VP8/VP8L 有损/无损混合帧 + ANIM/ANMF chunk）的编解码复杂度很高，
 * 不像 GIF/APNG 那样容易手刻或找到轻量的纯 JS 解码库，这里改用浏览器内建的
 * `ImageDecoder` 直接吐出每一帧解码好的 VideoFrame，画到 canvas 存成静态帧，
 * 用法与前两种格式共用同一份 entry.frames 结构，播放逻辑完全不用另外处理。
 *
 * 目前仅 Chromium 系（Chrome/Edge）与较新版本的 Safari 支持 `ImageDecoder`；
 * 不支持的浏览器（例如未支持前的 Firefox）一律视为「解析失败」，交还静态图片
 * 管线处理——退化成只显示第一帧、不会动，但不会报错或崩溃。
 * @param {ArrayBuffer} buffer
 * @param {GifEntry} entry
 */
async function decodeAnimatedWebp(buffer, entry) {
    if (typeof ImageDecoder === "undefined") {
        // 当前浏览器不支持 WebCodecs ImageDecoder，优雅降级为静态图处理
        entry.failed = true;
        return;
    }

    const decoder = new ImageDecoder({ data: buffer, type: "image/webp" });
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;

    // 没有 animated 标记，或只解出 1 帧：视为普通静态 WebP，交还静态图片管线
    if (!track || !track.animated || track.frameCount <= 1) {
        entry.failed = true;
        decoder.close();
        return;
    }

    const frameCount = track.frameCount;

    for (let i = 0; i < frameCount; i++) {
        const { image } = await decoder.decode({ frameIndex: i });

        if (i === 0) {
            entry.width = image.displayWidth;
            entry.height = image.displayHeight;
        }

        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = entry.width || 1;
        frameCanvas.height = entry.height || 1;
        frameCanvas.getContext("2d").drawImage(image, 0, 0);

        // VideoFrame.duration 单位是微秒；0 或极短延迟比照 GIF/APNG 分支的惯例视为 100ms
        const rawDelayMs = image.duration ? image.duration / 1000 : 0;
        const delay = rawDelayMs > 10 ? rawDelayMs : 100;

        image.close();

        entry.frames.push({ canvas: frameCanvas, delay });
        entry.totalDuration += delay;

        if ((i + 1) % COMPOSE_CHUNK_SIZE === 0 && i + 1 < frameCount) {
            await _yieldToMainThread();
        }
    }

    entry.isAnimated = true;
    decoder.close();
}

/**
 * 依内容解析动图，结果按网址缓存，同一网址只会解析一次。
 *
 * @param {string} url
 * @param {() => void} [onReady] - 可选：如果这个网址的下载/解析此刻还没完成，
 *   注册一个「完成（不论成功、失败、还是确认不是 GIF）时呼叫一次」的回调。
 *   用于渲染逻辑第一次读到「还没 ready，这一帧先跳过」时，顺便请求「解析完了
 *   通知我补画一次」，避免因为没有人再触发角色重绘，导致这一层贴图或该角色
 *   的整个动图播放循环一直无法真正开始（详见 render.js 的调用处）。
 *   已经完成的情况下不会注册，因为已经没有「等待」的必要
 * @returns {GifEntry} 若尚未解析完成，回传的物件 loaded 为 false，之后同一个 entry 物件的欄位会被就地更新
 */
export function getAnimatedImage(url, onReady) {
    let entry = _gifCache.get(url);
    if (entry) {
        entry.lastUsed = Date.now();
        if (onReady && !entry.loaded) entry._waiters.add(onReady);
        return entry;
    }

    entry = {
        loaded: false,
        failed: false,
        isAnimated: false,
        frames: [],
        totalDuration: 0,
        width: 0,
        height: 0,
        lastUsed: Date.now(),
        _waiters: new Set()
    };
    _gifCache.set(url, entry);
    if (onReady) entry._waiters.add(onReady);

    // fetch + 解码整体排进并发限制队列：房间人多、大量贴图同时开始加载时，
    // 同时间只会有最多 MAX_CONCURRENT_DECODES 个在实际做事，其余在队列里等，
    // 避免所有人的 GIF 同一瞬间一起挤爆主执行绪
    scheduleDecodeTask(() =>
        fetch(url, { mode: "cors", credentials: "omit" })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.arrayBuffer();
            })
            .then(async (buffer) => {
                const header = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
                const isGifHeader = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46; // "GIF"
                // PNG 完整签名是 8 bytes（89 50 4E 47 0D 0A 1A 0A），这里取前 4 bytes 已足够判断类型，
                // 真正校验交给 UPNG.decode 自己做（签名不对会 throw，被下面的 .catch 接住）
                const isPngHeader = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47; // PNG
                // WebP 是 RIFF 容器格式：bytes 0-3 "RIFF"，bytes 4-7 是档案长度（不检查），
                // bytes 8-11 才是真正标示内容类型的 "WEBP"
                const isWebpHeader = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 // "RIFF"
                    && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50; // "WEBP"

                if (isPngHeader) {
                    await decodeApng(buffer, entry);
                    entry.loaded = true;
                    notifyReady(entry);
                    return;
                }

                if (isWebpHeader) {
                    await decodeAnimatedWebp(buffer, entry);
                    entry.loaded = true;
                    notifyReady(entry);
                    return;
                }

                if (!isGifHeader) {
                    // 内容既不是 GIF、PNG 也不是 WebP（例如网址是 .gif 但实际给的是 jpg，或反过来）
                    // -> 交还给一般的静态图片管线（getCorsImage）处理，这里只标记失败即可
                    entry.failed = true;
                    entry.loaded = true;
                    notifyReady(entry);
                    return;
                }

                const gif = parseGIF(buffer);
                const rawFrames = decompressFrames(gif, true);

                entry.width = gif.lsd.width;
                entry.height = gif.lsd.height;
                // 依实际解压出的帧数判断，而不是看副檔名：只有 1 帧的 GIF 不算动图
                entry.isAnimated = rawFrames.length > 1;

                // 依 GIF 规范的 disposal 方式，把每一帧合成还原成「完整画布」大小的静态帧，
                // 一次性预先渲染好存起来。之后播放只是挑选已经画好的帧来贴，不会重复解码。
                //
                // disposal 的语意是「这一帧显示完之后，画布该如何处理，才能画下一帧」，
                // 所以套用的应该是「上一帧」的 disposalType，而不是「这一帧自己」的 disposalType；
                // 且 disposalType === 2 只须清除上一帧实际画到的那个矩形区域，不是整张画布清空。
                // disposalType === 3（还原到更早之前的状态）也一并处理，仿照 libgif.js 的做法：
                // 用「上一次 disposal 不是 3 时」的那张快照当还原依据。
                //
                // 分块处理：每合成 COMPOSE_CHUNK_SIZE 帧就让出一次主执行绪，避免帧数多、
                // 解析度大的单一 GIF 自己就造成一段长任务卡顿；不影响合成结果的正确性，
                // 因为每一帧的合成都依赖上一帧已经画好的 composeCanvas 状态，天生就是顺序的。
                const composeCanvas = document.createElement("canvas");
                composeCanvas.width = entry.width || 1;
                composeCanvas.height = entry.height || 1;
                const composeCtx = composeCanvas.getContext("2d");

                const patchCanvas = document.createElement("canvas");
                const patchCtx = patchCanvas.getContext("2d");

                let lastDisposalType = null;
                let lastDims = null;
                let disposalRestoreFromIdx = null;

                for (let currIdx = 0; currIdx < rawFrames.length; currIdx++) {
                    const frame = rawFrames[currIdx];
                    const { dims } = frame;

                    if (currIdx > 0) {
                        if (lastDisposalType === 3) {
                            // 还原到「上一次 disposal 不是 3」时的完整画面快照；
                            // 如果从头到现在每一帧都是 disposal 3（没有可还原的快照），退而求其次清除那块区域
                            if (disposalRestoreFromIdx !== null) {
                                composeCtx.clearRect(0, 0, entry.width, entry.height);
                                composeCtx.drawImage(entry.frames[disposalRestoreFromIdx].canvas, 0, 0);
                            } else if (lastDims) {
                                composeCtx.clearRect(lastDims.left, lastDims.top, lastDims.width, lastDims.height);
                            }
                        } else {
                            disposalRestoreFromIdx = currIdx - 1;
                        }

                        if (lastDisposalType === 2 && lastDims) {
                            // 还原成背景色：浏览器的历史实现一律还原成「透明」，这里比照办理
                            composeCtx.clearRect(lastDims.left, lastDims.top, lastDims.width, lastDims.height);
                        }
                        // disposalType 0 / 1（未指定 / 不处理）：画布维持上一帧画完的样子，不用做任何事
                    }

                    patchCanvas.width = dims.width || 1;
                    patchCanvas.height = dims.height || 1;
                    const patchImageData = patchCtx.createImageData(patchCanvas.width, patchCanvas.height);
                    patchImageData.data.set(frame.patch);
                    patchCtx.putImageData(patchImageData, 0, 0);

                    composeCtx.drawImage(patchCanvas, dims.left, dims.top);

                    // 必须现在就把目前完整画面另外存一份快照，因为 composeCanvas 之后还会被下一帧继续叠加
                    const frameCanvas = document.createElement("canvas");
                    frameCanvas.width = entry.width || 1;
                    frameCanvas.height = entry.height || 1;
                    frameCanvas.getContext("2d").drawImage(composeCanvas, 0, 0);

                    // gifuct-js 已把 delay 转换成毫秒；0 或极短的延迟依浏览器惯例视为 100ms，
                    // 避免部分工具导出的「0 延迟」帧造成播放速度失控或除以 0
                    const delay = frame.delay > 10 ? frame.delay : 100;

                    entry.frames.push({ canvas: frameCanvas, delay });
                    entry.totalDuration += delay;

                    lastDisposalType = frame.disposalType;
                    lastDims = dims;

                    if ((currIdx + 1) % COMPOSE_CHUNK_SIZE === 0 && currIdx + 1 < rawFrames.length) {
                        await _yieldToMainThread();
                    }
                }

                entry.loaded = true;
                notifyReady(entry);
            })
            .catch((err) => {
                entry.failed = true;
                entry.loaded = true;
                notifyReady(entry);
                Logger.warn(L(
                    `GIF/APNG/WebP 解析失败（可能该图床未开启跨域 CORS，或档案已损毁）: ${url}`,
                    `Failed to parse GIF/APNG/WebP (the host may not support CORS, or the file is corrupted): ${url}`
                ), err);
            })
    );

    return entry;
}

/**
 * 依经过的时间，从已解码的帧数组中选出目前应显示的帧「索引」，并顺便算出
 * 「还要多久这一帧才会换下一帧」（remainingMs）。remainingMs 是 gifAnimationLoop
 * 到期排程的依据：呼叫端把 Date.now() + remainingMs 当作 nextDue 交给
 * notifyGifFrame，这样长 delay 的 GIF 不会被固定轮询间隔白白多重绘好几次。
 * @param {GifEntry} entry
 * @param {number} elapsedMs - 从图层第一次显示这张动图算起，经过的毫秒数
 * @returns {{index: number, remainingMs: number}} index 尚未就绪或没有帧时为 -1
 */
export function getGifFrameState(entry, elapsedMs) {
    if (!entry.loaded || entry.failed || entry.frames.length === 0 || entry.totalDuration <= 0) {
        return { index: -1, remainingMs: 0 };
    }
    let t = elapsedMs % entry.totalDuration;
    for (let i = 0; i < entry.frames.length; i++) {
        const delay = entry.frames[i].delay;
        if (t < delay) return { index: i, remainingMs: delay - t };
        t -= delay;
    }
    const lastFrame = entry.frames[entry.frames.length - 1];
    return { index: entry.frames.length - 1, remainingMs: lastFrame.delay };
}

export default {
    getAnimatedImage,
    getGifFrameState
};