/**
 * 自定义贴图道具 - 列表/隐藏/域名确认页面
 * 包含贴图管理主列表、隐藏设置、添加可信域名确认页面的绘制与点击处理
 */

import {
    MAX_TEXTURE_COUNT, TEXTURES_PER_PAGE,
    DEFAULT_TEXTURE, DEFAULT_PROPS, HIDE_CATEGORIES, trimTrailingNulls
} from "./constants.js";
import { state, resetDragState, showStatus } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { updateHideArray } from "./hideArray.js";
import { createEditInputs, unregisterPoseHook } from "./editPanel.js";
import { exportConfig, importConfig } from "./importExport.js";
import { L, isChineseLang, Logger } from "@lib/utils.js";
import { isDomainInWhitelist, extractDomain, addDomainToWhitelist } from "./settings.js";

/**
 * 绘制添加可信域名确认页面
 */
export function drawAddDomainConfirm() {
    DrawText(L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠"), 1500, 370, "Red", "Gray");

    let y = 440;
    const lines = isChineseLang() ? [
        { t: `即将添加域名到白名单: ${state.pendingDomainToAdd}`, c: "Cyan" },
        { t: "", c: "White" },
        { t: "添加后，来自该域名的贴图 URL 将被允许加载", c: "White" },
        { t: "", c: "White" },
        { t: "请注意以下风险：", c: "White" },
        { t: "1. 请确认您信任该域名提供者", c: "White" },
        { t: "2. 该域名的所有 URL 都将被加载", c: "White" },
        { t: "3. 恶意域名可能用于追踪您的 IP 地址", c: "White" },
        { t: "4. 恶意域名可能导致隐私信息泄露", c: "White" },
        { t: "", c: "White" },
        { t: "确定要添加此域名到可信列表吗？", c: "Red" },
    ] : [
        { t: `About to add domain to whitelist: ${state.pendingDomainToAdd}`, c: "Cyan" },
        { t: "", c: "White" },
        { t: "Once added, texture URLs from this domain will be allowed", c: "White" },
        { t: "", c: "White" },
        { t: "Please note the following risks:", c: "White" },
        { t: "1. Make sure you trust this domain's provider", c: "White" },
        { t: "2. All URLs from this domain will be loaded", c: "White" },
        { t: "3. A malicious domain may track your IP address", c: "White" },
        { t: "4. A malicious domain may leak private info", c: "White" },
        { t: "", c: "White" },
        { t: "Add this domain to the trusted list?", c: "Red" },
    ];

    for (const line of lines) {
        DrawText(line.t, 1500, y, line.c, "Black");
        y += 35;
    }

    y += 10;
    DrawButton(1250, y, 200, 50, L("确认添加", "Add"), "#4CAF50", "#66BB6A", false,
        L(`将 ${state.pendingDomainToAdd} 加入白名单`, `Add ${state.pendingDomainToAdd} to whitelist`));
    DrawButton(1500, y, 200, 50, L("取消", "Cancel"), "#9E9E9E", "#BDBDBD", false,
        L("放弃添加并返回", "Discard and go back"));
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
                showStatus(L(`✔ 已添加可信域名: ${state.pendingDomainToAdd}`,
                    `✔ Trusted domain added: ${state.pendingDomainToAdd}`), "#4CAF50");
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
    DrawText(L("隐藏设置", "Hide Settings"), 1500, 360, "White", "Gray");
    DrawText(L("选择需要隐藏的部位分类", "Choose which part categories to hide"), 1505, 410, "#fff942", "Gray");

    const startY = 450;
    // 身体拆为 头部/上半身/下半身 后分类数 6→8，行高收紧避免溢出画布底部
    const rowHeight = 55;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        const isHidden = item.Property?.[cat.key] === true;
        const catLabel = L(cat.label, cat.labelEn);

        DrawText(catLabel, 1100, y + 20, "White");
        DrawButton(1200, y, 400, 40, L(`${cat.groups.length}个部位`, `${cat.groups.length} parts`), "White", null,
            L(`该分类包含 ${cat.groups.length} 个部位组`, `This category covers ${cat.groups.length} groups`), false);
        // 与列表页贴图可见开关保持一致的显示/隐藏配色
        DrawButton(1620, y, 100, 40, isHidden ? L("隐藏", "Hidden") : L("显示", "Shown"),
            isHidden ? "#666666" : "#4CAF50",
            null, L(`点击切换是否隐藏「${catLabel}」`, `Toggle hiding "${catLabel}"`), false);
    }

    // 确认（返回列表）
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        L("确认并返回列表", "Confirm & back to list"));
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
export function drawTextureListMain(item) {
    const textures = item.Property?.Textures || [];

    DrawText(L("贴图管理", "Texture Manager"), 1500, 360, "White", "Gray");
    const usedSlots = textures.filter(t => t != null).length;
    DrawText(L(`已使用 ${usedSlots}/${MAX_TEXTURE_COUNT} 个槽位`,
        `${usedSlots}/${MAX_TEXTURE_COUNT} slots used`), 1505, 410, "#ebfe58", "Gray");

    // 隐藏设置跳转（右上角图标按钮）
    DrawButton(1665, 25, 90, 90, "", "White", "Icons/Private.png",
        L("隐藏设置：隐藏身体部位/服饰等", "Hide settings: hide body parts / clothing"));

    // 教程按钮（确认并退出按钮下方）
    DrawButton(1885, 235, 90, 90, "", "White", "Icons/Question.png",
        L("使用教程", "Tutorial"));

    const startY = 450;
    const itemHeight = 60;

    // 分页计算：基于固定 16 个槽位
    const totalPages = Math.max(1, Math.ceil(MAX_TEXTURE_COUNT / TEXTURES_PER_PAGE));
    if (state.currentListPage >= totalPages) state.currentListPage = totalPages - 1;
    if (state.currentListPage < 0) state.currentListPage = 0;
    const pageStart = state.currentListPage * TEXTURES_PER_PAGE;
    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, MAX_TEXTURE_COUNT);

    for (let i = pageStart; i < pageEnd; i++) {
        const y = startY + (i - pageStart) * itemHeight;
        const texture = textures[i];

        DrawText(L(`槽位${i + 1}:`, `Slot ${i + 1}:`), 1100, y + 20, "White");

        if (texture) {
            // 已使用槽位：别名/URL 预览、显示/隐藏开关、编辑按钮、信任按钮
            const urlPreview = texture.TextureURL
                ? (texture.TextureURL.length > 12 ? texture.TextureURL.substring(0, 12) + "..." : texture.TextureURL)
                : L("(空)", "(empty)");
            const displayText = texture.Alias || urlPreview;

            DrawButton(1200, y, 400, 40, displayText, "White", null,
                L("点击修改别名", "Click to edit alias"), false);

            const isVisible = texture.Visible !== false;
            DrawButton(1620, y, 100, 40, isVisible ? L("显示", "Shown") : L("隐藏", "Hidden"),
                isVisible ? "#4CAF50" : "#666666", null,
                L("点击切换该图层显示/隐藏", "Toggle this layer's visibility"), false);

            DrawButton(1740, y, 100, 40, L("编辑", "Edit"), "White", null,
                L("编辑该图层的 URL 与参数", "Edit this layer's URL and parameters"), false);

            if (texture.TextureURL && !isDomainInWhitelist(texture.TextureURL)) {
                DrawButton(1860, y, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
                    L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
            }
        } else {
            // 空槽位：显示添加按钮
            DrawButton(1200, y, 400, 40, L("（空槽位）", "(empty slot)"), "#333333", null,
                L("点击添加贴图到此槽位", "Click to add a texture to this slot"), false);
            DrawButton(1740, y, 100, 40, L("添加", "Add"), "#D4FFD4", null,
                L("在此槽位添加新贴图", "Add a new texture to this slot"), false);
        }
    }

    // 底部按钮固定位置
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;

    // 翻页按钮：16 个槽位 = 3 页，始终显示
    const hasPages = totalPages > 1;
    if (hasPages) {
        DrawButton(1885, 810, 90, 90, "", "White", "Icons/Down.png",
            L("下一页", "Next page"), !hasPages);
    }
    // 确认并退出：保存同步后关闭对话框
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        L("确认并退出（保存并关闭）", "Confirm & Exit (save and close)"));

    // 导入导出按钮
    const ioBtnY = btnY + 120;
    DrawButton(1170, ioBtnY, 200, 50, L("导出配置", "Export"), "#4CAF50", null,
        L("将当前配置复制到剪贴板", "Copy current config to clipboard"), false);
    DrawButton(1390, ioBtnY, 200, 50, L("覆盖导入", "Import (Replace)"), "#28639A", null,
        L("用剪贴板配置覆盖当前所有图层", "Replace all layers with clipboard config"), false);
    DrawButton(1610, ioBtnY, 200, 50, L("追加导入", "Import (Append)"), "#28639A", null,
        L("将剪贴板配置追加到当前图层后", "Append clipboard config after current layers"), false);

    // 导入/导出结果提示（任务3：显示在 1505,890）
    if (state.statusMessage && Date.now() < state.statusMessageExpiry) {
        DrawText(state.statusMessage.text, 1505, 890, state.statusMessage.color, "Black");
    }
}

/**
 * 处理主界面点击
 */
export function handleTextureListClick(item, data) {
    const textures = item.Property?.Textures || [];

    // 隐藏设置跳转
    if (MouseIn(1665, 25, 90, 90)) {
        state.currentView = "hide";
        return;
    }

    // 教程按钮
    if (MouseIn(1885, 235, 90, 90)) {
        state.currentView = "tutorial";
        state.tutorialPage = 0;
        return;
    }

    const startY = 450;
    const itemHeight = 60;

    // 分页计算：基于固定 16 个槽位
    const totalPages = Math.max(1, Math.ceil(MAX_TEXTURE_COUNT / TEXTURES_PER_PAGE));
    if (state.currentListPage >= totalPages) state.currentListPage = totalPages - 1;
    if (state.currentListPage < 0) state.currentListPage = 0;
    const pageStart = state.currentListPage * TEXTURES_PER_PAGE;
    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, MAX_TEXTURE_COUNT);

    for (let i = pageStart; i < pageEnd; i++) {
        const y = startY + (i - pageStart) * itemHeight;
        const texture = textures[i];

        if (texture) {
            // 已使用槽位：别名编辑、可见开关、编辑、信任按钮
            // 槽位按钮：点击修改别名
            if (MouseIn(1200, y, 400, 40)) {
                const current = texture.Alias || "";
                const newAlias = prompt(L("请输入图层别名（留空清除别名）：", "Enter layer alias (leave empty to clear):"), current);
                if (newAlias !== null) {
                    texture.Alias = newAlias.trim();
                    syncItemToServer(item);
                }
                return;
            }
            // 可见开关
            if (MouseIn(1620, y, 100, 40)) {
                textures[i].Visible = textures[i].Visible === false ? true : false;
                syncItemToServer(item);
                const C = CharacterGetCurrent();
                if (C) CharacterRefresh(C, false, false);
                return;
            }
            if (MouseIn(1740, y, 100, 40)) {
                state.currentEditTexture = i;
                state.tempTextureData = JSON.parse(JSON.stringify(textures[i]));
                state.originalEditTexture = JSON.parse(JSON.stringify(textures[i]));
                if (!data.PersistentData) data.PersistentData = {};
                data.PersistentData._originalTexture = JSON.parse(JSON.stringify(textures[i]));
                createEditInputs(textures[i]);
                resetDragState();
                return;
            }
            if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL) && MouseIn(1860, y, 100, 40)) {
                const domain = extractDomain(texture.TextureURL);
                if (domain) {
                    state.pendingDomainToAdd = domain;
                    state.currentView = "addDomainConfirm";
                }
                return;
            }
        } else {
            // 空槽位：点击"添加"或空槽位区域 = 新增贴图到此槽位
            if (MouseIn(1740, y, 100, 40) || MouseIn(1200, y, 400, 40)) {
                const newTexture = JSON.parse(JSON.stringify(DEFAULT_TEXTURE));
                if (!item.Property) item.Property = { ...DEFAULT_PROPS };
                if (!item.Property.Textures) item.Property.Textures = [];
                item.Property.Textures[i] = newTexture;
                state.currentEditTexture = i;
                state.tempTextureData = JSON.parse(JSON.stringify(newTexture));
                state.originalEditTexture = null;
                if (!data.PersistentData) data.PersistentData = {};
                data.PersistentData._originalTexture = JSON.parse(JSON.stringify(newTexture));
                createEditInputs(newTexture);
                resetDragState();
                return;
            }
        }
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
            showStatus(L(`✘ 超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`,
                `✘ Texture limit reached (max ${MAX_TEXTURE_COUNT})`), "#E53935");
            return;
        }
        importConfig(item, "append");
        return;
    }
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
