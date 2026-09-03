import { TUTORIAL_PAGES } from "../i18n/tutorial.js";
import { t, L, isChineseLang } from "../i18n/index.js";
/**
 * 自定义贴图道具 - 内置教程
 * 从列表页点击「?」按钮进入，多页翻页浏览
 * 坐标系与列表页一致（X 居中 1500）
 */

import { state } from "./state.js";


/**
 * 教程页面数据
 * 每页包含 title 和 lines（每行有 cn/en 文本和可选颜色）
 */
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
    DrawText(t("tutorial.page", [state.tutorialPage + 1, totalPages]),
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
        t("tutorial.close_tutorial"));

    // 底部翻页：第一页隐藏「上一页」；最后一页「下一页」变为「理解了」（点击退出教程）
    const hasPrev = state.tutorialPage > 0;
    const isLastPage = state.tutorialPage >= totalPages - 1;
    if (hasPrev) {
        DrawButton(PREV_BTN.x, PREV_BTN.y, PREV_BTN.w, PREV_BTN.h,
            t("tutorial.prev"), "#555555", null, "", false);
    }
    DrawButton(NEXT_BTN.x, NEXT_BTN.y, NEXT_BTN.w, NEXT_BTN.h,
        isLastPage ? t("tutorial.got_it") : t("tutorial.next"),
        "#555555", null, "", false);
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
