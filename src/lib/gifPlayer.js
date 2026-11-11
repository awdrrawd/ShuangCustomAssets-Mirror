import { t } from "../i18n/index.js";
import { fetchImageBuffer, checkImageBudget, inspectPng } from "./imageLimits.js";
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
 * 唯一的例外是超出像素预算的 Animated WebP：它只常驻压缩档和少量已解码帧，
 * 换到未缓存的帧时才会请 ImageDecoder 当场解那一帧（见 resolveAnimatedFrame）。
 *
 * 缓存不是永久的：每次某个网址被 getAnimatedImage 读取到都会刷新其 lastUsed
 * 戳记，若一张图片长时间不再被任何图层引用（道具移除、网址被改掉等，等同于
 * 「画面上已经不存在」），cacheGC 会自动把它的缓存条目（含解码出来的整批帧
 * canvas）清除掉，释放内存；详见 cacheGC.js。
 */
import { parseGIF, decompressFrames } from "gifuct-js";
import UPNG from "upng-js";
import { Logger } from "./utils.js";
import { registerPrunableCache } from "./cacheGC.js";

/** @type {Map<string, GifEntry>} */
const _gifCache = new Map();
registerPrunableCache(_gifCache, t("gifPlayer.animated_image"));

// Bound the total decoded animation cache as well as individual files.
const MAX_CACHE_PIXELS = 64 * 1024 * 1024;
/** 超出全量预算的动图最多同时缓存几帧（含钉住不淘汰的第 0 帧），其余按需解码 */
export const STREAM_FRAME_CACHE = 4;
/** 预解码窗口：动画循环可能每 100ms 才重绘一次，单帧 40ms 会一次跨过 2~3 帧 */
export const STREAM_PREFETCH = 3;
/** 像素预算：LRU 之外还额外留住「上一次真正画出来的那一帧」，避免解码没跟上时画面跳回第 0 帧 */
export const STREAM_DECODED_BUDGET = STREAM_FRAME_CACHE + 1;
/** 串流帧还没解码好时，隔多久补一次重绘 */
export const STREAM_RETRY_MS = 16;

/**
 * 决定一张动图要用「全量预解码」还是「串流按需解码」，全部沿用现有像素预算口径。
 * 纯函数，方便单测覆盖边界。
 * @param {number} width
 * @param {number} height
 * @param {number} frameCount
 * @param {number} [reserved] - 其他动图已经占用的像素
 * @returns {{mode: "full"|"stream"|"fail", pixels: number}}
 */
export function planAnimationStorage(width, height, frameCount, reserved = 0) {
    const full = width * height * frameCount;
    const stream = width * height * Math.min(STREAM_DECODED_BUDGET, frameCount);
    if (reserved + full <= MAX_CACHE_PIXELS) return { mode: "full", pixels: full };
    if (reserved + stream <= MAX_CACHE_PIXELS) return { mode: "stream", pixels: stream };
    return { mode: "fail", pixels: full };
}

function cacheLimitError() {
    const error = new Error("Animation cache limit exceeded");
    error.code = "ANIMATION_CACHE_LIMIT";
    return error;
}

function reservedPixels(entry) {
    let reserved = 0;
    for (const value of _gifCache.values()) if (value !== entry) reserved += value.pixelBudget || 0;
    return reserved;
}

function reserveFrames(entry, width, height, count) {
    checkImageBudget(width, height, count);
    const pixels = width * height * count;
    if (reservedPixels(entry) + pixels > MAX_CACHE_PIXELS) throw cacheLimitError();
    entry.pixelBudget = pixels;
}

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
    const info = inspectPng(buffer);
    if (info.frames <= 1) { entry.failed = true; return; }
    reserveFrames(entry, info.width, info.height, info.frames);
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
 * Animated WebP 的两条解码路线：
 * - 预算放得下：用 ImageDecoder 一次解完所有帧，画成 canvas 常驻（与旧行为相同）。
 * - 放不下：只先解第 0 帧，保留 decoder 持有的压缩数据；其余帧播放时按需解码，
 *   只保留一个小型 LRU（见 resolveAnimatedFrame / requestStreamFrame）。内存从
 *   「帧数 × 分辨率 × 4 字节」降到约「压缩档 + STREAM_FRAME_CACHE 帧」。
 *
 * 目前仅 Chromium 系（Chrome/Edge）与较新版本的 Safari 支持 `ImageDecoder`；
 * 不支持的浏览器（例如未支持前的 Firefox）一律视为「解析失败」，交还静态图片
 * 管线处理——退化成只显示第一帧、不会动，但不会报错或崩溃。
 */
/** VideoFrame.duration 单位是微秒；0 或极短延迟比照 GIF/APNG 分支的惯例视为 100ms */
function videoFrameDelayMs(duration) {
    const delay = duration ? duration / 1000 : 0;
    return delay > 10 ? delay : 100;
}

function createFrameCanvas(entry, image) {
    const canvas = document.createElement("canvas");
    canvas.width = entry.width || 1;
    canvas.height = entry.height || 1;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return canvas;
}

/**
 * 不经过解码器，直接从 RIFF/ANMF 容器读出每一帧的显示时长。
 * 串流模式靠这份时长表建时间轴，不必先解码全部像素。
 */
export function readWebpFrameDelays(buffer, frameCount) {
    if (buffer.byteLength < 12) throw new Error("Invalid WebP");
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    const delays = [];
    for (let offset = 12; offset + 8 <= buffer.byteLength;) {
        const size = view.getUint32(offset + 4, true);
        const next = offset + 8 + size + (size & 1);
        if (next > buffer.byteLength) throw new Error("Invalid WebP chunk bounds");
        // "ANMF"
        if (bytes[offset] === 0x41 && bytes[offset + 1] === 0x4e && bytes[offset + 2] === 0x4d && bytes[offset + 3] === 0x46) {
            if (size < 16) throw new Error("Invalid WebP animation frame");
            // ANMF payload 前 16 bytes：X(3) Y(3) W-1(3) H-1(3) Duration(3) Flags(1)
            // Duration 本身就是毫秒，不需要像 VideoFrame.duration 那样换算微秒
            const delay = view.getUint32(offset + 20, true) & 0xffffff;
            delays.push(delay > 10 ? delay : 100);
        }
        offset = next;
    }
    if (delays.length !== frameCount) throw new Error("WebP animation frame table mismatch");
    return delays;
}

/**
 * 串流模式：把一帧画进缓存槽位，并按 STREAM_FRAME_CACHE 做 LRU 淘汰。
 * 第 0 帧永远钉住（列表预览、循环接缝、解码失败时的后备帧都用它）。
 */
export function storeStreamFrame(entry, index, canvas) {
    const slot = entry?.frames?.[index];
    if (!slot) return;
    slot.canvas = canvas;
    const order = entry._frameOrder;
    const existing = order.indexOf(index);
    if (existing >= 0) order.splice(existing, 1);
    order.push(index);
    while (order.length > STREAM_FRAME_CACHE) {
        const victim = order.find((i) => i !== 0);
        if (victim === undefined) break;
        order.splice(order.indexOf(victim), 1);
        entry.frames[victim].canvas = null;
    }
}

function decodeStreamFrame(entry, index) {
    const decoder = entry._decoder;
    if (!decoder || entry._destroyed || entry.frames[index]?.canvas) return Promise.resolve();
    return decoder.decode({ frameIndex: index }).then(({ image }) => {
        try {
            if (entry._destroyed) return;
            storeStreamFrame(entry, index, createFrameCanvas(entry, image));
        } finally { image.close(); }
    });
}

/** 请一个还没解码的帧；同一帧不会重复排队 */
export function requestStreamFrame(entry, index) {
    if (!entry?.streaming || entry._destroyed || entry._streamFailed || !entry._decoder) return;
    if (index < 0 || index >= entry.frames.length) return;
    if (entry.frames[index]?.canvas || entry._inflight.has(index)) return;
    entry._inflight.add(index);
    entry._decodeChain = entry._decodeChain
        .then(() => decodeStreamFrame(entry, index))
        .catch((err) => {
            if (entry._destroyed) return;
            // 解码失败就退化成固定显示第 0 帧，避免重绘计时器每 16ms 反复重试
            entry._streamFailed = true;
            Logger.warn("[ShuangAssets] 串流动图帧解码失败，改用第 0 帧", err);
        })
        .finally(() => { entry._inflight.delete(index); });
}

/**
 * 串流条目取「这一帧该画什么」。
 * 命中缓存就把后面几帧一并排进解码队列；未命中先沿用上一次真正画出来的帧，
 * 同时请求当前帧与后续窗口，由调用端在 STREAM_RETRY_MS 后补一次重绘。
 * @param {GifEntry} entry
 * @param {number} index
 * @returns {{canvas: HTMLCanvasElement|null, index: number, pending: boolean}}
 */
export function resolveAnimatedFrame(entry, index) {
    const frames = entry?.frames || [];
    if (!entry?.streaming) return { canvas: frames[index]?.canvas || null, index, pending: false };
    if (entry._destroyed || entry._streamFailed) {
        const fallback = entry._fallbackCanvas || frames[0]?.canvas || null;
        return { canvas: fallback, index: fallback ? (entry._fallbackIndex ?? 0) : -1, pending: false };
    }
    const cached = frames[index]?.canvas;
    // 重绘间隔通常远大于单帧时长，命中时只预解下一帧会永远差 1~2 帧
    const first = cached ? index + 1 : index;
    for (let step = 0; step < STREAM_PREFETCH; step++) {
        requestStreamFrame(entry, (first + step) % frames.length);
    }
    if (cached) {
        entry._fallbackCanvas = cached;
        entry._fallbackIndex = index;
        return { canvas: cached, index, pending: false };
    }
    // 还没解好：继续显示上一次真正画出来的那一帧，不要跳回第 0 帧
    const fallback = entry._fallbackCanvas || frames[0]?.canvas || null;
    return { canvas: fallback, index: fallback ? (entry._fallbackIndex ?? 0) : -1, pending: true };
}

function disposeStreamingEntry(entry) {
    entry._destroyed = true;
    try { entry._decoder?.close(); } catch { /* 已经关过 */ }
    entry._decoder = null;
    entry._decodeChain = Promise.resolve();
    entry._inflight?.clear();
    entry._fallbackCanvas = null;
    entry._fallbackIndex = 0;
    for (const frame of entry.frames || []) frame.canvas = null;
    entry.frames = [];
    entry.pixelBudget = 0;
}

/**
 * 用 `ImageDecoder` 解析 Animated WebP 并填入 entry。
 * 全量解不下时自动改用串流模式，见上方说明。
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
    let keepDecoder = false;
    try {
        await decoder.tracks.ready;
        const track = decoder.tracks.selectedTrack;

        // 没有 animated 标记，或只解出 1 帧：视为普通静态 WebP，交还静态图片管线
        if (!track || !track.animated || track.frameCount <= 1) {
            entry.failed = true;
            return;
        }

        const frameCount = track.frameCount;
        checkImageBudget(1, 1, frameCount);

        // 先解第 0 帧：决定尺寸、列表预览、循环接缝与后备帧都靠它
        const { image: first } = await decoder.decode({ frameIndex: 0 });
        let firstCanvas, firstDelay;
        try {
            entry.width = first.displayWidth;
            entry.height = first.displayHeight;
            firstDelay = videoFrameDelayMs(first.duration);
            firstCanvas = createFrameCanvas(entry, first);
        } finally { first.close(); }

        // 使用者自订的「图片大小限制」优先于任何降级策略
        checkImageBudget(entry.width, entry.height, frameCount);
        const plan = planAnimationStorage(entry.width, entry.height, frameCount, reservedPixels(entry));
        if (plan.mode === "fail") throw cacheLimitError();

        if (plan.mode === "stream") {
            // 全量解码放不下：保留 decoder 持有的压缩数据，只缓存少量帧，播放时按需解码。
            // 帧时长直接读 ANMF 标头，不需要先把每一帧解出来。
            const delays = readWebpFrameDelays(buffer, frameCount);
            delays[0] = firstDelay;
            entry.frames = delays.map((delay) => ({ canvas: null, delay }));
            entry.frames[0].canvas = firstCanvas;
            entry.totalDuration = delays.reduce((sum, delay) => sum + delay, 0);
            entry.isAnimated = true;
            entry.streaming = true;
            entry.pixelBudget = plan.pixels;
            entry._decoder = decoder;
            entry._frameOrder = [0];
            entry._inflight = new Set();
            entry._decodeChain = Promise.resolve();
            entry._destroyed = false;
            entry._streamFailed = false;
            entry._fallbackCanvas = firstCanvas;
            entry._fallbackIndex = 0;
            entry.dispose = () => disposeStreamingEntry(entry);
            keepDecoder = true;
            return;
        }

        entry.pixelBudget = plan.pixels;
        entry.frames.push({ canvas: firstCanvas, delay: firstDelay });
        entry.totalDuration = firstDelay;
        for (let i = 1; i < frameCount; i++) {
            const { image } = await decoder.decode({ frameIndex: i });
            const delay = videoFrameDelayMs(image.duration);
            const canvas = createFrameCanvas(entry, image);
            image.close();
            entry.frames.push({ canvas, delay });
            entry.totalDuration += delay;
            if ((i + 1) % COMPOSE_CHUNK_SIZE === 0 && i + 1 < frameCount) {
                await _yieldToMainThread();
            }
        }

        entry.isAnimated = true;
    } finally {
        if (!keepDecoder) decoder.close();
    }
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
export function getAnimatedImage(url, onReady, animated = true) {
    if (!animated) return { loaded: true, failed: true, isAnimated: false, frames: [] };
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
        fetchImageBuffer(url)
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
                for (const frame of gif.frames) {
                    if (!frame.image) continue;
                    const { width, height, left, top } = frame.image.descriptor;
                    checkImageBudget(width, height);
                    if (left + width > gif.lsd.width || top + height > gif.lsd.height) throw new Error("Invalid GIF frame bounds");
                }
                reserveFrames(entry, gif.lsd.width, gif.lsd.height, gif.frames.filter(frame => frame.image).length);
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
                if (err?.name === "AbortError") {
                    if (_gifCache.get(url) === entry) _gifCache.delete(url);
                    entry.loaded = true;
                    entry.failed = true;
                    notifyReady(entry);
                    return;
                }
                entry.failed = true;
                entry.error = true;
                entry.frames = [];
                entry.pixelBudget = 0;
                entry.loaded = true;
                notifyReady(entry);
                Logger.warn(t("gifPlayer.failed_to_parse_gif_apng_webp_the_host_may_not_support_cors_or_th", [url]), err);
            })
    );

    return entry;
}

export function peekAnimatedImage(url) { return _gifCache.get(url); }

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
