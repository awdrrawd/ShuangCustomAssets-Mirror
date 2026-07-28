/**
 * 自定义贴图道具 - 配置导入/导出
 */

import { LAYER_NAMES, MAX_TEXTURE_COUNT, HIDE_CATEGORIES, DEFAULT_PROPS } from "./constants.js";
import { state, showStatus } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { updateHideArray } from "./hideArray.js";
import { Logger, L } from "@lib/utils.js";

/**
 * 导出配置到剪贴板
 */
export function exportConfig(item) {
    const textures = item.Property?.Textures || [];
    const overridePriority = (item.Property?.OverridePriority && typeof item.Property.OverridePriority === "object")
        ? item.Property.OverridePriority
        : {};
    const config = {
        type: "ShuangCustomAssets",
        version: 5,
        textures: textures,
        overridePriority: overridePriority, // 图层优先级（键为 LayerN，值为 -99~99）
    };

    // 动态导出所有隐藏分类开关（兼容旧版：导入侧同样按 HIDE_CATEGORIES 动态读取）
    for (const cat of HIDE_CATEGORIES) {
        config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] = item.Property?.[cat.key] === true;
    }
    const json = JSON.stringify(config, null, 2);

    // 复制到剪贴板
    navigator.clipboard.writeText(json).then(() => {
        Logger.info("配置已复制到剪贴板");
        showStatus(L(`✔ 已复制到剪贴板，共 ${textures.length} 个图层`,
            `✔ Copied to clipboard, ${textures.length} layers`), "#4CAF50");
    }).catch(err => {
        Logger.error("复制失败:", err);
        // 降级方案：创建下载
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shuang-custom-assets-config.json";
        a.click();
        URL.revokeObjectURL(url);
        showStatus(L("✔ 剪贴板不可用，已改为下载配置文件", "✔ Clipboard unavailable, downloaded config file"), "#FF9800");
    });
}

/**
 * 校验并清理图层优先级对象（overridePriority）
 * 只保留合法的 LayerN 键（索引需 < layerCount）及 -99~99 范围内的数值
 * @param {*} raw - 待校验的原始对象
 * @param {number} layerCount - 有效图层数量上限
 * @returns {Object<string, number>}
 */
export function sanitizePriorityMap(raw, layerCount) {
    const result = {};
    if (!raw || typeof raw !== "object") return result;
    for (const key in raw) {
        const idx = LAYER_NAMES.indexOf(key);
        if (idx === -1 || idx >= layerCount) continue;
        const val = parseInt(raw[key]);
        if (isNaN(val)) continue;
        result[key] = Math.max(-99, Math.min(99, val));
    }
    return result;
}

/**
 * 从剪贴板导入配置
 * @param {Object} item - 道具对象
 * @param {"overwrite"|"append"} mode - 导入模式：overwrite=覆盖导入，append=追加导入
 */
export function importConfig(item, mode) {
    navigator.clipboard.readText().then(text => {
        try {
            const config = JSON.parse(text);
            if (config.type !== "ShuangCustomAssets") {
                throw new Error("无效的配置类型");
            }
            if (!Array.isArray(config.textures)) {
                throw new Error("配置格式错误");
            }

            // 验证并清理数据
            const validTextures = config.textures.map(t => {
                const cleaned = {
                    TextureURL: String(t.TextureURL || ""),
                    OffsetX: parseInt(t.OffsetX) || 0,
                    OffsetY: parseInt(t.OffsetY) || 0,
                    Scale: parseInt(t.Scale) || 100,
                    Rotation: parseInt(t.Rotation) || 0,
                    Visible: t.Visible !== false,
                    Opacity: Math.max(0, Math.min(100, parseInt(t.Opacity) || 100)),
                    MirrorH: t.MirrorH === true,
                    MirrorV: t.MirrorV === true
                };
                // 保留姿势设置（验证为纯对象）
                if (t.PoseSettings && typeof t.PoseSettings === "object" && !Array.isArray(t.PoseSettings)) {
                    cleaned.PoseSettings = t.PoseSettings;
                }
                return cleaned;
            });

            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Textures) item.Property.Textures = [];

            if (mode === "append") {
                // 追加导入：将剪贴板图层追加到现有图层后
                const currentCount = item.Property.Textures.length;
                const totalCount = currentCount + validTextures.length;
                if (totalCount > MAX_TEXTURE_COUNT) {
                    throw new Error(`超过贴图数量上限（当前 ${currentCount} + 导入 ${validTextures.length} = ${totalCount}，最多 ${MAX_TEXTURE_COUNT}）`);
                }
                item.Property.Textures = [...item.Property.Textures, ...validTextures];
                // 追加模式不修改隐藏开关

                // 图层优先级：导入的 LayerN 键需按追加偏移量重新映射（如 Layer1 -> Layer(currentCount+1)）
                const importedPriority = sanitizePriorityMap(config.overridePriority, validTextures.length);
                const shiftedPriority = {};
                for (const key in importedPriority) {
                    const idx = LAYER_NAMES.indexOf(key);
                    const newIdx = idx + currentCount;
                    if (newIdx < MAX_TEXTURE_COUNT) shiftedPriority[LAYER_NAMES[newIdx]] = importedPriority[key];
                }
                if (Object.keys(shiftedPriority).length > 0) {
                    if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
                        item.Property.OverridePriority = {};
                    }
                    Object.assign(item.Property.OverridePriority, shiftedPriority);
                }
            } else {
                // 覆盖导入：用剪贴板内容完全替换
                if (validTextures.length > MAX_TEXTURE_COUNT) {
                    throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个，当前 ${validTextures.length} 个）`);
                }
                item.Property.Textures = validTextures;
                // 覆盖模式同步导入隐藏分类开关（兼容旧版配置：无该字段时默认 false）
                for (const cat of HIDE_CATEGORIES) {
                    item.Property[cat.key] = config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] === true;
                }

                // 图层优先级：覆盖模式直接用导入内容替换（兼容旧版配置：无该字段时清空）
                const importedPriority = sanitizePriorityMap(config.overridePriority, validTextures.length);
                if (Object.keys(importedPriority).length > 0) {
                    item.Property.OverridePriority = importedPriority;
                } else {
                    delete item.Property.OverridePriority;
                }
            }

            updateHideArray(item);

            const count = item.Property.Textures.length;
            const modeText = mode === "append" ? "追加" : "覆盖";
            const modeTextEn = mode === "append" ? "Append" : "Replace";
            Logger.info(`${modeText}导入成功:`, count, "个图层");
            showStatus(L(`✔ ${modeText}导入成功，共 ${count} 个图层`,
                `✔ ${modeTextEn} import OK, ${count} layers`), "#4CAF50");

            // 同步到服务器并刷新角色
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
        } catch (err) {
            Logger.error("导入失败:", err.message);
            showStatus(L(`✘ 导入失败: ${err.message}`, `✘ Import failed: ${err.message}`), "#E53935");
        }
    }).catch(err => {
        Logger.error("读取剪贴板失败:", err);
        showStatus(L("✘ 读取剪贴板失败，请确保已复制配置 JSON", "✘ Cannot read clipboard, make sure the config JSON is copied"), "#E53935");
    });
}
