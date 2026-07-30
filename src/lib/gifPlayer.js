/**
 * 内容导向的 GIF 解析与播放器。
 *
 * 与「用副檔名猜測」不同，这里的判断依据全部来自档案实际内容：
 * 1. 读取文件的前几个字节，确认 magic header 是不是 "GIF87a"/"GIF89a"
 *    （不管网址后缀写 .gif、.png、还是没有后缀，都一律照实际内容判断）
 * 2. 用 gifuct-js 把档案完整解压成一张一张的帧，帧数 > 1 才视为「动图」，
 *    帧数只有 1 张的 .gif 就当成一般静态图处理
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
 */

/**
 * 依内容解析动图，结果按网址缓存，同一网址只会解析一次。
 * @param {string} url
 * @returns {GifEntry} 若尚未解析完成，回传的物件 loaded 为 false，之后同一个 entry 物件的欄位会被就地更新
 */
export function getAnimatedImage(url) {
    let entry = _gifCache.get(url);
    if (entry) {
        entry.lastUsed = Date.now();
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
        lastUsed: Date.now()
    };
    _gifCache.set(url, entry);

    fetch(url, { mode: "cors", credentials: "omit" })
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.arrayBuffer();
        })
        .then((buffer) => {
            const header = new Uint8Array(buffer, 0, 3);
            const isGifHeader = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46; // "GIF"

            if (!isGifHeader) {
                // 内容根本不是 GIF（例如网址是 .gif 但实际给的是 png/jpg，或反过来）
                // -> 交还给一般的静态图片管线（getCorsImage）处理，这里只标记失败即可
                entry.failed = true;
                entry.loaded = true;
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
            const composeCanvas = document.createElement("canvas");
            composeCanvas.width = entry.width || 1;
            composeCanvas.height = entry.height || 1;
            const composeCtx = composeCanvas.getContext("2d");

            const patchCanvas = document.createElement("canvas");
            const patchCtx = patchCanvas.getContext("2d");

            let lastDisposalType = null;
            let lastDims = null;
            let disposalRestoreFromIdx = null;

            rawFrames.forEach((frame, currIdx) => {
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
            });

            entry.loaded = true;
        })
        .catch((err) => {
            entry.failed = true;
            entry.loaded = true;
            Logger.warn(L(
                `GIF 解析失败（可能该图床未开启跨域 CORS，或档案已损毁）: ${url}`,
                `Failed to parse GIF (the host may not support CORS, or the file is corrupted): ${url}`
            ), err);
        });

    return entry;
}

/**
 * 依经过的时间，从已解码的帧数组中选出目前应显示的帧「索引」
 * （回传索引而非直接回传 canvas，方便呼叫端用索引本身当作缓存 key 的一部分，
 * 只有索引改变时才需要重绘，索引不变时可以直接跳过，不会有持续重绘的开销）
 * @param {GifEntry} entry
 * @param {number} elapsedMs - 从图层第一次显示这张动图算起，经过的毫秒数
 * @returns {number} 帧索引；尚未就绪或没有帧时回传 -1
 */
export function getCurrentGifFrameIndex(entry, elapsedMs) {
    if (!entry.loaded || entry.failed || entry.frames.length === 0 || entry.totalDuration <= 0) {
        return -1;
    }
    let t = elapsedMs % entry.totalDuration;
    for (let i = 0; i < entry.frames.length; i++) {
        const delay = entry.frames[i].delay;
        if (t < delay) return i;
        t -= delay;
    }
    return entry.frames.length - 1;
}

export default {
    getAnimatedImage,
    getCurrentGifFrameIndex
};
