/**
 * 自定义贴图道具 - 配置导入/导出
 */

import { LAYER_NAMES, MAX_TEXTURE_COUNT, HIDE_CATEGORIES, DEFAULT_PROPS, migrateScaleField, trimTrailingNulls } from "./constants.js";
import { state, showStatus } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { updateHideArray } from "./hideArray.js";
import { Logger, L } from "@lib/utils.js";

/**
 * 导出配置到剪贴板
 */
export function exportConfig(item) {
    const textures = item.Property?.Textures || [];
    const usedCount = textures.filter(t => t != null).length;
    const overridePriority = (item.Property?.OverridePriority && typeof item.Property.OverridePriority === "object")
        ? item.Property.OverridePriority
        : {};
    const config = {
        type: "ShuangCustomAssets",
        version: 7,
        textures: textures, // 保留 null 以维持槽位位置
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
        showStatus(L(`✔ 已复制到剪贴板，共 ${usedCount} 个图层`,
            `✔ Copied to clipboard, ${usedCount} layers`), "#4CAF50");
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
            // 用 Number.isFinite 判断而非 `|| 后备值`：Scale=0（完全缩小）、Opacity=0（全透明）
            // 都是合法的有效值，用 `||` 会把它们误判成「没填」而强制拉回默认值（与 editPanel.js 一致）
            const toIntOr = (val, fallback) => {
                const n = parseInt(val, 10);
                return Number.isFinite(n) ? n : fallback;
            };
            const validTextures = config.textures.map(t => {
                if (t == null) return null; // 保留空槽位
                // 兼容旧版单一 Scale 字段导出的配置文件：没有 ScaleX/ScaleY 时用旧 Scale 值填充两者
                const legacyScale = toIntOr(t.Scale, 100);
                const cleaned = {
                    Alias: String(t.Alias || ""),
                    TextureURL: String(t.TextureURL || ""),
                    OffsetX: toIntOr(t.OffsetX, 0),
                    OffsetY: toIntOr(t.OffsetY, 0),
                    ScaleX: toIntOr(t.ScaleX, legacyScale),
                    ScaleY: toIntOr(t.ScaleY, legacyScale),
                    ScaleLocked: t.ScaleLocked !== false,
                    Rotation: toIntOr(t.Rotation, 0),
                    Visible: t.Visible !== false,
                    Opacity: Math.max(0, Math.min(100, toIntOr(t.Opacity, 100))),
                    MirrorH: t.MirrorH === true,
                    MirrorV: t.MirrorV === true,
                    // 导入者成为 URL 来源和配置者
                    TextureURLSource: typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0,
                    CurrentConfigurator: typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0,
                };
                // 保留姿势设置（验证为纯对象），同样迁移其中可能存在的旧版 Scale 字段
                if (t.PoseSettings && typeof t.PoseSettings === "object" && !Array.isArray(t.PoseSettings)) {
                    cleaned.PoseSettings = t.PoseSettings;
                    migrateScaleField(cleaned);
                }
                return cleaned;
            });

            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Textures) item.Property.Textures = [];

            if (mode === "append") {
                // 追加导入：优先填入现有空槽位，剩余追加到末尾
                const nonNullImports = [];
                for (let i = 0; i < validTextures.length; i++) {
                    if (validTextures[i] != null) {
                        nonNullImports.push({ texture: validTextures[i], sourceIdx: i });
                    }
                }

                const existing = item.Property.Textures;
                const targetMappings = []; // { source, target }
                let importIdx = 0;
                // 先填入现有空槽位
                for (let i = 0; i < existing.length && importIdx < nonNullImports.length; i++) {
                    if (existing[i] == null) {
                        existing[i] = nonNullImports[importIdx].texture;
                        targetMappings.push({ source: nonNullImports[importIdx].sourceIdx, target: i });
                        importIdx++;
                    }
                }
                // 剩余的追加到末尾
                while (importIdx < nonNullImports.length) {
                    if (existing.length >= MAX_TEXTURE_COUNT) {
                        throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`);
                    }
                    existing.push(nonNullImports[importIdx].texture);
                    targetMappings.push({ source: nonNullImports[importIdx].sourceIdx, target: existing.length - 1 });
                    importIdx++;
                }

                // 图层优先级：按实际目标位置映射
                const importedPriority = sanitizePriorityMap(config.overridePriority, MAX_TEXTURE_COUNT);
                if (Object.keys(importedPriority).length > 0) {
                    if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
                        item.Property.OverridePriority = {};
                    }
                    for (const mapping of targetMappings) {
                        const sourceKey = LAYER_NAMES[mapping.source];
                        const targetKey = LAYER_NAMES[mapping.target];
                        if (sourceKey && targetKey && importedPriority[sourceKey] !== undefined) {
                            item.Property.OverridePriority[targetKey] = importedPriority[sourceKey];
                        }
                    }
                }
            } else {
                // 覆盖导入：用剪贴板内容完全替换（保留 null 槽位位置）
                if (validTextures.length > MAX_TEXTURE_COUNT) {
                    throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个，当前 ${validTextures.length} 个）`);
                }
                item.Property.Textures = validTextures;
                trimTrailingNulls(item.Property.Textures);
                // 覆盖模式同步导入隐藏分类开关（兼容旧版配置：无该字段时默认 false）
                for (const cat of HIDE_CATEGORIES) {
                    item.Property[cat.key] = config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] === true;
                }
                // 兼容 v5 及以前配置：旧 hideBody=true 等价于 头部+上半身+下半身 全部隐藏
                if (config.hideBody === true) {
                    item.Property.HideHead = true;
                    item.Property.HideBodyUpper = true;
                    item.Property.HideBodyLower = true;
                }

                // 图层优先级：覆盖模式直接用导入内容替换（兼容旧版配置：无该字段时清空）
                const importedPriority = sanitizePriorityMap(config.overridePriority, MAX_TEXTURE_COUNT);
                if (Object.keys(importedPriority).length > 0) {
                    item.Property.OverridePriority = importedPriority;
                } else {
                    delete item.Property.OverridePriority;
                }
            }

            updateHideArray(item);

            const count = item.Property.Textures.filter(t => t != null).length;
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
