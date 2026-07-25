/**
 * 自定义贴图 - 安全设置模块
 * 提供贴图 URL 加载模式控制和域名白名单管理
 */

import { Logger } from "@lib/utils.js";

// === 常量 ===
const EXTENSION_ID = "ShuangCustomAssets";
const DEFAULT_ALLOWED_DOMAINS = [
    "github.io",
    "gitlab.io",
    "ibb.co",
    "imgbb.com",
    "imgchest.com",
    "imgur.com",
    "postimg.cc",
    "hd-r.icu"
];

// 设置页面状态
let settingsPage = "main"; // "main" | "modeSelect" | "whitelist" | "unrestrictedConfirm"

// === 设置存储 ===

/**
 * 获取当前设置
 * @returns {{urlLoadMode: string, allowedDomains: string[]}}
 */
export function getSettings() {
    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
    if (!Player.ExtensionSettings[EXTENSION_ID]) {
        Player.ExtensionSettings[EXTENSION_ID] = {
            urlLoadMode: "whitelist",
            allowedDomains: [...DEFAULT_ALLOWED_DOMAINS],
        };
    }
    return Player.ExtensionSettings[EXTENSION_ID];
}

/**
 * 保存设置到服务器
 */
export function saveSettings() {
    if (typeof ServerPlayerExtensionSettingsSync === "function") {
        ServerPlayerExtensionSettingsSync(EXTENSION_ID);
    }
}

// === URL 检查 ===

/**
 * 从 URL 中提取域名
 * @param {string} url
 * @returns {string|null}
 */
function extractDomain(url) {
    try {
        const u = new URL(url);
        return u.hostname;
    } catch {
        return null;
    }
}

/**
 * 检查 URL 是否允许加载
 * @param {string} url
 * @returns {boolean}
 */
export function isUrlAllowed(url) {
    if (!url || typeof url !== "string") return false;
    if (!url.startsWith("https://")) return false;

    const settings = getSettings();

    // 不限制模式：允许所有 HTTPS URL
    if (settings.urlLoadMode === "unrestricted") {
        return true;
    }

    // 白名单模式：检查域名
    const domain = extractDomain(url);
    if (!domain) return false;

    const allowed = settings.allowedDomains || [];
    return allowed.some(allowed => {
        if (domain === allowed) return true;
        if (domain.endsWith("." + allowed)) return true;
        return false;
    });
}

// === 设置页面 UI ===

/**
 * 注册扩展设置
 * 需要在玩家登录后调用
 */
export function registerExtensionSetting() {
    if (typeof PreferenceRegisterExtensionSetting !== "function") {
        Logger.warn("PreferenceRegisterExtensionSetting 不可用，延迟注册");
        return;
    }

    PreferenceRegisterExtensionSetting({
        Identifier: EXTENSION_ID,
        ButtonText: "自定义贴图设置",
        Image: "Icons/Texture.png",
        load: () => {
            settingsPage = "main";
            _createDomainInput();
        },
        run: () => {
            MainCanvas.textAlign = "center";
            if (settingsPage === "main") {
                _drawMainPage();
            } else if (settingsPage === "modeSelect") {
                _drawModeSelectPage();
            } else if (settingsPage === "whitelist") {
                _drawWhitelistPage();
            } else if (settingsPage === "unrestrictedConfirm") {
                _drawUnrestrictedConfirmPage();
            }
            _updateInputPosition();
            MainCanvas.textAlign = "center";
        },
        click: () => {
            if (settingsPage === "main") {
                _clickMainPage();
            } else if (settingsPage === "modeSelect") {
                _clickModeSelectPage();
            } else if (settingsPage === "whitelist") {
                _clickWhitelistPage();
            } else if (settingsPage === "unrestrictedConfirm") {
                _clickUnrestrictedConfirmPage();
            }
        },
        exit: () => {
            _removeDomainInput();
            settingsPage = "main";
            return true;
        },
        unload: () => {
            _removeDomainInput();
            settingsPage = "main";
        },
    });

    Logger.info("扩展设置已注册");
}

// === 页面绘制 ===

// 绘制左对齐文字的辅助函数
function _drawTextLeft(text, x, y, color, backColor) {
    MainCanvas.textAlign = "left";
    DrawText(text, x, y, color, backColor);
    MainCanvas.textAlign = "center";
}

function _drawMainPage() {
    const settings = getSettings();

    DrawText("自定义贴图 - 安全设置", 1000, 100, "Black", "Gray");

    const modeText = settings.urlLoadMode === "whitelist"
        ? "当前模式：白名单模式"
        : "当前模式：不限制模式";
    DrawText(modeText, 1000, 180, "Black", "Gray");

    const descText = settings.urlLoadMode === "whitelist"
        ? "仅加载来自可信域名的贴图 URL"
        : "加载所有 HTTPS 贴图 URL（可能存在隐私风险）";
    DrawText(descText, 1000, 220, "Gray", "White");

    // 按钮（居中 X=1000）
    DrawButton(800, 280, 400, 60, "加载模式设置 >>>", "White");

    if (settings.urlLoadMode === "whitelist") {
        DrawButton(800, 360, 400, 60, "域名白名单管理 >>>", "White");
        DrawText(`已配置 ${settings.allowedDomains?.length || 0} 个可信域名`, 1000, 440, "Gray", "White");
    }

    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
}

function _drawModeSelectPage() {
    const settings = getSettings();

    DrawText("选择贴图加载模式", 1000, 100, "Black", "Gray");

    const whitelistActive = settings.urlLoadMode === "whitelist";
    DrawButton(700, 200, 600, 80,
        `白名单模式${whitelistActive ? "（当前）" : ""}`,
        whitelistActive ? "#D4FFD4" : "White");
    DrawText("仅加载来自可信域名的贴图 URL", 1000, 300, "Gray", "White");

    const unrestrictedActive = settings.urlLoadMode === "unrestricted";
    DrawButton(700, 360, 600, 80,
        `不限制模式${unrestrictedActive ? "（当前）" : ""}`,
        unrestrictedActive ? "#FFE4D4" : "White");
    DrawText("加载所有 HTTPS 贴图 URL", 1000, 460, "Gray", "White");

    DrawButton(800, 560, 400, 60, "返回", "White");
    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
}

function _drawWhitelistPage() {
    const settings = getSettings();
    const domains = settings.allowedDomains || [];

    DrawText("域名白名单管理", 1000, 100, "Black", "Gray");
    DrawText("仅来自这些域名的贴图 URL 会被加载", 1000, 140, "Gray", "White");

    // 域名列表 - 左对齐文字 + 右侧删除按钮
    const listStartY = 190;
    const lineH = 45;
    const maxShow = 8;
    const domainTextX = 400;    // 域名文字左边缘
    const deleteBtnX = 1300;    // 删除按钮左边缘
    const deleteBtnW = 120;

    for (let i = 0; i < Math.min(domains.length, maxShow); i++) {
        const y = listStartY + i * lineH;
        _drawTextLeft(`${i + 1}. ${domains[i]}`, domainTextX, y, "Black", "White");
        DrawButton(deleteBtnX, y - 17, deleteBtnW, 35, "删除", "#FFD4D4");
    }

    if (domains.length > maxShow) {
        DrawText(`... 共 ${domains.length} 个域名，仅显示前 ${maxShow} 个`, 1000, listStartY + maxShow * lineH, "Gray", "White");
    }

    // 添加域名区域
    const inputY = listStartY + maxShow * lineH + 40;
    _drawTextLeft("添加域名:", domainTextX, inputY, "Black", "White");

    // 输入框在文字右侧
    DrawButton(900, inputY - 17, 100, 35, "添加", "#D4FFD4");
    DrawButton(1050, inputY - 17, 120, 35, "清空全部", "#FFD4D4");

    // 返回按钮
    DrawButton(800, 720, 400, 60, "返回", "White");
    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
}

function _drawUnrestrictedConfirmPage() {
    DrawText("⚠ 隐私安全警告 ⚠", 1000, 120, "Red", "Yellow");

    const lines = [
        "不限制模式将加载来自任意 HTTPS 地址的贴图 URL",
        "",
        "请注意以下风险：",
        "1. 其他玩家可能提供恶意的贴图 URL",
        "2. 这些 URL 可能被用于追踪您的 IP 地址",
        "3. 恶意 URL 可能导致隐私信息泄露",
        "4. 您的真实 IP 可能被第三方记录",
        "",
        "我们强烈建议您保持白名单模式",
        "",
        "确定要开启不限制模式吗？",
    ];

    let y = 180;
    for (const line of lines) {
        const color = line.startsWith("确定") ? "Red" : "Black";
        DrawText(line, 1000, y, color, "White");
        y += 35;
    }

    // 确认和取消按钮（居中）
    DrawButton(700, y + 20, 280, 60, "我已了解风险，确认开启", "#FFD4D4");
    DrawButton(1020, y + 20, 280, 60, "取消，保持白名单模式", "#D4FFD4");

    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png");
}

// === 页面点击 ===

function _clickMainPage() {
    const settings = getSettings();

    if (MouseIn(1815, 75, 90, 90)) {
        PreferenceSubscreenExtensionsClear();
        return;
    }

    if (MouseIn(800, 280, 400, 60)) {
        settingsPage = "modeSelect";
        return;
    }

    if (settings.urlLoadMode === "whitelist" && MouseIn(800, 360, 400, 60)) {
        settingsPage = "whitelist";
        return;
    }
}

function _clickModeSelectPage() {
    const settings = getSettings();

    if (MouseIn(1815, 75, 90, 90)) {
        PreferenceSubscreenExtensionsClear();
        return;
    }

    if (MouseIn(700, 200, 600, 80)) {
        if (settings.urlLoadMode !== "whitelist") {
            settings.urlLoadMode = "whitelist";
            saveSettings();
            Logger.info("切换到白名单模式");
        }
        settingsPage = "main";
        return;
    }

    if (MouseIn(700, 360, 600, 80)) {
        if (settings.urlLoadMode !== "unrestricted") {
            settingsPage = "unrestrictedConfirm";
            return;
        }
        settings.urlLoadMode = "whitelist";
        saveSettings();
        settingsPage = "main";
        return;
    }

    if (MouseIn(800, 560, 400, 60)) {
        settingsPage = "main";
        return;
    }
}

function _clickWhitelistPage() {
    const settings = getSettings();
    const domains = settings.allowedDomains || [];

    if (MouseIn(1815, 75, 90, 90)) {
        PreferenceSubscreenExtensionsClear();
        return;
    }

    const listStartY = 190;
    const lineH = 45;
    const maxShow = 8;
    const deleteBtnX = 1300;
    const deleteBtnW = 120;

    // 删除按钮
    for (let i = 0; i < Math.min(domains.length, maxShow); i++) {
        const y = listStartY + i * lineH;
        if (MouseIn(deleteBtnX, y - 17, deleteBtnW, 35)) {
            const removed = domains.splice(i, 1)[0];
            settings.allowedDomains = domains;
            saveSettings();
            Logger.info(`删除域名: ${removed}`);
            return;
        }
    }

    // 添加域名
    const inputY = listStartY + maxShow * lineH + 40;
    if (MouseIn(900, inputY - 17, 100, 35)) {
        const input = document.getElementById("ShuangTextureDomainInput");
        const domain = input?.value?.trim()?.toLowerCase();
        if (domain && !domains.includes(domain)) {
            if (/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) {
                domains.push(domain);
                settings.allowedDomains = domains;
                saveSettings();
                input.value = "";
                Logger.info(`添加域名: ${domain}`);
            }
        }
        return;
    }

    // 清空全部
    if (MouseIn(1050, inputY - 17, 120, 35)) {
        settings.allowedDomains = [];
        saveSettings();
        Logger.info("清空所有域名");
        return;
    }

    // 返回按钮
    if (MouseIn(800, 720, 400, 60)) {
        settingsPage = "main";
        return;
    }
}

function _clickUnrestrictedConfirmPage() {
    const settings = getSettings();

    if (MouseIn(1815, 75, 90, 90)) {
        PreferenceSubscreenExtensionsClear();
        return;
    }

    const confirmY = 180 + 35 * 11 + 20;

    if (MouseIn(700, confirmY, 280, 60)) {
        settings.urlLoadMode = "unrestricted";
        saveSettings();
        Logger.info("已切换到不限制模式");
        settingsPage = "main";
        return;
    }

    if (MouseIn(1020, confirmY, 280, 60)) {
        settingsPage = "main";
        return;
    }
}

// === 输入框管理 ===

function _createDomainInput() {
    const input = ElementCreateInput("ShuangTextureDomainInput", "text", "", "example.com");
    _updateInputPosition();
}

function _updateInputPosition() {
    const input = document.getElementById("ShuangTextureDomainInput");
    if (input && settingsPage === "whitelist") {
        // 输入框在"添加域名:"文字右侧，"添加"按钮左侧
        // 文字在 X=400，按钮在 X=900，输入框居中于 X=720
        const inputY = 190 + 8 * 45 + 40;
        ElementPosition("ShuangTextureDomainInput", 720, inputY, 350, 40);
    } else if (input) {
        // 非白名单页面时隐藏输入框
        ElementPosition("ShuangTextureDomainInput", -999, -999, 0, 0);
    }
}

function _removeDomainInput() {
    const input = document.getElementById("ShuangTextureDomainInput");
    if (input) input.remove();
}
