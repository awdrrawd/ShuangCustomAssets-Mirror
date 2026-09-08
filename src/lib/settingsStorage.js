export const SETTINGS_KEY = "ShuangCustomAssets";

export const ALWAYS_ALLOWED_DOMAINS = ["shuang-custom-assets.pages.dev"];

export const DEFAULT_ALLOWED_DOMAINS = [
    "github.io", "gitlab.io", "ibb.co", "imgbb.com", "imgchest.com",
    "imgur.com", "postimg.cc", "hd-r.icu",
    "catbox.moe", "litter.catbox.moe",
    "pub-*.r2.dev", "r2.cloudflarestorage.com",
    "cdn.discordapp.com", "media.discordapp.net",
    ...ALWAYS_ALLOWED_DOMAINS
];

const DEFAULTS = {
    urlLoadMode: "whitelist",
    pluginEnabled: true,
    imagesEnabled: true,
    allowedDomains: [...DEFAULT_ALLOWED_DOMAINS],
    domainWarningEnabled: true,
    animatedImageEnabled: true,
    gifFrameRate: 100,
    gifFpsSyncGame: false,
    blockedPlayers: [],
    imageLimitsEnabled: false,
    imageLimitMaxBytes: 20971520,
    imageLimitMaxFramePixels: 16777216,
    imageLimitMaxAnimationPixels: 33554432,
    imageLimitMaxAnimationFrames: 300,
    imageLimitTimeoutMs: 15000,
};

export function getSettings() {
    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
    const s = Player.ExtensionSettings[SETTINGS_KEY];
    if (!s) {
        Player.ExtensionSettings[SETTINGS_KEY] = { ...DEFAULTS, allowedDomains: [...DEFAULT_ALLOWED_DOMAINS] };
        return Player.ExtensionSettings[SETTINGS_KEY];
    }
    // 老用户已有设置对象但可能缺新字段：合并默认值补齐，避免 undefined 导致开关显示错误
    for (const [k, v] of Object.entries(DEFAULTS)) {
        if (s[k] === undefined) s[k] = k === "allowedDomains" ? [...DEFAULT_ALLOWED_DOMAINS] : v;
    }
    return s;
}
