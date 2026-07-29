/**
 * 自定义贴图道具 - 编辑面板逻辑
 * 包含步进按钮、镜射、移动拖拽、DOM 输入框管理、编辑面板绘制与点击处理
 */

import {
    LAYER_NAMES, TEXTURES_PER_PAGE,
    STEPPER_FIELDS, STEPPER_MINUS_X, STEPPER_PLUS_X, STEPPER_BTN_W, STEPPER_BTN_H,
    STEPPER_INPUT_X, STEPPER_INPUT_W,
    MIRROR_ROW_Y, MIRROR_ROW_LABEL_Y, MIRROR_H_BTN_X, MIRROR_V_BTN_X, MIRROR_BTN_W, MIRROR_BTN_H,
    MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H,
    URL_BOX_X, URL_BOX_Y, URL_BOX_W, URL_BOX_H,
    URL_INPUT_ID, OPACITY_SLIDER_ID, OPACITY_SLIDER_X, OPACITY_SLIDER_W,
    INPUT_OPACITY,
    TEXTURE_REFRESH_INTERVAL, TEXTURE_DRAG_REFRESH_INTERVAL,
    stepperPress,
    POSE_LABELS, getPoseKey, POSE_BAR_Y, POSE_BTN_Y, POSE_TOGGLE_X, POSE_TOGGLE_W, POSE_TOGGLE_H,
    POSE_SWITCH_X, POSE_SWITCH_W,
    POSE_PAGE_BTN_W, POSE_PAGE_BTN_H, POSE_PAGE_BTN_GAP, POSE_PAGE_START_X,
    POSE_CATEGORIES
} from "./constants.js";
import { state, resetDragState } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { L, isChineseLang, getCorsImage, Logger } from "@lib/utils.js";
import { isUrlAllowed, isDomainInWhitelist, extractDomain } from "./settings.js";

/**
 * 获取当前编辑目标对象（全局配置或姿势独立配置）
 * 这是姿势感知编辑的核心抽象：根据 state.poseEditing 决定读写哪个对象
 * - poseEditing 非 null 且对应 PoseSettings 存在：返回该姿势的独立配置对象
 * - 否则：返回 tempTextureData（全局配置）
 * @returns {object|null}
 */
export function getEditTarget() {
    if (state.poseEditing && state.tempTextureData?.PoseSettings?.[state.poseEditing]) {
        return state.tempTextureData.PoseSettings[state.poseEditing];
    }
    return state.tempTextureData;
}

/**
 * 刷新所有 DOM 输入框（贴图网址、6 个数值字段、透明度滑桿）以反映当前编辑目标
 * 在切换姿势编辑模式时调用，确保界面显示正确的值
 */
export function refreshEditInputs() {
    const target = getEditTarget();
    if (!target) return;

    // 贴图网址输入框
    const urlInput = document.getElementById(URL_INPUT_ID);
    if (urlInput) urlInput.value = target.TextureURL || "";

    // 6 个数值输入框（图层优先级不随姿势变化，始终读取 tempPriority）
    for (const field of STEPPER_FIELDS) {
        const input = document.getElementById(field.id);
        if (input) input.value = String(getFieldValue(field));
    }

    // 透明度滑桿
    const opacitySlider = document.getElementById(OPACITY_SLIDER_ID);
    if (opacitySlider) {
        const opacityField = STEPPER_FIELDS.find(f => f.id === INPUT_OPACITY);
        opacitySlider.value = String(getFieldValue(opacityField));
    }

    state._fieldsDirty = true;
}

/**
 * 从全局配置继承所有字段，生成姿势独立配置的初始对象
 * @returns {object}
 */
function inheritGlobalFields() {
    const g = state.tempTextureData;
    return {
        enabled: true,
        TextureURL: g?.TextureURL || "",
        OffsetX: g?.OffsetX ?? 1,
        OffsetY: g?.OffsetY ?? 1,
        Scale: g?.Scale ?? 100,
        Rotation: g?.Rotation ?? 0,
        Opacity: g?.Opacity ?? 100,
        MirrorH: g?.MirrorH === true,
        MirrorV: g?.MirrorV === true
    };
}

/**
 * 进入姿势独立配置编辑模式
 * 如果该姿势的 PoseSettings 不存在，则从全局配置继承创建
 * @param {string} poseKey - 姿势键名（如 "Yoked" 或 "Yoked+Kneel"）
 */
export function enterPoseEditing(poseKey) {
    if (!state.tempTextureData) return;
    if (!state.tempTextureData.PoseSettings) {
        state.tempTextureData.PoseSettings = {};
    }
    if (!state.tempTextureData.PoseSettings[poseKey]) {
        state.tempTextureData.PoseSettings[poseKey] = inheritGlobalFields();
    }
    state.poseEditing = poseKey;
    refreshEditInputs();
}

/**
 * 退出姿势独立配置编辑模式（仅切回全局视图，不删除已编辑的姿势配置）
 * 姿势配置在 tempTextureData 中保留，直到玩家点击保存（提交）或取消（还原原始数据）
 */
export function exitPoseEditing() {
    state.poseEditing = null;
    refreshEditInputs();
}

/**
 * 禁用并删除某个姿势的独立配置（点击开关"关"时调用）
 * @param {string} poseKey - 要删除的姿势键名
 */
export function deletePoseEditing(poseKey) {
    if (state.tempTextureData?.PoseSettings?.[poseKey]) {
        delete state.tempTextureData.PoseSettings[poseKey];
    }
    if (state.poseEditing === poseKey) {
        state.poseEditing = null;
    }
    refreshEditInputs();
}

/**
 * 切换到另一个姿势的编辑视图
 * - 如果新姿势已有 enabled 的独立配置：切换到编辑该姿势配置
 * - 如果新姿势没有独立配置：切回全局编辑模式（保留旧姿势的配置不删除）
 * - newPoseKey 为 null（基础站姿）：切回全局编辑模式
 * @param {string|null} newPoseKey - 新姿势键名
 */
export function switchPose(newPoseKey) {
    if (!newPoseKey) {
        exitPoseEditing();
        return;
    }
    if (state.poseEditing === newPoseKey) return;
    if (!state.tempTextureData) return;

    // 仅当新姿势已有 enabled 的独立配置时才切换到姿势编辑模式
    const ps = state.tempTextureData.PoseSettings?.[newPoseKey];
    if (ps && ps.enabled === true) {
        state.poseEditing = newPoseKey;
    } else {
        // 新姿势没有独立配置，切回全局编辑（旧姿势配置保留在 tempTextureData 中）
        state.poseEditing = null;
    }
    refreshEditInputs();
}

/**
 * 绘制姿势信息栏：显示当前角色姿势名称 + 独立配置开关按钮
 * 位于编辑面板底部（POSE_BAR_Y=835），在图层优先级字段下方
 */
export function drawPoseBar() {
    const C = CharacterGetCurrent();
    const poseKey = getPoseKey(C?.DrawPose);

    // 显示当前姿势名称（所有姿势统一逻辑：拆分组合键，逐个翻译后用 " + " 连接）
    let poseText;
    if (poseKey) {
        const labels = poseKey.split("+").map(p => {
            const label = POSE_LABELS[p];
            return label ? L(label.cn, label.en) : p;
        });
        poseText = L("当前姿势: ", "Current pose: ") + labels.join(" + ");
        if (state.poseEditing) {
            poseText += L("  [编辑姿势配置]", "  [Editing Pose Override]");
        }
    } else {
        poseText = L("当前姿势: 未知", "Current pose: Unknown");
    }
    DrawText(poseText, 1100, POSE_BAR_Y, "White", "Gray");

    // 始终显示独立配置开关按钮（包括基础站姿）
    if (poseKey) {
        // 开关状态：当前正在编辑此姿势 OR 此姿势已有 enabled 的独立配置
        const ps = state.tempTextureData?.PoseSettings?.[poseKey];
        const isEnabled = state.poseEditing === poseKey || (ps && ps.enabled === true);
        const btnText = isEnabled
            ? L("独立配置: 开", "Pose Override: On")
            : L("独立配置: 关", "Pose Override: Off");
        DrawButton(POSE_TOGGLE_X, POSE_BTN_Y - POSE_TOGGLE_H / 2,
            POSE_TOGGLE_W, POSE_TOGGLE_H,
            btnText, isEnabled ? "#4CAF50" : "White", null, null, false);
    }

    // 切换姿势按钮（始终显示，与独立配置开关同一行）
    DrawButton(POSE_SWITCH_X, POSE_BTN_Y - POSE_TOGGLE_H / 2,
        POSE_SWITCH_W, POSE_TOGGLE_H,
        L("切换姿势", "Switch Pose"), "White", null,
        L("打开姿势切换页面", "Open pose switch page"), false);
}

/**
 * 处理姿势信息栏的点击：切换独立配置开关 / 打开姿势切换页面
 * @returns {boolean} 是否命中并处理了某个按钮
 */
export function handlePoseBarClick() {
    const C = CharacterGetCurrent();
    const poseKey = getPoseKey(C?.DrawPose);

    // 切换姿势按钮
    if (MouseIn(POSE_SWITCH_X, POSE_BTN_Y - POSE_TOGGLE_H / 2,
            POSE_SWITCH_W, POSE_TOGGLE_H)) {
        state.poseSwitchMode = true;
        return true;
    }

    if (poseKey && MouseIn(POSE_TOGGLE_X, POSE_BTN_Y - POSE_TOGGLE_H / 2,
            POSE_TOGGLE_W, POSE_TOGGLE_H)) {
        if (state.poseEditing === poseKey) {
            // 当前正在编辑此姿势的独立配置 -> 关闭并删除配置
            deletePoseEditing(poseKey);
        } else {
            // 开启此姿势的独立配置（从全局继承）
            enterPoseEditing(poseKey);
        }
        return true;
    }
    return false;
}

/**
 * 绘制姿势切换页面：分三组显示所有可选手部/腿部/全身姿势
 * 点击姿势按钮通过 PoseSetActive 切换角色姿势，实时预览
 */
export function drawPoseSwitchPage() {
    const C = CharacterGetCurrent();
    if (!C) return;

    // 标题
    DrawText(L("切换姿势", "Switch Pose"), 1500, 360, "White", "Gray");
    DrawText(L("点击姿势按钮切换，左侧实时预览效果", "Click a pose to switch, preview on the left"),
        1505, 390, "Yellow", "Black");

    // 当前角色的渲染姿势映射（包含 previewPoseMapping 的覆盖）
    const activeMapping = C.DrawPoseMapping || {};
    let y = 430;

    // 按分类绘制姿势按钮
    for (const [catKey, cat] of Object.entries(POSE_CATEGORIES)) {
        // 分类标题
        DrawText(L(cat.label, cat.labelEn), 1100, y, "White", "Gray");
        y += 25;

        // 该分类下的姿势按钮
        for (let i = 0; i < cat.poses.length; i++) {
            const poseName = cat.poses[i];
            const btnX = POSE_PAGE_START_X + i * (POSE_PAGE_BTN_W + POSE_PAGE_BTN_GAP);
            const isActive = activeMapping[catKey] === poseName;
            const label = POSE_LABELS[poseName];
            const btnText = label ? L(label.cn, label.en) : poseName;

            DrawButton(btnX, y, POSE_PAGE_BTN_W, POSE_PAGE_BTN_H,
                btnText, isActive ? "#4CAF50" : "White", null, null, false);
        }
        y += POSE_PAGE_BTN_H + 30;
    }
}

/**
 * 处理姿势切换页面的点击
 * @returns {boolean} 是否命中并处理了某个按钮
 */
export function handlePoseSwitchClick() {
    const C = CharacterGetCurrent();
    if (!C) return false;

    // Y 坐标必须与 drawPoseSwitchPage 完全一致：每分类 = 25（标题）+ 40（按钮）+ 30（间距）
    let y = 455; // 第一行按钮 Y（标题 430 + 25）

    for (const [catKey, cat] of Object.entries(POSE_CATEGORIES)) {
        for (let i = 0; i < cat.poses.length; i++) {
            const poseName = cat.poses[i];
            const btnX = POSE_PAGE_START_X + i * (POSE_PAGE_BTN_W + POSE_PAGE_BTN_GAP);

            if (MouseIn(btnX, y, POSE_PAGE_BTN_W, POSE_PAGE_BTN_H)) {
                // 本地预览姿势（仅修改 DrawPoseMapping，不同步服务器）
                setPreviewPose(poseName);
                return true;
            }
        }
        y += POSE_PAGE_BTN_H + 30 + 25; // 按钮高度 + 间距 + 下一分类标题高度
    }

    return false;
}

/**
 * 步进按钮：初始化鼠标/触摸事件监听器（仅执行一次）
 * 跟踪指针按下状态，供 drawTextureEditPanel 每帧检测长按
 */
export function setupStepperListeners() {
    if (state._stepperListenerReady) return;
    state._stepperListenerReady = true;
    // 鼠标
    document.addEventListener("mousedown", () => { state._pointerDown = true; });
    document.addEventListener("mouseup", () => {
        state._pointerDown = false;
        stepperPress.fieldId = null;
        // 释放后立即允许刷新（绕过节流，让预览马上更新）
        state._lastTextureRefresh = 0;
    });
    // 触摸（移动端）
    document.addEventListener("touchstart", () => { state._pointerDown = true; }, { passive: true });
    document.addEventListener("touchend", () => {
        state._pointerDown = false;
        stepperPress.fieldId = null;
        state._lastTextureRefresh = 0;
    });
    document.addEventListener("touchcancel", () => {
        state._pointerDown = false;
        stepperPress.fieldId = null;
        state._lastTextureRefresh = 0;
    });
}

/**
 * 读取字段当前值（图层优先级取 tempPriority，其余取 tempTextureData 对应属性）
 * @param {object} field - STEPPER_FIELDS 中的字段配置
 * @returns {number}
 */
export function getFieldValue(field) {
    if (field.prop === null) return state.tempPriority;
    const target = getEditTarget();
    const v = target ? target[field.prop] : undefined;
    return typeof v === "number" && !isNaN(v) ? v : field.def;
}

/**
 * 写入字段值（自动裁剪到 min/max 范围），并标记为已变更
 * @param {object} field - STEPPER_FIELDS 中的字段配置
 * @param {number} value - 新值
 */
export function setFieldValue(field, value) {
    if (isNaN(value)) value = field.def;
    if (field.min !== null) value = Math.max(field.min, value);
    if (field.max !== null) value = Math.min(field.max, value);

    if (field.prop === null) {
        if (state.tempPriority !== value) {
            state.tempPriority = value;
            state._fieldsDirty = true;
        }
    } else {
        const target = getEditTarget();
        if (target) {
            if (target[field.prop] !== value) {
                target[field.prop] = value;
                state._fieldsDirty = true;
            }
        }
    }

    // 步进按钮改变数值时，同步更新 DOM 输入框的显示值
    const domInput = document.getElementById(field.id);
    if (domInput && domInput.value !== String(value)) {
        domInput.value = String(value);
    }

    // 透明度：同步更新滑桿
    if (field.id === INPUT_OPACITY) {
        const slider = document.getElementById(OPACITY_SLIDER_ID);
        if (slider && slider.value !== String(value)) {
            slider.value = String(value);
        }
    }
}

/**
 * 步进按钮：将变更应用到字段
 * @param {object} field - STEPPER_FIELDS 中的字段配置
 * @param {number} delta - 变更量（正负整数）
 */
export function applyStepperChange(field, delta) {
    setFieldValue(field, getFieldValue(field) + delta);
}

/**
 * 绘制"镜射"行（紧跟在"旋转"字段下方），右侧两个切换按钮：水平 / 垂直
 * 与其余数值字段不同，镜射为布尔开关，不使用 prompt 输入，点击即切换
 */
export function drawMirrorRow() {
    DrawText(L("镜像", "Mirror"), 1100, MIRROR_ROW_LABEL_Y, "White", "Gray");

    const target = getEditTarget();
    const mirrorH = target?.MirrorH === true;
    const mirrorV = target?.MirrorV === true;

    DrawButton(MIRROR_H_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H,
        L("水平", "H-Flip"), mirrorH ? "#4CAF50" : "White", null,
        L("水平镜像翻转图片", "Flip the image horizontally"), false);

    DrawButton(MIRROR_V_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H,
        L("垂直", "V-Flip"), mirrorV ? "#4CAF50" : "White", null,
        L("垂直镜像翻转图片", "Flip the image vertically"), false);
}

/**
 * 处理"镜射"行的点击：切换水平/垂直镜射开关
 * @returns {boolean} 是否命中并处理了某个按钮
 */
export function handleMirrorRowClick() {
    const target = getEditTarget();
    if (!target) return false;

    if (MouseIn(MIRROR_H_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H)) {
        target.MirrorH = !(target.MirrorH === true);
        state._fieldsDirty = true;
        return true;
    }

    if (MouseIn(MIRROR_V_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H)) {
        target.MirrorV = !(target.MirrorV === true);
        state._fieldsDirty = true;
        return true;
    }

    return false;
}

/**
 * 绘制"移动"按钮：点击后切换拖拽模式（开启后可在角色预览区域用鼠标/触摸自由拖动图片）
 * 坐标固定为 (1435, 510, 150, 40)，与所有其他控件一致为手动写死坐标
 *
 * 悬停说明文字不使用 DrawButton 内置 tooltip（在鼠标位置绘制，长文字会被 X偏移/Y偏移 DOM 输入框遮挡），
 * 改为在按钮右侧固定位置手动绘制，确保始终可见。
 */
export function drawMoveButton() {
    DrawButton(MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H,
        L("移动", "Move"), state.isDragMode ? "#4CAF50" : "White", null, null, false);
    // 鼠标悬停时在按钮右侧绘制说明文字（分四行，避免过长遮挡按钮）
    if (MouseIn(MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H)) {
        const hintX = 1770;
        const hintY = MOVE_BTN_Y + MOVE_BTN_H / 2;
        const lines = isChineseLang()
            ? ["开启后可在左侧", "角色预览区域", "按住鼠标", "拖动图片"]
            : ["When enabled,", "drag on the", "character preview", "to move the image"];
        for (let i = 0; i < lines.length; i++) {
            DrawText(lines[i], hintX, hintY - 22 + i * 30, "Yellow", "Black");
        }
    }
}

/**
 * 处理"移动"按钮点击：切换拖拽模式开关
 * @returns {boolean} 是否命中并处理了该按钮
 */
export function handleMoveButtonClick() {
    if (!MouseIn(MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H)) return false;
    state.isDragMode = !state.isDragMode;
    state.dragActive = false;
    return true;
}

/**
 * 每帧检测拖拽模式下的鼠标/触摸状态，实时更新 OffsetX/OffsetY
 * 复用 setupStepperListeners() 中已有的全局 _pointerDown 指针状态，无需额外注册事件监听器
 * 拖动范围限制在角色预览区域（虚拟画布坐标 0~1000, 0~1000），避免与右侧功能面板冲突
 */
export function updateDragMove() {
    if (!state.isDragMode) {
        state.dragActive = false;
        return;
    }
    const target = getEditTarget();
    if (!target) {
        state.dragActive = false;
        return;
    }

    const inPreviewArea = MouseX >= 0 && MouseX <= 1000 && MouseY >= 0 && MouseY <= 1000;

    if (!state._pointerDown || !inPreviewArea) {
        state.dragActive = false;
        return;
    }

    if (!state.dragActive) {
        // 开始新的一次拖拽：记录起始鼠标位置与起始偏移量
        state.dragActive = true;
        state.dragStartMouseX = MouseX;
        state.dragStartMouseY = MouseY;
        state.dragStartOffsetX = parseInt(target.OffsetX) || 0;
        state.dragStartOffsetY = parseInt(target.OffsetY) || 0;
        return;
    }

    // 持续拖拽中：按鼠标位移量实时更新偏移
    const newOffsetX = Math.round(state.dragStartOffsetX + (MouseX - state.dragStartMouseX));
    const newOffsetY = Math.round(state.dragStartOffsetY + (MouseY - state.dragStartMouseY));
    if (target.OffsetX !== newOffsetX || target.OffsetY !== newOffsetY) {
        target.OffsetX = newOffsetX;
        target.OffsetY = newOffsetY;
        state._fieldsDirty = true;
    }
}

/**
 * 创建编辑面板用到的真实 DOM 元素（贴图网址输入框 + 6 个数值输入框），仅创建一次（幂等）。
 * 应在道具 Load 时调用一次，之后整个对话框生命周期内复用同一批元素，
 * 通过 positionEditPanelInputs() 控制显示/隐藏，直到 Exit 时才真正移除。
 *
 * 贴图网址：<input type="text">，可直接打字输入。
 * 数值字段（X偏移/Y偏移/缩放/旋转/透明度/图层优先级）：<input type="number">，
 * 支持鼠标滚轮调值和直接键入，数值变更时同步写入 tempTextureData / tempPriority。
 * 透明度额外附带 <input type="range"> 滑桿（位于 +/- 按钮右侧），与数值框双向同步。
 */
export function createEditPanelDomInputs() {
    if (!document.getElementById(URL_INPUT_ID)) {
        const input = ElementCreateInput(URL_INPUT_ID, "text", "", 1000);
        input.placeholder = L("请输入贴图网址（需以 https:// 开头）", "Enter image URL (must start with https://)");
        input.addEventListener("input", () => {
            const target = getEditTarget();
            if (!target) return;
            const newUrl = input.value.trim();
            if (target.TextureURL !== newUrl) {
                target.TextureURL = newUrl;
                state._fieldsDirty = true;
            }
        });
    }

    // 6 个数值字段：X偏移/Y偏移/缩放/旋转/透明度/图层优先级
    for (const field of STEPPER_FIELDS) {
        if (document.getElementById(field.id)) continue;
        const input = ElementCreateInput(field.id, "number", String(field.def), "10");
        input.style.width = "80px";
        if (field.min !== null) input.min = String(field.min);
        if (field.max !== null) input.max = String(field.max);
        input.addEventListener("input", () => {
            const parsed = parseInt(input.value);
            if (isNaN(parsed)) return;
            if (field.prop === null) {
                if (state.tempPriority !== parsed) {
                    state.tempPriority = parsed;
                    state._fieldsDirty = true;
                }
            } else {
                const target = getEditTarget();
                if (target && target[field.prop] !== parsed) {
                    target[field.prop] = parsed;
                    state._fieldsDirty = true;
                }
            }
            // 透明度：同步更新滑桿
            if (field.id === INPUT_OPACITY) {
                const slider = document.getElementById(OPACITY_SLIDER_ID);
                if (slider && slider.value !== String(parsed)) {
                    slider.value = String(Math.max(0, Math.min(100, parsed)));
                }
            }
        });
    }

    // 透明度滑桿：与数值框双向同步
    if (!document.getElementById(OPACITY_SLIDER_ID)) {
        const slider = ElementCreateRangeInput(OPACITY_SLIDER_ID, 100, 0, 100, 1);
        slider.addEventListener("input", () => {
            const target = getEditTarget();
            if (!target) return;
            const v = Math.max(0, Math.min(100, parseInt(slider.value, 10) || 0));
            if (target.Opacity !== v) {
                target.Opacity = v;
                state._fieldsDirty = true;
            }
            // 同步更新数值输入框
            const opacityInput = document.getElementById(INPUT_OPACITY);
            if (opacityInput && opacityInput.value !== String(v)) {
                opacityInput.value = String(v);
            }
        });
    }
}

/**
 * 每帧定位（或移出画面）贴图网址输入框、6 个数值输入框与透明度滑桿
 * @param {boolean} visible - 是否正在编辑某个图层（currentEditTexture >= 0）
 */
export function positionEditPanelInputs(visible) {
    if (!visible) {
        // 移出可视画面外，避免遮挡列表页 / 隐藏设置页等其他 canvas 内容
        ElementPosition(URL_INPUT_ID, -999, -999, 0, 0);
        for (const field of STEPPER_FIELDS) {
            ElementPosition(field.id, -999, -999, 0, 0);
        }
        ElementPosition(OPACITY_SLIDER_ID, -999, -999, 0, 0);
        return;
    }

    // 贴图网址输入框：覆盖原本 canvas 按钮所在的区域
    ElementPosition(URL_INPUT_ID, URL_BOX_X + URL_BOX_W / 2, URL_BOX_Y + URL_BOX_H / 2, URL_BOX_W, URL_BOX_H);

    // 6 个数值输入框：定位到各自字段行（位于 +/- 步进按钮之间）
    for (const field of STEPPER_FIELDS) {
        ElementPositionFixed(field.id, STEPPER_INPUT_X, field.y, STEPPER_INPUT_W, 40);
    }

    // 透明度滑桿：放在透明度 +/- 按钮右侧
    const opacityField = STEPPER_FIELDS.find(f => f.id === INPUT_OPACITY);
    ElementPositionFixed(OPACITY_SLIDER_ID, OPACITY_SLIDER_X, opacityField.y + 20, OPACITY_SLIDER_W, 40);
}

/**
 * 移除贴图网址输入框、6 个数值输入框与透明度滑桿（道具对话框完全关闭时调用）
 */
export function removeEditPanelInputs() {
    ElementRemove(URL_INPUT_ID);
    for (const field of STEPPER_FIELDS) {
        ElementRemove(field.id);
    }
    ElementRemove(OPACITY_SLIDER_ID);
}

/**
 * 步进按钮：每帧检测长按状态并应用加速变更
 * 在 drawTextureEditPanel 中调用（每帧执行）
 * 长按时间越长，步进间隔越短、步长越大
 */
export function updateSteppers() {
    if (!state._pointerDown) {
        stepperPress.fieldId = null;
        return;
    }

    // 检测当前指针位于哪个步进按钮上
    let activeField = null;
    let activeDirection = 0;
    for (const field of STEPPER_FIELDS) {
        if (MouseIn(STEPPER_MINUS_X, field.y, STEPPER_BTN_W, STEPPER_BTN_H)) {
            activeField = field;
            activeDirection = -1;
            break;
        }
        if (MouseIn(STEPPER_PLUS_X, field.y, STEPPER_BTN_W, STEPPER_BTN_H)) {
            activeField = field;
            activeDirection = 1;
            break;
        }
    }

    if (!activeField) {
        // 指针移出按钮区域，停止步进
        stepperPress.fieldId = null;
        return;
    }

    const now = Date.now();

    // 新按钮按下：立即应用一次变更
    if (stepperPress.fieldId !== activeField.id || stepperPress.direction !== activeDirection) {
        stepperPress.fieldId = activeField.id;
        stepperPress.direction = activeDirection;
        stepperPress.startTime = now;
        stepperPress.lastUpdate = now;
        applyStepperChange(activeField, activeDirection);
        return;
    }

    // 持续按住：根据按住时长计算步进间隔和步长
    const elapsed = now - stepperPress.startTime;
    // 间隔从 150ms 递减到 40ms（约 3s 后达到最小值）
    const interval = Math.max(40, 150 - elapsed * 0.035);
    // 步长每 300ms 递增 1，上限 50（约 14.7s 达到最大步长）
    const stepMultiplier = Math.min(50, 1 + Math.floor(elapsed / 300));

    if (now - stepperPress.lastUpdate >= interval) {
        applyStepperChange(activeField, activeDirection * stepMultiplier);
        stepperPress.lastUpdate = now;
    }
}

/**
 * 绘制带缩放图标的步进按钮
 * DrawButton 内部用 DrawImage（原始尺寸）画图标，大图标会溢出小按钮
 * 这里先画空白按钮，再用 DrawImageResize 将图标缩放到按钮尺寸
 * @param {number} x - 按钮 X 坐标
 * @param {number} y - 按钮 Y 坐标
 * @param {string} icon - 图标路径
 */
export function drawStepperButton(x, y, icon) {
    DrawButton(x, y, STEPPER_BTN_W, STEPPER_BTN_H, "", "White", null, null);
    DrawImageResize(icon, x + 2, y + 2, STEPPER_BTN_W - 4, STEPPER_BTN_H - 4);
}

/**
 * 初始化编辑面板状态
 * 6 个数值字段（X偏移/Y偏移/缩放/旋转/透明度/图层优先级）均为真实 DOM <input type="number">，
 * 贴图网址为真实 DOM <input type="text">，
 * 这里需要把它们的显示值同步为当前图层的数据，因为 DOM 元素本身在整个对话框期间是复用的
 * （调用方已在调用本函数前将 tempTextureData 设为当前图层的数据副本）
 */
/**
 * BeforeSortLayers 钩子：在 CharacterLoadCanvas 时用 previewPoseMapping 覆盖 DrawPoseMapping
 * 仅影响本地渲染，不修改 ActivePoseMapping，不同步服务器
 */
const POSE_HOOK_NAME = "SCA_PosePreview";

export function registerPoseHook() {
    const C = CharacterGetCurrent();
    if (!C) return;
    state.previewPoseMapping = null;
    C.RegisterHook("BeforeSortLayers", POSE_HOOK_NAME, () => {
        if (state.previewPoseMapping) {
            C.DrawPoseMapping = { ...C.DrawPoseMapping, ...state.previewPoseMapping };
        }
    });
}

export function unregisterPoseHook() {
    const C = CharacterGetCurrent();
    if (!C) return;
    C.UnregisterHook("BeforeSortLayers", POSE_HOOK_NAME);
    state.previewPoseMapping = null;
    // 重新加载画布以恢复原始姿势渲染
    CharacterLoadCanvas(C);
}

/**
 * 本地切换预览姿势：仅修改 previewPoseMapping，触发 CharacterLoadCanvas 重绘
 * 不修改 ActivePoseMapping，不同步服务器
 */
export function setPreviewPose(poseName) {
    const C = CharacterGetCurrent();
    if (!C) return;
    const newPose = PoseRecord[poseName];
    if (!newPose) return;

    if (newPose.Category === "BodyFull") {
        // 全身姿势：替换整个映射
        state.previewPoseMapping = { [newPose.Category]: newPose.Name };
    } else {
        // 非全身姿势：基于当前预览映射（保留其他分类的选择），清理 BodyFull
        const current = state.previewPoseMapping || C.ActivePoseMapping || {};
        const baseMapping = { ...current };
        for (const [category, name] of Object.entries(baseMapping)) {
            const pose = PoseRecord[name];
            if (!pose || !pose.AllowMenu || pose.Category === "BodyFull") {
                delete baseMapping[category];
            }
        }
        baseMapping[newPose.Category] = newPose.Name;
        state.previewPoseMapping = baseMapping;
    }

    // 触发重绘（BeforeSortLayers 钩子会应用 previewPoseMapping 到 DrawPoseMapping）
    CharacterLoadCanvas(C);
}

export function createEditInputs(texture) {
    state._fieldsDirty = false;
    // 重置姿势编辑状态：进入新图层编辑时始终从全局配置开始
    state.poseEditing = null;
    state.tempGlobalData = null;
    state.lastPoseKey = null; // 下一帧 drawTextureEditPanel 会检测到变化并自动切换
    state.poseSwitchMode = false;

    // 注册 BeforeSortLayers 钩子：在 CharacterLoadCanvas 时覆盖 DrawPoseMapping
    // 实现本地预览姿势（不修改 ActivePoseMapping，不同步服务器）
    registerPoseHook();

    // 图层优先级：读取 item.Property.OverridePriority，与 BC 原生 Layering 界面同步
    const item = DialogFocusItem;
    const layerName = LAYER_NAMES[state.currentEditTexture];
    const op = item?.Property?.OverridePriority;
    let priorityValue = 50;
    if (typeof op === "number") {
        priorityValue = op;
    } else if (op && typeof op[layerName] === "number") {
        priorityValue = op[layerName];
    }
    state.tempPriority = priorityValue;
    state.originalOverridePriority = op ? JSON.parse(JSON.stringify(op)) : undefined;

    // 贴图网址输入框：回填当前图层的网址（元素在 Load 时已创建，此处只需要设置显示值）
    const urlInput = /** @type {HTMLInputElement|null} */ (document.getElementById(URL_INPUT_ID));
    if (urlInput) urlInput.value = state.tempTextureData?.TextureURL || "";

    // 6 个数值输入框：回填当前图层的数值
    for (const field of STEPPER_FIELDS) {
        const input = /** @type {HTMLInputElement|null} */ (document.getElementById(field.id));
        if (input) input.value = String(getFieldValue(field));
    }

    // 透明度滑桿：回填当前图层的透明度
    const opacitySlider = /** @type {HTMLInputElement|null} */ (document.getElementById(OPACITY_SLIDER_ID));
    if (opacitySlider) {
        const opacityField = STEPPER_FIELDS.find(f => f.id === INPUT_OPACITY);
        opacitySlider.value = String(getFieldValue(opacityField));
    }
}

/**
 * 绘制编辑面板
 */
export function drawTextureEditPanel(item, textureIndex, data) {
    // 姿势切换页面：优先绘制并跳过正常编辑面板
    if (state.poseSwitchMode) {
        drawPoseSwitchPage();
        return;
    }

    // 初始化步进按钮事件监听（仅一次），并在每帧检测长按状态
    // 放在最前面：先应用步进变更，再由下方的 tempTextureData 检测检测变更并刷新预览
    setupStepperListeners();
    updateSteppers();
    // "移动"拖拽模式：每帧检测鼠标/触摸拖拽状态，实时更新 OffsetX/OffsetY
    updateDragMove();

    // 检测姿势变化：角色姿势改变时自动切换编辑目标
    // 用 lastPoseKey 追踪实际姿势变化，而非 poseEditing（poseEditing 为 null 时也需要检测）
    const C = CharacterGetCurrent();
    const currentPoseKey = getPoseKey(C?.DrawPose);
    if (state.lastPoseKey !== currentPoseKey) {
        state.lastPoseKey = currentPoseKey;
        // switchPose 会检查新姿势是否有 enabled 的独立配置：
        // 有则切换到姿势编辑，无则切回全局编辑
        switchPose(currentPoseKey);
    }

    if (state.tempTextureData) {
        // X偏移/Y偏移/缩放/旋转/透明度/图层优先级/贴图网址：均由 stepper 按钮或 prompt 点击
        // 直接写入 tempTextureData / tempPriority，并将 _fieldsDirty 置为 true，这里统一同步
        if (state._fieldsDirty) {
            state._fieldsDirty = false;

            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];

            const previousUrl = item.Property.Textures[textureIndex]?.TextureURL || "";
            const newUrl = state.tempTextureData.TextureURL || "";
            const urlChanged = previousUrl !== newUrl;

            item.Property.Textures[textureIndex] = JSON.parse(JSON.stringify(state.tempTextureData));

            // 图层优先级：写入 item.Property.OverridePriority，与 BC 原生 Layering 界面同步
            const layerName = LAYER_NAMES[textureIndex];
            if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
                item.Property.OverridePriority = {};
            }
            item.Property.OverridePriority[layerName] = state.tempPriority;

            // 标记需要刷新（不直接调用 CharacterRefresh，由下方节流逻辑统一处理）
            state._pendingTextureRefresh = true;

            // URL 变化时预加载图片（CORS 安全），加载完成后触发一次刷新
            if (urlChanged && isUrlAllowed(newUrl)) {
                const entry = getCorsImage(newUrl);
                if (!entry.img.complete) {
                    const C = CharacterGetCurrent();
                    entry.img.addEventListener("load", () => {
                        Logger.info(`[ShuangAssets] 图片加载完成: ${newUrl.substring(0, 50)}...`);
                        if (C) CharacterRefresh(C, false, false);
                    }, { once: true });
                }
            }
        }

        // 节流刷新：限制 CharacterRefresh 调用频率
        // GLDraw2DCanvas hook 已修复 WebGL 纹理泄漏，可安全进行实时预览
        // 拖拽移动中使用更短的间隔（TEXTURE_DRAG_REFRESH_INTERVAL），让预览更跟手；
        // 其余情况（如 stepper 长按）维持原本较保守的间隔，避免长按加速时刷新过于频繁
        if (state._pendingTextureRefresh) {
            const now = Date.now();
            const interval = state.dragActive ? TEXTURE_DRAG_REFRESH_INTERVAL : TEXTURE_REFRESH_INTERVAL;
            if (now - state._lastTextureRefresh >= interval) {
                const C = CharacterGetCurrent();
                if (C) CharacterRefresh(C, false, false);
                state._lastTextureRefresh = now;
                state._pendingTextureRefresh = false;
            }
        }
    }

    // 姿势信息栏：显示当前姿势 + 独立配置开关
    drawPoseBar();

    // 标题：id1 (1430,340,140,39.65) -> 中心点 (1500,360)
    DrawText(L(`编辑图层${textureIndex + 1}`, `Edit Layer ${textureIndex + 1}`), 1500, 360, "White", "Gray");

    // 说明文字：id2 (1270.42,385,470,40) -> 中心点 (1505,405)
    DrawText(L("修改后自动预览，点击「确认」返回列表", "Auto-previews on change; press ✓ to return"), 1505, 405, "Yellow", "Black");

    // 贴图：id9 标签 (1000,435,200,40) -> 中心 (1100,455)；网址框为真实 DOM <input>（见 createEditPanelDomInputs/
    // positionEditPanelInputs），这里只绘制标签文字，输入框本体由 DOM 元素叠加在 URL_BOX_X/Y/W/H 区域之上
    DrawText(L("贴图", "Image"), 1100, 455, "White", "Gray");
    // 信任按钮：id15 (1730,435,100,40)，与贴图 URL 同一行，固定位置显示，不随其他字段变化
    const currentUrl = state.tempTextureData?.TextureURL || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain) {
            DrawButton(1730, 435, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
        }
    }

    // "移动"按钮：坐标固定 (1435,510,150,40)。开启拖拽模式后，可在左侧角色预览区域按住鼠标/触摸自由拖动图片
    drawMoveButton();

    // X偏移/Y偏移/缩放/旋转/透明度/图层优先级：绘制文字标签 + 左右步进按钮，
    // 数值框本体为真实 DOM <input type="number">（由 positionEditPanelInputs 定位），支持鼠标滚轮调值和直接键入
    for (const field of STEPPER_FIELDS) {
        DrawText(L(field.labelCn, field.labelEn), 1100, field.labelY, "White", "Gray");
        drawStepperButton(STEPPER_MINUS_X, field.y, "Icons/Minus.png");
        drawStepperButton(STEPPER_PLUS_X, field.y, "Icons/Plus.png");
    }

    // 镜射（水平/垂直）：紧跟在"旋转"字段下方的一整行，右侧两个切换按钮
    drawMirrorRow();

    // 确认保存：id13 (1885,135,90,90)
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        L("保存该图层并返回列表", "Save this layer & back to list"));
    // 删除此贴图：id14 (1885,245,90,90)，不染色，与其他图标按钮一致使用白底
    DrawButton(1885, 245, 90, 90, "", "White", "Icons/Trash.png",
        L("删除此图层", "Delete this layer"), false);
}

/**
 * 处理编辑点击
 */
export function handleTextureEditClick(item, textureIndex, data) {
    // 姿势切换页面：优先处理点击并跳过正常编辑面板
    if (state.poseSwitchMode) {
        handlePoseSwitchClick();
        return;
    }

    // 贴图网址框现为真实 DOM <input>，点击/输入由浏览器原生处理，不再需要 canvas 点击检测

    // 姿势信息栏：独立配置开关 / 切换姿势按钮
    if (handlePoseBarClick()) {
        return;
    }

    // 可信域名按钮（与贴图 URL 同一行，固定位置，不随其他字段变化）
    const currentUrl = state.tempTextureData?.TextureURL || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain && MouseIn(1730, 435, 100, 40)) {
            state.pendingDomainToAdd = domain;
            state.currentView = "addDomainConfirm";
            state.currentEditTexture = -1;
            state.tempTextureData = null;
            state.originalOverridePriority = undefined;
            state._pendingTextureRefresh = false;
            state.poseEditing = null;
            state.tempGlobalData = null;
            state.poseSwitchMode = false;
            unregisterPoseHook();
            resetDragState();
            return;
        }
    }

    // "移动"按钮：点击切换拖拽模式
    if (handleMoveButtonClick()) {
        return;
    }

    // 数值字段（X偏移/Y偏移/缩放/旋转/透明度/图层优先级）现为真实 DOM <input>，
    // 点击/输入/滚轮由浏览器原生处理，不再需要 canvas 点击检测

    // 镜射（水平/垂直）：点击切换开关
    if (handleMirrorRowClick()) {
        return;
    }

    // 删除此贴图（右下角图标按钮）
    if (MouseIn(1885, 245, 90, 90)) {
        item.Property.Textures.splice(textureIndex, 1);
        state.currentEditTexture = -1;
        state.tempTextureData = null;
        state.originalOverridePriority = undefined;
        state._pendingTextureRefresh = false;
        state.currentListPage = 0;
        state.poseEditing = null;
        state.tempGlobalData = null;
        state.poseSwitchMode = false;
        unregisterPoseHook();
        resetDragState();
        syncItemToServer(item);
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }

    // 确认保存（右上角图标按钮）
    if (MouseIn(1885, 135, 90, 90)) {
        // 深拷贝 tempTextureData（保留 PoseSettings 结构），再逐字段清理类型
        const finalTexture = JSON.parse(JSON.stringify(state.tempTextureData));
        // Clean up: ensure numeric fields are numbers, booleans are booleans
        finalTexture.TextureURL = String(state.tempTextureData?.TextureURL?.trim() || "");
        finalTexture.OffsetX = parseInt(state.tempTextureData?.OffsetX) || 0;
        finalTexture.OffsetY = parseInt(state.tempTextureData?.OffsetY) || 0;
        finalTexture.Scale = parseInt(state.tempTextureData?.Scale) || 100;
        finalTexture.Rotation = parseInt(state.tempTextureData?.Rotation) || 0;
        finalTexture.Opacity = Math.max(0, Math.min(100, parseInt(state.tempTextureData?.Opacity) || 100));
        finalTexture.MirrorH = state.tempTextureData?.MirrorH === true;
        finalTexture.MirrorV = state.tempTextureData?.MirrorV === true;
        // Preserve Visible
        const existing = item.Property.Textures[textureIndex];
        finalTexture.Visible = (existing && existing.Visible !== undefined) ? existing.Visible : true;
        // PoseSettings is already in finalTexture from the deep copy

        if (!item.Property) item.Property = { Textures: [] };
        if (!item.Property.Textures) item.Property.Textures = [];

        item.Property.Textures[textureIndex] = finalTexture;

        // 图层优先级：写入 item.Property.OverridePriority，与 BC 原生 Layering 界面同步
        const layerName = LAYER_NAMES[textureIndex];
        if (typeof item.Property.OverridePriority !== "object" || item.Property.OverridePriority === null) {
            item.Property.OverridePriority = {};
        }
        item.Property.OverridePriority[layerName] = state.tempPriority;

        // 立即同步到服务器
        syncItemToServer(item);

        state.currentEditTexture = -1;
        state.tempTextureData = null;
        state.originalOverridePriority = undefined;
        state._pendingTextureRefresh = false;
        state.currentListPage = Math.floor(textureIndex / TEXTURES_PER_PAGE);
        state.poseEditing = null;
        state.tempGlobalData = null;
        state.poseSwitchMode = false;
        unregisterPoseHook();
        resetDragState();
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }
}
