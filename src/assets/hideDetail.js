/**
 * 自定义贴图道具 - 详细调整页面
 * 逐组切换是否隐藏，覆盖隐藏设置里的分类开关。
 * 所有修改先只在本机渲染；点击「确认并同步」后才上传服务器，只触发一次编辑广播。
 */

import { t, L, getLanguage } from "../i18n/index.js";
import { HIDE_CATEGORIES } from "./constants.js";
import { state } from "./state.js";
import { isGroupHidden, toggleGroupHidden, updateHideArray } from "./hideArray.js";
import { syncItemToServer } from "./serverSync.js";
import { drawHoverTooltip } from "./hoverTooltip.js";
import { Logger } from "@lib/utils.js";

const PAGE_SIZE = 16; // 2 列 × 8 行
const TAB = { x: 1000, y: 430, w: 220, h: 40, stepX: 230, stepY: 46, cols: 4 };
const LIST_Y = 545;
const ROW_H = 45;
// DrawTextFit 的 X 是文本中心；左右列各留 250px 宽度给组名
const COLUMNS = [
    { labelX: 1075, labelW: 250, toggleX: 1210 },
    { labelX: 1575, labelW: 250, toggleX: 1710 }
];
const TOGGLE_W = 100;
const TOGGLE_H = 40;
const RESET_BTN = { x: 1000, y: 915, w: 180, h: 45 };
const PREV_BTN = { x: 1200, y: 915, w: 150, h: 45 };
const NEXT_BTN = { x: 1650, y: 915, w: 150, h: 45 };
const CONFIRM_BTN = { x: 1665, y: 135, w: 200, h: 90 };
const BACK_BTN = { x: 1885, y: 25, w: 90, h: 90 };

/** 当前分类与可切换的组（拘束分类排除本道具自身所在组） */
function getCategoryGroups(item) {
    const index = Math.min(Math.max(state.hideDetailCategory, 0), HIDE_CATEGORIES.length - 1);
    const category = HIDE_CATEGORIES[index];
    const currentGroup = item?.Asset?.Group?.Name;
    const groups = category.groups.filter(group =>
        !(category.key === "HideItems" && group === currentGroup));
    return { category, groups };
}

function getPageCount(groups) {
    return Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
}

let _dictLanguage = null;
let _dict = null;

/** 当前语言的资产翻译词典（BC 的 Assets/Female3DCG_<lang>.txt） */
function activeDictionary() {
    const raw = typeof TranslationLanguage === "string" ? TranslationLanguage : "";
    const mapped = getLanguage();
    const languages = [...new Set([raw, mapped].filter(Boolean))];
    if (!languages.length) return null;
    const cacheKey = languages.join("|");
    if (_dictLanguage === cacheKey && _dict) return _dict;
    try {
        if (typeof TranslationCache !== "object" || !TranslationCache) return null;
        let dict = null;
        for (const language of languages) {
            const exact = `Assets/Female3DCG_${language}.txt`;
            if (Array.isArray(TranslationCache[exact])) {
                dict = TranslationCache[exact];
                break;
            }
            const key = Object.keys(TranslationCache).find(name =>
                name.includes(`Female3DCG_${language}`) && Array.isArray(TranslationCache[name]));
            if (key) {
                dict = TranslationCache[key];
                break;
            }
        }
        if (dict) {
            _dictLanguage = cacheKey;
            _dict = dict;
        }
        return dict;
    } catch (_) {
        return null;
    }
}

function translateText(text) {
    if (!text) return text;
    const dict = activeDictionary();
    if (!dict || typeof TranslationString !== "function") return text;
    try {
        return TranslationString(text, dict) || text;
    } catch (_) {
        return text;
    }
}

/** 组名优先使用游戏翻译；没有组名条目时再试英文描述 */
function localizeGroupLabel(group, description) {
    const fallback = description && !String(description).startsWith("MISSING") ? description : "";
    const byDescription = fallback ? translateText(fallback) : "";
    if (byDescription && byDescription !== fallback) return byDescription;
    const byName = translateText(group);
    if (byName && byName !== group) return byName;
    return fallback || group;
}

/** 游戏内的组显示名；自定义组或未注册组回退到内部组名 */
function groupLabel(group) {
    try {
        const info = typeof AssetGroupGet === "function" ? AssetGroupGet("Female3DCG", group) : null;
        return localizeGroupLabel(group, info?.Description);
    } catch (_) {
        return localizeGroupLabel(group, "");
    }
}

function categoryLabel(category) {
    return L(category.label, category.labelEn);
}

/** 物品显示名：优先自定义名/本地化描述，不再显示内部资源名 */
function localizeItemLabel(item) {
    if (item?.Craft?.Name) return item.Craft.Name;
    const asset = item?.Asset;
    const description = asset?.Description;
    if (description && !String(description).startsWith("MISSING")) {
        const translated = translateText(description);
        if (translated && translated !== description) return translated;
        return description;
    }
    return translateText(asset?.Name || "");
}

/** 当前角色该部位正在使用的物品名（支持同组多件） */
function getWornItemName(character, group) {
    const names = [];
    for (const item of character?.Appearance || []) {
        if (item?.Asset?.Group?.Name !== group) continue;
        const name = localizeItemLabel(item);
        if (name && !names.includes(name)) names.push(name);
    }
    return names.join(" / ");
}

/** 本地预览：只重算并重绘，不发送任何服务器同步 */
function preview(item) {
    const C = CharacterGetCurrent();
    updateHideArray(item, C);
    if (C) CharacterRefresh(C, false, false);
}

/** 确认：一次性同步服务器，只触发一次编辑广播 */
function confirmAndSync(item) {
    const C = CharacterGetCurrent();
    updateHideArray(item, C);
    syncItemToServer(item);
    state.originalHideOverrides = null;
    state.currentView = "hide";
    if (C) CharacterRefresh(C, false, false);
}

/** 返回：丢弃本次详细调整，还原进入前的逐组覆盖 */
function cancelAndReturn(item) {
    if (state.originalHideOverrides !== null) {
        item.Property.HideOverrides = JSON.parse(JSON.stringify(state.originalHideOverrides));
    }
    state.originalHideOverrides = null;
    state.currentView = "hide";
    const C = CharacterGetCurrent();
    updateHideArray(item, C);
    if (C) CharacterRefresh(C, false, false);
}

/**
 * 绘制详细调整页
 * @param {Item} item
 */
export function drawHideDetail(item) {
    const { groups } = getCategoryGroups(item);
    const totalPages = getPageCount(groups);
    if (state.hideDetailPage >= totalPages) state.hideDetailPage = totalPages - 1;
    if (state.hideDetailPage < 0) state.hideDetailPage = 0;

    DrawText(t("listView.detailed_hide"), 1500, 360, "White", "Gray");
    DrawText(t("listView.detailed_hide_hint"), 1505, 410, "#fff942", "Gray");

    // 分类标签：两行四列
    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const row = Math.floor(i / TAB.cols);
        const col = i % TAB.cols;
        const x = TAB.x + col * TAB.stepX;
        const y = TAB.y + row * TAB.stepY;
        const active = i === state.hideDetailCategory;
        DrawButton(x, y, TAB.w, TAB.h, categoryLabel(cat),
            active ? "#4CAF50" : "#666666", null, categoryLabel(cat), false);
    }

    // 组列表：两列
    const character = CharacterGetCurrent();
    const pageStart = state.hideDetailPage * PAGE_SIZE;
    const visible = groups.slice(pageStart, pageStart + PAGE_SIZE);
    let hoverText = "";
    for (let i = 0; i < visible.length; i++) {
        const group = visible[i];
        const col = i % COLUMNS.length;
        const row = Math.floor(i / COLUMNS.length);
        const layout = COLUMNS[col];
        const y = LIST_Y + row * ROW_H;
        const hidden = isGroupHidden(item, group);
        const label = groupLabel(group);
        const worn = getWornItemName(character, group);
        const empty = !worn;
        // 空部位用灰色 + 「无」标记，和已穿戴部位区分开
        const labelText = empty ? `${label} · ${t("listView.none")}` : label;

        DrawTextFit(labelText, layout.labelX, y + 24, layout.labelW, empty ? "#8a8a8a" : "White", "Gray");
        DrawButton(layout.toggleX, y, TOGGLE_W, TOGGLE_H,
            hidden ? t("listView.hidden") : t("listView.shown"),
            hidden ? "#666666" : "#4CAF50", null, "", false);

        const rowX = layout.labelX - layout.labelW / 2;
        const rowW = layout.toggleX + TOGGLE_W - rowX;
        if (MouseIn(rowX, y, rowW, ROW_H)) {
            hoverText = empty ? t("listView.none") : t("listView.equipped_item", [worn]);
        }
    }

    // 分页与清除覆盖
    DrawButton(RESET_BTN.x, RESET_BTN.y, RESET_BTN.w, RESET_BTN.h,
        t("listView.clear_category_overrides"), "#9E9E9E", null,
        t("listView.clear_category_overrides"), false);
    DrawButton(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h,
        t("tutorial.prev"), "#555555", null, "", state.hideDetailPage <= 0);
    DrawButton(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h,
        t("tutorial.next"), "#555555", null, "", state.hideDetailPage >= totalPages - 1);
    DrawText(t("tutorial.page", [state.hideDetailPage + 1, totalPages]), 1500, 942, "White", "Black");

    // 确认并同步 / 返回并放弃
    DrawButton(CONFIRM_BTN.x, CONFIRM_BTN.y, CONFIRM_BTN.w, CONFIRM_BTN.h,
        t("listView.confirm_and_sync"), "#4CAF50", null,
        t("listView.confirm_and_sync"), false);
    DrawButton(BACK_BTN.x, BACK_BTN.y, BACK_BTN.w, BACK_BTN.h, "", "White",
        "Icons/Exit.png", t("listView.back_and_discard"));

    if (hoverText) drawHoverTooltip(hoverText, 650);
}

/**
 * 处理详细调整页点击
 * @param {Item} item
 */
export function handleHideDetailClick(item) {
    if (!item) return;

    if (MouseIn(BACK_BTN.x, BACK_BTN.y, BACK_BTN.w, BACK_BTN.h)) {
        cancelAndReturn(item);
        return;
    }
    if (MouseIn(CONFIRM_BTN.x, CONFIRM_BTN.y, CONFIRM_BTN.w, CONFIRM_BTN.h)) {
        confirmAndSync(item);
        return;
    }

    // 分类标签
    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const row = Math.floor(i / TAB.cols);
        const col = i % TAB.cols;
        const x = TAB.x + col * TAB.stepX;
        const y = TAB.y + row * TAB.stepY;
        if (MouseIn(x, y, TAB.w, TAB.h)) {
            state.hideDetailCategory = i;
            state.hideDetailPage = 0;
            return;
        }
    }

    const { category, groups } = getCategoryGroups(item);
    const totalPages = getPageCount(groups);
    if (state.hideDetailPage >= totalPages) state.hideDetailPage = totalPages - 1;
    if (state.hideDetailPage < 0) state.hideDetailPage = 0;

    if (MouseIn(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h) && state.hideDetailPage > 0) {
        state.hideDetailPage--;
        return;
    }
    if (MouseIn(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h) && state.hideDetailPage < totalPages - 1) {
        state.hideDetailPage++;
        return;
    }
    if (MouseIn(RESET_BTN.x, RESET_BTN.y, RESET_BTN.w, RESET_BTN.h)) {
        const overrides = item.Property.HideOverrides;
        if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
            const next = { ...overrides };
            for (const group of category.groups) delete next[group];
            item.Property.HideOverrides = next;
            preview(item);
        }
        return;
    }

    const visible = groups.slice(state.hideDetailPage * PAGE_SIZE,
        state.hideDetailPage * PAGE_SIZE + PAGE_SIZE);
    for (let i = 0; i < visible.length; i++) {
        const col = i % COLUMNS.length;
        const row = Math.floor(i / COLUMNS.length);
        const layout = COLUMNS[col];
        const y = LIST_Y + row * ROW_H;
        if (MouseIn(layout.toggleX, y, TOGGLE_W, TOGGLE_H)) {
            const group = visible[i];
            const hidden = toggleGroupHidden(item, group);
            Logger.info(`详细调整 - ${group}: ${hidden}`);
            preview(item);
            return;
        }
    }
}
