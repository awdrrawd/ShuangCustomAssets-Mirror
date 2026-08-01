/**
 * 自定义贴图道具 - 编辑面板逻辑
 * 包含步进按钮、数值输入框（真实 DOM <input>，可直接输入，item1）、BAR 滑桿（可拖动，item2/3）、
 * 镜射、移动/缩放拖拽、编辑面板绘制与点击处理
 */

import {
    LAYER_NAMES, TEXTURES_PER_PAGE,
    STEPPER_FIELDS, STEPPER_MINUS_X, STEPPER_PLUS_X, STEPPER_BTN_W, STEPPER_BTN_H,
    STEPPER_INPUT_X, STEPPER_INPUT_W, STEPPER_INPUT_H,
    BAR_FIELDS, BAR_TRACK_X, BAR_TRACK_W, BAR_TRACK_H, BAR_HANDLE_SIZE,
    barDrag,
    MIRROR_ROW_Y, MIRROR_ROW_LABEL_Y, MIRROR_H_BTN_X, MIRROR_V_BTN_X, MIRROR_BTN_W, MIRROR_BTN_H,
    MOVE_BTN_X, MOVE_BTN_Y, MOVE_BTN_W, MOVE_BTN_H,
    SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H,
    ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H,
    SCALE_DRAG_SENSITIVITY, scaleDrag,
    URL_BOX_X, URL_BOX_Y, URL_BOX_W, URL_BOX_H, FIELD_URL,
    TEXTURE_REFRESH_INTERVAL, TEXTURE_DRAG_REFRESH_INTERVAL,
    stepperPress,
    POSE_LABELS, getPoseKey, POSE_BAR_Y, POSE_TOGGLE_X, POSE_TOGGLE_W, POSE_TOGGLE_H,
    POSE_SWITCH_X, POSE_SWITCH_W,
    POSE_NAME_LABEL_X, POSE_NAME_VALUE_X, POSE_NAME_VALUE_W, POSE_NAME_VALUE_H,
    POSE_PAGE_BTN_W, POSE_PAGE_BTN_H, POSE_PAGE_BTN_GAP, POSE_PAGE_START_X,
    POSE_PAGE_COLS, POSE_PAGE_START_Y, POSE_PAGE_ROW_STEP, POSE_PAGE_CATEGORY_GAP,
    POSE_PAGE_LABEL_X, POSE_PAGE_LABEL_Y_OFFSET,
    POSE_CATEGORIES
} from "./constants.js";
import { state, resetDragState } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { L, isChineseLang, getCorsImage, Logger, hideNumberInputSpinner } from "@lib/utils.js";
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
 * 切换姿势编辑目标后调用：数值框/BAR 滑桿本身是 canvas 绘制，每帧都直接从 getEditTarget()
 * 读取当前值，不需要额外同步任何 DOM 显示值；这里只需要标记为已变更以触发一次预览刷新
 */
export function refreshEditInputs() {
    if (!getEditTarget()) return;
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
        ScaleX: g?.ScaleX ?? 100,
        ScaleY: g?.ScaleY ?? 100,
        ScaleLocked: g?.ScaleLocked !== false,
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
 * 绘制姿势信息栏：显示当前角色姿势名称 + 独立配置开关按钮 + "设定"按钮
 * 位于编辑面板底部（POSE_BAR_Y），item5：三者现在同一行显示（标签+值 X 整体左移 40，
 * 独立配置开关与"设定"按钮紧跟在姿势名称值框之后，不再单独占一行）
 */
export function drawPoseBar() {
    // 标签：固定文字，不随内容变化，因此不会因为姿势名称长短不同而产生位移
    DrawText(L("特定姿势: ", "Specific Pose: "), POSE_NAME_LABEL_X, POSE_BAR_Y, "White", "Gray");

    // 姿势名称值：独立对象（DrawTextFit，固定宽度框），显示当前正在编辑的姿势独立配置名称，
    // 而不是角色的实际姿势——没有正在编辑任何姿势独立配置（即编辑的是全局默认值）时显示"无"
    let poseValueText;
    if (state.poseEditing) {
        const labels = state.poseEditing.split("+").map(p => {
            const label = POSE_LABELS[p];
            return label ? L(label.cn, label.en) : p;
        });
        poseValueText = labels.join(" + ");
    } else {
        poseValueText = L("无", "None");
    }
    // DrawTextFit 绘制过程中会动到 MainCanvas.textAlign，为确保文字仍按预期居中/对齐，
    // 在调用前后显式设置（与本项目 settings.js 中 _drawTextLeft 的处理方式一致）
    MainCanvas.textAlign = "center";
    DrawTextFit(poseValueText, POSE_NAME_VALUE_X + POSE_NAME_VALUE_W / 2, POSE_BAR_Y, POSE_NAME_VALUE_W, "Yellow", "Black");
    MainCanvas.textAlign = "center";

    // 独立配置开关按钮：始终显示（包括基础站姿），按钮本身依然对应角色的实际当前姿势，
    // 现与姿势名称值框同一行（item5），标签由"独立配置"改名为"启用/停用"
    const C = CharacterGetCurrent();
    const poseKey = getPoseKey(C?.DrawPose);
    if (poseKey) {
        // 开关状态：当前正在编辑此姿势 OR 此姿势已有 enabled 的独立配置（继续用灰色/绿色切换）
        const ps = state.tempTextureData?.PoseSettings?.[poseKey];
        const isEnabled = state.poseEditing === poseKey || (ps && ps.enabled === true);
        const btnText = isEnabled
            ? L("启用", "On")
            : L("停用", "Off");
        DrawButton(POSE_TOGGLE_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
            POSE_TOGGLE_W, POSE_TOGGLE_H,
            btnText, isEnabled ? "#4CAF50" : "White", null, null, false);
    }

    // "设定"按钮：始终显示，紧跟在独立配置开关之后，同一行
    DrawButton(POSE_SWITCH_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
        POSE_SWITCH_W, POSE_TOGGLE_H,
        L("设定", "Configure"), "White", null,
        L("打开姿势切换页面", "Open pose switch page"), false);
}

/**
 * 处理姿势信息栏的点击：切换独立配置开关 / 打开姿势切换页面
 * @returns {boolean} 是否命中并处理了某个按钮
 */
export function handlePoseBarClick() {
    const C = CharacterGetCurrent();
    const poseKey = getPoseKey(C?.DrawPose);

    // "设定"按钮
    if (MouseIn(POSE_SWITCH_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
            POSE_SWITCH_W, POSE_TOGGLE_H)) {
        state.poseSwitchMode = true;
        return true;
    }

    if (poseKey && MouseIn(POSE_TOGGLE_X, POSE_BAR_Y - POSE_TOGGLE_H / 2,
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

    // 标题（与 贴图管理/编辑图层/隐藏设置 三页统一坐标+颜色）
    DrawText(L("切换姿势", "Switch Pose"), 1500, 360, "White", "Gray");
    DrawText(L("点击姿势按钮切换，左侧实时预览效果", "Click a pose to switch, preview on the left"),
        1505, 405, "Yellow", "Black");

    // 当前角色的渲染姿势映射（包含 previewPoseMapping 的覆盖）
    const activeMapping = C.DrawPoseMapping || {};
    let rowY = POSE_PAGE_START_Y;

    // 按分类绘制姿势按钮：每个分类的按钮从 X1265 开始，每行固定 3 个自动换行；
    // 分类标题在左侧(X1100)，与该分类第一行按钮同一行对齐
    for (const [catKey, cat] of Object.entries(POSE_CATEGORIES)) {
        const categoryFirstRowY = rowY;
        DrawText(L(cat.label, cat.labelEn), POSE_PAGE_LABEL_X,
            categoryFirstRowY + POSE_PAGE_LABEL_Y_OFFSET, "White", "Gray");

        for (let i = 0; i < cat.poses.length; i++) {
            const poseName = cat.poses[i];
            const col = i % POSE_PAGE_COLS;
            const row = Math.floor(i / POSE_PAGE_COLS);
            const btnX = POSE_PAGE_START_X + col * (POSE_PAGE_BTN_W + POSE_PAGE_BTN_GAP);
            const btnY = categoryFirstRowY + row * POSE_PAGE_ROW_STEP;
            const isActive = activeMapping[catKey] === poseName;
            const label = POSE_LABELS[poseName];
            const btnText = label ? L(label.cn, label.en) : poseName;

            DrawButton(btnX, btnY, POSE_PAGE_BTN_W, POSE_PAGE_BTN_H,
                btnText, isActive ? "#4CAF50" : "White", null, null, false);
        }

        const rowCount = Math.ceil(cat.poses.length / POSE_PAGE_COLS);
        rowY = categoryFirstRowY + rowCount * POSE_PAGE_ROW_STEP + POSE_PAGE_CATEGORY_GAP;
    }
}

/**
 * 处理姿势切换页面的点击
 * @returns {boolean} 是否命中并处理了某个按钮
 */
export function handlePoseSwitchClick() {
    const C = CharacterGetCurrent();
    if (!C) return false;

    // 命中判定必须与 drawPoseSwitchPage 的网格布局完全一致（每行 3 个按钮，自动换行）
    let rowY = POSE_PAGE_START_Y;

    for (const [catKey, cat] of Object.entries(POSE_CATEGORIES)) {
        const categoryFirstRowY = rowY;
        for (let i = 0; i < cat.poses.length; i++) {
            const poseName = cat.poses[i];
            const col = i % POSE_PAGE_COLS;
            const row = Math.floor(i / POSE_PAGE_COLS);
            const btnX = POSE_PAGE_START_X + col * (POSE_PAGE_BTN_W + POSE_PAGE_BTN_GAP);
            const btnY = categoryFirstRowY + row * POSE_PAGE_ROW_STEP;

            if (MouseIn(btnX, btnY, POSE_PAGE_BTN_W, POSE_PAGE_BTN_H)) {
                // 本地预览姿势（仅修改 DrawPoseMapping，不同步服务器）
                setPreviewPose(poseName);
                return true;
            }
        }
        const rowCount = Math.ceil(cat.poses.length / POSE_PAGE_COLS);
        rowY = categoryFirstRowY + rowCount * POSE_PAGE_ROW_STEP + POSE_PAGE_CATEGORY_GAP;
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
    document.addEventListener("mousedown", () => {
        state._pointerDown = true;
        tryStartBarDrag();
    });
    document.addEventListener("mouseup", () => {
        state._pointerDown = false;
        stepperPress.fieldId = null;
        // 释放后立即允许刷新（绕过节流，让预览马上更新）
        state._lastTextureRefresh = 0;
    });
    // 触摸（移动端）
    document.addEventListener("touchstart", () => {
        state._pointerDown = true;
        tryStartBarDrag();
    }, { passive: true });
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
 * 指针刚按下的瞬间检测是否命中某个 BAR 滑桿（轨道或手柄），命中则立即跳变到该位置并
 * 标记为拖动中——不能像之前那样只在游戏的 Click 事件里判断：Click 必然发生在 mouseup
 * 之后，此时 mouseup 监听器已经把 _pointerDown 重置为 false，下一帧 updateBarDrag()
 * 会马上清空 barDrag.fieldId，导致 BAR 只能点击跳变、无法真正按住拖动
 */
function tryStartBarDrag() {
    if (state.currentEditTexture < 0 || state.poseSwitchMode) return;
    for (const field of BAR_FIELDS) {
        const barTop = field.y + STEPPER_INPUT_H / 2 - BAR_HANDLE_SIZE / 2;
        if (MouseIn(BAR_TRACK_X - BAR_HANDLE_SIZE / 2, barTop, BAR_TRACK_W + BAR_HANDLE_SIZE, BAR_HANDLE_SIZE)) {
            setFieldValue(field, barValueFromMouseX(field, MouseX));
            barDrag.fieldId = field.id;
            return;
        }
    }
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
 * "等比"锁定开启时（target.ScaleLocked === true），修改 ScaleX/ScaleY 任一方会同步另一方
 * @param {object} field - STEPPER_FIELDS / BAR_FIELDS 中的字段配置
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
            // 等比锁定：缩放X/Y 任一方变更时同步另一方，保持比例始终一致
            // 用 !== false（而非 === true）判断，与「等比」按钮显示状态/其余读取处保持一致：
            // 旧数据里从未显式写入过 ScaleLocked 字段时视为默认锁定，否则按钮显示锁定但实际不同步
            if (target.ScaleLocked !== false) {
                if (field.prop === "ScaleX" && target.ScaleY !== value) {
                    target.ScaleY = value;
                    state._fieldsDirty = true;
                } else if (field.prop === "ScaleY" && target.ScaleX !== value) {
                    target.ScaleX = value;
                    state._fieldsDirty = true;
                }
            }
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
 * 创建编辑图层面板的全部 DOM 输入框（贴图网址 1 个 + 数值字段 7 个：X/Y偏移、缩放X/Y、透明度、
 * 旋转、图层优先级），均为真实 <input>，可直接输入/编辑（item1），不再依赖 canvas 按钮 + prompt() 弹窗。
 * 只创建一次（复用同一批元素），编辑不同图层/切换姿势时只需在 positionEditPanelInputs() 里重新赋值
 */
export function createEditPanelDomInputs() {
    if (state._editInputsReady) return;
    state._editInputsReady = true;

    // 贴图网址：type=text，输入即时写入 target.TextureURL 并标记刷新预览
    const urlInput = ElementCreateInput(FIELD_URL, "text", "", "https://");
    urlInput.addEventListener("input", () => {
        const target = getEditTarget();
        if (!target) return;
        target.TextureURL = urlInput.value.trim();
        state._fieldsDirty = true;
    });

    // 数值字段（X偏移/Y偏移/缩放X/缩放Y/透明度/旋转/图层优先级）：type=number
    for (const field of [...STEPPER_FIELDS, ...BAR_FIELDS]) {
        const input = ElementCreateInput(field.id, "number", String(field.def), "");
        if (field.min !== null) input.min = String(field.min);
        if (field.max !== null) input.max = String(field.max);
        input.step = "1";
        // 已有自绘 +/- 步进按钮，隐藏原生上下箭头，避免视觉/点击区域冗余
        hideNumberInputSpinner(input);
        input.addEventListener("input", () => {
            const parsed = parseInt(input.value, 10);
            if (!Number.isFinite(parsed)) return; // 允许临时空值（如清空重打），change 时再修正
            setFieldValue(field, parsed);
        });
        input.addEventListener("change", () => {
            // 失焦/回车：用裁剪后的最终值回填，修正超出范围或非法输入
            input.value = String(getFieldValue(field));
        });
    }
}

/**
 * 每帧定位编辑图层面板的 DOM 输入框：正在编辑某个图层且不在姿势切换页面时，
 * 定位到对应字段坐标（ElementPosition 以中心点为基准，故需 +宽高的一半）；
 * 否则移出画布（与 settings.js 现有的 ElementPosition(-999,-999,0,0) 隐藏方式一致）。
 * 数值同步：仅在该输入框未获得焦点时才回填当前值，避免每帧覆盖用户正在打字的内容；
 * 其余情况（BAR 拖动、步进按钮、移动/缩放拖拽、切换图层或姿势等程序化修改）都会实时同步显示
 * 在 drawTextureEditPanel 中每帧调用
 */
export function positionEditPanelInputs() {
    const showing = state.currentEditTexture >= 0 && !state.poseSwitchMode;

    const urlInput = document.getElementById(FIELD_URL);
    if (urlInput) {
        if (showing) {
            ElementPosition(FIELD_URL, URL_BOX_X + URL_BOX_W / 2, URL_BOX_Y + URL_BOX_H / 2, URL_BOX_W, URL_BOX_H);
            if (document.activeElement !== urlInput) {
                const val = getEditTarget()?.TextureURL || "";
                if (urlInput.value !== val) urlInput.value = val;
            }
        } else {
            ElementPosition(FIELD_URL, -999, -999, 0, 0);
        }
    }

    for (const field of [...STEPPER_FIELDS, ...BAR_FIELDS]) {
        const input = document.getElementById(field.id);
        if (!input) continue;
        if (showing) {
            ElementPosition(field.id, STEPPER_INPUT_X + STEPPER_INPUT_W / 2, field.y + STEPPER_INPUT_H / 2,
                STEPPER_INPUT_W, STEPPER_INPUT_H);
            if (document.activeElement !== input) {
                const val = String(getFieldValue(field));
                if (input.value !== val) input.value = val;
            }
        } else {
            ElementPosition(field.id, -999, -999, 0, 0);
        }
    }
}

/**
 * 移除编辑图层面板的全部 DOM 输入框（退出道具编辑时调用，与 settings.js 的 _removeDomainInput 等一致）
 */
export function removeEditPanelInputs() {
    if (!state._editInputsReady) return;
    state._editInputsReady = false;
    const ids = [FIELD_URL, ...STEPPER_FIELDS.map(f => f.id), ...BAR_FIELDS.map(f => f.id)];
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

/**
 * 绘制 BAR 滑桿（旋转 0~360 / 图层优先级 -99~99）：横向轨道 + 方形手柄（替代原本圆形手柄）
 * item2：与 STEPPER_FIELDS 完全一致的左侧 [-]/数值输入框(DOM)/[+] 布局（由调用方
 * drawTextureEditPanel 统一绘制 label + drawStepperButton，与其他数值字段共用同一循环），
 * 这里只负责绘制数值框右侧追加的 BAR 部分：轨道 + 方形手柄，点击轨道/拖动手柄可直接调值。
 * item3：min<0<max 的字段（如图层优先级 -99~99）在 0 对应位置画一条黑线标示中点
 * @param {object} field - BAR_FIELDS 中的字段配置
 */
export function drawBarField(field) {
    const value = getFieldValue(field);
    const ratio = (value - field.min) / (field.max - field.min);
    const trackY = field.y + STEPPER_INPUT_H / 2 - BAR_TRACK_H / 2;

    // 轨道（直接用 MainCanvas 2D 上下文绘制，MainCanvas 即当前画布的渲染上下文）
    MainCanvas.fillStyle = "#999999";
    MainCanvas.fillRect(BAR_TRACK_X, trackY, BAR_TRACK_W, BAR_TRACK_H);

    // item3：0 刻度中点线（仅当该字段的取值范围横跨 0 时才有意义，如图层优先级 -99~99）
    if (field.min < 0 && field.max > 0) {
        const zeroRatio = (0 - field.min) / (field.max - field.min);
        const zeroX = BAR_TRACK_X + zeroRatio * BAR_TRACK_W;
        MainCanvas.fillStyle = "#000000";
        MainCanvas.fillRect(zeroX - 1, trackY - 4, 2, BAR_TRACK_H + 8);
    }

    // 方形手柄
    const handleX = BAR_TRACK_X + ratio * BAR_TRACK_W - BAR_HANDLE_SIZE / 2;
    const handleY = field.y + STEPPER_INPUT_H / 2 - BAR_HANDLE_SIZE / 2;
    MainCanvas.fillStyle = barDrag.fieldId === field.id ? "#4CAF50" : "#FFFFFF";
    MainCanvas.fillRect(handleX, handleY, BAR_HANDLE_SIZE, BAR_HANDLE_SIZE);
    MainCanvas.strokeStyle = "#000000";
    MainCanvas.lineWidth = 2;
    MainCanvas.strokeRect(handleX, handleY, BAR_HANDLE_SIZE, BAR_HANDLE_SIZE);
}

/**
 * 根据鼠标 X 坐标换算 BAR 轨道对应的数值（裁剪到 min/max，取整）
 * @param {object} field - BAR_FIELDS 中的字段配置
 * @param {number} mouseX
 * @returns {number}
 */
function barValueFromMouseX(field, mouseX) {
    const ratio = Math.max(0, Math.min(1, (mouseX - BAR_TRACK_X) / BAR_TRACK_W));
    return Math.round(field.min + ratio * (field.max - field.min));
}

/**
 * 处理 BAR 滑桿点击：点击轨道/手柄区域直接跳转到对应值，并将该字段标记为"正在拖动"，
 * 后续帧由 updateBarDrag() 持续跟随鼠标实现真正的拖拽（item2：现在不仅能点击，也能拖动）；
 * 数值框本体已改为 DOM <input>（item1），其点击/输入由浏览器原生处理，不需要在这里判断
 * @param {object} field - BAR_FIELDS 中的字段配置
 * @returns {boolean} 是否命中并处理了该 BAR
 */
export function handleBarFieldClick(field) {
    const barTop = field.y + STEPPER_INPUT_H / 2 - BAR_HANDLE_SIZE / 2;
    if (MouseIn(BAR_TRACK_X - BAR_HANDLE_SIZE / 2, barTop, BAR_TRACK_W + BAR_HANDLE_SIZE, BAR_HANDLE_SIZE)) {
        setFieldValue(field, barValueFromMouseX(field, MouseX));
        barDrag.fieldId = field.id;
        return true;
    }

    return false;
}

/**
 * 每帧检测 BAR 滑桿的拖动状态：指针松开时清除拖动标记，拖动中则持续跟随鼠标 X 坐标更新数值
 * 在 drawTextureEditPanel 中调用（每帧执行），与 updateSteppers()/updateDragMove() 同一模式
 */
export function updateBarDrag() {
    if (!barDrag.fieldId) return;
    if (!state._pointerDown) {
        barDrag.fieldId = null;
        return;
    }
    const field = BAR_FIELDS.find(f => f.id === barDrag.fieldId);
    if (!field) {
        barDrag.fieldId = null;
        return;
    }
    setFieldValue(field, barValueFromMouseX(field, MouseX));
}

/**
 * 绘制"拖移"按钮（缩放X/Y 行右侧）：点击后切换缩放拖拽模式，
 * 开启后可在左侧角色预览区域按住鼠标/触摸拖动来缩放图片（等比锁定时 X/Y 同步变化）
 *
 * 悬停说明文字不使用 DrawButton 内置 tooltip（会被 DOM 输入框遮挡），
 * 改为在按钮右侧固定位置手动绘制，与"移动"按钮共用同一片提示区域。
 */
export function drawScaleDragButton() {
    DrawButton(SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H,
        L("拖移", "Drag"), state.isScaleDragMode ? "#4CAF50" : "White", null, null, false);
    if (MouseIn(SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H)) {
        const hintX = 1820;
        const hintY = SCALE_DRAG_BTN_Y + SCALE_DRAG_BTN_H / 2;
        const lines = isChineseLang()
            ? ["开启后可在左侧", "预览区域拖动", "缩放图片"]
            : ["When enabled,", "drag on the preview", "to resize the image"];
        for (let i = 0; i < lines.length; i++) {
            DrawText(lines[i], hintX, hintY - 22 + i * 30, "Yellow", "Black");
        }
    }
}

/**
 * 处理"拖移"按钮点击：切换缩放拖拽模式开关
 * @returns {boolean} 是否命中并处理了该按钮
 */
export function handleScaleDragButtonClick() {
    if (!MouseIn(SCALE_DRAG_BTN_X, SCALE_DRAG_BTN_Y, SCALE_DRAG_BTN_W, SCALE_DRAG_BTN_H)) return false;
    state.isScaleDragMode = !state.isScaleDragMode;
    scaleDrag.active = false;
    if (state.isScaleDragMode) {
        // 移动与拖移缩放共用同一块预览区域的指针拖拽手势，两者不能同时生效
        state.isDragMode = false;
        state.dragActive = false;
    }
    return true;
}

/**
 * 每帧检测缩放拖拽模式下的鼠标/触摸状态，实时更新 ScaleX/ScaleY
 * 拖动范围限制在角色预览区域，逻辑与 updateDragMove()（位置拖拽）一致，仅把偏移量换成缩放量
 */
export function updateScaleDrag() {
    if (!state.isScaleDragMode) {
        scaleDrag.active = false;
        return;
    }
    const target = getEditTarget();
    if (!target) {
        scaleDrag.active = false;
        return;
    }

    const inPreviewArea = MouseX >= 0 && MouseX <= 1000 && MouseY >= 0 && MouseY <= 1000;
    if (!state._pointerDown || !inPreviewArea) {
        scaleDrag.active = false;
        return;
    }

    if (!scaleDrag.active) {
        scaleDrag.active = true;
        scaleDrag.startMouseX = MouseX;
        scaleDrag.startMouseY = MouseY;
        const sx = Number(target.ScaleX);
        const sy = Number(target.ScaleY);
        scaleDrag.startScaleX = Number.isFinite(sx) ? sx : 100;
        scaleDrag.startScaleY = Number.isFinite(sy) ? sy : 100;
        return;
    }

    const deltaX = (MouseX - scaleDrag.startMouseX) * SCALE_DRAG_SENSITIVITY;
    const deltaY = (MouseY - scaleDrag.startMouseY) * SCALE_DRAG_SENSITIVITY;
    let newScaleX, newScaleY;
    if (target.ScaleLocked !== false) {
        // 等比锁定：只用水平位移驱动，X/Y 同步变化
        newScaleX = newScaleY = Math.round(scaleDrag.startScaleX + deltaX);
    } else {
        newScaleX = Math.round(scaleDrag.startScaleX + deltaX);
        newScaleY = Math.round(scaleDrag.startScaleY + deltaY);
    }
    if (target.ScaleX !== newScaleX || target.ScaleY !== newScaleY) {
        target.ScaleX = newScaleX;
        target.ScaleY = newScaleY;
        state._fieldsDirty = true;
    }
}

/**
 * 绘制"等比"按钮（缩放X/Y 行右侧，坐标固定 1680,680）：锁定/解锁 XY 缩放比例始终一致
 */
export function drawAspectLockButton() {
    const target = getEditTarget();
    const locked = target?.ScaleLocked !== false;
    DrawButton(ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H,
        L("等比", "Lock"), locked ? "#4CAF50" : "White", null, null, false);
    if (MouseIn(ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H)) {
        const hintX = 1820;
        const hintY = ASPECT_LOCK_BTN_Y + ASPECT_LOCK_BTN_H / 2;
        const lines = isChineseLang()
            ? ["锁定缩放X/Y", "比例始终一致"]
            : ["Lock the X/Y", "scale ratio together"];
        for (let i = 0; i < lines.length; i++) {
            DrawText(lines[i], hintX, hintY - 15 + i * 30, "Yellow", "Black");
        }
    }
}

/**
 * 处理"等比"按钮点击：切换 ScaleLocked 开关；开启的瞬间立即把 ScaleY 同步为 ScaleX，
 * 确保切换的那一刻两者就是一致的，而不是等到下一次修改才生效
 * @returns {boolean} 是否命中并处理了该按钮
 */
export function handleAspectLockButtonClick() {
    if (!MouseIn(ASPECT_LOCK_BTN_X, ASPECT_LOCK_BTN_Y, ASPECT_LOCK_BTN_W, ASPECT_LOCK_BTN_H)) return false;
    const target = getEditTarget();
    if (!target) return true;
    const newLocked = !(target.ScaleLocked !== false);
    target.ScaleLocked = newLocked;
    if (newLocked && target.ScaleX !== target.ScaleY) {
        target.ScaleY = target.ScaleX;
        state._fieldsDirty = true;
    }
    return true;
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
    if (state.isDragMode) {
        // 移动与拖移缩放共用同一块预览区域的指针拖拽手势，两者不能同时生效
        state.isScaleDragMode = false;
        scaleDrag.active = false;
    }
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
 * 步进按钮：每帧检测长按状态并应用加速变更
 * 在 drawTextureEditPanel 中调用（每帧执行）
 * 长按时间越长，步进间隔越短、步长越大
 */
export function updateSteppers() {
    if (!state._pointerDown) {
        stepperPress.fieldId = null;
        return;
    }

    // 检测当前指针位于哪个步进按钮上（item2：旋转/图层优先级 BAR_FIELDS 现与其他数值字段
    // 共用同一套 [-]/[+] 步进按钮布局，一并检测）
    let activeField = null;
    let activeDirection = 0;
    for (const field of [...STEPPER_FIELDS, ...BAR_FIELDS]) {
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
            // item6：完全替换而非与 C.DrawPoseMapping 合并——setPreviewPose 生成的
            // previewPoseMapping 本身已是一份完整映射（全身姿势时只含 BodyFull，
            // 手部/腿部分类刻意不存在，代表"没有姿势"）。若改用展开合并（{...C.DrawPoseMapping,
            // ...previewPoseMapping}），旧的 BodyUpper/BodyLower 键不会被合并操作删除，
            // 导致切到"仰卧"/"四肢着地"后手脚仍残留旧姿势
            C.DrawPoseMapping = { ...state.previewPoseMapping };
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
        // 全身姿势（如"仰卧"/"四肢着地"）：替换整个映射，只保留 BodyFull 一项，
        // 刻意不包含 BodyUpper/BodyLower —— 手部/腿部没有姿势（item6）
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
        // item6：从"仰卧"/"四肢着地"切回一般姿势时，手部/腿部分类此前完全没有姿势
        // （上面的过滤只会删除 BodyFull，不会补回 BodyUpper/BodyLower），
        // 此时预设为 基础手势(BaseUpper) + 站立(BaseLower)，避免分类缺失导致渲染异常
        if (!baseMapping.BodyUpper) baseMapping.BodyUpper = "BaseUpper";
        if (!baseMapping.BodyLower) baseMapping.BodyLower = "BaseLower";
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
    // BAR 滑桿（旋转/图层优先级）拖动状态
    updateBarDrag();
    // "拖移"缩放拖拽模式：每帧检测鼠标/触摸拖拽状态，实时更新 ScaleX/ScaleY
    updateScaleDrag();

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
        // 拖拽中（移动/缩放/BAR滑桿）使用更短的间隔（TEXTURE_DRAG_REFRESH_INTERVAL），让预览更跟手；
        // 其余情况（如 stepper 长按）维持原本较保守的间隔，避免长按加速时刷新过于频繁
        if (state._pendingTextureRefresh) {
            const now = Date.now();
            const isDragging = state.dragActive || scaleDrag.active || !!barDrag.fieldId;
            const interval = isDragging ? TEXTURE_DRAG_REFRESH_INTERVAL : TEXTURE_REFRESH_INTERVAL;
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

    // 贴图：id9 标签 (1000,435,200,40) -> 中心 (1100,455)；网址框现为真实 DOM <input type="text">
    // （createEditPanelDomInputs/positionEditPanelInputs），可直接输入网址，不再需要弹窗（item1）
    DrawText(L("贴图", "Image"), 1100, 455, "White", "Gray");
    // 信任按钮：id15 (1730,435,100,40)，与贴图 URL 同一行，固定位置显示，不随其他字段变化
    const currentUrl = getEditTarget()?.TextureURL || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain) {
            DrawButton(1730, 435, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
        }
    }

    // "移动"按钮：坐标固定 (1435,510,150,40)。开启拖拽模式后，可在左侧角色预览区域按住鼠标/触摸自由拖动图片
    drawMoveButton();

    // X偏移/Y偏移/缩放X/缩放Y/透明度：绘制文字标签 + 左右步进按钮 + canvas 数值框（点击 prompt 输入，item1）
    for (const field of STEPPER_FIELDS) {
        DrawText(L(field.labelCn, field.labelEn), 1100, field.labelY, "White", "Gray");
        drawStepperButton(STEPPER_MINUS_X, field.y, "Icons/Minus.png");
        drawStepperButton(STEPPER_PLUS_X, field.y, "Icons/Plus.png");
    }

    // 缩放X/Y 行右侧：拖动缩放按钮 + 等比锁定按钮（item2）
    drawScaleDragButton();
    drawAspectLockButton();

    // 旋转 / 图层优先级：BAR 滑桿（方形手柄，item3+item4）
    for (const field of BAR_FIELDS) {
        DrawText(L(field.labelCn, field.labelEn), 1100, field.labelY, "White", "Gray");
        drawStepperButton(STEPPER_MINUS_X, field.y, "Icons/Minus.png");
        drawStepperButton(STEPPER_PLUS_X, field.y, "Icons/Plus.png");
        drawBarField(field);
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

    // 姿势信息栏：独立配置开关 / "设定"按钮
    if (handlePoseBarClick()) {
        return;
    }

    // 可信域名按钮（与贴图 URL 同一行，固定位置，不随其他字段变化）
    const currentUrl = getEditTarget()?.TextureURL || "";
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

    // 缩放X/Y 行右侧："拖移"缩放拖拽按钮 / "等比"锁定按钮（item2）
    if (handleScaleDragButtonClick()) {
        return;
    }
    if (handleAspectLockButtonClick()) {
        return;
    }

    // 旋转 / 图层优先级：BAR 滑桿，点击轨道/手柄跳转取值并开始拖动，点击数值弹出 prompt 精确输入（item3+item4）
    for (const field of BAR_FIELDS) {
        if (handleBarFieldClick(field)) {
            return;
        }
    }

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
        // 深拷贝 tempTextureData（保留 PoseSettings 结构），再逐字段清理类型。
        // 用 Number.isFinite 判断而非 `|| 后备值`：Scale=0（完全缩小）、Opacity=0（全透明）
        // 都是合法的有效值，用 `||` 会把它们误判成「没填」而强制拉回默认值
        const toIntOr = (val, fallback) => {
            const n = parseInt(val, 10);
            return Number.isFinite(n) ? n : fallback;
        };
        const finalTexture = JSON.parse(JSON.stringify(state.tempTextureData));
        // Clean up: ensure numeric fields are numbers, booleans are booleans
        finalTexture.TextureURL = String(state.tempTextureData?.TextureURL?.trim() || "");
        finalTexture.OffsetX = toIntOr(state.tempTextureData?.OffsetX, 0);
        finalTexture.OffsetY = toIntOr(state.tempTextureData?.OffsetY, 0);
        finalTexture.ScaleX = toIntOr(state.tempTextureData?.ScaleX, 100);
        finalTexture.ScaleY = toIntOr(state.tempTextureData?.ScaleY, 100);
        finalTexture.ScaleLocked = state.tempTextureData?.ScaleLocked !== false;
        finalTexture.Rotation = Math.max(0, Math.min(360, toIntOr(state.tempTextureData?.Rotation, 0)));
        finalTexture.Opacity = Math.max(0, Math.min(100, toIntOr(state.tempTextureData?.Opacity, 100)));
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