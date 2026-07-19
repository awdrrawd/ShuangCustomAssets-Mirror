// ==UserScript==
// @name         ShuangCustomAssets (Shuang自定义道具)
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Shuang的自定义道具扩展 - 支持动态贴图等功能
// @author       Shuang
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        https://bondageprojects.com/*
// @match        https://www.bondageprojects.com/*
// @match        https://www.bondage-asia.com/club/R*
// @grant        none
// @run-at       document-end
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

// 生产环境 CDN 地址（需要部署后修改）
const CDN_URL = 'https://your-cdn.pages.dev/shuang-assets.js';

async function loadAssets() {
    const timestamp = Date.now();
    const url = `${CDN_URL}?t=${timestamp}`;
    console.log('[ShuangCustomAssets] 正在加载:', url);

    try {
        await import(url);
        console.log('[ShuangCustomAssets] 加载成功');
    } catch (error) {
        console.error('[ShuangCustomAssets] 加载失败:', error);
    }
}

if (isSupportedDomain) {
    console.log('[ShuangCustomAssets] 正在加载...');
    loadAssets();
} else {
    console.warn('[ShuangCustomAssets] 当前页面不在支持的游戏域名内，跳过加载');
}