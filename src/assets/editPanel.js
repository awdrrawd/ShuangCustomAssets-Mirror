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
    stepperPress
} from "./constants.js";
import { state, resetDragState } from "./state.js";
import { syncItemToServer } from "./serverSync.js";
import { L, isChineseLang, getCorsImage, Logger } from "@lib/utils.js";
import { isUrlAllowed, isDomainInWhitelist, extractDomain } from "./settings.js";

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
    const v = state.tempTextureData ? state.tempTextureData[field.prop] : undefined;
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
    } else if (state.tempTextureData) {
        if (state.tempTextureData[field.prop] !== value) {
            state.tempTextureData[field.prop] = value;
            state._fieldsDirty = true;
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

    const mirrorH = state.tempTextureData?.MirrorH === true;
    const mirrorV = state.tempTextureData?.MirrorV === true;

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
    if (!state.tempTextureData) return false;

    if (MouseIn(MIRROR_H_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H)) {
        state.tempTextureData.MirrorH = !(state.tempTextureData.MirrorH === true);
        state._fieldsDirty = true;
        return true;
    }

    if (MouseIn(MIRROR_V_BTN_X, MIRROR_ROW_Y, MIRROR_BTN_W, MIRROR_BTN_H)) {
        state.tempTextureData.MirrorV = !(state.tempTextureData.MirrorV === true);
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
    if (!state.isDragMode || !state.tempTextureData) {
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
        state.dragStartOffsetX = parseInt(state.tempTextureData.OffsetX) || 0;
        state.dragStartOffsetY = parseInt(state.tempTextureData.OffsetY) || 0;
        return;
    }

    // 持续拖拽中：按鼠标位移量实时更新偏移
    const newOffsetX = Math.round(state.dragStartOffsetX + (MouseX - state.dragStartMouseX));
    const newOffsetY = Math.round(state.dragStartOffsetY + (MouseY - state.dragStartMouseY));
    if (state.tempTextureData.OffsetX !== newOffsetX || state.tempTextureData.OffsetY !== newOffsetY) {
        state.tempTextureData.OffsetX = newOffsetX;
        state.tempTextureData.OffsetY = newOffsetY;
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
            if (!state.tempTextureData) return;
            const newUrl = input.value.trim();
            if (state.tempTextureData.TextureURL !== newUrl) {
                state.tempTextureData.TextureURL = newUrl;
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
            } else if (state.tempTextureData) {
                if (state.tempTextureData[field.prop] !== parsed) {
                    state.tempTextureData[field.prop] = parsed;
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
            if (!state.tempTextureData) return;
            const v = Math.max(0, Math.min(100, parseInt(slider.value, 10) || 0));
            if (state.tempTextureData.Opacity !== v) {
                state.tempTextureData.Opacity = v;
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
export function createEditInputs(texture) {
    state._fieldsDirty = false;

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
    // 初始化步进按钮事件监听（仅一次），并在每帧检测长按状态
    // 放在最前面：先应用步进变更，再由下方的 tempTextureData 检测检测变更并刷新预览
    setupStepperListeners();
    updateSteppers();
    // "移动"拖拽模式：每帧检测鼠标/触摸拖拽状态，实时更新 OffsetX/OffsetY
    updateDragMove();

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

            item.Property.Textures[textureIndex] = { ...state.tempTextureData };

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
    // 贴图网址框现为真实 DOM <input>，点击/输入由浏览器原生处理，不再需要 canvas 点击检测

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
        resetDragState();
        syncItemToServer(item);
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }

    // 确认保存（右上角图标按钮）
    if (MouseIn(1885, 135, 90, 90)) {
        const finalTexture = {
            TextureURL: state.tempTextureData?.TextureURL?.trim() || "",
            OffsetX: parseInt(state.tempTextureData?.OffsetX) || 0,
            OffsetY: parseInt(state.tempTextureData?.OffsetY) || 0,
            Scale: parseInt(state.tempTextureData?.Scale) || 100,
            Rotation: parseInt(state.tempTextureData?.Rotation) || 0,
            Opacity: Math.max(0, Math.min(100, parseInt(state.tempTextureData?.Opacity) || 100)),
            MirrorH: state.tempTextureData?.MirrorH === true,
            MirrorV: state.tempTextureData?.MirrorV === true
        };

        if (!item.Property) item.Property = { Textures: [] };
        if (!item.Property.Textures) item.Property.Textures = [];

        // 保留 Visible 字段
        const existing = item.Property.Textures[textureIndex];
        if (existing && existing.Visible !== undefined) {
            finalTexture.Visible = existing.Visible;
        } else {
            finalTexture.Visible = true;
        }

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
        resetDragState();
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }
}
