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
        Logger.warn(`道具 "${name}" 已注册，跳过重复注册`);
        return;
    }
    registeredAssets.set(name, registerFn);
    Logger.info(`道具 "${name}" 注册成功`);
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
    Logger.info(`开始初始化 ${registeredAssets.size} 个道具`);
    for (const [name, registerFn] of registeredAssets) {
        try {
            registerFn(AssetManager);
            Logger.info(`道具 "${name}" 初始化完成`);
        } catch (e) {
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