/**
 * 自定义悬浮提示：正常字号 + 手动换行。
 * BC 自带的按钮悬浮提示会把长文本压成一行小字，而 DrawTextWrap 对连续中文不换行，
 * 所以这里按实际字宽逐字折行，再逐行用 DrawText 绘制。
 */

const FONT_SIZE = 30;
const LINE_HEIGHT = 32;
const PADDING = 12;
const CJK_RE = /[\u1100-\u11ff\u2e80-\u9fff\uac00-\ud7af\uff00-\uffef]/;

function currentFont() {
    try {
        if (typeof CommonGetFont === "function") return CommonGetFont(FONT_SIZE);
    } catch (_) {}
    return `${FONT_SIZE}px Arial`;
}

function charWidth(ch, font) {
    try {
        if (typeof MainCanvas !== "undefined" && MainCanvas?.measureText) {
            MainCanvas.font = font;
            return MainCanvas.measureText(ch).width;
        }
    } catch (_) {}
    return CJK_RE.test(ch) ? FONT_SIZE : FONT_SIZE / 2;
}

/** 逐字折行；优先在空格处断开，中文可在任意字之间断开 */
function wrapText(text, maxWidth, font) {
    const lines = [];
    let line = "";
    let lineWidth = 0;
    for (const ch of String(text)) {
        if (ch === "\n") {
            lines.push(line);
            line = "";
            lineWidth = 0;
            continue;
        }
        const width = charWidth(ch, font);
        if (line && lineWidth + width > maxWidth) {
            const space = line.lastIndexOf(" ");
            if (space > 0) {
                lines.push(line.slice(0, space));
                line = line.slice(space + 1) + ch;
                lineWidth = measure(line, font);
            } else {
                lines.push(line);
                line = ch;
                lineWidth = width;
            }
        } else {
            line += ch;
            lineWidth += width;
        }
    }
    if (line) lines.push(line);
    return lines.length > 0 ? lines : [""];
}

function measure(text, font) {
    let width = 0;
    for (const ch of String(text)) width += charWidth(ch, font);
    return width;
}

/**
 * @param {string} text - 提示内容
 * @param {number} [width] - 提示框宽度
 */
export function drawHoverTooltip(text, width = 760) {
    if (!text) return;

    const boxWidth = Math.max(240, Math.min(width, 900));
    const font = currentFont();
    const lines = wrapText(text, boxWidth - PADDING * 2, font);
    const boxHeight = lines.length * LINE_HEIGHT + PADDING * 2;

    const mouseX = typeof MouseX === "number" ? MouseX : 1000;
    const mouseY = typeof MouseY === "number" ? MouseY : 500;
    const left = Math.max(20, Math.min(mouseX + 18, 1980 - boxWidth));
    const top = Math.max(20, Math.min(mouseY + 18, 980 - boxHeight));

    // 外框 + 深色底，保证在任意房间背景上可读
    DrawRect(left - 3, top - 3, boxWidth + 6, boxHeight + 6, "#fff942");
    DrawRect(left, top, boxWidth, boxHeight, "#1b1b1b");
    for (let i = 0; i < lines.length; i++) {
        DrawText(lines[i], left + boxWidth / 2, top + PADDING + FONT_SIZE + i * LINE_HEIGHT, "White");
    }
}
