/**
 * 自定义贴图道具 - 对话框交互 hook
 * 任务5：编辑图层（及其它子页面）时点击退出，应返回贴图管理列表而非整个跳出
 * 任务6：配置本道具时隐藏左侧人物身上的互动格线，避免上传图片时被框线干扰
 * 任务7：编辑单个图层时，进一步阻止点击角色身上的互动格（避免误触切换到其他部位，
 *        同时便于「移动」拖拽功能在角色预览区域正常拖动图片而不被切换部位打断）
 */

import { ASSET_NAME } from "./constants.js";
import { state } from "./state.js";
import { returnToListFromSubview } from "./listView.js";

/**
 * 注册与对话框交互相关的全局函数 hook
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupDialogHooks(HookManager) {
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
                returnToListFromSubview();
                return; // 阻止关闭对话框
            }
            return next(args);
        });
    }
}
