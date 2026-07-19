// ==UserScript==
// @name         ShuangCustomAssets Dev (Shuang自定义道具 - 开发版)
// @namespace    http://tampermonkey.net/
// @version      0.1.0-dev
// @description  Shuang的自定义道具扩展 - 开发版本
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

// 本地开发服务器地址
const DEV_URL = 'http://localhost:8080/shuang-assets.js';

async function loadAssets() {
    const timestamp = Date.now();
    const url = `${DEV_URL}?t=${timestamp}`;
    console.log('[ShuangCustomAssets Dev] 正在从本地服务器加载:', url);

    try {
        await import(url);
        console.log('[ShuangCustomAssets Dev] 加载成功');
    } catch (error) {
        console.error('[ShuangCustomAssets Dev] 加载失败:', error);
        console.log('[ShuangCustomAssets Dev] 请确保已运行: npm run serve');
    }
}

if (isSupportedDomain) {
    console.log('[ShuangCustomAssets Dev] 正在加载...');
    loadAssets();
} else {
    console.warn('[ShuangCustomAssets Dev] 当前页面不在支持的游戏域名内，跳过加载');
}