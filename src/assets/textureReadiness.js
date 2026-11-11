/**
 * 自定义贴图道具 - 贴图显示状态
 * 供渲染与「隐藏部位异常保护」共用，确保两边对「这张贴图是否真的画出来了」判断一致。
 */

import { ASSETS_CDN_PRIMARY, getPoseKey } from "./constants.js";
import { resolveFixedAssetUrl } from "./cdnFallback.js";
import { sanitizeRenderParams } from "./textureValidation.js";
import { getCorsImage } from "@lib/utils.js";
import { getAnimatedImage } from "@lib/gifPlayer.js";
import { isUrlAllowed, getAnimatedImageEnabled } from "./settings.js";

/**
 * 解析当前姿势下的有效渲染参数
 * 通过 getPoseKey 生成姿势组合键，在 PoseSettings 中查找对应的独立配置
 * - 找到且 enabled=true：用独立配置覆盖全局（未设置的字段回退到全局）
 * - 未找到或未启用：使用全局配置
 * @param {object} texture - 贴图配置（含 PoseSettings）
 * @param {string[]} drawPose - C.DrawPose 数组
 * @returns {object} 合并后的渲染参数
 */
export function resolvePoseParams(texture, drawPose) {
    const base = sanitizeRenderParams(texture);

    const poseKey = getPoseKey(drawPose);
    if (!poseKey) return base;

    const ps = texture.PoseSettings?.[poseKey];
    if (!ps || ps.enabled !== true) return base;

    return { ...base, ...sanitizeRenderParams(ps, true) };
}

/** 当前玩家屏蔽名单（贴图显示与列表预览共用同一份） */
export function getBlockedPlayers() {
    try {
        const s = Player?.ExtensionSettings?.ShuangCustomAssets;
        return Array.isArray(s?.blockedPlayers) ? s.blockedPlayers : [];
    } catch (_) {
        return [];
    }
}

/**
 * 这张贴图是否因玩家屏蔽而不会显示。
 * 贴图来源者、最近配置者、以及当前角色本人的 MemberNumber 都在屏蔽名单时跳过。
 * @param {object} texture
 * @param {object} character - 当前绘制/预览的角色
 * @param {number[]} [blockedPlayers]
 */
export function isTextureBlocked(texture, character, blockedPlayers = getBlockedPlayers()) {
    if (!blockedPlayers.length) return false;
    const texSource = texture?.TextureURLSource || 0;
    const texConfig = texture?.CurrentConfigurator || 0;
    return blockedPlayers.includes(character?.MemberNumber) ||
        (texSource > 0 && blockedPlayers.includes(texSource)) ||
        (texConfig > 0 && blockedPlayers.includes(texConfig));
}

/**
 * 判断一张贴图当前实际会显示成什么状态：
 * - "none"    未配置 URL、Visible=false 或已被屏蔽：本来就不该显示，不算异常
 * - "ready"   已通过域名检查且图片/动图已就绪
 * - "loading" 仍在下载或解析
 * - "failed"  域名不可信、图片加载失败、GIF 解码失败或内容为空
 * 玩家屏蔽不在这里判断：调用方应先排除被屏蔽的贴图，避免把「主动不看」当成加载异常。
 * @param {object} texture
 * @param {string[]} drawPose
 * @returns {"none"|"ready"|"loading"|"failed"}
 */
export function getTextureStatus(texture, drawPose) {
    const params = resolvePoseParams(texture, drawPose);
    if (!params.TextureURL || params.Visible === false) return "none";
    if (!isUrlAllowed(params.TextureURL)) return "failed";

    let imageUrl = params.TextureURL;
    if (imageUrl.startsWith(ASSETS_CDN_PRIMARY + "/")) {
        imageUrl = resolveFixedAssetUrl(imageUrl.substring((ASSETS_CDN_PRIMARY + "/").length));
    }

    const animation = getAnimatedImage(imageUrl, undefined, getAnimatedImageEnabled());
    if (animation.error) return "failed";
    if (!animation.loaded) return "loading";
    if (!animation.failed) {
        if (animation.isAnimated) return animation.frames.length > 0 ? "ready" : "failed";
        return animation.frames[0] ? "ready" : "failed";
    }

    // 内容不是动图（或动图解析器不可用）：交还给静态图片管线
    const image = getCorsImage(imageUrl, undefined, true);
    if (image.failed) return "failed";
    if (!image.loaded || !image.img.complete || image.img.naturalWidth <= 0) return "loading";
    return "ready";
}

/**
 * 「隐藏部位异常保护」：所有应当显示的贴图都就绪时，才允许隐藏游戏原本的服装。
 * 没有配置任何可显示贴图时返回 true（不阻止用户纯用隐藏功能）。
 * @param {object} item
 * @param {object} character - 需要包含 DrawPose 与 MemberNumber
 * @returns {boolean}
 */
export function allTexturesReadyForHide(item, character) {
    if (!character) return true;
    const textures = item?.Property?.Textures;
    if (!Array.isArray(textures)) return true;

    const blockedPlayers = getBlockedPlayers();
    for (const texture of textures) {
        if (!texture) continue;
        // 被屏蔽的贴图同样不会显示：与加载失败一样保留原服装，避免衣服被隐藏却什么都没画出来
        if (isTextureBlocked(texture, character, blockedPlayers)) return false;
        if (getTextureStatus(texture, character.DrawPose) !== "ready") return false;
    }
    return true;
}
