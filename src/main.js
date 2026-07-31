/**
 * ShuangCustomAssets 主入口
 */

import { AssetManager } from "@sugarch/bc-asset-manager";
import { HookManager } from "@sugarch/bc-mod-hook-manager";
import { once } from "@sugarch/bc-mod-utility";

import ModInfo from "./modInfo.js";
import { registerAssets, initAssets } from "./lib/assetManager.js";
import { Logger } from "./lib/utils.js";
import { setupGifAnimationHooks } from "./lib/gifAnimationLoop.js";
import assets from "./assets/index.js";
import { setupLoginBadge, setupDialogHooks } from "./assets/customTexture.js";
import { registerExtensionSetting } from "./assets/settings.js";

// 立即输出日志，确认脚本已被 Toolbox / 加载器成功执行到（不代表初始化已完成）
console.log(`[ShuangAssets] 脚本已加载，准备初始化...`);

/**
 * 初始化插件
 */
function init() {
    // 注册所有道具
    registerAssets(assets);

    // 初始化道具（在 AssetManager.afterLoad 中执行）
    AssetManager.afterLoad(() => {
        initAssets();
        // 设置登录页面加载标识
        setupLoginBadge(HookManager);
        // 注册对话框交互 hook（编辑退出返回列表、隐藏互动格线）
        setupDialogHooks(HookManager);
        // 注册画面切换 / 登入时的动图续播钩子
        setupGifAnimationHooks(HookManager);
        // 注册扩展设置页面（玩家登录后可用）
        HookManager.afterPlayerLogin(() => {
            registerExtensionSetting();
        });
        Logger.info(`${ModInfo.fullName} v${ModInfo.version} 初始化完成`);
    });
}

/**
 * setup 函数 - 传给 AssetManager.init
 */
function setup() {
    init();
}

// 使用 once 确保只初始化一次（防重复加载：见文件末尾说明）
once(ModInfo.name, async () => {
    try {
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
            const craft = next(args);
            // 兼容 v5 及以前自制道具：v6 把单一 HideBody 拆为 头部/上半身/下半身 三个开关，
            // 老自制道具反序列化出的 ItemProperty 里仍带 HideBody。这里在反序列化后立即把
            // HideBody=true 迁移到三个新字段，让老道具的「隐藏身体」设置在新版本自动生效
            // （否则 updateHideArray 不再读取 HideBody，隐藏会失效）。
            // 注意：不删除 HideBody 字段本身——保留它让 BC 的 CraftingValidate (typeof 校验) 通过，
            // 避免整个 ItemProperty 被判废导致 Textures 连带丢失。
            if (craft && craft.ItemProperty && typeof craft.ItemProperty === "object" && craft.ItemProperty.HideBody === true) {
                craft.ItemProperty.HideHead = true;
                craft.ItemProperty.HideBodyUpper = true;
                craft.ItemProperty.HideBodyLower = true;
            }
            return craft;
        });

        // Hook GLDraw2DCanvas：修复 BC WebGL 纹理泄漏
        // BC 的 GLDraw2DCanvas 在替换纹理时仅调用 gl.textureCache.delete(name) 删除缓存条目，
        // 但不调用 gl.deleteTexture() 释放 GPU 资源。每次 CharacterRefresh 都会泄露一个 WebGL 纹理，
        // 累积到一定程度触发 WebGL Context Lost，导致所有贴图（包括游戏自带的）全部崩溃。
        // 此 hook 在缓存条目被删除前先释放对应的 GPU 纹理，从源头修复泄漏。
        HookManager.hookFunction("GLDraw2DCanvas", 0, (args, next) => {
            const gl = args[0];
            const Img = args[1];
            if (gl?.textureCache) {
                const name = Img?.getAttribute?.("name");
                if (name) {
                    const old = gl.textureCache.get(name);
                    if (old?.texture) {
                        gl.deleteTexture(old.texture);
                    }
                }
            }
            return next(args);
        });

        // 设置 AssetManager 日志
        AssetManager.setLogger(Logger);

        // ⚠️ 关键：调用 AssetManager.init 并传入 setup 函数
        AssetManager.init(setup);
    } catch (error) {
        // 保留错误抛出：初始化过程中任何一步失败都会在这里被捕获并打印完整堆栈，
        // 方便排查问题；正常流程不会打印额外的过程日志
        console.error(`[ShuangAssets] 初始化失败:`, error);
    }
});