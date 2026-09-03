import { t } from "../i18n/index.js";
/**
 * 自定义贴图 - 安全设置模块（DOM 版）
 * 使用 HTML/CSS 布局替代 canvas 绘制
 */
import { Logger, cancelTextureImageLoads } from "@lib/utils.js";
import { setTextureDownloadsEnabled } from "../lib/imageLimits.js";
import { BADGE_IMAGE_URL, ASSET_NAME } from "./constants.js";
import ModInfo from "../modInfo.js";
import { exportPlayerBackup, importPlayerBackup, CRAFT_KEY } from "../lib/persistence.js";
import { packetBytes, extensionPacket, ACCOUNT_UPDATE_LIMIT } from "../lib/accountCapacity.js";

import { SETTINGS_KEY, getSettings, ALWAYS_ALLOWED_DOMAINS, DEFAULT_ALLOWED_DOMAINS } from "../lib/settingsStorage.js";
export { getSettings } from "../lib/settingsStorage.js";
const CONTAINER_ID = "ShuangSettingsContainer";

let settingsPage = "main";
let _pageHistory = []; // 页面导航栈

// 房间扫描状态
let _scanResults = null;      // 扫描结果缓存（null=需重新计算）
let _scanPendingDomain = null; // 待确认加入白名单的域名

// === 设置存储 ===

export function saveSettings() {
    if (typeof ServerPlayerExtensionSettingsSync === "function")
        ServerPlayerExtensionSettingsSync(SETTINGS_KEY);
}

export function getDomainWarningEnabled() {
    return getSettings().domainWarningEnabled !== false;
}

export function getPluginEnabled() { return getSettings().pluginEnabled !== false; }
export function getImageLoadingEnabled() { return getPluginEnabled() && getSettings().imagesEnabled !== false; }

export function setupSettingsHooks(hooks) {
    hooks.hookFunction("ValidationResolveAppearanceDiff", 10, (args, next) => {
        const [, previous, incoming, params] = args;
        // Reject remote additions/edits locally using BC's standard diff rejection path.
        // Self edits and removal remain subject to the normal game permissions.
        if (!getPluginEnabled() && params?.C?.MemberNumber === Player.MemberNumber &&
            !params.fromSelf && incoming?.Asset?.Name === ASSET_NAME &&
            (previous?.Asset !== incoming.Asset ||
                ['Property', 'Craft', 'Color', 'Difficulty'].some(key => JSON.stringify(previous?.[key]) !== JSON.stringify(incoming[key])))) return { item: previous, valid: false };
        return next(args);
    });
}
export function isPlayerBlocked(member) { return (getSettings().blockedPlayers || []).includes(member); }
export function togglePlayerBlocked(member) {
    if (!Number.isSafeInteger(member) || member <= 0 || member === Player.MemberNumber) return;
    const settings = getSettings();
    settings.blockedPlayers = isPlayerBlocked(member) ? settings.blockedPlayers.filter(id => id !== member) : [...(settings.blockedPlayers || []), member];
    saveSettings();
    _refreshRoomCharacters();
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
    if (!getImageLoadingEnabled()) return false;
    if (typeof url !== "string" || !url.startsWith("https://")) return false;
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
    background:var(--sca-bg); color:var(--sca-fg); box-sizing:border-box; user-select:none; -webkit-user-select:none; touch-action:pan-y;
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
#${CONTAINER_ID} input, #${CONTAINER_ID} textarea { user-select:text; -webkit-user-select:text; }
#${CONTAINER_ID} img { -webkit-user-drag:none; }
#${CONTAINER_ID} .sca-setting-row { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:12px 0; border-bottom:1px solid var(--sca-line); }
#${CONTAINER_ID} .sca-setting-row > :last-child { flex-shrink:0; }
#${CONTAINER_ID} .sca-setting-row p { margin:5px 0 0; }
#${CONTAINER_ID} .sca-anchor { scroll-margin-top:12px; }
#${CONTAINER_ID} .sca-tabs { display:flex; gap:10px; flex-wrap:wrap; padding:12px 0; border-bottom:1px solid var(--sca-line); }
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

/** Mouse/pen drag scrolling; touch uses the browser's native pan-y behavior. */
export function enableSettingsDragScroll(container) {
    let drag = null, suppressClick = false;
    container.addEventListener("pointerdown", event => {
        suppressClick = false;
        drag = null;
        if (event.pointerType === "touch" || event.button !== 0 ||
            event.target.closest('button,input,select,textarea,a,[contenteditable="true"],[onclick]')) return;
        let scroller = event.target;
        while (scroller && scroller !== container) {
            if (scroller.scrollHeight > scroller.clientHeight && /auto|scroll/.test(getComputedStyle(scroller).overflowY)) break;
            scroller = scroller.parentElement;
        }
        if (!scroller || scroller === container) return;
        drag = { scroller, pointer: event.pointerId, y: event.clientY, top: scroller.scrollTop };
    });
    container.addEventListener("pointermove", event => {
        if (!drag || drag.pointer !== event.pointerId) return;
        if (!(event.buttons & 1)) { drag = null; return; }
        const delta = event.clientY - drag.y;
        if (!suppressClick && Math.abs(delta) < 4) return;
        if (!suppressClick) container.setPointerCapture(event.pointerId);
        suppressClick = true;
        drag.scroller.scrollTop = drag.top - delta;
        event.preventDefault();
    });
    const finish = event => {
        if (drag?.pointer !== event.pointerId) return;
        drag = null;
        if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
    };
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) container.addEventListener(name, finish);
    container.addEventListener("click", event => {
        if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    }, true);
}

function _getContainer() {
    let el = document.getElementById(CONTAINER_ID);
    if (!el) {
        _injectStyle();
        el = document.createElement("div");
        el.id = CONTAINER_ID;
        // 背景交由样式表的 --sca-bg 控制（亮色透明 / 暗色纯色面板），此处不写死 background
        el.style.cssText = "position:fixed;overflow:hidden;z-index:1000;font-family:Arial,'Microsoft YaHei',sans-serif";
        enableSettingsDragScroll(el);
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
    el.style.left = (MainCanvas.canvas.offsetLeft + 180 * sx) + "px";
    el.style.top = (MainCanvas.canvas.offsetTop + 75 * sy) + "px";
    el.style.width = ((MainCanvasWidth - 420) * sx) + "px";
    el.style.height = ((MainCanvasHeight - 115) * sy) + "px";
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

function settingRow(label, control, help = "") {
    return `<div class="sca-setting-row"><div><span>${t(label)}</span>${help ? `<p class="sca-card-desc">${t(help)}</p>` : ""}</div><div class="sca-row">${control}</div></div>`;
}
function settingsToggle(key, label, help = "") {
    const enabled = key === "gifFpsSyncGame" ? !!getSettings()[key] : getSettings()[key] !== false;
    return settingRow(label, `<button class="sca-btn ${enabled ? 'primary' : ''}" aria-pressed="${enabled}" onclick="ShuangSettings.toggle('${key}')">${t(enabled ? 'settings.on' : 'settings.off')}</button>`, help);
}
let capacityUpdated = 0;
function updateCapacityDisplay() {
    const el = document.querySelector('[data-sca-capacity]');
    if (!el || Date.now() - capacityUpdated < 500) return;
    capacityUpdated = Date.now();
    el.innerHTML = capacityRow(CRAFT_KEY, 'settings.craft_capacity');
}
function capacityRow(key, label) {
    const bytes = packetBytes(extensionPacket(key, Player.ExtensionSettings[key] || {}));
    const color = bytes > ACCOUNT_UPDATE_LIMIT ? '#d84343' : bytes > ACCOUNT_UPDATE_LIMIT * .8 ? '#c57b12' : '#4caf50';
    const percent = bytes / ACCOUNT_UPDATE_LIMIT * 100;
    return `<div style="display:flex;justify-content:space-between;gap:6px;font-size:13px"><span>${t(label)}</span><span style="color:${color}">${(bytes / 1000).toFixed(1)} / 180 kB</span></div><div role="progressbar" aria-label="${t(label)}" aria-valuemin="0" aria-valuemax="180000" aria-valuenow="${Math.min(bytes, ACCOUNT_UPDATE_LIMIT)}" aria-valuetext="${percent.toFixed(1)}%" style="height:7px;margin-top:6px;background:var(--sca-line);border-radius:4px;overflow:hidden"><div style="width:${Math.min(100, percent)}%;height:100%;background:${color}"></div></div>`;
}

function _renderMainPage() {
    const s = getSettings();
    const section = (id, label, content) => `<section id="sca-section-${id}" class="sca-anchor"><h2 class="sca-section-title">${t(label)}</h2><div class="sca-card">${content}</div></section>`;
    const nav = (page, label, detail) => settingRow(label, `<button class="sca-btn" onclick="ShuangSettings.nav('${page}')">${detail}</button>`);
    const sections = [['main', 'settings.main_controls'], ['display', 'settings.display_management'], ['images', 'settings.image_options'], ['cache', 'settings.cache_management']];
    _getContainer().innerHTML = `<div class="sca-page active sca-flex" style="padding:4px 16px 12px">
        <div class="sca-title">${t('settings.custom_texture_settings')} - v${ModInfo.version}</div>
        <nav class="sca-tabs">${sections.map(([id, label]) => `<button class="sca-btn" onclick="ShuangSettings.jump('${id}')">${t(label)}</button>`).join('')}<span data-sca-capacity title="${t('settings.backup_capacity_help')}" style="display:block;align-self:center;width:200px;flex:0 0 200px;padding:8px 10px;border:1px solid var(--sca-btn-border);border-radius:6px;background:var(--sca-card-bg);white-space:nowrap"></span></nav>
        <div data-sca-scroll style="overflow-y:auto;min-height:0;flex:1;padding-right:12px">
        ${section('main', 'settings.main_controls', settingsToggle('pluginEnabled', 'settings.plugin_enabled', 'settings.plugin_help'))}
        ${section('display', 'settings.display_management', settingsToggle('imagesEnabled', 'settings.images_enabled', 'settings.images_help') + nav('modeSelect', 'settings.load_mode_settings', t(s.urlLoadMode === 'whitelist' ? 'settings.whitelist' : 'settings.unrestricted')) + nav('whitelist', 'settings.domain_whitelist', t('settings.domains', [s.allowedDomains?.length || 0])) + nav('blocked', 'settings.blocked_players', t('settings.players', [s.blockedPlayers?.length || 0])))}
        ${section('images', 'settings.image_options', settingsToggle('domainWarningEnabled', 'settings.untrusted_domain_warning') + settingsToggle('animatedImageEnabled', 'settings.enable_animated_images') + settingRow('settings.gif_frame_rate', `<input aria-label="fps" class="sca-input" type="number" min="2" max="30" value="${Math.round(1000 / getGifFrameRate())}" style="width:85px" onchange="ShuangSettings.setFps(this.value)" ${s.gifFpsSyncGame ? 'disabled' : ''}> fps`) + settingsToggle('gifFpsSyncGame', 'settings.sync_game_fps'))}
        ${section('cache', 'settings.cache_management', settingRow('settings.backup_export', `<button class="sca-btn" onclick="ShuangSettings.exportBackup()">${t('settings.backup_export')}</button>`, 'settings.backup_help') + settingRow('settings.backup_import', `<button class="sca-btn" onclick="document.getElementById('ShuangBackupFile').click()">${t('settings.backup_import')}</button><input id="ShuangBackupFile" type="file" accept=".json,application/json" hidden onchange="ShuangSettings.importBackup(this)">`) + '<p data-sca-backup-status role="status" class="sca-card-desc"></p>')}
        </div></div>`;
    capacityUpdated = 0;
    updateCapacityDisplay();
}

function _renderModeSelectPage() {
    const s = getSettings();
    const isWhitelist = s.urlLoadMode === "whitelist";
    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title">${t("settings.select_load_mode")}</div>
            <div class="sca-subtitle">${t("settings.choose_whitelist_or_unrestricted_mode")}</div>

            <div class="sca-card ${isWhitelist ? 'active' : ''}" onclick="ShuangSettings.setMode('whitelist')" style="cursor:pointer">
                <div class="sca-card-title">${t("settings.whitelist_mode")} ${isWhitelist ? `<span class="sca-tag green">${t("settings.current")}</span>` : ""}</div>
                <div class="sca-card-desc">${t("settings.only_load_textures_from_trusted_domains_recommended")}</div>
            </div>

            <div class="sca-card ${!isWhitelist ? 'active' : ''}" onclick="ShuangSettings.nav('unrestrictedConfirm')" style="cursor:pointer">
                <div class="sca-card-title">${t("settings.unrestricted_mode")} ${!isWhitelist ? `<span class="sca-tag orange">${t("settings.current")}</span>` : ""}</div>
                <div class="sca-card-desc">${t("settings.load_any_https_texture_url_privacy_risk")}</div>
            </div>

            ${isWhitelist ? "" : `
            <div style="margin-top:16px;padding:12px;background:#fff3e0;border-radius:8px;border:1px solid #ffcc02">
                <span style="color:#e65100;font-size:14px">⚠️ ${t("settings.in_unrestricted_mode_all_https_textures_will_load_this_may_includ")}</span>
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
            <div class="sca-title">${t("settings.domain_whitelist")}</div>
            <div class="sca-subtitle">${t("settings.only_texture_urls_from_these_domains_will_load")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:40px">#</th><th>${t("settings.domain")}</th><th style="width:100px">${t("settings.action")}</th></tr></thead>
                    <tbody>
                        ${domains.length === 0 ? `
                            <tr><td colspan="3" style="text-align:center;color:var(--sca-muted);padding:30px">${t("settings.no_domains_add_one")}</td></tr>
                        ` : domains.map((d, i) => `
                            <tr>
                                <td style="color:var(--sca-muted)">${i + 1}</td>
                                <td>${d}</td>
                                <td><button class="sca-btn danger small" onclick="ShuangSettings.removeDomain(${i})">${t("settings.delete")}</button></td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sca-bottom">
                <div class="sca-row">
                    <span class="sca-label">${t("settings.add_domain")}</span>
                    <input class="sca-input" id="ShuangDomainInput" type="text" placeholder="${t("settings.example_com")}" style="width:250px" onkeydown="if(event.key==='Enter')ShuangSettings.addDomain()">
                    <button class="sca-btn primary" onclick="ShuangSettings.addDomain()">${t("settings.add")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.addDefaultDomains()" style="background:#e3f2fd;border-color:#90caf9">${t("settings.add_defaults")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.scanRoom()" style="background:#fff3e0;border-color:#ffb74d">${t("settings.scan_room")}</button>
                    <button class="sca-btn danger" onclick="ShuangSettings.clearDomains()">${t("settings.clear_all")}</button>
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
            <div class="sca-title">${t("settings.blocked_players")}</div>
            <div class="sca-subtitle">${t("settings.textures_from_or_configured_by_blocked_players_will_be_hidden")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:100px">${t("settings.id")}</th><th>${t("settings.nickname")}</th><th style="width:120px">${t("settings.action")}</th></tr></thead>
                    <tbody id="ShuangBlockedTableBody">
                        ${blocked.length === 0 ? `
                            <tr><td colspan="3" style="text-align:center;color:var(--sca-muted);padding:30px">${t("settings.no_blocked_players")}</td></tr>
                        ` : blocked.map((mn, i) => {
                            const name = _getPlayerName(mn);
                            return `<tr>
                                <td>#${mn}</td>
                                <td>${name || "-"}</td>
                                <td><button class="sca-btn danger small" onclick="ShuangSettings.unblock(${i})">${t("settings.unblock")}</button></td>
                            </tr>`;
                        }).join("")}
                    </tbody>
                </table>
            </div>

            <div class="sca-bottom">
                <div class="sca-section-title" style="margin-top:0">${t("settings.add_block")}</div>
                <div class="sca-row">
                    <span class="sca-label">MemberNumber:</span>
                    <input class="sca-input" id="ShuangBlockedNewInput" type="text" placeholder="${t("settings.enter_membernumber")}" style="width:200px">
                    <button class="sca-btn primary" onclick="ShuangSettings.addBlocked()">${t("settings.add")}</button>
                    <button class="sca-btn" onclick="ShuangSettings.nav('roomPick')">${t("settings.from_room")}</button>
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
            <div class="sca-title">${t("settings.room_untrusted_domain_scan")}</div>
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--sca-muted)">
                <div style="font-size:16px">${t("settings.this_feature_is_only_available_in_whitelist_mode")}</div>
                <div style="font-size:14px">${t("settings.please_switch_to_whitelist_mode_first")}</div>
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
            <div class="sca-title">${t("settings.room_untrusted_domain_scan")}</div>
            <div class="sca-subtitle">${inRoom
                ? t("settings.untrusted_texture_domains_from_all_players_in_the_current_room")
                : t("settings.not_in_a_room_only_your_own_textures_were_scanned")}</div>

            ${results.length === 0 ? `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px">
                <div style="font-size:18px;color:#4caf50">${t("settings.no_untrusted_domains_found")}</div>
                <div style="font-size:14px;color:var(--sca-muted)">${t("settings.all_texture_domains_in_the_current_room_are_already_whitelisted")}</div>
            </div>
            ` : `
            <div style="font-size:14px;color:#e65100;margin-bottom:8px">${t("settings.untrusted_domains_found", [results.length])}</div>
            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr>
                        <th style="width:36px">#</th>
                        <th style="width:160px">${t("settings.player")}</th>
                        <th style="width:240px">${t("settings.domain")}</th>
                        <th>${t("settings.url")}</th>
                        <th style="width:90px">${t("settings.action")}</th>
                    </tr></thead>
                    <tbody>
                        ${results.map((r, i) => `
                        <tr>
                            <td style="color:var(--sca-muted)">${i + 1}</td>
                            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.name}">${r.name}</td>
                            <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.domain}">${r.domain}</td>
                            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--sca-muted);font-size:13px" title="${r.url}">${r.url}</td>
                            <td><button class="sca-btn primary small" onclick="ShuangSettings.trustDomain(&quot;${r.domain.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}&quot;)">${t("editPanel.trust")}</button></td>
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
    const lines = [t("settings.help_line_1", [domain]), "", t("settings.help_line_2"), "", t("settings.help_line_3"), t("settings.help_line_4"), t("settings.help_line_5"), t("settings.help_line_6"), t("settings.help_line_7"), "", t("settings.help_line_8")];

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title" style="color:#e53935">${t("listView.confirm_trusted_domain")}</div>
            <div style="flex:1;min-height:0;overflow-y:auto;padding:12px;background:#fff8f8;border:1px solid #ffcdd2;border-radius:8px;margin:8px 0">
                ${lines.map(line => line ? `<div style="font-size:15px;color:#333;padding:3px 0">${line}</div>` : `<div style="height:8px"></div>`).join("")}
            </div>
            <div class="sca-row" style="justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--sca-line)">
                <button class="sca-btn primary" onclick="ShuangSettings.confirmTrustDomain()" style="min-width:160px;font-size:17px;padding:12px 30px;background:#4caf50;border-color:#43a047">
                    ${t("listView.add")}
                </button>
                <button class="sca-btn secondary" onclick="ShuangSettings.cancelTrustDomain()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${t("listView.cancel")}
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
            <div class="sca-title">${t("settings.select_from_room")}</div>

            <div class="sca-table-wrap" style="flex:1;min-height:200px">
                <table class="sca-table">
                    <thead><tr><th style="width:100px">${t("settings.id")}</th><th>${t("settings.nickname")}</th><th style="width:120px">${t("settings.action")}</th></tr></thead>
                    <tbody>
                        ${chars.filter(c => c.MemberNumber).map(c => {
                            const mn = c.MemberNumber;
                            const name = (typeof CharacterNickname === "function" ? CharacterNickname(c) : "") || c.Nickname || c.Name || "";
                            const isBlocked = blocked.indexOf(mn) !== -1;
                            return `<tr>
                                <td>#${mn}</td>
                                <td>${name || "-"}</td>
                                <td>${isBlocked
                                    ? `<span style="color:var(--sca-muted);font-size:14px">${t("settings.blocked")}</span>`
                                    : `<button class="sca-btn danger small" onclick="ShuangSettings.blockFromRoom(${mn})">${t("settings.block")}</button>`
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
    const lines = [t("settings.help_line_9"), "", t("settings.help_line_10"), t("settings.help_line_11"), t("settings.help_line_12"), t("settings.help_line_13"), t("settings.help_line_14"), "", t("settings.help_line_15"), "", t("settings.help_line_16")];

    _getContainer().innerHTML = `
        <div class="sca-page active sca-flex" style="height:100%">
            <div class="sca-title" style="color:#e53935">${t("settings.privacy_security_warning")}</div>
            <div style="flex:1;min-height:0;overflow-y:auto;padding:12px;background:#fff8f8;border:1px solid #ffcdd2;border-radius:8px;margin:8px 0">
                ${lines.map(line => line ? `<div style="font-size:15px;color:#333;padding:3px 0">${line}</div>` : `<div style="height:8px"></div>`).join("")}
            </div>
            <div class="sca-row" style="justify-content:center;gap:16px;padding-top:12px;border-top:1px solid var(--sca-line)">
                <button class="sca-btn danger" onclick="ShuangSettings.confirmUnrestricted()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${t("settings.enable")}
                </button>
                <button class="sca-btn secondary" onclick="ShuangSettings.cancelUnrestricted()" style="min-width:160px;font-size:17px;padding:12px 30px">
                    ${t("listView.cancel")}
                </button>
            </div>
        </div>
    `;
}

function backupStatus(success) {
    const el = document.querySelector('[data-sca-backup-status]');
    if (el) el.textContent = t(success ? 'settings.backup_imported' : 'settings.backup_failed');
}

// === 全局事件处理 ===

window.ShuangSettings = {
    jump: id => document.getElementById('sca-section-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    exportBackup: () => {
        try {
            const url = URL.createObjectURL(new Blob([JSON.stringify(exportPlayerBackup(), null, 2)], { type: 'application/json' }));
            const link = document.createElement('a');
            link.href = url; link.download = 'shuang-texture-backup.json'; link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) { Logger.warn('Cannot export backup', error); backupStatus(false); }
    },
    importBackup: async input => {
        const file = input.files?.[0], member = Player.MemberNumber;
        if (!file) return;
        try {
            if (file.size > ACCOUNT_UPDATE_LIMIT * 4) throw new Error('Backup file too large');
            const data = JSON.parse(await file.text());
            if (Player.MemberNumber !== member) return;
            importPlayerBackup(data);
            backupStatus(true);
            capacityUpdated = 0; updateCapacityDisplay();
        } catch (error) { Logger.warn('Cannot import backup', error); backupStatus(false); }
        finally { input.value = ''; }
    },
    nav: (page) => _navigateTo(page),
    back: () => _goBack(),

    toggle: (key) => {
        const s = getSettings();
        s[key] = key === "gifFpsSyncGame" ? !s[key] : s[key] === false;
        if (key === "imagesEnabled" || key === "pluginEnabled") {
            setTextureDownloadsEnabled(getImageLoadingEnabled());
            if (!getImageLoadingEnabled()) cancelTextureImageLoads();
        }
        saveSettings();
        _refreshRoomCharacters();
        const scroll = document.querySelector('[data-sca-scroll]')?.scrollTop || 0;
        _renderCurrentPage();
        const body = document.querySelector('[data-sca-scroll]');
        if (body) body.scrollTop = scroll;
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
            ? [...ChatRoomCharacter] : [];
        if (Player && chars.indexOf(Player) === -1) chars.push(Player);
        const current = typeof CharacterGetCurrent === "function" ? CharacterGetCurrent() : null;
        if (current && !chars.includes(current)) chars.push(current);
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
        ButtonText: t("settings.custom_texture_settings"),
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
                    t("settings.back"));
            } else {
                DrawButton(1815, 75, 90, 90, "", "White", "Icons/Exit.png",
                    t("settings.exit"));
            }
            _posContainer();
            _applyTheme();
            if (settingsPage === "main") updateCapacityDisplay();
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
