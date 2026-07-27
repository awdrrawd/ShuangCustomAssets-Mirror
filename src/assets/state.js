/**
 * 自定义贴图道具 - 共享可变状态
 * 所有模块通过 state.xxx 访问和修改共享状态，确保同一引用
 */

export const state = {
    currentEditTexture: -1,
    tempTextureData: null,
    currentListPage: 0,
    currentView: "list", // "list" | "hide" | "addDomainConfirm"
    pendingDomainToAdd: null, // 待确认添加的域名
    // 进入编辑前的原始贴图数据（用于「退出=取消编辑并返回列表」时还原）
    originalEditTexture: null,

    // 图层优先级（OverridePriority）的临时值和原始值（用于取消编辑时还原）
    tempPriority: 50,
    originalOverridePriority: undefined,

    // === 编辑图层 - "移动"拖拽模式 ===
    isDragMode: false,     // 是否已开启拖拽模式（点击「移动」按钮切换）
    dragActive: false,     // 当前是否正在进行一次拖拽（鼠标/触摸按住且位于角色预览区域内）
    dragStartMouseX: 0,    // 本次拖拽开始时的鼠标 X（虚拟画布坐标）
    dragStartMouseY: 0,    // 本次拖拽开始时的鼠标 Y
    dragStartOffsetX: 0,   // 本次拖拽开始时的 OffsetX
    dragStartOffsetY: 0,   // 本次拖拽开始时的 OffsetY

    // === CharacterRefresh 节流 ===
    _lastTextureRefresh: 0,       // 上次刷新时间戳
    _pendingTextureRefresh: false, // 是否有待刷新

    // === 顶部状态提示（导入/导出等结果） ===
    statusMessage: null,      // { text: string, color: string }
    statusMessageExpiry: 0,   // 时间戳，超过则不再显示

    // === 字段变更标记 ===
    _fieldsDirty: false,

    // === 鼠标/触摸按下状态（由 document 事件监听器维护） ===
    _pointerDown: false,
    _stepperListenerReady: false,
};

/**
 * 重置"移动"拖拽模式状态（进入/退出编辑图层时调用，避免状态残留到下一次编辑）
 */
export function resetDragState() {
    state.isDragMode = false;
    state.dragActive = false;
}

/**
 * 显示一条临时状态提示（用于导入/导出结果）
 * @param {string} text
 * @param {string} [color]
 * @param {number} [durationMs]
 */
export function showStatus(text, color = "#4CAF50", durationMs = 5000) {
    state.statusMessage = { text, color };
    state.statusMessageExpiry = Date.now() + durationMs;
}
