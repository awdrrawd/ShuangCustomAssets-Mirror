/**
 * 工具函数集合
 */
import { registerPrunableCache } from "./cacheGC.js";

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

// === 双语 i18n ===

/**
 * 判断当前游戏语言是否为中文（简体 CN / 繁体 TW）
 * @returns {boolean}
 */
export function isChineseLang() {
    const lang = (typeof TranslationLanguage !== "undefined") ? TranslationLanguage : "EN";
    return lang === "CN" || lang === "TW";
}

/**
 * 根据当前语言返回中文或英文文本
 * 中文（CN/TW）时返回 cn，其余语言返回 en
 * @param {string} cn - 中文文本
 * @param {string} en - 英文文本
 * @returns {string}
 */
export function L(cn, en) {
    return isChineseLang() ? cn : en;
}

// === 跨域安全图片加载 ===

/**
 * 自维护的图片缓存，始终使用 crossOrigin="anonymous" 加载
 * 与 BC 的 DrawGetImage 不同：加载失败不会回退到无 crossOrigin，
 * 从而避免污染(tainted) canvas 导致 WebGL texImage2D 报错、贴图变黑框。
 * 只有服务器正确返回 Access-Control-Allow-Origin 的图片才会被渲染。
 * lastUsed 记录该 entry 最近一次被 getCorsImage 读取到的时间戳，
 * 用来让 cacheGC 判断这张图片是否已经「画面上看不到了」，进而释放内存
 * @type {Map<string, {img: HTMLImageElement, loaded: boolean, failed: boolean, lastUsed: number}>}
 */
const _corsImageCache = new Map();
registerPrunableCache(_corsImageCache, L("静态图片", "static image"));

/**
 * 获取一张 CORS 安全的图片
 * 每次被呼叫（不论是新建还是命中既有缓存）都会刷新该 entry 的 lastUsed 戳记；
 * 长时间没有任何图层再引用到某个网址时，该条目会被 cacheGC 自动清理释放
 * @param {string} url
 * @returns {{img: HTMLImageElement, loaded: boolean, failed: boolean}}
 */
export function getCorsImage(url) {
    let entry = _corsImageCache.get(url);
    if (!entry) {
        const img = new Image();
        entry = { img, loaded: false, failed: false, lastUsed: Date.now() };
        img.addEventListener("load", () => { entry.loaded = true; });
        img.addEventListener("error", () => {
            entry.failed = true;
            Logger.warn(L(
                `图片加载失败（很可能是图床未开启跨域 CORS，无 Access-Control-Allow-Origin 响应头）: ${url}`,
                `Failed to load image (the host likely has no CORS / Access-Control-Allow-Origin header): ${url}`
            ));
        });
        // 必须在设置 src 之前设置 crossOrigin
        img.crossOrigin = "anonymous";
        img.src = url;
        _corsImageCache.set(url, entry);
    } else {
        entry.lastUsed = Date.now();
    }
    return entry;
}

export default {
    createVirtualPath,
    isValidImageUrl,
    debounce,
    Logger,
    isChineseLang,
    L,
    getCorsImage
};