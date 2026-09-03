// ==UserScript==
// @name         ShuangCustomAssets (NetlifyFirst)
// @name:zh      Shuang自定义道具 (NetlifyFirst)
// @namespace    https://gitgud.io/yeshuang26/shuangcustomassets
// @version      0.1.0
// @description  Shuang的自定义道具扩展 - 支持动态贴图等功能
// @author       Shuang
// @icon         https://shuang-custom-assets.pages.dev/SCA_slider.png
// @match        https://*.bondageprojects.elementfx.com/R*/*
// @match        https://*.bondage-europe.com/R*/*
// @match        https://*.bondageprojects.com/R*/*
// @match        https://*.bondage-asia.com/club/R*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

const supportedDomains = [
    'bondageprojects.elementfx.com',
    'bondage-europe.com',
    'bondageprojects.com',
    'bondage-asia.com'
];

const isSupportedDomain = supportedDomains.some(domain =>
    window.location.hostname.includes(domain)
);

const MIRROR_SOURCES = [
    {
        name: 'Netlify',
        getUrl: (timestamp) => `https://shuang-custom-assets.netlify.app/assets/main.js?t=${timestamp}`
    },
    {
        name: 'Cloudflare Pages',
        getUrl: (timestamp) => `https://shuang-custom-assets.pages.dev/assets/main.js?t=${timestamp}`
    },
];

async function loadWithFallback() {
    const timestamp = Date.now();

    for (const source of MIRROR_SOURCES) {
        const url = source.getUrl(timestamp);
        console.log(`[ShuangCustomAssets] 尝试从 ${source.name} 加载: ${url}`);

        try {
            await import(url);
            console.log(`[ShuangCustomAssets] 成功从 ${source.name} 加载`);
            return true;
        } catch (error) {
            console.warn(`[ShuangCustomAssets] ${source.name} 加载失败:`, error.message);
        }
    }

    console.error('[ShuangCustomAssets] 所有镜像源均加载失败，请检查网络连接或联系开发者');
    return false;
}

if (isSupportedDomain) {
    console.log('[ShuangCustomAssets] 正在加载...');
    loadWithFallback();
} else {
    console.warn('[ShuangCustomAssets] 当前页面不在支持的游戏域名内，跳过加载');
}