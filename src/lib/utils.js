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

const NO_SPINNER_CLASS = "shuang-no-number-spinner";
let _noSpinnerStyleInjected = false;

/**
 * 移除 <input type="number"> 浏览器原生的上下箭头（spinner）
 * 本插件的数值输入框旁边已有自绘的 +/- 步进按钮，原生箭头是多余的且容易和步进按钮的点击区域产生混淆
 * @param {HTMLInputElement} input - 要处理的 number 输入框
 */
export function hideNumberInputSpinner(input) {
    if (!input) return;
    if (!_noSpinnerStyleInjected) {
        const style = document.createElement("style");
        style.textContent = `
            .${NO_SPINNER_CLASS}::-webkit-outer-spin-button,
            .${NO_SPINNER_CLASS}::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            .${NO_SPINNER_CLASS} {
                -moz-appearance: textfield;
                appearance: textfield;
            }
        `;
        document.head.appendChild(style);
        _noSpinnerStyleInjected = true;
    }
    input.classList.add(NO_SPINNER_CLASS);
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
    // info 是给开发者看的过程性日志（同步成功、导入成功、状态切换……），默认不输出，
    // 避免刷屏吓到玩家。需要排查时在控制台执行 `ShuangAssets.Logger.debugEnabled = true` 打开。
    // warn / error 属于「必要信息」，始终输出。
    debugEnabled: false,
    info(...args) {
        if (this.debugEnabled) console.log(this.prefix, ...args);
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
 * 用来让 cacheGC 判断这张图片是否已经「画面上看不到了」，进而释放内存。
 * _waiters 记录「图片还没加载完成前，想在它就绪时被通知一次」的回调，
 * 用途见下方 getCorsImage 的 onReady 参数说明
 * @type {Map<string, {img: HTMLImageElement, loaded: boolean, failed: boolean, lastUsed: number, _waiters: Set<Function>}>}
 */
const _corsImageCache = new Map();
registerPrunableCache(_corsImageCache, L("静态图片", "static image"));

/**
 * 获取一张 CORS 安全的图片
 * 每次被呼叫（不论是新建还是命中既有缓存）都会刷新该 entry 的 lastUsed 戳记；
 * 长时间没有任何图层再引用到某个网址时，该条目会被 cacheGC 自动清理释放
 *
 * @param {string} url
 * @param {() => void} [onReady] - 可选：如果这张图片此刻还没加载完成，
 *   注册一个「加载完成（成功或失败）时呼叫一次」的回调。用于渲染逻辑第一次
 *   读到「还没准备好，这一帧先跳过」时，顺便请求「准备好了通知我补画一次」，
 *   而不是被动等待下一次「刚好」发生的重绘（换装、聊天讯息等），
 *   避免图片明明已经下载完成、却因为没人触发重绘而一直不显示。
 *   加载已完成（或失败）时不会注册，因为已经没有「等待」的必要
 * @returns {{img: HTMLImageElement, loaded: boolean, failed: boolean}}
 */
export function getCorsImage(url, onReady) {
    let entry = _corsImageCache.get(url);
    if (!entry) {
        const img = new Image();
        entry = { img, loaded: false, failed: false, lastUsed: Date.now(), _waiters: new Set() };
        img.addEventListener("load", () => {
            entry.loaded = true;
            entry._waiters.forEach((fn) => { try { fn(); } catch (err) { Logger.error("[ShuangAssets] 图片就绪回调执行失败", err); } });
            entry._waiters.clear();
        });
        img.addEventListener("error", () => {
            entry.failed = true;
            entry._waiters.forEach((fn) => { try { fn(); } catch (err) { Logger.error("[ShuangAssets] 图片就绪回调执行失败", err); } });
            entry._waiters.clear();
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
    if (onReady && !entry.loaded && !entry.failed) {
        entry._waiters.add(onReady);
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