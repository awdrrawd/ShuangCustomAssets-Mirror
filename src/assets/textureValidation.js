import { DEFAULT_TEXTURE } from "./constants.js";

const NUMBER_FIELDS = {
    OffsetX: [-10000, 10000], OffsetY: [-10000, 10000],
    ScaleX: [0, 2000], ScaleY: [0, 2000], Rotation: [-360, 360], Opacity: [0, 100]
};
const BOOLEAN_FIELDS = ["Visible", "MirrorH", "MirrorV", "ScaleLocked"];
export const isRecord = value => value !== null && typeof value === "object" && !Array.isArray(value);

/** Only known render fields may cross the import/server boundary. Missing pose fields inherit. */
export function sanitizeRenderParams(raw, partial = false) {
    if (!isRecord(raw)) return partial ? {} : { ...DEFAULT_TEXTURE, PoseSettings: {} };
    const result = partial ? {} : { ...DEFAULT_TEXTURE, PoseSettings: {} };
    if (typeof raw.TextureURL === "string") result.TextureURL = raw.TextureURL.trim().slice(0, 1000);
    for (const [key, [min, max]] of Object.entries(NUMBER_FIELDS)) {
        const source = raw[key] ?? ((key === "ScaleX" || key === "ScaleY") ? raw.Scale : undefined);
        if (source === undefined || source === null || source === "") continue;
        const number = Number(source);
        if (Number.isFinite(number)) result[key] = Math.max(min, Math.min(max, Math.trunc(number)));
    }
    for (const key of BOOLEAN_FIELDS) if (typeof raw[key] === "boolean") result[key] = raw[key];
    return result;
}

export function sanitizeTexture(raw) {
    if (!isRecord(raw)) throw new Error("Invalid texture configuration");
    const result = sanitizeRenderParams(raw);
    result.Alias = typeof raw.Alias === "string" ? raw.Alias.slice(0, 200) : "";
    for (const key of ["TextureURLSource", "CurrentConfigurator"]) {
        result[key] = Number.isSafeInteger(raw[key]) && raw[key] > 0 ? raw[key] : 0;
    }
    if (isRecord(raw.PoseSettings)) {
        for (const [key, pose] of Object.entries(raw.PoseSettings).slice(0, 100)) {
            if (!/^[A-Za-z]+(?:\+[A-Za-z]+)*$/.test(key) || !isRecord(pose)) continue;
            result.PoseSettings[key] = { ...sanitizeRenderParams(pose, true), enabled: pose.enabled === true };
        }
    }
    return result;
}
