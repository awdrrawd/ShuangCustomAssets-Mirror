import { ASSET_NAME, DEFAULT_PROPS } from "./constants.js";

/**
 * BC R134 起 ExtendedItemInit（以及非扩展道具的 ValidationSanitizeProperties）会调用
 * ItemPropertiesValidate：它用 PropertyData 里注册过的键重建 item.Property，未注册的键
 * 直接丢弃。SCA 的 Textures / Hide* / HideOverrides 都是自定义属性，没有（也不应该）
 * 注册进 BC 的 PropertyData，于是每个收到的道具都会被洗成默认值，表现为贴图全丢。
 *
 * 这里只对本插件的道具做还原：validation 完成后，把输入里存在、但没有 PropertyData
 * 条目的自定义字段放回输出。已注册字段（Hide / LockedBy / Effect 等）仍走 BC 校验，
 * 避免绕过原生安全逻辑；调用方显式 omit 的字段也不还原。
 */
const CUSTOM_PROPERTY_NAMES = Object.freeze(Object.keys(DEFAULT_PROPS));

/**
 * 安装 ItemPropertiesValidate 兼容 hook。
 * R134 之前该函数不会删未注册字段，hook 只是把输入原样保留，行为不变。
 * @param {{ hookFunction: (name: string, priority: number, hook: Function) => void }} hooks
 */
export function setupPropertyValidationCompat(hooks) {
    if (typeof ItemPropertiesValidate !== "function") return;

    hooks.hookFunction("ItemPropertiesValidate", 0, (args, next) => {
        const [properties, asset, options] = args;
        const result = next(args);
        if (!result || typeof result.value !== "object" || result.value === null) return result;
        if (asset?.Name !== ASSET_NAME || !properties || typeof properties !== "object") return result;

        const omit = new Set(options?.omit ?? []);
        const registered = typeof PropertyData === "object" && PropertyData !== null ? PropertyData : {};
        for (const name of CUSTOM_PROPERTY_NAMES) {
            if (omit.has(name) || registered[name]) continue;
            if (properties[name] !== undefined) result.value[name] = properties[name];
        }
        return result;
    });
}
