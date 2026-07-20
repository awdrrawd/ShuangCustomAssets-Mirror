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

// 立即输出日志，确认脚本已执行
console.log(`[ShuangAssets] 脚本已加载，准备初始化...`);

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
    console.log(`[ShuangAssets] once 函数开始执行...`);
    
    try {
        // 加载 SDK
        console.log(`[ShuangAssets] 正在加载 SDK...`);
        await import("https://cdn.jsdelivr.net/npm/bondage-club-mod-sdk@1.2.0");
        console.log(`[ShuangAssets] SDK 加载完成`);
        
        // 注册模组
        const mod = /** @type {any} */ (globalThis).bcModSdk.registerMod({
            name: ModInfo.name,
            fullName: ModInfo.fullName,
            version: ModInfo.version,
            repository: ModInfo.repository
        });
        console.log(`[ShuangAssets] 模组已注册: ${mod.name}`);
        
        // 初始化 HookManager
        HookManager.initWithMod(mod);
        console.log(`[ShuangAssets] HookManager 已初始化`);
        
        // 设置 AssetManager 日志
        AssetManager.setLogger(Logger);
        
        // ⚠️ 关键：调用 AssetManager.init 并传入 setup 函数
        AssetManager.init(setup);
        console.log(`[ShuangAssets] AssetManager.init 已调用`);
    } catch (error) {
        console.error(`[ShuangAssets] 初始化失败:`, error);
    }
});