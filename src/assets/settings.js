/**
 * 自定义贴图 - 安全设置模块
 * 提供贴图 URL 加载模式控制和域名白名单管理
 */

import { Logger } from "@lib/utils.js";

// === 常量 ===
const EXTENSION_ID = "ShuangCustomAssets";

/**
 * 插件自身服务域名，始终允许（不依赖玩家设置）
 * 用于登录页面加载标识等场景
 */
const ALWAYS_ALLOWED_DOMAINS = [
    "shuang-custom-assets.pages.dev"
];

const DEFAULT_ALLOWED_DOMAINS = [
    "github.io",
    "gitlab.io",
    "ibb.co",
    "imgbb.com",
    "imgchest.com",
    "imgur.com",
    "postimg.cc",
    "hd-r.icu",
    ...ALWAYS_ALLOWED_DOMAINS
];

// 设置页面状态
let settingsPage = "main"; // "main" | "modeSelect" | "whitelist" | "unrestrictedConfirm"
let whitelistPage = 0; // 白名单管理页面当前页码（0-indexed）

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
export function extractDomain(url) {
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

    // 插件自身服务域名始终允许（如登录页面标识）
    const domain = extractDomain(url);
    if (domain && ALWAYS_ALLOWED_DOMAINS.some(d => domain === d || domain.endsWith("." + d))) {
        return true;
    }
    if (!domain) return false;

    const settings = getSettings();

    // 不限制模式：允许所有 HTTPS URL
    if (settings.urlLoadMode === "unrestricted") {
        return true;
    }

    // 白名单模式：检查域名
    const allowed = settings.allowedDomains || [];
    return allowed.some(allowed => {
        if (domain === allowed) return true;
        if (domain.endsWith("." + allowed)) return true;
        return false;
    });
}

/**
 * 检查 URL 的域名是否在白名单中
 * @param {string} url
 * @returns {boolean}
 */
export function isDomainInWhitelist(url) {
    const settings = getSettings();
    if (settings.urlLoadMode !== "whitelist") return true;
    const domain = extractDomain(url);
    if (!domain) return false;
    const allowed = settings.allowedDomains || [];
    return allowed.some(a => domain === a || domain.endsWith("." + a));
}

/**
 * 添加域名到白名单
 * @param {string} domain
 * @returns {boolean} 是否添加成功
 */
export function addDomainToWhitelist(domain) {
    if (!domain) return false;
    domain = domain.toLowerCase().trim();
    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) return false;
    const settings = getSettings();
    if (!settings.allowedDomains) settings.allowedDomains = [];
    if (settings.allowedDomains.includes(domain)) return false;
    settings.allowedDomains.push(domain);
    saveSettings();
    return true;
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
            whitelistPage = 0;
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
            whitelistPage = 0;
            return true;
        },
        unload: () => {
            _removeDomainInput();
            settingsPage = "main";
            whitelistPage = 0;
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

    // 域名列表布局常量
    const listStartY = 190;
    const lineH = 45;
    const maxShow = 8;
    const domainTextX = 400;    // 域名文字左边缘
    const deleteBtnX = 1300;    // 删除按钮左边缘
    const deleteBtnW = 120;

    // 计算翻页
    const totalPages = Math.max(1, Math.ceil(domains.length / maxShow));
    if (whitelistPage >= totalPages) whitelistPage = totalPages - 1;
    if (whitelistPage < 0) whitelistPage = 0;
    const pageStart = whitelistPage * maxShow;
    const pageEnd = Math.min(pageStart + maxShow, domains.length);
    const hasPrev = whitelistPage > 0;
    const hasNext = whitelistPage < totalPages - 1;

    DrawText("域名白名单管理", 1000, 100, "Black", "Gray");
    DrawText("仅来自这些域名的贴图 URL 会被加载", 1000, 140, "Gray", "White");

    // 域名列表 - 左对齐文字 + 右侧删除按钮
    // 显示当前页的域名
    for (let i = pageStart; i < pageEnd; i++) {
        const displayIdx = i - pageStart;
        const y = listStartY + displayIdx * lineH;
        _drawTextLeft(`${i + 1}. ${domains[i]}`, domainTextX, y, "Black", "White");
        DrawButton(deleteBtnX, y - 17, deleteBtnW, 35, "删除", "#FFD4D4");
    }

    // 翻页控制和页面信息
    const paginationY = listStartY + maxShow * lineH + 10;
    DrawText(`第 ${whitelistPage + 1}/${totalPages} 页  (共 ${domains.length} 个域名)`, 1000, paginationY, "Gray", "White");

    DrawButton(1180, paginationY - 17, 80, 35, "上一页", "#555555", "#777777", !hasPrev);
    DrawButton(1270, paginationY - 17, 80, 35, "下一页", "#555555", "#777777", !hasNext);

    // 添加域名区域
    const inputY = paginationY + 40;
    _drawTextLeft("添加域名:", domainTextX, inputY, "Black", "White");

    // 输入框在文字右侧
    DrawButton(900, inputY - 17, 100, 35, "添加", "#D4FFD4");
    DrawButton(1010, inputY - 17, 100, 35, "清空全部", "#FFD4D4");
    DrawButton(1120, inputY - 17, 120, 35, "添加推荐域名", "#B3E5FC");

    // 导入导出
    const ieY = inputY + 50;
    DrawButton(900, ieY - 17, 120, 35, "导出配置", "#FF9800", "#FFB74D", false);
    DrawButton(1030, ieY - 17, 120, 35, "导入配置", "#2196F3", "#42A5F5", false);

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

    // 域名列表布局常量（必须与 _drawWhitelistPage 一致）
    const listStartY = 190;
    const lineH = 45;
    const maxShow = 8;
    const deleteBtnX = 1300;
    const deleteBtnW = 120;

    const totalPages = Math.max(1, Math.ceil(domains.length / maxShow));

    // 删除按钮 - 使用翻页偏移
    for (let i = 0; i < maxShow; i++) {
        const idx = whitelistPage * maxShow + i;
        if (idx >= domains.length) break;
        const y = listStartY + i * lineH;
        if (MouseIn(deleteBtnX, y - 17, deleteBtnW, 35)) {
            const removed = domains.splice(idx, 1)[0];
            settings.allowedDomains = domains;
            saveSettings();
            // 如果删除后当前页为空且不是第一页，回退一页
            if (domains.length > 0 && whitelistPage >= Math.ceil(domains.length / maxShow)) {
                whitelistPage = Math.max(0, Math.ceil(domains.length / maxShow) - 1);
            }
            Logger.info(`删除域名: ${removed}`);
            return;
        }
    }

    // 翻页控制
    const paginationY = listStartY + maxShow * lineH + 10;
    const hasPrev = whitelistPage > 0;
    const hasNext = whitelistPage < totalPages - 1;

    if (hasPrev && MouseIn(1180, paginationY - 17, 80, 35)) {
        whitelistPage--;
        return;
    }
    if (hasNext && MouseIn(1270, paginationY - 17, 80, 35)) {
        whitelistPage++;
        return;
    }

    // 添加域名
    const inputY = paginationY + 40;
    if (MouseIn(900, inputY - 17, 100, 35)) {
        const input = document.getElementById("ShuangTextureDomainInput");
        const domain = input?.value?.trim()?.toLowerCase();
        if (domain && !domains.includes(domain)) {
            if (/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) {
                domains.push(domain);
                settings.allowedDomains = domains;
                saveSettings();
                input.value = "";
                // 跳转到最后一页显示新添加的域名
                whitelistPage = Math.max(0, Math.ceil(domains.length / maxShow) - 1);
                Logger.info(`添加域名: ${domain}`);
            }
        }
        return;
    }

    // 清空全部
    if (MouseIn(1010, inputY - 17, 100, 35)) {
        if (confirm("确定要清空所有可信域名吗？")) {
            settings.allowedDomains = [];
            saveSettings();
            whitelistPage = 0;
            Logger.info("清空所有域名");
        }
        return;
    }

    // 添加推荐域名
    if (MouseIn(1120, inputY - 17, 120, 35)) {
        const existing = new Set(settings.allowedDomains || []);
        let added = 0;
        for (const d of DEFAULT_ALLOWED_DOMAINS) {
            if (!existing.has(d)) {
                settings.allowedDomains.push(d);
                existing.add(d);
                added++;
            }
        }
        if (added > 0) {
            saveSettings();
            // 跳转到最后一页
            whitelistPage = Math.max(0, Math.ceil(settings.allowedDomains.length / maxShow) - 1);
            Logger.info(`添加了 ${added} 个推荐域名`);
        }
        return;
    }

    // 导出配置
    const ieY = inputY + 50;
    if (MouseIn(900, ieY - 17, 120, 35)) {
        const json = JSON.stringify(settings.allowedDomains || [], null, 2);
        navigator.clipboard.writeText(json).then(() => {
            Logger.info("域名白名单已复制到剪贴板");
        }).catch(() => {
            // 降级：通过临时 textarea 复制
            const ta = document.createElement("textarea");
            ta.value = json;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            Logger.info("域名白名单已复制到剪贴板");
        });
        return;
    }

    // 导入配置
    if (MouseIn(1030, ieY - 17, 120, 35)) {
        const jsonStr = prompt("请粘贴域名白名单 JSON 配置：\n格式如: [\"domain1.com\", \"domain2.com\"]");
        if (jsonStr) {
            try {
                const imported = JSON.parse(jsonStr);
                if (!Array.isArray(imported)) throw new Error("不是数组格式");
                const existing = new Set(settings.allowedDomains || []);
                let added = 0;
                for (const d of imported) {
                    const domain = String(d).toLowerCase().trim();
                    if (domain && !existing.has(domain) && /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) {
                        settings.allowedDomains.push(domain);
                        existing.add(domain);
                        added++;
                    }
                }
                if (added > 0) {
                    saveSettings();
                    whitelistPage = Math.max(0, Math.ceil(settings.allowedDomains.length / maxShow) - 1);
                    Logger.info(`导入了 ${added} 个域名`);
                } else {
                    Logger.info("导入完成，无新增域名");
                }
            } catch (e) {
                Logger.error("导入域名配置失败:", e);
                alert("导入失败：JSON 格式错误，请检查后重试");
            }
        }
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
        const inputY = 190 + 8 * 45 + 10 + 40; // listStartY + maxShow * lineH + 10 + 40
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
