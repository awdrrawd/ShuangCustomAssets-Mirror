/**
 * 自定义贴图道具 - CDN 双源回退
 * 固定资源（插件自身 CDN）：主源加载失败时自动回退到 Netlify 备用源
 */

import { getCorsImage } from "@lib/utils.js";
import { ASSETS_CDN_PRIMARY, ASSETS_CDN_FALLBACK } from "./constants.js";

// 固定资源已解析 URL 缓存（避免每帧重复检测 fallback）
export const _resolvedAssetUrls = new Map();

/**
 * 获取固定资源的可用 URL（主源加载失败时自动回退到 Netlify 备用源）
 * 利用 getCorsImage 的 loaded/failed 状态判断主源是否可用：
 * - 主源已成功加载 -> 缓存并返回主源 URL
 * - 主源已确认失败 -> 缓存并返回备用源 URL
 * - 主源仍在加载中 -> 先返回主源 URL，下帧若失败会自动切换
 * @param {string} filename - 资源文件名（如 SCA_logo.png）
 * @returns {string} 可用的 URL
 */
export function resolveFixedAssetUrl(filename) {
    if (_resolvedAssetUrls.has(filename)) {
        return _resolvedAssetUrls.get(filename);
    }
    const primaryUrl = `${ASSETS_CDN_PRIMARY}/${filename}`;
    const fallbackUrl = `${ASSETS_CDN_FALLBACK}/${filename}`;
    const entry = getCorsImage(primaryUrl);
    if (entry.failed) {
        _resolvedAssetUrls.set(filename, fallbackUrl);
        return fallbackUrl;
    }
    if (entry.loaded) {
        _resolvedAssetUrls.set(filename, primaryUrl);
    }
    return primaryUrl;
}
