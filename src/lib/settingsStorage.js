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

export function getSettings() {
    if (!Player.ExtensionSettings) Player.ExtensionSettings = {};
    if (!Player.ExtensionSettings[SETTINGS_KEY]) {
        Player.ExtensionSettings[SETTINGS_KEY] = {
            urlLoadMode: "whitelist",
            pluginEnabled: true,
            imagesEnabled: true,
            allowedDomains: [...DEFAULT_ALLOWED_DOMAINS],
            domainWarningEnabled: true,
            animatedImageEnabled: true,
            gifFrameRate: 100,
            gifFpsSyncGame: false,
            blockedPlayers: [],
        };
    }
    return Player.ExtensionSettings[SETTINGS_KEY];
}

