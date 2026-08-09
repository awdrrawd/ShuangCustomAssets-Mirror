/**
 * 自定义贴图道具 - 内置教程
 * 从列表页点击「?」按钮进入，多页翻页浏览
 * 坐标系与列表页一致（X 居中 1500）
 */

import { state } from "./state.js";
import { L, isChineseLang } from "@lib/utils.js";

/**
 * 教程页面数据
 * 每页包含 title 和 lines（每行有 cn/en 文本和可选颜色）
 */
const TUTORIAL_PAGES = [
    {
        title: { cn: "什么是自定义贴图？", en: "What is Custom Texture?" },
        lines: [
            { cn: "自定义贴图可以在角色身上叠加自定义图片。", en: "Overlay custom images on your character." },
            {},
            { cn: "核心功能：", en: "Core features:" },
            { cn: "• 最多 16 个图层，可独立设置图片和参数", en: "• Up to 16 layers with independent settings" },
            { cn: "• 支持 GIF 动图播放", en: "• Animated GIF playback" },
            { cn: "• 支持按姿势切换不同贴图效果", en: "• Per-pose texture switching" },
            { cn: "• 可隐藏身体部位/服饰，避免遮挡贴图", en: "• Hide body parts / clothing" },
            { cn: "• 域名白名单安全机制", en: "• Domain whitelist security" },
            {},
            { cn: "点击「下一页」继续了解各项功能。", en: "Click \"Next\" to continue.", color: "Gray" },
        ]
    },
    {
        title: { cn: "图层与全局设置", en: "Layers & Global Settings" },
        lines: [
            { cn: "每个图层有一组「全局设置」，作为默认参数：", en: "Each layer has global settings as defaults:" },
            {},
            { cn: "• 贴图网址：图片的 URL 地址", en: "• Texture URL: the image URL" },
            { cn: "• X/Y 偏移：图片在角色身上的位置", en: "• X/Y Offset: image position" },
            { cn: "• 缩放 X/Y：水平和垂直缩放比例", en: "• Scale X/Y: horizontal & vertical scale" },
            { cn: "• 旋转：图片旋转角度（0-360°）", en: "• Rotation: 0-360 degrees" },
            { cn: "• 透明度：图片不透明度（0-100%）", en: "• Opacity: 0-100%" },
            { cn: "• 镜射：水平/垂直翻转图片", en: "• Mirror: flip H / V" },
            {},
            { cn: "不用特殊姿势设置时，只需调整全局设置。", en: "Without per-pose settings, just adjust globals.", color: "Gray" },
        ]
    },
    {
        title: { cn: "特殊姿势设置", en: "Per-Pose Settings" },
        lines: [
            { cn: "可为特定姿势设置不同的贴图参数。", en: "Set different params for specific poses." },
            {},
            { cn: "底部有两个开关：", en: "Two toggles at the bottom:" },
            { cn: "「视角」开关：", en: "\"View\" toggle:" },
            { cn: "  全局视角 = 编辑全局配置，角色不换姿势", en: "  Global = edit global, no pose change" },
            { cn: "  当前视角 = 编辑当前姿势配置并预览", en: "  Current = edit & preview current pose" },
            { cn: "「生效」开关：", en: "\"Active\" toggle:" },
            { cn: "  开启 = 该姿势使用独立配置", en: "  On = use pose-specific config" },
            { cn: "  关闭 = 回退到全局配置", en: "  Off = fall back to global config" },
        ]
    },
    {
        title: { cn: "批量配置", en: "Batch Configuration" },
        lines: [
            { cn: "需要为多个姿势设置相同效果时使用：", en: "Batch config for multiple poses:" },
            {},
            { cn: "1. 点击「批量配置」进入姿势选择页", en: "1. Click \"Batch Config\" to select poses" },
            { cn: "2. 多选需要配置的姿势（橙色 = 选中）", en: "2. Multi-select (orange = selected)" },
            { cn: "3. 点击「编辑选中姿势」进入批量编辑", en: "3. Click \"Edit Selected\" to batch edit" },
            { cn: "4. 调整参数，所有选中姿势组合会同步", en: "4. Adjust params - all combos sync" },
            { cn: "5. 保存后所有选中姿势都有相同配置", en: "5. Save to apply to all selected" },
            {},
            { cn: "适合：多个姿势用同一张贴图、统一调整偏移等。", en: "Useful: same image across poses, etc.", color: "Gray" },
        ]
    },
    {
        title: { cn: "隐藏设置", en: "Hide Settings" },
        lines: [
            { cn: "隐藏设置可隐藏遮挡贴图的身体部位或服饰。", en: "Hide parts that occlude your textures." },
            {},
            { cn: "8 个分类：", en: "8 categories:" },
            { cn: "• 表情图标：聊天表情", en: "• Emoticon: chat emotes" },
            { cn: "• cosplay：发型、翅膀、动物身体等", en: "• Cosplay: hair, wings, animal body" },
            { cn: "• 五官：眼睛、眉毛、嘴巴等", en: "• Face: eyes, eyebrows, mouth" },
            { cn: "• 头部 / 上半身 / 下半身：身体模型", en: "• Head / Body Upper / Body Lower" },
            { cn: "• 服饰：衣服、鞋子、饰品等", en: "• Clothing: clothes, shoes, etc." },
            { cn: "• 拘束道具：所有拘束物品", en: "• Restraints: all restraint items" },
            {},
            { cn: "在列表页右上角点击隐藏图标进入。", en: "Click the hide icon on the list page.", color: "Gray" },
        ]
    },
    {
        title: { cn: "安全与域名白名单", en: "Security & Whitelist" },
        lines: [
            { cn: "白名单模式（推荐）：只加载可信域名的图片。", en: "Whitelist mode: only trusted domains load." },
            {},
            { cn: "添加可信域名的方式：", en: "Ways to add trusted domains:" },
            { cn: "• 编辑面板中点击「信任」按钮", en: "• Click \"Trust\" in the edit panel" },
            { cn: "• 白名单管理页面手动添加", en: "• Add manually in whitelist page" },
            { cn: "• 「扫描房间」查看房间内不可信域名", en: "• \"Scan Room\" for all untrusted" },
            { cn: "不可信域名提示：", en: "Untrusted domain warning:" },
            { cn: "  开启 = 显示警告图片", en: "  On = show warning image" },
            { cn: "  关闭 = 直接跳过不加载", en: "  Off = skip silently" },
            { cn: "在扩展设置页面可调整安全选项。", en: "Adjust in extension settings.", color: "Gray" },
        ]
    },
    {
        title: { cn: "导入导出", en: "Import / Export" },
        lines: [
            { cn: "在列表页底部有三个按钮：", en: "Three buttons at the bottom:" },
            {},
            { cn: "• 导出配置：复制所有图层配置到剪贴板", en: "• Export: copy configs to clipboard" },
            { cn: "• 覆盖导入：用剪贴板配置替换所有图层", en: "• Import (Replace): replace all" },
            { cn: "• 追加导入：在当前图层后追加配置", en: "• Import (Append): add after current" },
            { cn: "配置包含图层所有参数（URL、偏移、", en: "Config includes all params (URL, offset," },
            { cn: "缩放、旋转、透明度、镜射、姿势设置等）。", en: "scale, rotation, opacity, mirror, etc.)" },
            { cn: "不包含隐藏设置。", en: "Excludes hide settings." },
            {},
            { cn: "追加导入超过 16 层上限会提示。", en: "Append checks the 16-layer limit.", color: "Gray" },
        ]
    },
];

// === 布局常量 ===
const TITLE_Y = 360;
const SUBTITLE_Y = 410;
const CONTENT_START_Y = 470;
const LINE_HEIGHT = 38;
const CLOSE_BTN = { x: 1885, y: 25, w: 90, h: 90 };
const PREV_BTN = { x: 1250, y: 900, w: 150, h: 50 };
const NEXT_BTN = { x: 1600, y: 900, w: 150, h: 50 };

/**
 * 绘制教程页面
 */
export function drawTutorial() {
    const totalPages = TUTORIAL_PAGES.length;
    if (state.tutorialPage >= totalPages) state.tutorialPage = totalPages - 1;
    if (state.tutorialPage < 0) state.tutorialPage = 0;

    const page = TUTORIAL_PAGES[state.tutorialPage];
    const cn = isChineseLang();

    // 标题
    DrawText(L(page.title.cn, page.title.en), 1500, TITLE_Y, "White", "Gray");
    // 页码
    DrawText(L(`第 ${state.tutorialPage + 1}/${totalPages} 页`, `Page ${state.tutorialPage + 1}/${totalPages}`),
        1505, SUBTITLE_Y, "#ebfe58", "Gray");

    // 内容行
    let y = CONTENT_START_Y;
    for (const line of page.lines) {
        const text = cn ? line.cn : line.en;
        if (text) {
            const color = line.color || "White";
            DrawText(text, 1500, y, color, "Gray");
        }
        y += LINE_HEIGHT;
    }

    // 右上角关闭
    DrawButton(CLOSE_BTN.x, CLOSE_BTN.y, CLOSE_BTN.w, CLOSE_BTN.h, "", "White", "Icons/Exit.png",
        L("关闭教程", "Close tutorial"));

    // 底部翻页：第一页隐藏「上一页」；最后一页「下一页」变为「理解了」（点击退出教程）
    const hasPrev = state.tutorialPage > 0;
    const isLastPage = state.tutorialPage >= totalPages - 1;
    if (hasPrev) {
        DrawButton(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h,
            L("上一页", "Prev"), "#555555", "#777777", false,
            L("上一页", "Previous page"));
    }
    DrawButton(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h,
        isLastPage ? L("理解了", "Got it") : L("下一页", "Next"),
        "#555555", "#777777", false,
        isLastPage ? L("退出教程", "Exit tutorial") : L("下一页", "Next page"));
}

/**
 * 处理教程页面点击
 */
export function handleTutorialClick() {
    // 关闭
    if (MouseIn(CLOSE_BTN.x, CLOSE_BTN.y, CLOSE_BTN.w, CLOSE_BTN.h)) {
        state.currentView = "list";
        state.tutorialPage = 0;
        return;
    }

    const totalPages = TUTORIAL_PAGES.length;
    // 上一页（第一页无此按钮）
    if (state.tutorialPage > 0 && MouseIn(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h)) {
        state.tutorialPage--;
        return;
    }
    // 下一页 / 最后一页「理解了」退出教程
    if (MouseIn(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h)) {
        if (state.tutorialPage < totalPages - 1) {
            state.tutorialPage++;
        } else {
            state.currentView = "list";
            state.tutorialPage = 0;
        }
        return;
    }
}
