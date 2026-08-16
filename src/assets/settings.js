/**
 * 自定义贴图 - 安全设置模块（DOM 版）
 * 使用 HTML/CSS 布局替代 canvas 绘制
 */
import { Logger, L, isChineseLang } from "@lib/utils.js";
import { BADGE_IMAGE_URL, ASSET_NAME } from "./constants.js";

const EXTENSION_ID = "ShuangCustomAssets";
const CONTAINER_ID = "ShuangSettingsContainer";

const ALWAYS_ALLOWED_DOMAINS = ["shuang-custom-assets.pages.dev"];

const DEFAULT_ALLOWED_DOMAINS = [
    "github.io", "gitlab.io", "ibb.co", "imgbb.com", "imgchest.com",
    "imgur.com", "postimg.cc", "hd-r.icu",
    "catbox.moe", "litter.catbox.moe",
    "pub-*.r2.dev", "r2.cloudflarestorage.com",
    "cdn.discordapp.com", "media.discordapp.net",
    ...ALWAYS_ALLOWED_DOMAINS
];

let settingsPage = "main";
let _pageHistory = []; // 页面导航栈

// 房间扫描状态
let _scanResults = null;      // 扫描结果缓存（null=需重新计算）
let _scanPendingDomain = null; // 待确认加入白名单的域名

// === 设置存储 ===

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

export function saveSettings() {
    if (typeof ServerPlayerExtensionSettingsSync === "function")
        ServerPlayerExtensionSettingsSync(EXTENSION_ID);
}

export function getDomainWarningEnabled() {
    return getSettings().domainWarningEnabled !== false;
}

export function getAnimatedImageEnabled() {
    return getSettings().animatedImageEnabled !== false;
}

export function getGifFrameRate() {
    const s = getSettings();
    if (s.gifFpsSyncGame) {
        const fps = (Player?.GraphicsSettings?.MaxFPS ?? 60) || 60;
        return Math.max(16, Math.round(1000 / fps));
    }
    return (typeof s.gifFrameRate === "number" && s.gifFrameRate >= 33) ? s.gifFrameRate : 100;
}

export function extractDomain(url) {
    try { return new URL(url).hostname; } catch { return null; }
}

export function isDomainInWhitelist(url) {
    const domain = extractDomain(url);
    if (!domain) return false;
    const settings = getSettings();
    const allowed = [...(settings.allowedDomains || []), ...ALWAYS_ALLOWED_DOMAINS];
    return allowed.some(d => {
        if (d.includes("*")) {
            const p = new RegExp("^" + d.replace(/\./g, "\\.").replace(/\*/g, "[^/]+") + "$");
            return p.test(domain);
        }
        return domain === d || domain.endsWith("." + d);
    });
}

export function isUrlAllowed(url) {
    if (!url || !url.startsWith("https://")) return false;
    const s = getSettings();
    if (s.urlLoadMode === "unrestricted") return true;
    return isDomainInWhitelist(url);
}

export function addDomainToWhitelist(domain) {
    if (!domain) return false;
    domain = domain.toLowerCase().trim();
    if (!/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) return false;
    const s = getSettings();
    if (!s.allowedDomains) s.allowedDomains = [];
    if (s.allowedDomains.includes(domain)) return false;
    s.allowedDomains.push(domain);
    saveSettings();
    return true;
}

// === DOM 容器 ===

let _styleInjected = false;

function _injectStyle() {
    if (_styleInjected) return;
    _styleInjected = true;
    const s = document.createElement("style");
    s.id = "ShuangSettingsStyle";
    s.textContent = `
#${CONTAINER_ID} {
    /* 亮色（默认）：面板背景透明，保持原有外观 */
    --sca-fg:#1a1a1a; --sca-muted:#888; --sca-line:#eee; --sca-bg:transparent;
    --sca-card-bg:#fafafa; --sca-card-border:#e8e8e8; --sca-card-border-hover:#d0d0d0;
    --sca-btn-bg:#fff; --sca-btn-fg:#333; --sca-btn-border:#ccc;
    --sca-input-bg:#fff; --sca-input-fg:#333; --sca-input-border:#ccc;
    --sca-th-bg:#fafafa; --sca-th-fg:#666; --sca-th-line:#e0e0e0;
    --sca-td-even:#f8f8f8; --sca-td-odd:#fff; --sca-td-hover:#eef6ff;
    background:var(--sca-bg); box-sizing:border-box;
}
#${CONTAINER_ID}.sca-dark {
    /* 暗色：检测到暗背景时切换（见 _applyTheme） */
    --sca-fg:#e8e8e8; --sca-muted:#a0a6ae; --sca-line:#3a3d44; --sca-bg:#23252b;
    --sca-card-bg:#2c2f36; --sca-card-border:#3a3d44; --sca-card-border-hover:#4a4e57;
    --sca-btn-bg:#33363d; --sca-btn-fg:#e8e8e8; --sca-btn-border:#4a4e57;
    --sca-input-bg:#2c2f36; --sca-input-fg:#e8e8e8; --sca-input-border:#4a4e57;
    --sca-th-bg:#2c2f36; --sca-th-fg:#a0a6ae; --sca-th-line:#3a3d44;
    --sca-td-even:#282b31; --sca-td-odd:#23252b; --sca-td-hover:#31343c;
}
#${CONTAINER_ID} * { box-sizing:border-box; }
#${CONTAINER_ID} .sca-page { display:none; }
#${CONTAINER_ID} .sca-page.active { display:block; }
#${CONTAINER_ID} .sca-table-wrap { flex:1; min-height:200px; overflow-y:auto; }
#${CONTAINER_ID} .sca-table-wrap table { width:100%; border-collapse:collapse; }
#${CONTAINER_ID} .sca-table-wrap th { text-align:left; padding:10px 14px; color:var(--sca-th-fg); font-weight:normal; font-size:14px; border-bottom:2px solid var(--sca-th-line); background:var(--sca-th-bg); position:sticky; top:0; z-index:1; }
#${CONTAINER_ID} .sca-table-wrap td { padding:10px 14px; font-size:15px; color:var(--sca-fg); }
#${CONTAINER_ID} .sca-table-wrap tr:nth-child(even) td { background:var(--sca-td-even); }
#${CONTAINER_ID} .sca-table-wrap tr:nth-child(odd) td { background:var(--sca-td-odd); }
#${CONTAINER_ID} .sca-table-wrap tr:hover td { background:var(--sca-td-hover); }
#${CONTAINER_ID} .sca-bottom { flex-shrink:0; padding-top:12px; border-top:1px solid var(--sca-line); margin-top:10px; }
#${CONTAINER_ID} .sca-card { background:var(--sca-card-bg); border:1px solid var(--sca-card-border); border-radius:8px; padding:16px; margin-bottom:12px; }
#${CONTAINER_ID} .sca-card:hover { border-color:var(--sca-card-border-hover); }
#${CONTAINER_ID} .sca-card.active { border-color:#4caf50; background:#f1faf1; }
#${CONTAINER_ID}.sca-dark .sca-card.active { background:#1f2e22; }
#${CONTAINER_ID} .sca-card-title { font-size:16px; font-weight:600; margin-bottom:4px; color:var(--sca-fg); }
#${CONTAINER_ID} .sca-card-desc { font-size:13px; color:var(--sca-muted); }
#${CONTAINER_ID} .sca-tag { display:inline-block; padding:2px 10px; border-radius:10px; font-size:12px; font-weight:600; margin-left:8px; }
#${CONTAINER_ID} .sca-tag.green { background:#e8f5e9; color:#2e7d32; }
#${CONTAINER_ID} .sca-tag.orange { background:#fff3e0; color:#e65100; }
#${CONTAINER_ID} .sca-btn { display:inline-flex; align-items:center; justify-content:center; padding:9px 22px; border:1px solid var(--sca-btn-border); border-radius:6px; cursor:pointer; font-size:15px; user-select:none; transition:all 0.12s; background:var(--sca-btn-bg); color:var(--sca-btn-fg); }
#${CONTAINER_ID} .sca-btn:hover { filter:brightness(0.92); transform:translateY(-1px); box-shadow:0 2px 6px rgba(0,0,0,0.1); }
#${CONTAINER_ID} .sca-btn:active { filter:brightness(0.8); transform:translateY(0); }
#${CONTAINER_ID} .sca-btn:disabled { opacity:0.4; cursor:default; filter:none; transform:none; box-shadow:none; }
#${CONTAINER_ID} .sca-btn.danger { background:#e53935; color:#fff; border-color:#c62828; }
#${CONTAINER_ID} .sca-btn.primary { background:#4caf50; color:#fff; border-color:#388e3c; }
#${CONTAINER_ID} .sca-btn.small { padding:6px 14px; font-size:13px; border-radius:4px; }
#${CONTAINER_ID} .sca-input { padding:9px 12px; border:1px solid var(--sca-input-border); border-radius:6px; font-size:15px; outline:none; background:var(--sca-input-bg); color:var(--sca-input-fg); }
#${CONTAINER_ID} .sca-input:focus { border-color:#4caf50; box-shadow:0 0 0 3px rgba(76,175,80,0.15); }
#${CONTAINER_ID} .sca-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
#${CONTAINER_ID} .sca-label { color:var(--sca-fg); }
#${CONTAINER_ID} .sca-title { font-size:22px; font-weight:700; margin-bottom:4px; color:var(--sca-fg); letter-spacing:-0.3px; }
#${CONTAINER_ID} .sca-subtitle { font-size:14px; color:var(--sca-muted); margin-bottom:14px; }
#${CONTAINER_ID} .sca-section-title { font-size:17px; font-weight:600; margin:16px 0 10px; color:var(--sca-fg); }
#${CONTAINER_ID} .sca-page.active.sca-flex { display:flex; flex-direction:column; height:100%; }
`;
    document.head.appendChild(s);
}

function _getContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
        _injectStyle();
        el = document.createElement("div");
        el.id = CONTAINER_ID;
        // 背景交由样式表的 --sca-bg 控制（亮色透明 / 暗色纯色面板），此处不写死 background
        el.style.cssText = "position:fixed;overflow:hidden;z-index:1000;font-family:Arial,'Microsoft YaHei',sans-serif";
        document.body.appendChild(el);
    }
    return el;
}

function _removeContainer() {
    const el = document.getElementById(CONTAINER_ID);
    if (el) el.remove();
}

function _posContainer() {
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    const sx = MainCanvas.canvas.clientWidth / MainCanvasWidth;
    const sy = MainCanvas.canvas.clientHeight / MainCanvasHeight;
    el.style.left = (MainCanvas.canvas.offsetLeft + 380 * sx) + "px";
    el.style.top = (MainCanvas.canvas.offsetTop + 160 * sy) + "px";
    el.style.width = ((MainCanvasWidth - 760) * sx) + "px";
    el.style.height = ((MainCanvasHeight - 240) * sy) + "px";
}

// 面板背景是游戏 canvas，无法用 CSS prefers-color-scheme 判断明暗；
// 改为采样 canvas 面板中心处的像素亮度来决定亮/暗主题（切换 .sca-dark）
let _lastThemeCheck = 0;
function _applyTheme() {
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    const now = Date.now();
    if (now - _lastThemeCheck < 500) return; // 节流：无需每帧采样
    _lastThemeCheck = now;
    let dark = false;
    try {
        // 采样面板区域中心（逻辑坐标 1000,460）的背景像素
        const px = MainCanvas.getImageData(1000, 460, 1, 1).data;
        const lum = 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2];
        dark = lum < 128;
        // ponytail: canvas 若被跨域贴图污染，getImageData 抛错 -> 回退亮色主题
    } catch (_) { dark = false; }
    el.classList.toggle("sca-dark", dark);
}

// === 导航 ===

function _navigateTo(page) {
    _pageHistory.push(settingsPage);
    settingsPage = page;
    _renderCurrentPage();
}

function _goBack() {
    if (_pageHistory.length > 0) {
        settingsPage = _pageHistory.pop();
    } else {
        settingsPage = "main";
    }
    _renderCurrentPage();
}

// === 页面渲染 ===

function _renderMainPage() {
    const s = getSettings();
    const modeLabel = s.urlLoadMode === "whitelist"
        ? L("白名单模式", "Whitelist")
        : L("不限制模式", "Unrestricted");
    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("自定义贴图 - 安全设置", "Custom Texture - Security Settings")}</div>
            <div class="sca-row" style="margin:6px 0 14px">
                <span style="font-size:15px;color:var(--sca-muted)">${L("当前模式：", "Current mode: ")}<strong style="color:var(--sca-fg)">${modeLabel}</strong></span>
            </div>

            <div class="sca-card" onclick="ShuangSettings.nav('modeSelect')" style="cursor:pointer">
                <div class="sca-card-title">${L("加载模式设置", "Load Mode Settings")} <span class="sca-tag ${s.urlLoadMode === 'whitelist' ? 'green' : 'orange'}">${modeLabel}</span></div>
                <div class="sca-card-desc">${L("选择白名单模式或不限制模式", "Choose whitelist or unrestricted mode")}</div>
            </div>

            ${s.urlLoadMode === "whitelist" ? `
            <div class="sca-card" onclick="ShuangSettings.nav('whitelist')" style="cursor:pointer">
                <div class="sca-card-title">${L("域名白名单管理", "Domain Whitelist")} <span style="font-size:13px;color:var(--sca-muted);font-weight:normal">${L(`${s.allowedDomains?.length || 0} 个域名`, `${s.allowedDomains?.length || 0} domains`)}</span></div>
                <div class="sca-card-desc">${L("添加或移除可信域名，仅这些域名下的贴图会加载", "Add or remove trusted domains")}</div>
            </div>
            ` : ""}

            <div style="margin:12px 0;border-top:1px solid var(--sca-line);padding-top:12px">
                <div class="sca-row" style="margin-bottom:8px">
                    <span class="sca-label">${L("不可信域名提示", "Untrusted domain warning")}</span>
                    <button class="sca-btn ${s.domainWarningEnabled !== false ? 'primary' : ''}" onclick="ShuangSettings.toggle('domainWarningEnabled')" style="width:70px">
                        ${s.domainWarningEnabled !== false ? L("开", "On") : L("关", "Off")}
                    </button>
                </div>
                <div class="sca-row" style="margin-bottom:8px">
                    <span class="sca-label">${L("启用动态图片", "Enable animated images")}</span>
                    <button class="sca-btn ${s.animatedImageEnabled !== false ? 'primary' : ''}" onclick="ShuangSettings.toggle('animatedImageEnabled')" style="width:70px">
                        ${s.animatedImageEnabled !== false ? L("开", "On") : L("关", "Off")}
                    </button>
                </div>
                <div class="sca-row">
                    <span class="sca-label">${L("动图帧率", "GIF Frame Rate")}</span>
                    <input class="sca-input" type="number" min="2" max="30" value="${Math.round(1000 / getGifFrameRate())}" style="width:80px" onchange="ShuangSettings.setFps(this.value)" ${s.gifFpsSyncGame ? "disabled" : ""}>
                    <span style="font-size:14px;color:var(--sca-muted)">fps</span>
                    <button class="sca-btn ${s.gifFpsSyncGame ? 'primary' : ''}" onclick="ShuangSettings.toggle('gifFpsSyncGame')" style="min-width:160px">
                        ${L(`同步游戏帧率: ${s.gifFpsSyncGame ? "开" : "关"}`, `Sync FPS: ${s.gifFpsSyncGame ? "On" : "Off"}`)}
                    </button>
                </div>
            </div>

            <div style="margin-top:auto;padding-top:12px;border-top:1px solid var(--sca-line)">
                <div class="sca-card" onclick="ShuangSettings.nav('blocked')" style="cursor:pointer">
                    <div class="sca-card-title">${L("屏蔽玩家管理", "Blocked Players")} <span style="font-size:13px;color:var(--sca-muted);font-weight:normal">${L(`${(s.blockedPlayers || []).length} 人`, `${(s.blockedPlayers || []).length} players`)}</span></div>
                    <div class="sca-card-desc">${L("屏蔽某玩家的贴图来源或配置，其贴图将不显示", "Block textures from or configured by specific players")}</div>
                </div>
            </div>
        </div>
    `;
}

function _renderModeSelectPage() {
    const s = getSettings();
    const isWhitelist = s.urlLoadMode === "whitelist";
    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("选择贴图加载模式", "Select Load Mode")}</div>
            <div class="sca-subtitle">${L("选择白名单模式或不限制模式", "Choose whitelist or unrestricted mode")}</div>

            <div class="sca-card ${isWhitelist ? 'active' : ''}" onclick="ShuangSettings.setMode('whitelist')" style="cursor:pointer">
                <div class="sca-card-title">${L("白名单模式", "Whitelist Mode")} ${isWhitelist ? `<span class="sca-tag green">${L("当前", "Current")}</span>` : ""}</div>
                <div class="sca-card-desc">${L("仅加载来自可信域名的贴图 URL（推荐）", "Only load textures from trusted domains (recommended)")}</div>
            </div>

            <div class="sca-card ${!isWhitelist ? 'active' : ''}" onclick="ShuangSettings.nav('unrestrictedConfirm')" style="cursor:pointer">
                <div class="sca-card-title">${L("不限制模式", "Unrestricted Mode")} ${!isWhitelist ? `<span class="sca-tag orange">${L("当前", "Current")}</span>` : ""}</div>
                <div class="sca-card-desc">${L("加载所有 HTTPS 贴图 URL（存在隐私风险）", "Load any HTTPS texture URL (privacy risk)")}</div>
            </div>

            ${isWhitelist ? "" : `
            <div style="margin-top:16px;padding:12px;background:#fff3e0;border-radius:8px;border:1px solid #ffcc02">
                <span style="color:#e65100;font-size:14px">⚠️ ${L("不限制模式下，所有 HTTPS 贴图都会加载，可能包含不适宜内容。", "In unrestricted mode, all HTTPS textures will load. This may include inappropriate content.")}</span>
            </div>
            `}
        </div>
    `;
}

function _renderWhitelistPage() {
    const s = getSettings();
    const domains = s.allowedDomains || [];

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("域名白名单管理", "Domain Whitelist")}</div>
            <div class="sca-subtitle">${L("仅来自这些域名的贴图 URL 会被加载", "Only texture URLs from these domains will load")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:40px">#</th><th>${L("域名", "Domain")}</th><th style="width:100px">${L("操作", "Action")}</th></tr></thead>
                    <tbody>
                        ${domains.length === 0 ? `
                            <tr><td colspan="3" style="text-align:center;color:var(--sca-muted);padding:30px">${L("（暂无域名，请添加）", "(No domains, add one)")}</td></tr>
                        ` : domains.map((d, i) => `
                            <tr>
                                <td style="color:var(--sca-muted)">${i + 1}</td>
                                <td>${d}</td>
                                <td><button class="sca-btn danger small" onclick="ShuangSettings.removeDomain(${i})">${L("删除", "Delete")}</button></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sca-bottom">
                <div class="sca-row">
                    <span class="sca-label">${L("添加域名:", "Add domain:")}</span>
                    <input class="sca-input" id="ShuangDomainInput" type="text" placeholder="${L("example.com", "example.com")}" style="width:250px" onkeydown="if(event.key==='Enter')ShuangSettings.addDomain()">
                    <button class="sca-btn primary" onclick="ShuangSettings.addDomain()">${L("添加", "Add")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.addDefaultDomains()" style="background:#e3f2fd;border-color:#90caf9">${L("添加推荐域名", "Add Defaults")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.scanRoom()" style="background:#fff3e0;border-color:#ffb74d">${L("扫描房间", "Scan Room")}</button>
                    <button class="sca-btn danger" onclick="ShuangSettings.clearDomains()">${L("清空全部", "Clear All")}</button>
                </div>
            </div>
        </div>
    `;
    const input = document.getElementById("ShuangDomainInput");
    if (input) setTimeout(() => input.focus(), 50);
}

function _renderBlockedPage() {
    const s = getSettings();
    const blocked = s.blockedPlayers || [];

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("屏蔽玩家管理", "Blocked Players")}</div>
            <div class="sca-subtitle">${L("被屏蔽的玩家，其贴图来源或配置的贴图将不会显示",
                "Textures from or configured by blocked players will be hidden")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:100px">${L("ID", "ID")}</th><th>${L("昵称", "Nickname")}</th><th style="width:120px">${L("操作", "Action")}</th></tr></thead>
                    <tbody id="ShuangBlockedTableBody">
                        ${blocked.length === 0 ? `
                            <tr><td colspan="3" style="text-align:center;color:var(--sca-muted);padding:30px">${L("（暂无屏蔽的玩家）", "(No blocked players)")}</td></tr>
                        ` : blocked.map((mn, i) => {
                            const name = _getPlayerName(mn);
                            return `<tr>
                                <td>#${mn}</td>
                                <td>${name || "-"}</td>
                                <td><button class="sca-btn danger small" onclick="ShuangSettings.unblock(${i})">${L("取消屏蔽", "Unblock")}</button></td>
                            </tr>`;
                        }).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sca-bottom">
                <div class="sca-section-title" style="margin-top:0">${L("添加屏蔽", "Add Block")}</div>
                <div class="sca-row">
                    <span class="sca-label">MemberNumber:</span>
                    <input class="sca-input" id="ShuangBlockedNewInput" type="text" placeholder="${L("输入 MemberNumber", "Enter MemberNumber")}" style="width:200px">
                    <button class="sca-btn primary" onclick="ShuangSettings.addBlocked()">${L("添加", "Add")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.nav('roomPick')">${L("从房间中选择 >>>", "From Room >>>")}</button>
                </div>
            </div>
        </div>
    `;
    const inp = document.getElementById("ShuangBlockedNewInput");
    if (inp) {
        inp.onkeydown = (e) => {
            if (e.key === "Enter") ShuangSettings.addBlocked();
        };
        setTimeout(() => inp.focus(), 50);
    }
}

// === 房间不可信域名扫描 ===

/**
 * 遍历当前房间所有玩家的自定义贴图道具，收集所有不在白名单中的贴图 URL
 * 同时检查全局 TextureURL 和 PoseSettings 中各姿势覆盖的 TextureURL
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
    if (typeof Player !== "undefined" && Player && chars.indexOf(Player) === -1) {
        chars.push(Player);
    }

    for (const C of chars) {
        if (!C || !C.Appearance) continue;
        const name = (typeof CharacterNickname === "function" ? CharacterNickname(C) : "")
            || C.Nickname || C.Name || "Unknown";

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

    // 按 (玩家名, URL) 去重，避免同一玩家的同一 URL（可能出现在多个图层/姿势）重复显示
    const seen = new Set();
    return results.filter(r => {
        const key = r.name + "|" + r.url;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function _addIfUntrusted(results, name, url) {
    if (!url || typeof url !== "string") return;
    if (isDomainInWhitelist(url)) return; // 可信，跳过
    const domain = extractDomain(url);
    if (!domain) return;
    results.push({ name, url, domain });
}

function _getScanResults() {
    if (_scanResults === null) {
        _scanResults = collectUntrustedUrls();
    }
    return _scanResults;
}

function _refreshScanResults() {
    _scanResults = collectUntrustedUrls();
}

function _renderScanPage() {
    const s = getSettings();
    const inRoom = typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter) && ChatRoomCharacter.length > 0;
    const results = _getScanResults();

    // 非白名单模式提示
    if (s.urlLoadMode !== "whitelist") {
        _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("房间不可信域名扫描", "Room Untrusted Domain Scan")}</div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--sca-muted)">
                <div style="font-size:16px">${L("此功能仅在白名单模式下可用", "This feature is only available in Whitelist mode")}</div>
                <div style="font-size:14px">${L("请先切换到白名单模式", "Please switch to Whitelist mode first")}</div>
            </div>
        </div>`;
        return;
    }

    // 确认添加域名页
    if (_scanPendingDomain) {
        _renderScanConfirmPage();
        return;
    }

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("房间不可信域名扫描", "Room Untrusted Domain Scan")}</div>
            <div class="sca-subtitle">${inRoom
                ? L("当前房间内所有玩家身上的不可信贴图域名", "Untrusted texture domains from all players in the current room")
                : L("当前不在房间中，仅扫描了自己的贴图", "Not in a room, only your own textures were scanned")}</div>

            ${results.length === 0 ? `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
                <div style="font-size:18px;color:#4caf50">${L("✔ 未发现不可信域名", "✔ No untrusted domains found")}</div>
                <div style="font-size:14px;color:var(--sca-muted)">${L("当前房间内所有玩家的贴图域名均已在白名单中", "All texture domains in the current room are already whitelisted")}</div>
            </div>
            ` : `
            <div style="font-size:14px;color:#e65100;margin-bottom:8px">${L(`发现 ${results.length} 个不可信域名`, `${results.length} untrusted domains found`)}</div>
            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr>
                        <th style="width:36px">#</th>
                        <th style="width:160px">${L("玩家", "Player")}</th>
                        <th style="width:240px">${L("域名", "Domain")}</th>
                        <th>${L("URL", "URL")}</th>
                        <th style="width:90px">${L("操作", "Action")}</th>
                    </tr></thead>
                    <tbody>
                        ${results.map((r, i) => `
                        <tr>
                            <td style="color:var(--sca-muted)">${i + 1}</td>
                            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.name}">${r.name}</td>
                            <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.domain}">${r.domain}</td>
                            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sca-muted);font-size:13px" title="${r.url}">${r.url}</td>
                            <td><button class="sca-btn primary small" onclick="ShuangSettings.trustDomain(&quot;${r.domain.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}&quot;)">${L("信任", "Trust")}</button></td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>
            `}
        </div>
    `;
}

function _renderScanConfirmPage() {
    const domain = _scanPendingDomain;
    const lines = isChineseLang() ? [
        `即将添加域名到白名单: ${domain}`,
        "",
        "添加后，来自该域名的贴图 URL 将被允许加载",
        "",
        "请注意以下风险：",
        "1. 请确认您信任该域名提供者",
        "2. 该域名的所有 URL 都将被加载",
        "3. 恶意域名可能用于追踪您的 IP 地址",
        "4. 恶意域名可能导致隐私信息泄露",
        "",
        "确定要添加此域名到可信列表吗？",
    ] : [
        `About to add domain to whitelist: ${domain}`,
        "",
        "Once added, texture URLs from this domain will be allowed",
        "",
        "Please note the following risks:",
        "1. Make sure you trust this domain's provider",
        "2. All URLs from this domain will be loaded",
        "3. A malicious domain may track your IP address",
        "4. A malicious domain may leak private info",
        "",
        "Add this domain to the trusted list?",
    ];

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title" style="color:#e53935">${L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠")}</div>
            <div style="flex:1;min-height:0;overflow-y:auto;padding:12px;background:#fff8f8;border:1px solid #ffcdd2;border-radius:8px;margin:8px 0">
                ${lines.map(line => line ? `<div style="font-size:15px;color:#333;padding:3px 0">${line}</div>` : `<div style="height:8px"></div>`).join("")}
            </div>
            <div class="sca-row" style="justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--sca-line)">
                <button class="sca-btn primary" onclick="ShuangSettings.confirmTrustDomain()" style="min-width:160px;font-size:17px;padding:12px 30px;background:#4caf50;border-color:#43a047">
                    ${L("确认添加", "Add")}
                </button>
                <button class="sca-btn secondary" onclick="ShuangSettings.cancelTrustDomain()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${L("取消", "Cancel")}
                </button>
            </div>
        </div>
    `;
}

function _renderRoomPickPage() {
    const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
        ? ChatRoomCharacter : [];
    if (Player && chars.indexOf(Player) === -1) chars.push(Player);
    const blocked = getSettings().blockedPlayers || [];

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${L("从房间选择要屏蔽的玩家", "Select from Room")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:100px">${L("ID", "ID")}</th><th>${L("昵称", "Nickname")}</th><th style="width:120px">${L("操作", "Action")}</th></tr></thead>
                    <tbody>
                        ${chars.filter(c => c.MemberNumber).map(c => {
                            const mn = c.MemberNumber;
                            const name = (typeof CharacterNickname === "function" ? CharacterNickname(c) : "") || c.Nickname || c.Name || "";
                            const isBlocked = blocked.indexOf(mn) !== -1;
                            return `<tr>
                                <td>#${mn}</td>
                                <td>${name || "-"}</td>
                                <td>${isBlocked
                                    ? `<span style="color:var(--sca-muted);font-size:14px">${L("已屏蔽", "Blocked")}</span>`
                                    : `<button class="sca-btn danger small" onclick="ShuangSettings.blockFromRoom(${mn})">${L("屏蔽", "Block")}</button>`
                                }</td>
                            </tr>`;
                        }).join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function _renderUnrestrictedConfirmPage() {
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

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title" style="color:#e53935">${L("⚠ 隐私安全警告 ⚠", "⚠ Privacy & Security Warning ⚠")}</div>
            <div style="flex:1;min-height:0;overflow-y:auto;padding:12px;background:#fff8f8;border:1px solid #ffcdd2;border-radius:8px;margin:8px 0">
                ${lines.map(line => line ? `<div style="font-size:15px;color:#333;padding:3px 0">${line}</div>` : `<div style="height:8px"></div>`).join("")}
            </div>
            <div class="sca-row" style="justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--sca-line)">
                <button class="sca-btn danger" onclick="ShuangSettings.confirmUnrestricted()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${L("确定开启", "Enable")}
                </button>
                <button class="sca-btn secondary" onclick="ShuangSettings.cancelUnrestricted()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${L("取消", "Cancel")}
                </button>
            </div>
        </div>
    `;
}

// === 全局事件处理 ===

window.ShuangSettings = {
    nav: (page) => _navigateTo(page),
    back: () => _goBack(),

    toggle: (key) => {
        const s = getSettings();
        s[key] = !s[key];
        saveSettings();
        _renderCurrentPage();
    },

    setFps: (val) => {
        const p = parseInt(val);
        if (isNaN(p)) return;
        const c = Math.max(2, Math.min(30, p));
        const ms = Math.round(1000 / c);
        const s = getSettings();
        if (s.gifFrameRate !== ms) { s.gifFrameRate = ms; saveSettings(); }
    },

    setMode: (mode) => {
        const s = getSettings();
        s.urlLoadMode = mode;
        saveSettings();
        _renderModeSelectPage();
    },

    unblock: (index) => {
        const s = getSettings();
        const b = s.blockedPlayers || [];
        b.splice(index, 1);
        s.blockedPlayers = b;
        saveSettings();
        _refreshRoomCharacters();
        _renderBlockedPage();
    },

    addBlocked: () => {
        const inp = document.getElementById("ShuangBlockedNewInput");
        if (!inp) return;
        const val = parseInt(inp.value, 10);
        if (Number.isFinite(val) && val > 0) {
            const s = getSettings();
            const b = s.blockedPlayers || [];
            if (b.indexOf(val) === -1) {
                b.push(val);
                s.blockedPlayers = b;
                saveSettings();
                _refreshRoomCharacters();
            }
            inp.value = "";
            _renderBlockedPage();
        }
    },

    blockFromRoom: (mn) => {
        const s = getSettings();
        const b = s.blockedPlayers || [];
        if (b.indexOf(mn) === -1) {
            b.push(mn);
            s.blockedPlayers = b;
            saveSettings();
            _refreshRoomCharacters();
        }
        _renderRoomPickPage();
    },

    addDomain: () => {
        const inp = document.getElementById("ShuangDomainInput");
        if (!inp || !inp.value.trim()) return;
        addDomainToWhitelist(inp.value.trim());
        inp.value = "";
        _renderWhitelistPage();
    },

    removeDomain: (index) => {
        const s = getSettings();
        s.allowedDomains.splice(index, 1);
        saveSettings();
        _renderWhitelistPage();
    },

    clearDomains: () => {
        const s = getSettings();
        s.allowedDomains = [];
        saveSettings();
        _renderWhitelistPage();
    },

    addDefaultDomains: () => {
        const s = getSettings();
        for (const d of DEFAULT_ALLOWED_DOMAINS) {
            if (!s.allowedDomains.includes(d)) s.allowedDomains.push(d);
        }
        saveSettings();
        _renderWhitelistPage();
    },

    scanRoom: () => {
        _scanResults = null; // 强制重新扫描
        _scanPendingDomain = null;
        _navigateTo("scan");
    },

    trustDomain: (domain) => {
        _scanPendingDomain = domain;
        _renderScanPage();
    },

    confirmTrustDomain: () => {
        const domain = _scanPendingDomain;
        if (!domain) return;
        const success = addDomainToWhitelist(domain);
        if (success) Logger.info(`从房间扫描添加可信域名: ${domain}`);
        _scanPendingDomain = null;
        _refreshScanResults();
        _renderScanPage();
    },

    cancelTrustDomain: () => {
        _scanPendingDomain = null;
        _renderScanPage();
    },

    confirmUnrestricted: () => {
        const s = getSettings();
        s.urlLoadMode = "unrestricted";
        saveSettings();
        Logger.info("已切换到不限制模式");
        _pageHistory = [];
        settingsPage = "main";
        _renderCurrentPage();
    },

    cancelUnrestricted: () => {
        _goBack();
    }
};

function _renderCurrentPage() {
    const container = _getContainer();
    switch (settingsPage) {
        case "main": _renderMainPage(); break;
        case "modeSelect": _renderModeSelectPage(); break;
        case "whitelist": _renderWhitelistPage(); break;
        case "scan": _renderScanPage(); break;
        case "blocked": _renderBlockedPage(); break;
        case "roomPick": _renderRoomPickPage(); break;
        case "unrestrictedConfirm": _renderUnrestrictedConfirmPage(); break;
        default: container.innerHTML = ""; break;
    }
    _posContainer();
}

function _refreshRoomCharacters() {
    try {
        const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
            ? ChatRoomCharacter : [];
        if (Player && chars.indexOf(Player) === -1) chars.push(Player);
        for (const C of chars) {
            if (typeof CharacterRefresh === "function") CharacterRefresh(C, false, false);
        }
    } catch (_) {}
}

function _getPlayerName(mn) {
    try {
        if (typeof CharacterNickname === "function") {
            const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
                ? ChatRoomCharacter : [];
            for (const C of chars) {
                if (C.MemberNumber === mn) return CharacterNickname(C) || C.Name || "";
            }
            if (Player && Player.MemberNumber === mn) return CharacterNickname(Player) || Player.Name || "";
        }
        if (Player && Player.MemberNumber === mn) return Player.Nickname || Player.Name || "";
    } catch (_) {}
    return "";
}

// === 注册扩展设置 ===

export function initSettings() {
    if (typeof PreferenceRegisterExtensionSetting !== "function") {
        setTimeout(initSettings, 1000);
        return;
    }

    PreferenceRegisterExtensionSetting({
        Identifier: EXTENSION_ID,
        ButtonText: L("自定义贴图设置", "Custom Texture Settings"),
        Image: BADGE_IMAGE_URL,
        load: () => {
            settingsPage = "main";
            _pageHistory = [];
            _getContainer();
            _renderCurrentPage();
        },
        run: () => {
            MainCanvas.textAlign = "center";
            // 返回按钮（子页面时显示）
            if (settingsPage !== "main") {
                DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png",
                    L("返回", "Back"));
            } else {
                DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png",
                    L("退出", "Exit"));
            }
            _posContainer();
            _applyTheme();
            MainCanvas.textAlign = "center";
        },
        click: () => {
            if (MouseIn(1815, 75, 90, 90)) {
                if (settingsPage !== "main") {
                    // 子页面：返回上一级
                    _goBack();
                } else {
                    // 主页面：退出插件设置
                    PreferenceSubscreenExtensionsClear();
                }
            }
        },
        exit: () => {
            _removeContainer();
            settingsPage = "main";
            _pageHistory = [];
            return true;
        },
        unload: () => {
            _removeContainer();
            settingsPage = "main";
            _pageHistory = [];
        },
    });

    Logger.info("扩展设置已注册");
}