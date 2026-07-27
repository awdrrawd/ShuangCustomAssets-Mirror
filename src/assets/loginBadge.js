/**
 * 自定义贴图道具 - 登录页面加载标识
 * 参考 echo 服装扩展的汉堡标识，在 LoginCharacter 身体部位放上自定义贴图
 */

import { LOGIN_BADGE_TEXTURE, LOGIN_BADGE_ASSET_NAME, LOGIN_BADGE_GROUP, HIDE_CATEGORIES } from "./constants.js";

/**
 * 在登录页面给 LoginCharacter 穿上自定义贴图作为插件加载标识
 * 需要通过 HookManager 挂载到 LoginDoNextThankYou
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupLoginBadge(HookManager) {
    HookManager.progressiveHook("LoginDoNextThankYou")
        .next()
        .inject((args, next) => {
            if (CurrentScreen !== "Login") return next(args);
            if (typeof LoginCharacter === "undefined" || !LoginCharacter) return next(args);

            // 检查是否已穿戴自定义贴图
            const existing = LoginCharacter.Appearance.find(
                a => a.Asset.Group.Name === LOGIN_BADGE_GROUP && a.Asset.Name === LOGIN_BADGE_ASSET_NAME
            );
            if (!existing) {
                InventoryWear(LoginCharacter, LOGIN_BADGE_ASSET_NAME, LOGIN_BADGE_GROUP);
                const item = LoginCharacter.Appearance.find(
                    a => a.Asset.Group.Name === LOGIN_BADGE_GROUP && a.Asset.Name === LOGIN_BADGE_ASSET_NAME
                );
                if (item) {
                    if (!item.Property) item.Property = {};
                    item.Property.Textures = [{ ...LOGIN_BADGE_TEXTURE }];
                    for (const cat of HIDE_CATEGORIES) {
                        item.Property[cat.key] = false;
                    }
                    item.Property.Hide = [];
                }
                CharacterRefresh(LoginCharacter);
            }
            next(args);
        });
}
