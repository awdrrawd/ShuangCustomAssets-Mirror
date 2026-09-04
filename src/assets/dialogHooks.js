import { setupTransformCapture } from "./freeTransform.js";
/**
 * 自定义贴图道具 - 对话框交互 hook
 * 任务5：编辑图层（及其它子页面）时点击退出，应返回贴图管理列表而非整个跳出
 * 任务6：配置本道具时隐藏左侧人物身上的互动格线，避免上传图片时被框线干扰
 * 任务7：编辑单个图层时，进一步阻止点击角色身上的互动格（避免误触切换到其他部位，
 *        同时便于「移动」拖拽功能在角色预览区域正常拖动图片而不被切换部位打断）
 * 任务8：自定义贴图不 block 其他部位，也不被其他道具 block（双向豁免）
 * 任务9：修复「查看已制作道具属性」弹窗预览图标破图
 *        _DialogCraftedMenu._ReloadIcon（Dialog.js）直接拼接原始 Preview 路径塞进 <img src>，
 *        绕过了 bc-asset-manager 的 ImageMapping，addImageMapping 注册的映射不生效，破图。
 *        用 patchFunction 只替换拼路径的那一行，不影响其他 mod 挂在 _ReloadIcon 上的 hook，
 *        也不建立新的共用底层攻截点。
 */

import { ASSET_NAME, ALL_ITEM_GROUPS } from "./constants.js";
import { state } from "./state.js";
import { returnToListFromSubview } from "./listView.js";
import { AssetManager } from "@sugarch/bc-asset-manager";

// 内部命名空间：给 patchFunction 注入的全局作用域代码提供桥接入口
// （window.ShuangSettings 是设置页面 onclick 专用，用途不同，不混用）
window.ShuangCustomAssets ??= {};
window.ShuangCustomAssets.mapImgSrc = (src) => AssetManager.imageMapping.storage.mapImgSrc(src);

// 预计算：自定义贴图注册的所有 Item 组名集合，用于 O(1) 判断目标组是否包含贴图
const TEXTURE_GROUPS = new Set(ALL_ITEM_GROUPS);

/**
 * 注册与对话框交互相关的全局函数 hook
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupDialogHooks(HookManager) {
    setupTransformCapture(HookManager);
    // 任务6：DialogFocusItem 为「自定义贴图」时，跳过角色身上的互动区域格线绘制
    // DrawAssetGroupZone 由 DrawCharacter 在 C.FocusGroup 存在时调用，用于画各部位可点击格子
    if (typeof DrawAssetGroupZone === "function") {
        HookManager.hookFunction("DrawAssetGroupZone", 0, (args, next) => {
            if (DialogFocusItem?.Asset?.Name === ASSET_NAME) return;
            return next(args);
        });
    }

    // 任务7：编辑单个图层时（currentEditTexture >= 0），阻止点击角色身上的互动格
    // DialogClickedInZone 是 DialogClick 中用于判断「点击是否落在某个部位可点击区域」的唯一命中检测函数，
    // 命中后会触发 DialogChangeFocusToGroup 切换到其他部位。在此直接让命中检测返回 false，
    // 使得 DialogClick 内的该分支不会执行，而不影响后续 DialogMenuMode === "extended" 分支对
    // 本插件自身面板按钮（含新增的「移动」拖拽按钮）的点击处理
    if (typeof DialogClickedInZone === "function") {
        HookManager.hookFunction("DialogClickedInZone", 0, (args, next) => {
            if (DialogFocusItem?.Asset?.Name === ASSET_NAME && state.currentEditTexture >= 0) {
                return false;
            }
            return next(args);
        });
    }

    // 任务5：在子页面时点击退出（DialogLeaveFocusItem）-> 返回列表并阻止真正退出
    if (typeof DialogLeaveFocusItem === "function") {
        HookManager.hookFunction("DialogLeaveFocusItem", 0, (args, next) => {
            const item = DialogFocusItem;
            const inSubview = state.currentEditTexture >= 0 || state.currentView !== "list";
            if (item?.Asset?.Name === ASSET_NAME && inSubview) {
                // 姿势切换模式：退出姿势切换页面，返回编辑面板（不退出整个对话框）
                if (state.poseSwitchMode) {
                    state.poseSwitchMode = false;
                    return;
                }
                returnToListFromSubview();
                return; // 阻止关闭对话框
            }
            return next(args);
        });
    }

    // 任务8：自定义贴图不被其他道具的 Block 规则拦截
    // BC 的 InventoryGroupIsBlockedForCharacter 检查角色身上所有 restraints 的 Asset.Block /
    // Property.Block，如果其中任何一个包含目标 GroupName，就返回 true（该组被 block，无法装备/使用）。
    // 这会导致例如头套 Block 了 ItemMouth 后，ItemMouth 组里的自定义贴图也用不了。
    // 这里在目标组（GroupName）是自定义贴图注册的组、且角色身上该组确实装备了自定义贴图时，
    // 跳过 block 检查返回 false，让贴图所在组始终可用。
    if (typeof InventoryGroupIsBlockedForCharacter === "function") {
        HookManager.hookFunction("InventoryGroupIsBlockedForCharacter", 0, (args, next) => {
            const C = args[0];
            const GroupName = args[1];
            // 只处理自定义贴图注册的 Item 组
            if (C?.Appearance && TEXTURE_GROUPS.has(GroupName)) {
                // 目标组里装备了自定义贴图时，豁免 block
                const hasTexture = C.Appearance.some(
                    i => i.Asset?.Group?.Name === GroupName && i.Asset?.Name === ASSET_NAME
                );
                if (hasTexture) return false;
            }
            return next(args);
        });
    }

    // 任务9：见文件头注释
    if (typeof DialogMenuMapping !== "undefined" && DialogMenuMapping.crafted) {
        HookManager.hookFunction("DialogMenuMapping.crafted._ReloadIcon", 0, (args, next) => {
            const result = next(args); // 先让原本逻辑把 icon 画出来（含 <img id="{icon.id}-image">）
            try {
                const [, icon, properties] = args; // (root, icon, properties, options)
                const { C, focusGroup } = properties;
                const item = InventoryGet(C, focusGroup.Name);
                if (item?.Asset && icon?.id) {
                    const img = document.getElementById(`${icon.id}-image`);
                    if (img) {
                        const rawSrc = `./Assets/Female3DCG/${item.Asset.DynamicGroupName}/Preview/${item.Asset.Name}.png`;
                        img.src = window.ShuangCustomAssets.mapImgSrc(rawSrc);
                    }
                }
            } catch (e) {
                console.error("[ShuangCustomAssets] _ReloadIcon patch failed:", e);
            }
            return result;
        });
    }
}
