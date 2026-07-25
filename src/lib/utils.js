/**
 * 工具函数集合
 */

/**
 * 创建虚拟图片路径（用于动态生成的图片）
 * @param {string} id - 路径标识
 * @returns {string}
 */
export function createVirtualPath(id) {
    return `shuang-canvas://${id}`;
}

/**
 * 验证图片 URL 格式（基本格式检查）
 * 注意：域名白名单检查由 settings.js 的 isUrlAllowed 处理
 * @param {string} url
 * @returns {boolean}
 */
export function isValidImageUrl(url) {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("https://")) return false;
    if (url.length > 1000) return false;
    return true;
}

/**
 * 防抖函数
 * @template T
 * @param {T} fn
 * @param {number} delay
 * @returns {T}
 */
export function debounce(fn, delay = 300) {
    let timer = null;
    return /** @type {T} */ (function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    });
}

/**
 * 日志工具
 */
export const Logger = {
    prefix: "[ShuangAssets]",
    info(...args) {
        console.log(this.prefix, ...args);
    },
    warn(...args) {
        console.warn(this.prefix, ...args);
    },
    error(...args) {
        console.error(this.prefix, ...args);
    }
};

export default {
    createVirtualPath,
    isValidImageUrl,
    debounce,
    Logger
};