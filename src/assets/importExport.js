import { t } from "../i18n/index.js";
import { sanitizeTexture } from "./textureValidation.js";
/**
 * 自定义贴图道具 - 配置导入/导出
 */

import { LAYER_NAMES, MAX_TEXTURE_COUNT, HIDE_CATEGORIES, DEFAULT_PROPS, migrateScaleField, trimTrailingNulls } from "./constants.js";
import { state, showStatus } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { updateHideArray } from "./hideArray.js";
import { Logger } from "@lib/utils.js";

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
    Promise.resolve().then(() => navigator.clipboard.writeText(json)).then(() => {
        Logger.info("配置已复制到剪贴板");
        showStatus(t("importExport.copied_to_clipboard_layers", [usedCount]), "#4CAF50");
    }).catch(err => {
        Logger.warn(t("importExport.clipboard_copy_failed_downloading_instead", [err?.message ?? err]));
        // 降级方案：创建下载
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shuang-custom-assets-config.json";
        a.click();
        URL.revokeObjectURL(url);
        showStatus(t("importExport.clipboard_unavailable_downloaded_config_file"), "#FF9800");
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
    const targetCharacter = CharacterGetCurrent();
    return Promise.resolve().then(() => navigator.clipboard.readText()).then(text => {
        if (DialogFocusItem !== item || CharacterGetCurrent() !== targetCharacter) return;
        try {
            const config = JSON.parse(text);
            if (config.type !== "ShuangCustomAssets") {
                throw new Error(t("validation.invalid_type"));
            }
            if (!Array.isArray(config.textures)) {
                throw new Error(t("validation.invalid_format"));
            }

            const validTextures = config.textures.map(t => {
                if (t == null) return null;
                const cleaned = sanitizeTexture(t);
                cleaned.TextureURLSource = typeof Player?.MemberNumber === "number" ? Player.MemberNumber : 0;
                cleaned.CurrentConfigurator = cleaned.TextureURLSource;
                return cleaned;
            });
            // Validate capacity before touching the live item, including holes in the existing array.
            const existingCount = (item.Property?.Textures || []).filter(Boolean).length;
            const importCount = validTextures.filter(Boolean).length;
            if ((mode === "append" && existingCount + importCount > MAX_TEXTURE_COUNT)
                || (mode !== "append" && validTextures.length > MAX_TEXTURE_COUNT)) {
                throw new Error(t("importExport.texture_limit_exceeded"));
            }

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
                        throw new Error(t("importExport.texture_limit_exceeded"));
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
                    throw new Error(t("importExport.texture_limit_exceeded"));
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
            showStatus(t("importExport.import_ok_layers", [modeText, count, modeTextEn]), "#4CAF50");

            // 同步到服务器并刷新角色
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
        } catch (err) {
            // 导入失败多半是剪贴板里不是本插件的配置 JSON（用户操作问题），不是程序错误，
            // 用 warn 而非 error，避免控制台弹红色报错吓到玩家；真正的提示走下方 showStatus
            Logger.warn(t("importExport.import_failed", [err.message]));
            showStatus(t("importExport.import_failed_2", [err.message]), "#E53935");
        }
    }).catch(err => {
        Logger.warn(t("importExport.cannot_read_clipboard", [err?.message ?? err]));
        showStatus(t("importExport.cannot_read_clipboard_make_sure_the_config_json_is_copied"), "#E53935");
    });
}
