/**
 * 角色外观重绘的共用入口。
 *
 * 背景：BC 只有在明确调用 CharacterRefresh(C, ...) 时才会重新生成角色的外观画布
 * （AfterDraw / 自定义贴图的绘制逻辑都挂在这次重建过程里），不会随时间自动刷新。
 * 本模组把「谁在什么时机该被重新画一次」这件事集中管理，避免各处各写一份
 * CharacterRefresh 呼叫逻辑：
 *
 * - refreshCharacterAppearance(C)：单次重绘的实际入口，见下方说明。
 * - queueOneShotRefresh(C)：给「某个异步资源刚好准备好了」的场景使用，
 *   同一个角色在同一轮事件循环内只会被排入一次，避免多个图层同时就绪时重复触发。
 */
import { Logger } from "./utils.js";

/**
 * 用最低成本的方式让 BC 重新画出角色当前的外观画布。
 *
 * 优先只调用 CharacterAppearanceBuildCanvas(C)：这一步只按照「已经算好的
 * C.AppearanceLayers / C.AppearanceMasks」重新绘制像素，不会重新计算姿势、
 * 特效、图层排序或遮罩——这些在角色没有换装的情况下本来就不需要重算。
 * 完整的 CharacterRefresh 会连带跑 AnimationPurge / CharacterLoadEffect /
 * PoseRefresh / 重建 AppearanceLayers 与 AppearanceMasks 等一整串流程，
 * 对「只是想让一张贴图换一帧 / 补画一次」来说是不必要的开销，
 * 在多人房间里会随「动图角色数 × 频率」被放大成明显的卡顿。
 *
 * 重要：CharacterAppearanceBuildCanvas 内部（不论走 2D 还是 WebGL 路径）
 * 都会经过 CommonDrawCanvasPrepare(C)，而它固定会把 C.MustDraw 设回 true——
 * 这个标记正常只在 CharacterLoadCanvas 全套流程跑完的最后一步才会被清回
 * false。如果这里只调用 CharacterAppearanceBuildCanvas 而不清掉这个标记，
 * BC 自己的渲染循环（DrawCharacter，每个浏览器动画帧都会跑）会在下一帧
 * 看到 C.MustDraw 还是 true，误判「这个角色还欠一次重建」，转而调用完整的
 * CharacterLoadCanvas 再做一次——比我们想省掉的那些步骤还更多，等于每次
 * 轻量刷新都倒贴一次完整重建，反而比修改前更重、更容易造成掉帧。
 * 因此这里手动补上这一步，效果等同 CharacterLoadCanvas 结尾做的事。
 *
 * 只有在 CharacterAppearanceBuildCanvas 不可用时（理论上不会发生，纯防御）
 * 才退回完整的 CharacterRefresh，确保功能不会因为 API 不存在而整个失效。
 * @param {object} C - 角色对象
 */
export function refreshCharacterAppearance(C) {
    if (!C) return;
    try {
        if (typeof CharacterAppearanceBuildCanvas === "function") {
            CharacterAppearanceBuildCanvas(C);
            C.MustDraw = false;
        } else if (typeof CharacterRefresh === "function") {
            CharacterRefresh(C, false, false);
        }
    } catch (err) {
        Logger.error("[ShuangAssets] 角色外观重绘失败", err);
    }
}

/** 本轮事件循环内，已经排入「补画一次」的角色集合，用来去重 */
const _pendingOneShot = new Set();

/**
 * 排入「下一轮事件循环补画一次」，用于图片 / GIF 刚好在异步加载完成时通知渲染层。
 * 同一个角色在同一轮里重复呼叫只会真正执行一次，多个图层的资源同时就绪也不会重复刷新。
 * @param {object} C - 角色对象
 */
export function queueOneShotRefresh(C) {
    if (!C || _pendingOneShot.has(C)) return;
    _pendingOneShot.add(C);
    setTimeout(() => {
        _pendingOneShot.delete(C);
        refreshCharacterAppearance(C);
    }, 0);
}

export default { refreshCharacterAppearance, queueOneShotRefresh };