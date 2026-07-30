/**
 * 资产管理器 - 简化版
 * 提供方便的道具注册接口
 */

import { AssetManager } from "@sugarch/bc-asset-manager";
import { Logger } from "./utils.js";

/**
 * 存储所有已注册的道具
 * @type {Map<string, Function>}
 */
const registeredAssets = new Map();

/**
 * 注册单个道具
 * @param {string} name - 道具名称（用于日志）
 * @param {Function} registerFn - 注册函数，接收 AssetManager 作为参数
 */
export function registerAsset(name, registerFn) {
    if (registeredAssets.has(name)) {
        // 防重复加载机制之一：同一个道具名只登记一次，避免脚本被
        // Toolbox 等环境重复注入时把注册函数塞进 Map 两次
        Logger.warn(`道具 "${name}" 已注册，跳过重复注册`);
        return;
    }
    registeredAssets.set(name, registerFn);
}

/**
 * 批量注册道具
 * @param {Array<[string, Function]>} assets - 道具列表
 */
export function registerAssets(assets) {
    for (const [name, registerFn] of assets) {
        registerAsset(name, registerFn);
    }
}

/**
 * 初始化所有已注册的道具
 */
export function initAssets() {
    for (const [name, registerFn] of registeredAssets) {
        try {
            registerFn(AssetManager);
        } catch (e) {
            // 单个道具初始化失败不应中断其他道具，这里逐个 try/catch
            // 并把完整错误抛给日志，方便定位是哪个道具出的问题
            Logger.error(`道具 "${name}" 初始化失败:`, e);
        }
    }
}

/**
 * 获取 AssetManager 实例（用于高级用法）
 */
export { AssetManager };

export default {
    registerAsset,
    registerAssets,
    initAssets,
    AssetManager
};