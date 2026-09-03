import { t, L } from "../i18n/index.js";
import { drawTextureSlots, clickTextureSlots } from "./textureListCanvas.js";
/**
 * 自定义贴图道具 - 列表/隐藏/域名确认页面
 * 包含贴图管理主列表、隐藏设置、添加可信域名确认页面的绘制与点击处理
 */

import {
    MAX_TEXTURE_COUNT, TEXTURES_PER_PAGE, LAYER_NAMES,
    DEFAULT_TEXTURE, DEFAULT_PROPS, HIDE_CATEGORIES, trimTrailingNulls
} from "./constants.js";
import { state, resetDragState, showStatus } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { updateHideArray } from "./hideArray.js";
import { createEditInputs, unregisterPoseHook } from "./editPanel.js";
import { exportConfig, importConfig } from "./importExport.js";
import { Logger } from "@lib/utils.js";
import { extractDomain, addDomainToWhitelist, isPlayerBlocked, togglePlayerBlocked } from "./settings.js";

/**
 * 绘制添加可信域名确认页面
 */
export function drawAddDomainConfirm() {
    DrawText(t("listView.confirm_trusted_domain"), 1500, 370, "Red", "Gray");

    let y = 440;
    const lines = [{t: t("listView.help_line_1", [state.pendingDomainToAdd]), c: "Cyan"}, {t: "", c: "White"}, {t: t("listView.help_line_2"), c: "White"}, {t: "", c: "White"}, {t: t("listView.help_line_3"), c: "White"}, {t: t("listView.help_line_4"), c: "White"}, {t: t("listView.help_line_5"), c: "White"}, {t: t("listView.help_line_6"), c: "White"}, {t: t("listView.help_line_7"), c: "White"}, {t: "", c: "White"}, {t: t("listView.help_line_8"), c: "Red"}];

    for (const line of lines) {
        DrawText(line.t, 1500, y, line.c, "Black");
        y += 35;
    }

    y += 10;
    DrawButton(1250, y, 200, 50, t("listView.add"), "#4CAF50", null);
    DrawButton(1500, y, 200, 50, t("listView.cancel"), "#9E9E9E", null);
}

/**
 * 处理添加可信域名确认页面点击
 */
export function handleAddDomainConfirmClick(item, data) {
    const baseY = 440 + 35 * 11 + 10;
    // 确认添加
    if (MouseIn(1250, baseY, 200, 50)) {
        if (state.pendingDomainToAdd) {
            const success = addDomainToWhitelist(state.pendingDomainToAdd);
            if (success) {
                Logger.info(`已添加可信域名: ${state.pendingDomainToAdd}`);
                showStatus(t("listView.trusted_domain_added", [state.pendingDomainToAdd]), "#4CAF50");
            }
        }
        state.pendingDomainToAdd = null;
        state.currentView = "list";
        // 刷新预览
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }
    // 取消
    if (MouseIn(1500, baseY, 200, 50)) {
        state.pendingDomainToAdd = null;
        state.currentView = "list";
        return;
    }
}

/**
 * 绘制隐藏设置页面
 */
export function drawHideSettings(item) {
    // 标题 / 副标题：与主列表页共用同一套居中坐标
    DrawText(t("listView.hide_settings"), 1500, 360, "White", "Gray");
    DrawText(t("listView.choose_which_part_categories_to_hide"), 1505, 410, "#fff942", "Gray");

    const startY = 450;
    // 身体拆为 头部/上半身/下半身 后分类数 6→8，行高收紧避免溢出画布底部
    const rowHeight = 55;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        const isHidden = item.Property?.[cat.key] === true;
        const catLabel = L(cat.label, cat.labelEn);

        DrawText(catLabel, 1100, y + 20, "White");
        DrawButton(1200, y, 400, 40, t("listView.parts", [cat.groups.length]), "White", null,
            t("listView.this_category_covers_groups", [cat.groups.length]), false);
        // 与列表页贴图可见开关保持一致的显示/隐藏配色
        DrawButton(1620, y, 100, 40, isHidden ? t("listView.hidden") : t("listView.shown"),
            isHidden ? "#666666" : "#4CAF50",
            null, t("listView.toggle_hiding", [catLabel]), false);
    }

    // 确认（返回列表）
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        t("listView.confirm_back_to_list"));
}

/**
 * 处理隐藏设置页面点击
 */
export function handleHideSettingsClick(item) {
    const startY = 450;
    // 身体拆为 头部/上半身/下半身 后分类数 6→8，行高收紧避免溢出画布底部
    const rowHeight = 55;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        if (MouseIn(1620, y, 100, 40)) {
            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            item.Property[cat.key] = !(item.Property[cat.key] === true);
            updateHideArray(item);
            Logger.info(`${cat.label} 切换为: ${item.Property[cat.key]}`);
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
            return;
        }
    }

    // 确认（返回列表）
    if (MouseIn(1885, 135, 90, 90)) {
        state.currentView = "list";
        return;
    }
}

/**
 * 绘制主界面：贴图列表
 */
export function drawTextureListMain(item, data, locked = false) {
    const textures = item.Property?.Textures || [];

    DrawText(t("listView.texture_manager"), 1500, 360, "White", "Gray");
    const usedSlots = textures.filter(t => t != null).length;
    DrawText(t("listView.slots_used", [usedSlots, MAX_TEXTURE_COUNT]), 1505, 410, "#ebfe58", "Gray");

    // 隐藏设置跳转（右上角图标按钮）
    DrawButton(1665, 25, 90, 90, "", "White", "Icons/Naked.png",
        t("listView.hide_settings_hide_body_parts_clothing"));

    // 教程按钮（确认并退出按钮左侧）
    DrawButton(1775, 135, 90, 90, "", "White", "Icons/Question.png",
        t("listView.tutorial"));
    const member = CharacterGetCurrent()?.MemberNumber;
    if (Number.isSafeInteger(member) && member > 0 && member !== Player.MemberNumber) {
        DrawButton(1665, 135, 90, 90, "", "White", isPlayerBlocked(member) ? "Icons/Private.png" : "Icons/Public.png",
            t(isPlayerBlocked(member) ? "settings.unblock_images" : "settings.block_images"));
    }

    const startY = 450;
    const itemHeight = 60;

    // 分页计算：基于固定槽位上限
    const totalPages = Math.max(1, Math.ceil(MAX_TEXTURE_COUNT / TEXTURES_PER_PAGE));
    if (state.currentListPage >= totalPages) state.currentListPage = totalPages - 1;
    if (state.currentListPage < 0) state.currentListPage = 0;

    drawTextureSlots(item, locked);
    DrawButton(1885, 245, 90, 90, "", state.deleteMode ? "#f7aaaa" : "White", "Icons/Trash.png",
        state.deleteMode ? t("listView.finish_deleting") : t("listView.delete_mode_click_a_slot_s_delete_button"));

    // 底部按钮固定位置
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;

    // 翻页按钮：按槽位上限决定页数
    const hasPages = totalPages > 1;
    if (hasPages) {
        DrawButton(1885, 810, 90, 90, "", "White", "Icons/Down.png",
            t("listView.next_page"), !hasPages);
    }
    // 确认并退出：保存同步后关闭对话框
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        t("listView.confirm_exit_save_and_close"));

    // 导入导出按钮
    const ioBtnY = btnY + 120;
    DrawButton(1170, ioBtnY, 200, 50, t("listView.export"), "#4CAF50", null,
        t("listView.copy_current_config_to_clipboard"), false);
    DrawButton(1390, ioBtnY, 200, 50, t("listView.import_replace"), "#28639A", null,
        t("listView.replace_all_layers_with_clipboard_config"), false);
    DrawButton(1610, ioBtnY, 200, 50, t("listView.import_append"), "#28639A", null,
        t("listView.append_clipboard_config_after_current_layers"), false);

    // 导入/导出结果提示（任务3：显示在 1505,890）
    if (state.statusMessage && Date.now() < state.statusMessageExpiry) {
        DrawText(state.statusMessage.text, 1505, 890, state.statusMessage.color, "Black");
    }
}

/**
 * 处理主界面点击
 */
export function handleTextureListClick(item, data) {
    if (clickTextureSlots(item, (action, index) => handleSlotAction(item, data, action, index))) return;

    // 隐藏设置跳转
    if (MouseIn(1665, 25, 90, 90)) {
        state.currentView = "hide";
        return;
    }

    // 教程按钮
    if (MouseIn(1775, 135, 90, 90)) {
        state.currentView = "tutorial";
        state.tutorialPage = 0;
        return;
    }

    const startY = 450;
    const itemHeight = 60;

    // 分页计算：基于固定槽位上限
    const totalPages = Math.max(1, Math.ceil(MAX_TEXTURE_COUNT / TEXTURES_PER_PAGE));
    if (state.currentListPage >= totalPages) state.currentListPage = totalPages - 1;
    if (state.currentListPage < 0) state.currentListPage = 0;

    if (MouseIn(1885, 235, 90, 90)) {
        state.deleteMode = !state.deleteMode;
        return;
    }

    // 翻页按钮
    const hasPages = totalPages > 1;
    if (hasPages && MouseIn(1885, 810, 90, 90)) {
        state.currentListPage = (state.currentListPage + 1) % totalPages;
        return;
    }

    // 确认并退出（任务1）：保存同步后关闭整个对话框
    if (MouseIn(1885, 135, 90, 90)) {
        const C = CharacterGetCurrent();
        if (item) {
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            // 保存前确保 Hide 数组与开关一致
            updateHideArray(item);

            Logger.info("保存贴图数据:", JSON.stringify(item.Property.Textures));
            Logger.info(`隐藏分类 - ${HIDE_CATEGORIES.map(c => `${c.label}: ${item.Property[c.key]}`).join(', ')}`);

            syncItemToServer(item);
            if (C) CharacterRefresh(C, false, false);
            Logger.info("贴图设置已保存并同步");
        }
        // 退出对话框（currentView 为 list，不会被 DialogLeaveFocusItem hook 拦截）
        if (typeof DialogLeaveFocusItem === "function") DialogLeaveFocusItem();
        return;
    }

    // 导入导出按钮
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;
    const ioBtnY = btnY + 120;

    // 导出配置
    if (MouseIn(1170, ioBtnY, 200, 50)) {
        exportConfig(item);
        return;
    }

    // 覆盖导入
    if (MouseIn(1390, ioBtnY, 200, 50)) {
        importConfig(item, "overwrite");
        return;
    }

    // 追加导入
    if (MouseIn(1610, ioBtnY, 200, 50)) {
        // 预检查：当前已使用槽位达上限，无法追加
        const usedSlots = (item.Property?.Textures || []).filter(t => t != null).length;
        if (usedSlots >= MAX_TEXTURE_COUNT) {
            showStatus(t("listView.texture_limit_reached_max", [MAX_TEXTURE_COUNT]), "#E53935");
            return;
        }
        importConfig(item, "append");
        return;
    }
}

export function handlePlayerBlockClick() {
    const member = CharacterGetCurrent()?.MemberNumber;
    if (state.currentView !== "list" || state.currentEditTexture >= 0 || !MouseIn(1665, 135, 90, 90) || member === Player.MemberNumber || !Number.isSafeInteger(member) || member <= 0) return false;
    togglePlayerBlocked(member);
    return true;
}

/**
 * 从子页面（编辑图层 / 隐藏设置 / 添加域名确认）返回贴图管理列表
 * 若正在编辑图层，则视为「取消编辑」：还原为编辑前数据（新增未保存的空图层则移除）
 */
export function returnToListFromSubview() {
    if (state.currentEditTexture >= 0) {
        const item = DialogFocusItem;
        if (item) {
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            if (state.originalEditTexture) {
                // 编辑已存在图层：深拷贝还原（避免 PoseSettings 引用共享）
                item.Property.Textures[state.currentEditTexture] = JSON.parse(JSON.stringify(state.originalEditTexture));
            } else {
                // 新增但未确认的图层：取消即清空该槽位
                item.Property.Textures[state.currentEditTexture] = null;
                trimTrailingNulls(item.Property.Textures);
            }
            if (state.originalOverridePriority !== undefined) {
                item.Property.OverridePriority = JSON.parse(JSON.stringify(state.originalOverridePriority));
            } else {
                delete item.Property.OverridePriority;
            }
            state._fieldsDirty = false;
            state._pendingTextureRefresh = false;
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
        }
    }
    state.currentEditTexture = -1;
    state.tempTextureData = null;
    state.originalEditTexture = null;
    state.originalOverridePriority = undefined;
    state.pendingDomainToAdd = null;
    state.poseSwitchMode = false;
    unregisterPoseHook();
    resetDragState();
    state.currentView = "list";
}

/** Shared by Canvas buttons; always recheck item and lock permissions. */
export function handleSlotAction(item, data, action, index) {
    if (DialogFocusItem !== item || state.currentView !== "list" || state.currentEditTexture >= 0) return;
    const C = CharacterGetCurrent();
    if (item.Property?.LockedBy && (!C || !DialogCanUnlock(C, item))) return;
    if (!item.Property) item.Property = { ...DEFAULT_PROPS, Textures: [] };
    const textures = item.Property.Textures ||= [];
    const texture = textures[index];
    if (action === "delete" && state.deleteMode && texture) {
        textures[index] = null;
        trimTrailingNulls(textures);
        if (item.Property.OverridePriority) delete item.Property.OverridePriority[LAYER_NAMES[index]];
    } else if (state.deleteMode) return;
    else if (action === "alias" && texture) {
        const alias = prompt(t("listView.enter_layer_alias_leave_empty_to_clear"), texture.Alias || "");
        if (alias === null) return;
        texture.Alias = alias.trim().slice(0, 200);
    } else if (action === "visible" && texture) {
        texture.Visible = texture.Visible === false;
        texture.CurrentConfigurator = Player.MemberNumber || 0;
    } else if (action === "edit" || action === "add") {
        const value = texture || JSON.parse(JSON.stringify(DEFAULT_TEXTURE));
        state.originalEditTexture = texture ? JSON.parse(JSON.stringify(texture)) : null;
        textures[index] = value;
        state.currentEditTexture = index;
        state.tempTextureData = JSON.parse(JSON.stringify(value));
        data.PersistentData ||= {};
        data.PersistentData._originalTexture = JSON.parse(JSON.stringify(value));
        createEditInputs(value);
        resetDragState();
        return;
    } else if (action === "trust" && texture) {
        state.pendingDomainToAdd = extractDomain(texture.TextureURL);
        state.currentView = "addDomainConfirm";
        return;
    } else return;
    syncItemToServer(item);
    if (C) CharacterRefresh(C, false, false);
}
