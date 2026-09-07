import { getSettings } from "./settingsStorage.js";

export const DEFAULT_MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const DEFAULT_MAX_FRAME_PIXELS = 4096 * 4096;
export const DEFAULT_MAX_ANIMATION_PIXELS = 32 * 1024 * 1024;
export const DEFAULT_MAX_ANIMATION_FRAMES = 300;
export const DEFAULT_IMAGE_TIMEOUT_MS = 15000;

/** 从设置读取当前图片加载超时（毫秒） */
export function getImageTimeoutMs() { return cfg().timeoutMs; }

/** 从设置读取图片加载限制（默认关闭） */
function cfg() {
    const s = getSettings();
    return {
        enabled: s.imageLimitsEnabled === true,
        maxImageBytes: s.imageLimitMaxBytes ?? DEFAULT_MAX_IMAGE_BYTES,
        maxFramePixels: s.imageLimitMaxFramePixels ?? DEFAULT_MAX_FRAME_PIXELS,
        maxAnimationPixels: s.imageLimitMaxAnimationPixels ?? DEFAULT_MAX_ANIMATION_PIXELS,
        maxAnimationFrames: s.imageLimitMaxAnimationFrames ?? DEFAULT_MAX_ANIMATION_FRAMES,
        timeoutMs: s.imageLimitTimeoutMs ?? DEFAULT_IMAGE_TIMEOUT_MS,
    };
}

export function checkImageBudget(width, height, frames = 1) {
    const c = cfg();
    if (!c.enabled) return;
    if (![width, height, frames].every(n => Number.isSafeInteger(n) && n > 0)
        || width * height > c.maxFramePixels
        || frames > c.maxAnimationFrames
        || width * height * frames > c.maxAnimationPixels) {
        throw new Error("Image exceeds decoding limits");
    }
}

let downloadsEnabled = true;
const downloads = new Set();

export function setTextureDownloadsEnabled(enabled) {
    downloadsEnabled = enabled;
    if (!enabled) for (const controller of downloads) controller.abort();
}

/** Keep the timeout active while reading the body, not just until response headers arrive. */
export async function fetchImageBuffer(url) {
    if (!downloadsEnabled) { const error = new Error("Texture loading disabled"); error.name = "AbortError"; throw error; }
    const { enabled, maxImageBytes, timeoutMs } = cfg();
    const controller = new AbortController();
    downloads.add(controller);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { mode: "cors", credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (enabled && Number(response.headers.get("content-length")) > maxImageBytes) throw new Error("Image too large");
        const reader = response.body.getReader();
        const chunks = [];
        let length = 0;
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            length += value.byteLength;
            if (enabled && length > maxImageBytes) throw new Error("Image too large");
            chunks.push(value);
        }
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        return bytes.buffer;
    } finally {
        downloads.delete(controller);
        clearTimeout(timer);
        controller.abort();
    }
}

/** Read PNG dimensions and acTL before UPNG allocates decompressed frame buffers. */
export function inspectPng(buffer) {
    const view = new DataView(buffer);
    const width = view.getUint32(16), height = view.getUint32(20);
    let frames = 1;
    for (let offset = 8; offset + 12 <= buffer.byteLength;) {
        const size = view.getUint32(offset);
        if (offset + size + 12 > buffer.byteLength) throw new Error("Invalid PNG chunk");
        if (view.getUint32(offset + 4) === 0x6163544c) frames = view.getUint32(offset + 8);
        if (view.getUint32(offset + 4) === 0x6663544c) {
            if (size !== 26) throw new Error("Invalid PNG frame control");
            const frameWidth = view.getUint32(offset + 12), frameHeight = view.getUint32(offset + 16);
            checkImageBudget(frameWidth, frameHeight);
            if (view.getUint32(offset + 20) + frameWidth > width
                || view.getUint32(offset + 24) + frameHeight > height) throw new Error("Invalid PNG frame bounds");
        }
        offset += size + 12;
    }
    checkImageBudget(width, height, frames);
    return { width, height, frames };
}
