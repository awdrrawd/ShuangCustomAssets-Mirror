import { t } from "../i18n/index.js";
import { state } from "./state.js";
import { TEXTURES_PER_PAGE, MAX_TEXTURE_COUNT } from "./constants.js";
import { getCorsImage } from "../lib/utils.js";
import { getAnimatedImage } from "../lib/gifPlayer.js";
import { resolvePoseParams } from "./render.js";
import { isUrlAllowed, isDomainInWhitelist, getAnimatedImageEnabled, getImageLoadingEnabled, isPlayerBlocked } from "./settings.js";

export function slotActions(texture, deleting) {
    if (deleting) return texture ? ["delete"] : [];
    if (!texture) return ["add"];
    return ["visible", "edit", texture.TextureURL && !isDomainInWhitelist(texture.TextureURL) ? "trust" : "preview"];
}

function blocked(texture) {
    const players = Player?.ExtensionSettings?.ShuangCustomAssets?.blockedPlayers;
    return Array.isArray(players) && [texture.TextureURLSource, texture.CurrentConfigurator].some(id => id > 0 && players.includes(id));
}

/** The list and renderer share caches; hovering never bypasses trust or player blocking. */
export function textureStatus(texture, character) {
    if (!texture) return { state: "empty" };
    const url = resolvePoseParams(texture, character?.DrawPose).TextureURL;
    if (!url) return { state: "empty" };
    if (!getImageLoadingEnabled()) return { state: "disabled", url };
    if (isPlayerBlocked(character?.MemberNumber) || blocked(texture) || !isUrlAllowed(url)) return { state: "blocked", url };
    const animation = getAnimatedImage(url, undefined, getAnimatedImageEnabled());
    if (!animation.loaded) return { state: "loading", url };
    if (animation.error) return { state: "failed", url };
    if (!animation.failed) return { state: "ready", url, image: animation.frames[0]?.canvas };
    const image = getCorsImage(url, undefined, true);
    return { state: image.failed ? "failed" : image.loaded ? "ready" : "loading", url, image: image.img };
}

const ROW = { x: 1200, y: 450, width: 400, height: 40, spacing: 60, gap: 10, actionsX: 1620 };

/** Drawing and hit testing consume the same ordered rectangles. */
export function slotLayout(item) {
    const start = state.currentListPage * TEXTURES_PER_PAGE;
    return Array.from({ length: Math.min(TEXTURES_PER_PAGE, MAX_TEXTURE_COUNT - start) }, (_, row) => {
        const index = start + row;
        const texture = item.Property?.Textures?.[index];
        const y = ROW.y + row * ROW.spacing;
        let x = ROW.actionsX;
        const actions = slotActions(texture, state.deleteMode).map(action => {
            const width = action === "preview" ? ROW.height : 100;
            const rect = { action, x, y, width, height: ROW.height };
            x += width + ROW.gap;
            return rect;
        });
        return { index, texture, y, actions };
    });
}

function actionLabel(action, texture) {
    return {
        add: t("settings.add"), edit: t("textureListDom.edit"), trust: t("editPanel.trust"),
        delete: t("settings.delete"), visible: texture?.Visible === false ? t("listView.hidden") : t("listView.shown")
    }[action];
}

function statusHint(status) {
    if (status.state === "disabled") return t("settings.images_disabled");
    return status.state === "failed" ? t("textureListDom.image_unavailable_network_cors_or_size_limit")
        : status.state === "blocked" ? t("textureListDom.image_not_trusted_or_player_blocked")
            : status.state === "loading" ? t("textureListDom.loading_image") : t("textureListDom.no_image_set");
}

function drawPreview(status) {
    const image = status.image;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!(width > 0 && height > 0)) return;
    const area = { x: 1150, y: 25, width: 700, height: 400 };
    const scale = Math.min(area.width / width, area.height / height);
    const w = width * scale, h = height * scale;
    const x = area.x + (area.width - w) / 2, y = area.y + (area.height - h) / 2;
    MainCanvas.save();
    MainCanvas.fillStyle = "#333333";
    MainCanvas.fillRect(area.x, area.y, area.width, area.height);
    MainCanvas.strokeStyle = "White";
    MainCanvas.strokeRect(area.x, area.y, area.width, area.height);
    MainCanvas.drawImage(image, x, y, w, h);
    MainCanvas.restore();
}

function drawAction(rect, texture, status, locked) {
    const { action, x, y, width, height } = rect;
    if (action === "preview") {
        const ready = status.state === "ready" && status.image;
        DrawButton(x, y, width, height, "", "White", null, ready ? null : statusHint(status));
        DrawImageResize(status.state === "failed" ? "Icons/Small/Warning.png" : "Icons/Explore.png",
            x + 2, y + 2, width - 4, height - 4);
        if (ready && MouseIn(x, y, width, height)) DrawHoverElements.push(() => drawPreview(status));
        return;
    }
    const color = action === "delete" ? "#f7aaaa"
        : action === "visible" ? (texture.Visible === false ? "#666666" : "#4CAF50") : "White";
    DrawButton(x, y, width, height, actionLabel(action, texture), color, null, null, locked);
}

export function drawTextureSlots(item, locked = false) {
    for (const row of slotLayout(item)) {
        const { index, texture, y } = row;
        const status = textureStatus(texture, CharacterGetCurrent());
        // A figure space occupies the missing tens digit, keeping labels stable at slot 10.
        DrawText(t("textureListDom.slot", [String(index + 1).padStart(2, "\u2007")]), 1100, y + ROW.height / 2, "White", "Gray");
        const label = texture ? texture.Alias || status.url || t("textureListDom.empty") : t("textureListDom.empty_slot");
        const hint = state.deleteMode ? t("textureListDom.delete_hint") : texture
            ? t("textureListDom.click_to_edit_alias") : t("textureListDom.add_hint");
        DrawButton(ROW.x, y, ROW.width, ROW.height, "", "White", null, hint, locked || state.deleteMode);
        DrawTextFit(shortSlotLabel(label), ROW.x + ROW.width / 2, y + ROW.height / 2, ROW.width - 12, "Black");
        for (const rect of row.actions) drawAction(rect, texture, status, locked);
    }
}

/** Keep the normal font size instead of shrinking long image-host filenames. */
export function shortSlotLabel(label) {
    const maxWidth = ROW.width - 24;
    if (MainCanvas.measureText(label).width <= maxWidth) return label;
    let prefix = label;
    while (prefix && MainCanvas.measureText(prefix + "...").width > maxWidth) prefix = prefix.slice(0, -1);
    return prefix + "...";
}

export function clickTextureSlots(item, onAction) {
    for (const row of slotLayout(item)) {
        if (MouseIn(ROW.x, row.y, ROW.width, ROW.height)) {
            if (!state.deleteMode) onAction(row.texture ? "alias" : "add", row.index);
            return true;
        }
        for (const rect of row.actions) {
            if (!MouseIn(rect.x, rect.y, rect.width, rect.height)) continue;
            if (rect.action !== "preview") onAction(rect.action, row.index);
            return true;
        }
    }
    return false;
}
