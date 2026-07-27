/**
 * 自定义贴图道具 - 隐藏数组逻辑
 * 根据分类开关重新计算 Property.Hide 数组
 */

import { HIDE_CATEGORIES } from "./constants.js";

/**
 * 根据分类开关，重新计算 Property.Hide 数组
 * Property.Hide 是 BC 原生支持的隐藏机制：数组中列出的组名对应的图层都不渲染
 * 注意：拘束道具分类需排除当前道具自己所在的组
 * @param {Item} item - 当前道具
 * @returns {boolean} 是否需要刷新角色
 */
export function updateHideArray(item) {
    if (!item || !item.Property) return false;

    /** @type {string[]} */
    const hide = [];
    const currentGroup = item.Asset?.Group?.Name;

    for (const cat of HIDE_CATEGORIES) {
        if (item.Property[cat.key] === true) {
            for (const g of cat.groups) {
                // 拘束道具分类排除当前道具所在组
                if (cat.key === "HideItems" && g === currentGroup) continue;
                hide.push(g);
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
