/**
 * 自定义贴图 - 安全设置模块
 * 提供贴图 URL 加载模式控制、域名白名单管理，以及动态图片（GIF 动图播放）开关
 */

import { Logger, L, isChineseLang } from "@lib/utils.js";
import { BADGE_IMAGE_URL, ASSET_NAME } from "./constants.js";

// === 常量 ===
const EXTENSION_ID = "ShuangCustomAssets";
const GIF_FPS_INPUT_ID = "ShuangTextureGifFpsInput";

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
    // catbox / litterbox
    "catbox.moe",          // 覆盖 files.catbox.moe
    "litter.catbox.moe",   // litterbox 临时图床
    // Cloudflare R2 公共开发域名（注意：r2.dev 默认不返回 CORS 头，需在存储桶启用 CORS 才能正常显示）
    // 使用通配符仅放行 pub-*.r2.dev（公共开发桶），不放行其它 *.r2.dev
    "pub-*.r2.dev",
    "r2.cloudflarestorage.com",
    // Discord CDN（返回 Access-Control-Allow-Origin: *；但附件链接带 ?ex=&hm= 会过期，仅适合临时使用）
    "cdn.discordapp.com",
    "media.discordapp.net",
    ...ALWAYS_ALLOWED_DOMAINS
];

// 设置页面状态
let settingsPage = "main"; // "main" | "modeSelect" | "whitelist" | "unrestrictedConfirm" | "roomScan" | "blocked"
let whitelistPage = 0; // 白名单管理页面当前页码（0-indexed）
let roomScanPage = 0; // 房间扫描页面当前页码（0-indexed）
let roomScanResults = null; // 房间扫描结果缓存（null=需重新计算）
let _copiedDomain = ""; // 最近复制的域名（用于"已复制"反馈）
let _copiedTime = 0; // 复制时间戳
let roomScanPendingDomain = null; // 房间扫描-待确认的信任域名

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
            domainWarningEnabled: true,
            animatedImageEnabled: true,
            gifFrameRate: 100,
            gifFpsSyncGame: false,
            blockedPlayers: [],
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

/**
 * 获取域名提示开关状态
 * @returns {boolean}
 */
export function getDomainWarningEnabled() {
    const settings = getSettings();
    return settings.domainWarningEnabled !== false; // 默认开启
}

/**
 * 获取动态图片（GIF 动图播放）开关状态
 * 关闭时，多帧 GIF 只固定显示第一帧（当成静态图处理），不会推进播放时间轴，
 * 也不会把角色登记进 gifAnimationLoop 的共用刷新计时器，省下持续轮询的开销
 * @returns {boolean}
 */
export function getAnimatedImageEnabled() {
    const settings = getSettings();
    return settings.animatedImageEnabled !== false; // 默认开启
}

/**
 * 获取动图帧率间隔（毫秒）
 * 值越小刷新越快（越流畅），但 CPU 开销越大
 * 开启 gifFpsSyncGame 时跟随游戏帧率（Player.GraphicsSettings.MaxFPS）
 * @returns {number} 毫秒间隔
 */
export function getGifFrameRate() {
    const settings = getSettings();
    if (settings.gifFpsSyncGame) {
        const gameFps = Player?.GraphicsSettings?.MaxFPS ?? 60;
        // 0 表示无限制，用 60fps（约16ms）作为安全上限
        const fps = gameFps === 0 ? 60 : gameFps;
        return Math.max(16, Math.round(1000 / fps));
    }
    const v = settings.gifFrameRate;
    return (typeof v === "number" && v >= 33) ? v : 100; // 最小 33ms（约 30fps），默认 100ms
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
 * 判断域名是否匹配某个白名单条目
 * 支持通配符 *：* 匹配同一标签内任意字符（不跨越 "."），例如 pub-*.r2.dev
 * 精确条目：完全相等，或作为父域名匹配子域（domain 以 ".条目" 结尾）
 * @param {string} domain - 待检查的主机名
 * @param {string} pattern - 白名单条目
 * @returns {boolean}
 */
function domainMatches(domain, pattern) {
    if (!domain || !pattern) return false;
    if (pattern.includes("*")) {
        // 转义正则特殊字符，再把 * 替换为 [^.]*（不跨越点，避免 pub-*.r2.dev 意外匹配 x.evil.r2.dev）
        const re = new RegExp(
            "^" + pattern.split("*").map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[^.]*") + "$",
            "i"
        );
        return re.test(domain);
    }
    return domain === pattern || domain.endsWith("." + pattern);
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
    if (domain && ALWAYS_ALLOWED_DOMAINS.some(d => domainMatches(domain, d))) {
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
    return allowed.some(entry => domainMatches(domain, entry));
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
    // 插件自身服务域名视为始终可信
    if (ALWAYS_ALLOWED_DOMAINS.some(d => domainMatches(domain, d))) return true;
    const allowed = settings.allowedDomains || [];
    return allowed.some(a => domainMatches(domain, a));
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
        ButtonText: L("自定义贴图设置", "Custom Texture Settings"),
        Image: BADGE_IMAGE_URL,
        load: () => {
            settingsPage = "main";
            whitelistPage = 0;
            roomScanPage = 0;
            roomScanResults = null;
            roomScanPendingDomain = null;
            _createDomainInput();
            _createGifFpsInput();
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
            } else if (settingsPage === "roomScan") {
                _drawRoomScanPage();
            } else if (settingsPage === "blocked") {
                _drawBlockedPage();
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
            } else if (settingsPage === "roomScan") {
                _clickRoomScanPage();
            } else if (settingsPage === "blocked") {
                _clickBlockedPage();
            }
        },
        exit: () => {
            _removeDomainInput();
            _removeGifFpsInput();
            settingsPage = "main";
            whitelistPage = 0;
            roomScanPage = 0;
            roomScanResults = null;
            roomScanPendingDomain = null;
            return true;
        },
        unload: () => {
            _removeDomainInput();
            _removeGifFpsInput();
            settingsPage = "main";
            whitelistPage = 0;
            roomScanPage = 0;
            roomScanResults = null;
            roomScanPendingDomain = null;
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

    DrawText(L("自定义贴图 - 安全设置", "Custom Texture - Security Settings"), 1000, 100, "Black", "Gray");

    const modeText = settings.urlLoadMode === "whitelist"
        ? L("当前模式：白名单模式", "Current mode: Whitelist")
        : L("当前模式：不限制模式", "Current mode: Unrestricted");
    DrawText(modeText, 1000, 180, "Black", "Gray");

    const descText = settings.urlLoadMode === "whitelist"
        ? L("仅加载来自可信域名的贴图 URL", "Only load texture URLs from trusted domains")
        : L("加载所有 HTTPS 贴图 URL（可能存在隐私风险）", "Load all HTTPS texture URLs (privacy risk)");
    DrawText(descText, 1000, 220, "Gray", "White");

    // 按钮（居中 X=1000）
    DrawButton(800, 280, 400, 60, L("加载模式设置 >>>", "Load Mode Settings >>>"), "White",
        null, L("选择白名单/不限制加载模式", "Choose whitelist / unrestricted load mode"));

    if (settings.urlLoadMode === "whitelist") {
        DrawButton(800, 360, 400, 60, L("域名白名单管理 >>>", "Domain Whitelist >>>"), "White",
            null, L("添加或删除可信域名", "Add or remove trusted domains"));
        DrawText(L(`已配置 ${settings.allowedDomains?.length || 0} 个可信域名`,
            `${settings.allowedDomains?.length || 0} trusted domains configured`), 1000, 440, "Gray", "White");
    }

    // 域名提示设置（始终显示）
    const warnY = settings.urlLoadMode === "whitelist" ? 500 : 360;
    const isWarnOn = settings.domainWarningEnabled !== false;
    DrawText(L("不可信域名提示", "Untrusted domain warning"), 800, warnY + 22, "Black", "White");
    DrawButton(1150, warnY - 5, 80, 35, isWarnOn ? L("开", "On") : L("关", "Off"),
        isWarnOn ? "#4CAF50" : "#666666",
        isWarnOn ? "#66BB6A" : "#999999", false,
        L("是否对不在白名单的域名显示警告图片", "Whether to show a warning image for non-whitelisted domains"));

    // 动态图片开关（始终显示）：关闭时 GIF 只显示第一帧，不播放动画
    const animY = warnY + 70;
    const isAnimOn = settings.animatedImageEnabled !== false;
    DrawText(L("启用动态图片", "Enable animated images"), 800, animY + 22, "Black", "White");
    DrawButton(1150, animY - 5, 80, 35, isAnimOn ? L("开", "On") : L("关", "Off"),
        isAnimOn ? "#4CAF50" : "#666666",
        isAnimOn ? "#66BB6A" : "#999999", false,
        L("关闭后动图（GIF）只显示第一帧，不再播放动画", "When off, animated GIFs only show their first frame and won't play"));

    // 动图帧率调整（仅启用动态图片时生效）
    // 数值框为真实 DOM <input type="number">（由 _updateInputPosition 定位），直接输入帧率 fps
    const fpsY = animY + 70;
    const isSyncGame = settings.gifFpsSyncGame === true;
    DrawText(L("动图帧率", "GIF Frame Rate"), 800, fpsY + 22, "Black", "White");
    // 单位提示（DOM 输入框右侧）
    DrawText("fps", 1290, fpsY + 22, "Gray", "White");
    // 与游戏帧率同步开关
    DrawButton(1360, fpsY - 5, 200, 35,
        L(`同步游戏帧率: ${isSyncGame ? "开" : "关"}`, `Game FPS sync: ${isSyncGame ? "On" : "Off"}`),
        isSyncGame ? "#4CAF50" : "#666666",
        isSyncGame ? "#66BB6A" : "#999999", false,
        L("勾选后动图帧率跟随游戏帧率设置", "Sync GIF frame rate with game FPS setting"));

    // 屏蔽玩家管理
    const blockY = fpsY + 70;
    DrawButton(800, blockY, 400, 60, L("屏蔽玩家管理 >>>", "Blocked Players >>>"), "White",
        null, L("管理被屏蔽的玩家，其贴图将显示为占位图", "Manage blocked players; their textures will show as placeholders"));
    const blocked = settings.blockedPlayers || [];
    DrawText(L(`已屏蔽 ${blocked.length} 名玩家`, `${blocked.length} player(s) blocked`), 1000, blockY + 80, "Gray", "White");

    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
}

function _drawModeSelectPage() {
    const settings = getSettings();

    DrawText(L("选择贴图加载模式", "Select texture load mode"), 1000, 100, "Black", "Gray");

    const whitelistActive = settings.urlLoadMode === "whitelist";
    DrawButton(700, 200, 600, 80,
        L(`白名单模式${whitelistActive ? "（当前）" : ""}`, `Whitelist${whitelistActive ? " (current)" : ""}`),
        whitelistActive ? "#D4FFD4" : "White",
        null, L("仅加载可信域名的贴图（推荐）", "Only load textures from trusted domains (recommended)"));
    DrawText(L("仅加载来自可信域名的贴图 URL", "Only load texture URLs from trusted domains"), 1000, 300, "Gray", "White");

    const unrestrictedActive = settings.urlLoadMode === "unrestricted";
    DrawButton(700, 360, 600, 80,
        L(`不限制模式${unrestrictedActive ? "（当前）" : ""}`, `Unrestricted${unrestrictedActive ? " (current)" : ""}`),
        unrestrictedActive ? "#FFE4D4" : "White",
        null, L("加载任意 HTTPS 贴图（有隐私风险）", "Load any HTTPS texture (privacy risk)"));
    DrawText(L("加载所有 HTTPS 贴图 URL", "Load all HTTPS texture URLs"), 1000, 460, "Gray", "White");

    DrawButton(800, 560, 400, 60, L("返回", "Back"), "White", null, L("返回上一页", "Back to previous page"));
    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
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

    DrawText(L("域名白名单管理", "Domain Whitelist"), 1000, 100, "Black", "Gray");
    DrawText(L("仅来自这些域名的贴图 URL 会被加载", "Only texture URLs from these domains will load"), 1000, 140, "Gray", "White");

    // 域名列表 - 左对齐文字 + 右侧删除按钮
    // 显示当前页的域名
    for (let i = pageStart; i < pageEnd; i++) {
        const displayIdx = i - pageStart;
        const y = listStartY + displayIdx * lineH;
        _drawTextLeft(`${i + 1}. ${domains[i]}`, domainTextX, y, "Black", "White");
        DrawButton(deleteBtnX, y - 17, deleteBtnW, 35, L("删除", "Delete"), "#FFD4D4",
            null, L(`从白名单移除 ${domains[i]}`, `Remove ${domains[i]} from whitelist`));
    }

    // 翻页控制和页面信息
    const paginationY = listStartY + maxShow * lineH + 10;
    DrawText(L(`第 ${whitelistPage + 1}/${totalPages} 页  (共 ${domains.length} 个域名)`,
        `Page ${whitelistPage + 1}/${totalPages}  (${domains.length} domains)`), 1000, paginationY, "Gray", "White");

    DrawButton(1180, paginationY - 17, 80, 35, L("上一页", "Prev"), "#555555", "#777777", !hasPrev,
        L("上一页", "Previous page"));
    DrawButton(1270, paginationY - 17, 80, 35, L("下一页", "Next"), "#555555", "#777777", !hasNext,
        L("下一页", "Next page"));

    // 添加域名区域
    const inputY = paginationY + 40;
    _drawTextLeft(L("添加域名:", "Add domain:"), domainTextX, inputY, "Black", "White");

    // 输入框在文字右侧
    DrawButton(900, inputY - 17, 100, 35, L("添加", "Add"), "#D4FFD4",
        null, L("将输入框中的域名加入白名单", "Add the entered domain to the whitelist"));
    DrawButton(1010, inputY - 17, 100, 35, L("清空全部", "Clear All"), "#FFD4D4",
        null, L("移除所有可信域名", "Remove all trusted domains"));
    DrawButton(1120, inputY - 17, 120, 35, L("添加推荐域名", "Add Defaults"), "#B3E5FC",
        null, L("添加内置推荐图床域名", "Add the built-in recommended image hosts"));

    // 导入导出
    const ieY = inputY + 50;
    DrawButton(900, ieY - 17, 120, 35, L("导出配置", "Export"), "#FF9800", "#FFB74D", false,
        L("将白名单复制到剪贴板", "Copy the whitelist to clipboard"));
    DrawButton(1030, ieY - 17, 120, 35, L("导入配置", "Import"), "#2196F3", "#42A5F5", false,
        L("从 JSON 导入白名单", "Import a whitelist from JSON"));
    DrawButton(1180, ieY - 17, 140, 35, L("扫描房间", "Scan Room"), "#B3E5FC",
        null, L("扫描当前房间内所有玩家的不可信贴图域名", "Scan all players in the current room for untrusted texture domains"));

    // 返回按钮
    DrawButton(800, 720, 400, 60, L("返回", "Back"), "White", null, L("返回上一页", "Back to previous page"));
    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
}

function _drawUnrestrictedConfirmPage() {
    DrawText(L("⚠ 隐私安全警告 ⚠", "⚠ Privacy & Security Warning ⚠"), 1000, 120, "Red", "Yellow");

    const lines = isChineseLang() ? [
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
    ] : [
        "Unrestricted mode loads texture URLs from any HTTPS address",
        "",
        "Please note the following risks:",
        "1. Other players may provide malicious texture URLs",
        "2. These URLs may be used to track your IP address",
        "3. Malicious URLs may leak private information",
        "4. Your real IP may be recorded by third parties",
        "",
        "We strongly recommend keeping Whitelist mode",
        "",
        "Are you sure you want to enable Unrestricted mode?",
    ];

    let y = 180;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const color = (i === lines.length - 1) ? "Red" : "Black";
        DrawText(line, 1000, y, color, "White");
        y += 35;
    }

    // 确认和取消按钮（居中）
    DrawButton(700, y + 20, 280, 60, L("我已了解风险，确认开启", "I understand, enable it"), "#FFD4D4",
        null, L("切换到不限制模式", "Switch to Unrestricted mode"));
    DrawButton(1020, y + 20, 280, 60, L("取消，保持白名单模式", "Cancel, keep Whitelist"), "#D4FFD4",
        null, L("保持白名单模式", "Keep Whitelist mode"));

    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
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

    // 域名提示开关
    const warnY = settings.urlLoadMode === "whitelist" ? 500 : 360;
    if (MouseIn(1150, warnY - 5, 80, 35)) {
        settings.domainWarningEnabled = !(settings.domainWarningEnabled !== false);
        saveSettings();
        return;
    }

    // 动态图片开关
    const animY = warnY + 70;
    if (MouseIn(1150, animY - 5, 80, 35)) {
        settings.animatedImageEnabled = !(settings.animatedImageEnabled !== false);
        saveSettings();
        return;
    }

    // 动图帧率与游戏同步开关
    const fpsY = animY + 70;
    if (MouseIn(1360, fpsY - 5, 200, 35)) {
        settings.gifFpsSyncGame = !(settings.gifFpsSyncGame === true);
        saveSettings();
        // 取消勾选时恢复用户手动帧率到输入框
        if (!settings.gifFpsSyncGame) {
            const input = document.getElementById(GIF_FPS_INPUT_ID);
            if (input) input.value = String(Math.round(1000 / getGifFrameRate()));
        }
        return;
    }

    // 屏蔽玩家管理
    const blockY = fpsY + 70;
    if (MouseIn(800, blockY, 400, 60)) {
        settingsPage = "blocked";
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
        if (confirm(L("确定要清空所有可信域名吗？", "Clear all trusted domains?"))) {
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
        const jsonStr = prompt(L(
            "请粘贴域名白名单 JSON 配置：\n格式如: [\"domain1.com\", \"domain2.com\"]",
            "Paste the whitelist JSON config:\ne.g. [\"domain1.com\", \"domain2.com\"]"));
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
                alert(L("导入失败：JSON 格式错误，请检查后重试", "Import failed: invalid JSON, please check and retry"));
            }
        }
        return;
    }

    // 扫描房间
    if (MouseIn(1180, ieY - 17, 140, 35)) {
        settingsPage = "roomScan";
        roomScanPage = 0;
        roomScanResults = null;
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

    // 帧率输入框：仅在主页面且动态图片开启时显示
    const fpsInput = document.getElementById(GIF_FPS_INPUT_ID);
    if (fpsInput) {
        const s = getSettings();
        const animEnabled = s.animatedImageEnabled !== false;
        if (settingsPage === "main" && animEnabled) {
            const warnY = s.urlLoadMode === "whitelist" ? 500 : 360;
            const animY = warnY + 70;
            const fpsY = animY + 70;
            ElementPosition(GIF_FPS_INPUT_ID, 1200, fpsY + 12, 120, 35);
            // 同步游戏帧率时禁用输入框并显示游戏帧率值
            const syncGame = s.gifFpsSyncGame === true;
            fpsInput.disabled = syncGame;
            if (syncGame) {
                const gameFps = Player?.GraphicsSettings?.MaxFPS ?? 60;
                const displayFps = gameFps === 0 ? 60 : gameFps;
                if (fpsInput.value !== String(displayFps)) {
                    fpsInput.value = String(displayFps);
                }
            }
        } else {
            ElementPosition(GIF_FPS_INPUT_ID, -999, -999, 0, 0);
        }
    }
}

function _removeDomainInput() {
    const input = document.getElementById("ShuangTextureDomainInput");
    if (input) input.remove();
}

// === 帧率输入框管理 ===

/**
 * 创建动图帧率 DOM 输入框（<input type="number">）
 * 直接输入帧率 fps（范围 2~30），内部转换为 ms 间隔存储到 settings.gifFrameRate
 */
function _createGifFpsInput() {
    const initialFps = Math.round(1000 / getGifFrameRate());
    const input = ElementCreateInput(GIF_FPS_INPUT_ID, "number", String(initialFps), "10");
    input.min = "2";
    input.max = "30";
    input.step = "1";
    input.addEventListener("input", () => {
        const parsed = parseInt(input.value);
        if (isNaN(parsed)) return; // 允许临时空值，change 时再修正
        const clampedFps = Math.max(2, Math.min(30, parsed));
        const ms = Math.round(1000 / clampedFps);
        const settings = getSettings();
        if (settings.gifFrameRate !== ms) {
            settings.gifFrameRate = ms;
            saveSettings();
        }
    });
    input.addEventListener("change", () => {
        // 失焦时修正非法值并回填
        let parsed = parseInt(input.value);
        if (isNaN(parsed)) parsed = 10;
        const clampedFps = Math.max(2, Math.min(30, parsed));
        input.value = String(clampedFps);
        const ms = Math.round(1000 / clampedFps);
        const settings = getSettings();
        if (settings.gifFrameRate !== ms) {
            settings.gifFrameRate = ms;
            saveSettings();
        }
    });
}

function _removeGifFpsInput() {
    const input = document.getElementById(GIF_FPS_INPUT_ID);
    if (input) input.remove();
}

// === 房间不可信域名扫描 ===

/**
 * 复制文本到剪贴板（带降级方案）
 */
function _copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => _fallbackCopy(text));
    } else {
        _fallbackCopy(text);
    }
}
function _fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(ta);
}

/**
 * 遍历当前房间所有玩家的自定义贴图道具，收集所有不在白名单中的贴图 URL
 * 同时检查全局 TextureURL 和 PoseSettings 中各姿势覆盖的 TextureURL
 * 按 (玩家名, URL) 去重，避免同一玩家的同一 URL（可能出现在多个图层/姿势）重复显示
 * @returns {{name: string, url: string, domain: string}[]}
 */
function collectUntrustedUrls() {
    const results = [];
    const chars = [];
    if (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter)) {
        chars.push(...ChatRoomCharacter);
    }
    // 确保 Player 始终被扫描：在房间时 Player 已在 ChatRoomCharacter 中，
    // 不在房间时仍可扫描自己的贴图
    if (typeof Player !== "undefined" && Player && !chars.includes(Player)) {
        chars.push(Player);
    }

    for (const C of chars) {
        if (!C || !C.Appearance) continue;
        // 优先用 CharacterNickname 获取显示名，回退到 AccountName
        const name = (typeof CharacterNickname === "function")
            ? (CharacterNickname(C) || C.Name || "Unknown")
            : (C.Name || "Unknown");

        for (const item of C.Appearance) {
            if (!item?.Asset || item.Asset.Name !== ASSET_NAME) continue;
            const textures = item?.Property?.Textures;
            if (!Array.isArray(textures)) continue;

            for (const texture of textures) {
                if (!texture) continue;
                // 全局 URL
                _addIfUntrusted(results, name, texture.TextureURL);
                // 姿势级 URL（不同姿势可能使用不同贴图源）
                if (texture.PoseSettings && typeof texture.PoseSettings === "object") {
                    for (const ps of Object.values(texture.PoseSettings)) {
                        if (ps && typeof ps === "object") {
                            _addIfUntrusted(results, name, ps.TextureURL);
                        }
                    }
                }
            }
        }
    }

    // 按 (玩家名, URL) 去重
    const seen = new Set();
    return results.filter(r => {
        const key = r.name + "|" + r.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * 若 URL 不可信则加入结果数组
 */
function _addIfUntrusted(results, name, url) {
    if (!url || typeof url !== "string") return;
    if (isDomainInWhitelist(url)) return; // 可信，跳过
    const domain = extractDomain(url);
    if (!domain) return;
    results.push({ name, url, domain });
}

/**
 * 获取缓存的扫描结果，未计算时自动计算
 */
function _getRoomScanResults() {
    if (roomScanResults === null) {
        roomScanResults = collectUntrustedUrls();
    }
    return roomScanResults;
}

/**
 * 强制重新计算扫描结果（添加域名后调用）
 */
function _refreshRoomScanResults() {
    roomScanResults = collectUntrustedUrls();
    // 刷新后若当前页越界则回退
    const maxShow = 8;
    const totalPages = Math.max(1, Math.ceil(roomScanResults.length / maxShow));
    if (roomScanPage >= totalPages) roomScanPage = totalPages - 1;
    if (roomScanPage < 0) roomScanPage = 0;
}

/**
 * 绘制房间扫描-添加可信域名确认页（文案与道具编辑中的确认页一致）
 */
function _drawRoomScanConfirm() {
    DrawText(L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠"), 1000, 200, "Red", "Gray");

    let y = 260;
    const lines = isChineseLang() ? [
        { t: `即将添加域名到白名单: ${roomScanPendingDomain}`, c: "Cyan" },
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
        { t: `About to add domain to whitelist: ${roomScanPendingDomain}`, c: "Cyan" },
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
        DrawText(line.t, 1000, y, line.c, "Black");
        y += 32;
    }

    y += 10;
    DrawButton(750, y, 220, 50, L("确认添加", "Add"), "#4CAF50", "#66BB6A", false,
        L(`将 ${roomScanPendingDomain} 加入白名单`, `Add ${roomScanPendingDomain} to whitelist`));
    DrawButton(1030, y, 220, 50, L("取消", "Cancel"), "#9E9E9E", "#BDBDBD", false,
        L("放弃添加并返回", "Discard and go back"));
}

function _drawRoomScanPage() {
    const settings = getSettings();

    DrawText(L("房间不可信域名扫描", "Room Untrusted Domain Scan"), 1000, 100, "Black", "Gray");

    // 非白名单模式下此功能无意义
    if (settings.urlLoadMode !== "whitelist") {
        DrawText(L("此功能仅在白名单模式下可用", "This feature is only available in Whitelist mode"), 1000, 220, "Gray", "White");
        DrawText(L("请先切换到白名单模式", "Please switch to Whitelist mode first"), 1000, 260, "Gray", "White");
        DrawButton(800, 720, 400, 60, L("返回", "Back"), "White", null, L("返回上一页", "Back to previous page"));
        DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
        return;
    }

    // 确认添加域名
    if (roomScanPendingDomain) {
        _drawRoomScanConfirm();
        DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
        return;
    }

    // 不在房间时仍扫描自己（collectUntrustedUrls 会兜底加入 Player）
    const inRoom = typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter) && ChatRoomCharacter.length > 0;
    const results = _getRoomScanResults();

    DrawText(inRoom
        ? L("当前房间内所有玩家身上的不可信贴图域名", "Untrusted texture domains from all players in the current room")
        : L("当前不在房间中，仅扫描了自己的贴图", "Not in a room, only your own textures were scanned"),
        1000, 140, "Gray", "White");

    if (results.length === 0) {
        DrawText(L("✔ 未发现不可信域名", "✔ No untrusted domains found"), 1000, 300, "#4CAF50", "White");
        DrawText(L("当前房间内所有玩家的贴图域名均已在白名单中", "All texture domains in the current room are already whitelisted"), 1000, 340, "Gray", "White");
    } else {
        DrawText(L(`发现 ${results.length} 个不可信域名`, `${results.length} untrusted domains found`), 1000, 175, "Orange", "White");

        // 列表布局
        const listStartY = 210;
        const lineH = 50;
        const maxShow = 8;
        const totalPages = Math.max(1, Math.ceil(results.length / maxShow));
        if (roomScanPage >= totalPages) roomScanPage = totalPages - 1;
        if (roomScanPage < 0) roomScanPage = 0;
        const pageStart = roomScanPage * maxShow;
        const pageEnd = Math.min(pageStart + maxShow, results.length);

        for (let i = pageStart; i < pageEnd; i++) {
            const displayIdx = i - pageStart;
            const y = listStartY + displayIdx * lineH;
            const r = results[i];
            const nameStr = r.name.length > 12 ? r.name.substring(0, 12) + "…" : r.name;
            const domainDisplay = r.domain.length > 30 ? r.domain.substring(0, 30) + "…" : r.domain;
            const urlDisplay = r.url.length > 45 ? r.url.substring(0, 45) + "…" : r.url;
            const justCopiedDomain = r.domain === _copiedDomain && Date.now() - _copiedTime < 1500;
            const justCopiedUrl = r.url === _copiedDomain && Date.now() - _copiedTime < 1500;

            _drawTextLeft(`${i + 1}. ${nameStr}`, 250, y, "Black", "White");
            // 域名按钮：悬停显示完整域名，点击复制
            DrawButton(420, y - 18, 400, 36,
                justCopiedDomain ? L("✔ 已复制", "✔ Copied") : domainDisplay,
                justCopiedDomain ? "#4CAF50" : "White",
                null, r.domain);
            // URL 按钮：悬停显示完整 URL，点击复制
            DrawButton(840, y - 18, 640, 36,
                justCopiedUrl ? L("✔ 已复制", "✔ Copied") : urlDisplay,
                justCopiedUrl ? "#4CAF50" : "White",
                null, r.url);
            // 信任按钮
            DrawButton(1500, y - 18, 140, 36, L("信任", "Trust"), "#4CAF50", "#66BB6A", false,
                L(`将 ${r.domain} 加入白名单`, `Add ${r.domain} to whitelist`));
        }

        // 翻页控制
        const paginationY = listStartY + maxShow * lineH + 10;
        const hasPrev = roomScanPage > 0;
        const hasNext = roomScanPage < totalPages - 1;
        DrawText(L(`第 ${roomScanPage + 1}/${totalPages} 页  (共 ${results.length} 个)`,
            `Page ${roomScanPage + 1}/${totalPages}  (${results.length} items)`), 1000, paginationY, "Gray", "White");
        DrawButton(1180, paginationY - 17, 80, 35, L("上一页", "Prev"), "#555555", "#777777", !hasPrev,
            L("上一页", "Previous page"));
        DrawButton(1270, paginationY - 17, 80, 35, L("下一页", "Next"), "#555555", "#777777", !hasNext,
            L("下一页", "Next page"));
    }

    DrawButton(800, 720, 400, 60, L("返回", "Back"), "White", null, L("返回上一页", "Back to previous page"));
    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("退出", "Exit"));
}

function _clickRoomScanPage() {
    const settings = getSettings();

    if (MouseIn(1815, 75, 90, 90)) {
        PreferenceSubscreenExtensionsClear();
        return;
    }

    // 确认添加域名
    if (roomScanPendingDomain) {
        const confirmY = 260 + 32 * 11 + 10;
        if (MouseIn(750, confirmY, 220, 50)) {
            const success = addDomainToWhitelist(roomScanPendingDomain);
            if (success) Logger.info(`从房间扫描添加可信域名: ${roomScanPendingDomain}`);
            roomScanPendingDomain = null;
            _refreshRoomScanResults();
            return;
        }
        if (MouseIn(1030, confirmY, 220, 50)) {
            roomScanPendingDomain = null;
            return;
        }
        return;
    }

    if (MouseIn(800, 720, 400, 60)) {
        settingsPage = "whitelist";
        roomScanPage = 0;
        roomScanResults = null;
        return;
    }

    // 非白名单模式时无列表可点
    if (settings.urlLoadMode !== "whitelist") return;

    const results = _getRoomScanResults();
    if (results.length === 0) return;

    const listStartY = 210;
    const lineH = 50;
    const maxShow = 8;
    const totalPages = Math.max(1, Math.ceil(results.length / maxShow));

    // 域名按钮 + URL 按钮 + 信任按钮
    for (let i = 0; i < maxShow; i++) {
        const idx = roomScanPage * maxShow + i;
        if (idx >= results.length) break;
        const y = listStartY + i * lineH;
        // 域名按钮 - 点击复制域名
        if (MouseIn(420, y - 18, 400, 36)) {
            _copyToClipboard(results[idx].domain);
            _copiedDomain = results[idx].domain;
            _copiedTime = Date.now();
            return;
        }
        // URL 按钮 - 点击复制完整 URL
        if (MouseIn(840, y - 18, 640, 36)) {
            _copyToClipboard(results[idx].url);
            _copiedDomain = results[idx].url;
            _copiedTime = Date.now();
            return;
        }
        // 信任按钮 - 弹出确认
        if (MouseIn(1500, y - 18, 140, 36)) {
            roomScanPendingDomain = results[idx].domain;
            return;
        }
    }

    // 翻页控制
    const paginationY = listStartY + maxShow * lineH + 10;
    const hasPrev = roomScanPage > 0;
    const hasNext = roomScanPage < totalPages - 1;
    if (hasPrev && MouseIn(1180, paginationY - 17, 80, 35)) {
        roomScanPage--;
        return;
    }
    if (hasNext && MouseIn(1270, paginationY - 17, 80, 35)) {
        roomScanPage++;
        return;
    }
}

// === 屏蔽玩家管理页面 ===

function _drawBlockedPage() {
    const settings = getSettings();
    const blocked = settings.blockedPlayers || [];

    DrawText(L("屏蔽玩家管理", "Blocked Players"), 1000, 100, "Black", "Gray");
    DrawText(L("被屏蔽的玩家，其贴图来源或配置的贴图将显示为占位图", "Textures from or configured by blocked players will show as placeholders"), 1000, 140, "Gray", "White");

    // 输入框：输入玩家 MemberNumber
    const inputY = 200;
    DrawText(L("输入玩家 ID (MemberNumber) 添加屏蔽:", "Enter player ID (MemberNumber) to block:"), 1000, inputY, "Black", "White");
    DrawButton(800, inputY + 10, 400, 35, L("添加屏蔽", "Add Block"), "White", null,
        L("输入玩家 MemberNumber 后点击此按钮", "Enter a player's MemberNumber and click this button"));

    // 列表
    const listStartY = 300;
    const lineH = 40;
    const maxShow = 12;
    const totalPages = Math.max(1, Math.ceil(blocked.length / maxShow));
    let page = 0;

    _drawTextLeft(L("已屏蔽的玩家:", "Blocked Players:"), 800, listStartY - 25, "Black", "White");
    if (blocked.length === 0) {
        DrawText(L("（暂无屏蔽）", "(None)"), 1000, listStartY + 20, "Gray", "White");
    } else {
        const start = page * maxShow;
        const end = Math.min(start + maxShow, blocked.length);
        for (let i = start; i < end; i++) {
            const y = listStartY + (i - start) * lineH;
            DrawText(`#${blocked[i]}`, 800, y + 22, "Black", "White");
            DrawButton(1200, y, 100, 35, L("取消屏蔽", "Unblock"), "#E53935", "#FF6659", false,
                L("移除该玩家屏蔽", "Remove this player from block list"));
        }

        // 翻页
        if (totalPages > 1) {
            const pagY = listStartY + maxShow * lineH + 10;
            DrawText(L(`第 ${page + 1}/${totalPages} 页`, `Page ${page + 1}/${totalPages}`), 1000, pagY + 22, "Gray", "White");
        }
    }

    DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png", L("返回", "Back"));
}

function _clickBlockedPage() {
    const settings = getSettings();

    // 退出/返回
    if (MouseIn(1815, 75, 90, 90)) {
        settingsPage = "main";
        return;
    }

    // 添加屏蔽：通过 prompt 输入 MemberNumber
    if (MouseIn(800, 210, 400, 35)) {
        const input = prompt(L("输入要屏蔽的玩家 MemberNumber:", "Enter the player's MemberNumber to block:"));
        if (input) {
            const num = parseInt(input.trim(), 10);
            if (Number.isFinite(num) && num > 0) {
                let blocked = settings.blockedPlayers || [];
                if (blocked.indexOf(num) === -1) {
                    blocked.push(num);
                    settings.blockedPlayers = blocked;
                    saveSettings();
                }
            }
        }
        return;
    }

    // 取消屏蔽
    const blocked = settings.blockedPlayers || [];
    const listStartY = 300;
    const lineH = 40;
    const maxShow = 12;
    const start = 0;
    const end = Math.min(start + maxShow, blocked.length);
    for (let i = start; i < end; i++) {
        const y = listStartY + (i - start) * lineH;
        if (MouseIn(1200, y, 100, 35)) {
            blocked.splice(i, 1);
            settings.blockedPlayers = blocked;
            saveSettings();
            return;
        }
    }
}
