/**
 * ShuangCustomAssets 主入口
 */

import { AssetManager } from "@sugarch/bc-asset-manager";
import { HookManager } from "@sugarch/bc-mod-hook-manager";
import { once } from "@sugarch/bc-mod-utility";

import ModInfo from "./modInfo.js";
import { registerAssets, initAssets } from "./lib/assetManager.js";
import { Logger } from "./lib/utils.js";
import assets from "./assets/index.js";

/**
 * 初始化插件
 */
function init() {
    Logger.info(`${ModInfo.fullName} v${ModInfo.version} 正在初始化...`);
    
    // 注册所有道具
    registerAssets(assets);
    
    // 初始化道具（在 AssetManager.afterLoad 中执行）
    AssetManager.afterLoad(() => {
        initAssets();
        Logger.info("所有道具初始化完成");
    });
}

/**
 * setup 函数 - 传给 AssetManager.init
 */
function setup() {
    init();
}

// 使用 once 确保只初始化一次
once(ModInfo.name, async () => {
    // 加载 SDK
    await import("https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0");
    
    // 注册模组
    const mod = /** @type {any} */ (globalThis).bcModSdk.registerMod({
        name: ModInfo.name,
        fullName: ModInfo.fullName,
        version: ModInfo.version,
        repository: ModInfo.repository
    });
    
    // 初始化 HookManager
    HookManager.initWithMod(mod);
    
    // 设置 AssetManager 日志
    AssetManager.setLogger(Logger);
    
    // ⚠️ 关键：调用 AssetManager.init 并传入 setup 函数
    AssetManager.init(setup);
});