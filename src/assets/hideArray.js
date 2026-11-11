/**
 * 自定义贴图道具 - 隐藏数组逻辑
 * 根据分类开关重新计算 Property.Hide 数组
 */

import { ALL_HIDEABLE_GROUPS, HIDE_CATEGORIES } from "./constants.js";
import { allTexturesReadyForHide } from "./textureReadiness.js";

const HIDEABLE_GROUP_SET = new Set(ALL_HIDEABLE_GROUPS);

/**
 * 清理逐组覆盖表：只保留游戏允许隐藏的组名与布尔值。
 * true = 强制隐藏，false = 强制显示；未列出的组跟随分类开关。
 * @param {*} raw
 * @returns {Record<string, boolean>}
 */
export function sanitizeHideOverrides(raw) {
    /** @type {Record<string, boolean>} */
    const result = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
    for (const group of HIDEABLE_GROUP_SET) {
        if (Object.hasOwn(raw, group) && typeof raw[group] === "boolean") result[group] = raw[group];
    }
    return result;
}

/**
 * 分类开关对该组的基准结果（不考虑逐组覆盖）
 * @param {Item} item
 * @param {string} group
 * @param {string} [currentGroup] - 当前道具自身所在组，拘束分类需排除
 * @returns {boolean}
 */
export function isGroupHiddenByCategory(item, group, currentGroup = item?.Asset?.Group?.Name) {
    for (const cat of HIDE_CATEGORIES) {
        if (item?.Property?.[cat.key] !== true) continue;
        if (!cat.groups.includes(group)) continue;
        if (cat.key === "HideItems" && group === currentGroup) continue;
        return true;
    }
    return false;
}

/**
 * 某个分类下是否存在逐组覆盖（用于把分类按钮显示为「部分」）
 * @param {Item} item
 * @param {{ key: string, groups: string[] }} category
 * @returns {boolean}
 */
export function hasCategoryOverrides(item, category) {
    const overrides = item?.Property?.HideOverrides;
    if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) return false;
    const currentGroup = item.Asset?.Group?.Name;
    return category.groups.some(group =>
        !(category.key === "HideItems" && group === currentGroup) &&
        typeof overrides[group] === "boolean");
}

/**
 * 该组最终是否隐藏：逐组覆盖优先于分类开关
 * @param {Item} item
 * @param {string} group
 * @param {string} [currentGroup]
 * @returns {boolean}
 */
export function isGroupHidden(item, group, currentGroup = item?.Asset?.Group?.Name) {
    const override = item?.Property?.HideOverrides?.[group];
    if (override === true) return true;
    if (override === false) return false;
    return isGroupHiddenByCategory(item, group, currentGroup);
}

/**
 * 切换单组隐藏，并尽量保持覆盖表最小：
 * - 分类已经隐藏时，要显示该组 → 写 false
 * - 分类没有隐藏时，要隐藏该组 → 写 true
 * - 再点一次回到分类基准 → 删除覆盖项
 * @param {Item} item
 * @param {string} group
 * @returns {boolean} 切换后的隐藏状态
 */
export function toggleGroupHidden(item, group) {
    if (!item?.Property || !HIDEABLE_GROUP_SET.has(group)) return false;
    const currentGroup = item.Asset?.Group?.Name;
    if (group === currentGroup) return false;

    const baseHidden = isGroupHiddenByCategory(item, group, currentGroup);
    const overrides = sanitizeHideOverrides(item.Property.HideOverrides);
    const hidden = isGroupHidden(item, group, currentGroup);

    if (hidden) {
        if (baseHidden) overrides[group] = false;
        else delete overrides[group];
    } else if (baseHidden) {
        delete overrides[group];
    } else {
        overrides[group] = true;
    }

    item.Property.HideOverrides = overrides;
    return !hidden;
}

/**
 * 根据分类开关，重新计算 Property.Hide 数组
 * Property.Hide 是 BC 原生支持的隐藏机制：数组中列出的组名对应的图层都不渲染
 * 注意：拘束道具分类需排除当前道具自己所在的组
 *
 * HideOnlyWhenReady 开启时，只要还有任何一张应显示的贴图未就绪、加载失败或域名不可信，
 * 就不隐藏任何部位，保留游戏原本的服装。贴图就绪后再次调用会恢复隐藏。
 * @param {Item} item - 当前道具
 * @param {Character} [character] - 需要绘制该道具的角色（需含 DrawPose/MemberNumber）；缺省时不做异常保护
 * @returns {boolean} 是否需要刷新角色
 */
export function updateHideArray(item, character) {
    if (!item || !item.Property) return false;

    /** @type {string[]} */
    const hide = [];
    const currentGroup = item.Asset?.Group?.Name;
    const allowHiding = item.Property.HideOnlyWhenReady !== true ||
        !character || allTexturesReadyForHide(item, character);

    if (allowHiding) {
        for (const cat of HIDE_CATEGORIES) {
            if (item.Property[cat.key] === true) {
                for (const g of cat.groups) {
                    // 拘束道具分类排除当前道具所在组
                    if (cat.key === "HideItems" && g === currentGroup) continue;
                    hide.push(g);
                }
            }
        }

        // 逐组覆盖：true 强制隐藏，false 从分类结果里移除；未列出的组继续跟随分类
        const overrides = item.Property.HideOverrides;
        if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
            for (const [group, hidden] of Object.entries(overrides)) {
                if (!HIDEABLE_GROUP_SET.has(group) || group === currentGroup) continue;
                if (hidden === true) {
                    if (!hide.includes(group)) hide.push(group);
                } else if (hidden === false) {
                    const index = hide.indexOf(group);
                    if (index !== -1) hide.splice(index, 1);
                }
            }
        }
    }

    // 比较新旧数组内容是否一致
    const oldHide = item.Property.Hide || [];
    const newHideStr = [...hide].sort().join(",");
    const oldHideStr = [...oldHide].sort().join(",");
    const needsRefresh = newHideStr !== oldHideStr;

    if (hide.length > 0) {
        item.Property.Hide = hide;
    } else {
        delete item.Property.Hide;
    }

    return needsRefresh;
}
