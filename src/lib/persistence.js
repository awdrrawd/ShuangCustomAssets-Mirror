import { sanitizeTexture, isRecord } from "../assets/textureValidation.js";
import { MAX_TEXTURE_COUNT, ASSET_NAME } from "../assets/constants.js";
import { state } from "../assets/state.js";
import { getSettings, SETTINGS_KEY } from "./settingsStorage.js";
export { SETTINGS_KEY } from "./settingsStorage.js";
import { Logger } from "./utils.js";
import { packetBytes, extensionPacket, ACCOUNT_UPDATE_LIMIT } from "./accountCapacity.js";

export const CRAFT_KEY = "ShuangCustomAssetsCraft";
const BACKUP_TYPE = "ShuangCustomAssetsBackupFile";
const clone = value => JSON.parse(JSON.stringify(value));
let readyMember = null;
let assetsReady = false;
let loading = false;
let incoming = null;
let pendingAppearance = [];
let pendingCrafts = {};

function playerReady() {
    return typeof Player !== "undefined" && Number.isSafeInteger(Player?.MemberNumber)
        && Player.ExtensionSettings && Array.isArray(Player.Appearance) && Array.isArray(Player.Crafting);
}

function readBackup() {
    const appearance = getSettings().appearanceBackup;
    const crafts = Player.ExtensionSettings[CRAFT_KEY];
    return { version: 1,
        appearance: appearance?.version === 1 ? appearance.appearance : [],
        crafts: crafts?.version === 1 ? crafts.crafts : {} };
}

/** Portable backup contains saved appearance/Craft data, not downloaded image binaries. */
export function exportPlayerBackup() {
    backupAppearance();
    backupCrafts();
    return { type: BACKUP_TYPE, ...clone(readBackup()) };
}

export function importPlayerBackup(raw) {
    if (!playerReady() || !assetsReady || loading) throw new Error("Player assets are not ready");
    if (!isRecord(raw) || raw.type !== BACKUP_TYPE || raw.version !== 1 ||
        !Array.isArray(raw.appearance) || !isRecord(raw.crafts)) throw new Error("Invalid texture backup");
    const backup = clone({ version: 1, appearance: raw.appearance, crafts: raw.crafts });
    const groups = new Set();
    const sanitizeProperties = property => {
        if (property === undefined) return;
        if (!isRecord(property)) throw new Error("Invalid backup properties");
        if (property.Textures === undefined) return;
        if (!Array.isArray(property.Textures) || property.Textures.length > MAX_TEXTURE_COUNT) throw new Error("Invalid backup textures");
        property.Textures = property.Textures.map(value => value === null ? null : sanitizeTexture(value));
    };
    for (const saved of backup.appearance) {
        if (!isRecord(saved) || saved.Name !== ASSET_NAME || typeof saved.Group !== 'string' ||
            groups.has(saved.Group) || !AssetGet(Player.AssetFamily, saved.Group, ASSET_NAME)) throw new Error("Invalid backup asset");
        groups.add(saved.Group);
        sanitizeProperties(saved.Property);
    }
    for (const [index, saved] of Object.entries(backup.crafts)) {
        if (!/^(0|[1-9][0-9]*)$/.test(index) || Number(index) >= 200 || !isRecord(saved) || saved.Item !== ASSET_NAME) throw new Error("Invalid backup craft");
        sanitizeProperties(saved.ItemProperty);
    }
    // Validate all records and packet size before replacing any live backup or equipment.
    const appearance = { version: 1, appearance: backup.appearance };
    const crafts = { version: 1, crafts: backup.crafts };
    validateBackupSize(SETTINGS_KEY, { ...getSettings(), appearanceBackup: appearance });
    validateBackupSize(CRAFT_KEY, crafts);
    writeBackup(SETTINGS_KEY, { ...getSettings(), appearanceBackup: appearance });
    writeBackup(CRAFT_KEY, crafts);
    readyMember = null;
    restorePlayerData();
}

function validateBackupSize(key, backup) {
    if (packetBytes(extensionPacket(key, backup)) > ACCOUNT_UPDATE_LIMIT) {
        throw new Error(`${key} exceeds the 180 kB AccountUpdate packet budget; previous backup retained`);
    }
}

function writeBackup(key, backup) {
    if (JSON.stringify(Player.ExtensionSettings[key]) === JSON.stringify(backup)) return;
    validateBackupSize(key, backup);
    const previous = Player.ExtensionSettings[key];
    Player.ExtensionSettings[key] = backup;
    try {
        if (typeof ServerPlayerExtensionSettingsSync === "function") ServerPlayerExtensionSettingsSync(key);
    } catch (error) {
        if (previous === undefined) delete Player.ExtensionSettings[key];
        else Player.ExtensionSettings[key] = previous;
        throw error; // Keep the previous snapshot so the next save can retry.
    }
}

/** Update only after restoration. Login sanitation must never replace a good backup with an empty list. */
export function backupAppearance(committed = false) {
    if (!playerReady() || loading || readyMember !== Player.MemberNumber) return;
    if (!committed && state.currentEditTexture >= 0) return;
    try {
        const appearance = ServerAppearanceBundle(Player.Appearance).filter(item => item.Name === ASSET_NAME);
        const groups = new Set(appearance.map(item => item.Group));
        writeBackup(SETTINGS_KEY, { ...getSettings(), appearanceBackup: { version: 1, appearance: clone([
            ...appearance, ...pendingAppearance.filter(item => !groups.has(item.Group))
        ]) } });
    } catch (error) { Logger.warn("Cannot back up texture appearance", error); }
}

export function backupCrafts() {
    if (!playerReady() || loading || readyMember !== Player.MemberNumber) return;
    try {
        const crafts = { ...pendingCrafts };
        Player.Crafting.forEach((craft, index) => {
            if (craft?.Item === ASSET_NAME) crafts[index] = clone(craft);
        });
        writeBackup(CRAFT_KEY, { version: 1, crafts });
    } catch (error) { Logger.warn("Cannot back up crafted textures", error); }
}

function restoreAppearance(backup) {
    pendingAppearance = [];
    let changed = false;
    for (const saved of Array.isArray(backup.appearance) ? backup.appearance : []) {
        if (saved?.Name !== ASSET_NAME || typeof saved.Group !== "string") continue;
        const asset = AssetGet(Player.AssetFamily, saved.Group, ASSET_NAME);
        const current = Player.Appearance.find(item => item.Asset?.Group?.Name === saved.Group);
        if (!asset || (current && current.Asset.Name !== ASSET_NAME)) {
            pendingAppearance.push(saved); // Keep conflicts recoverable; never replace another equipped item.
            continue;
        }
        if (current) {
            if (!current.Property?.Textures?.length && saved.Property?.Textures?.length) {
                current.Property = clone(saved.Property);
                changed = true;
            }
            continue;
        }
        const { Group, Name, ...properties } = clone(saved);
        Player.Appearance.push({ ...properties, Asset: asset });
        changed = true;
    }
    return changed;
}

function restoreCrafts(backup) {
    pendingCrafts = {};
    let changed = false;
    for (const [key, saved] of Object.entries(backup.crafts || {})) {
        const index = Number(key);
        if (!Number.isInteger(index) || index < 0 || index >= 200 || saved?.Item !== ASSET_NAME) continue;
        const current = Player.Crafting[index];
        if (current) {
            if (current.Item !== ASSET_NAME || current.Name !== saved.Name) { pendingCrafts[key] = saved; continue; }
            if (current.ItemProperty?.Textures?.length || !saved.ItemProperty?.Textures?.length) continue;
        }
        const restored = clone(saved);
        if (typeof CraftingValidate === "function" && CraftingValidate(restored, null, false, true) === 0) {
            pendingCrafts[key] = saved;
            continue;
        }
        if (saved.ItemProperty?.Textures?.length && !restored.ItemProperty?.Textures?.length) {
            pendingCrafts[key] = saved;
            continue;
        }
        Player.Crafting[index] = restored;
        changed = true;
    }
    return changed;
}

export function restorePlayerData() {
    if (!assetsReady || !playerReady() || loading || readyMember === Player.MemberNumber) return;
    loading = true;
    try {
        const backup = clone(readBackup());
        if (incoming?.member === Player.MemberNumber) {
            for (const raw of incoming.appearance) {
                const saved = backup.appearance?.find(item => item.Group === raw.Group);
                if (!raw.Property?.Textures?.length && saved?.Property?.Textures?.length) raw.Property = clone(saved.Property);
            }
            for (const [key, raw] of Object.entries(incoming.crafts)) {
                const saved = backup.crafts?.[key];
                if (saved?.Name === raw.Name && !raw.ItemProperty?.Textures?.length && saved?.ItemProperty?.Textures?.length) raw.ItemProperty = clone(saved.ItemProperty);
            }
            const groups = new Set(incoming.appearance.map(item => item.Group));
            backup.appearance = [...incoming.appearance, ...(backup.appearance || []).filter(item => !groups.has(item.Group))];
            backup.crafts = { ...backup.crafts, ...incoming.crafts };
        }
        const appearanceChanged = restoreAppearance(backup);
        const craftsChanged = restoreCrafts(backup);
        if (appearanceChanged) {
            CharacterRefresh(Player, false, false);
            ServerPlayerAppearanceSync();
            if (typeof ChatRoomCharacterUpdate === "function") ChatRoomCharacterUpdate(Player);
        }
        if (craftsChanged) CraftingSaveServer();
        readyMember = Player.MemberNumber;
        incoming = null;
    } catch (error) { Logger.warn("Cannot restore saved textures; backup retained", error); }
    finally { loading = false; }
    backupAppearance();
    backupCrafts();
}

function captureLogin(packet) {
    if (!packet || !Number.isSafeInteger(packet.MemberNumber)) return;
    readyMember = null;
    const appearance = (Array.isArray(packet.Appearance) ? packet.Appearance : []).filter(item => item?.Name === ASSET_NAME);
    const crafts = {};
    incoming = { member: packet.MemberNumber, appearance: clone(appearance), crafts };
    try {
        const decoded = CraftingDecompressServerData(packet.Crafting);
        decoded.forEach((item, index) => { if (item?.Item === ASSET_NAME) crafts[index] = clone(item); });
    } catch (error) { Logger.warn("Cannot decode login crafts; appearance backup is still available", error); }
}

export function setupPersistence(HookManager) {
    HookManager.hookFunction("LoginResponse", 10, (args, next) => {
        try { captureLogin(args[0]); } catch (error) { Logger.warn("Cannot capture login texture data", error); }
        loading = true;
        try { return next(args); }
        finally { loading = false; restorePlayerData(); }
    });
    for (const [name, save] of [["ServerPlayerAppearanceSync", backupAppearance], ["CraftingSaveServer", backupCrafts]]) {
        HookManager.hookFunction(name, 0, (args, next) => { save(); return next(args); });
    }
}

export function persistenceAssetsReady() {
    // BC's initial index predates late-loaded custom assets.
    if (typeof CraftingAssetsPopulate === "function" && typeof CraftingAssets !== "undefined") {
        CraftingAssets = CraftingAssetsPopulate();
    }
    assetsReady = true;
    restorePlayerData();
}
