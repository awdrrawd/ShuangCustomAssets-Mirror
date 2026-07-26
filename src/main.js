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
import { setupLoginBadge, setupDialogHooks } from "./assets/customTexture.js";
import { registerExtensionSetting } from "./assets/settings.js";

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
        // 设置登录页面加载标识
        setupLoginBadge(HookManager);
        // 注册对话框交互 hook（编辑退出返回列表、隐藏互动格线）
        setupDialogHooks(HookManager);
        // 注册扩展设置页面（玩家登录后可用）
        HookManager.afterPlayerLogin(() => {
            registerExtensionSetting();
        });
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

        // Hook CraftingDeserialize：修复空名称的自制道具被丢弃的问题
        // BC 的 CraftingDeserialize 在 Name 为空时返回 null，导致无名称的自制道具在重新登录后丢失
        // 这里在反序列化前将空名称替换为默认值
        // 注意：必须使用 CraftingSerializeFieldSep ("¶") 作为分隔符，
        // CraftingDeserialize 内部用 "¶" 分隔各个字段，Item/Property/Lock/Name/.../Description/.../Effects
        // 如果错误使用 CraftingSerializeItemSep ("§")，单个道具字符串中不含 "§"，
        // split 会返回整个字符串作为单个元素，再 join 会追加 "§§§Crafted Item" 到末尾破坏数据
        HookManager.hookFunction("CraftingDeserialize", 0, (args, next) => {
            const craftString = args[0];
            if (typeof craftString === "string" && craftString.length > 0) {
                const sep = typeof CraftingSerializeFieldSep !== "undefined" ? CraftingSerializeFieldSep : ",";
                const parts = craftString.split(sep);
                // parts[0] = Item(道具名), parts[3] = Name(自制名称)
                if (parts[0] && (!parts[3] || parts[3] === "")) {
                    parts[3] = "Crafted Item";
                    args[0] = parts.join(sep);
                }
            }
            return next(args);
        });
        
        // 设置 AssetManager 日志
        AssetManager.setLogger(Logger);
        
        // ⚠️ 关键：调用 AssetManager.init 并传入 setup 函数
        AssetManager.init(setup);
        console.log(`[ShuangAssets] AssetManager.init 已调用`);
    } catch (error) {
        console.error(`[ShuangAssets] 初始化失败:`, error);
    }
});