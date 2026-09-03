export const IMAGE_TIMEOUT_MS = 15000;
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_FRAME_PIXELS = 4096 * 4096;
export const MAX_ANIMATION_PIXELS = 32 * 1024 * 1024;
export const MAX_ANIMATION_FRAMES = 300;
let downloadsEnabled = true;
const downloads = new Set();
export function setTextureDownloadsEnabled(enabled) {
    downloadsEnabled = enabled;
    if (!enabled) for (const controller of downloads) controller.abort();
}

export function checkImageBudget(width, height, frames = 1) {
    if (![width, height, frames].every(n => Number.isSafeInteger(n) && n > 0)
        || width * height > MAX_FRAME_PIXELS || frames > MAX_ANIMATION_FRAMES
        || width * height * frames > MAX_ANIMATION_PIXELS) {
        throw new Error("Image exceeds decoding limits");
    }
}

/** Keep the timeout active while reading the body, not just until response headers arrive. */
export async function fetchImageBuffer(url) {
    if (!downloadsEnabled) { const error = new Error("Texture loading disabled"); error.name = "AbortError"; throw error; }
    const controller = new AbortController();
    downloads.add(controller);
    const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
    try {
        const response = await fetch(url, { mode: "cors", credentials: "omit", signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES) throw new Error("Image too large");
        const reader = response.body.getReader();
        const chunks = [];
        let length = 0;
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            length += value.byteLength;
            if (length > MAX_IMAGE_BYTES) throw new Error("Image too large");
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
