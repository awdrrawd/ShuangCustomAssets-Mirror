/**
 * 自定义贴图道具 - 多图层版本
 * 支持多个独立图层，每个图层可单独调整位置、缩放、旋转
 */

import { isValidImageUrl, Logger } from "@lib/utils.js";

/**
 * 单个图层的默认属性
 */
const DEFAULT_LAYER = {
    TextureURL: "",
    OffsetX: 0,
    OffsetY: 0,
    Scale: 100,
    Rotation: 0
};

/**
 * 道具的默认属性
 */
const DEFAULT_PROPS = {
    Layers: []  // 图层数组
};

// UI 状态
let currentEditLayer = -1;  // 当前编辑的图层索引，-1 表示主界面
let tempLayerData = null;    // 临时存储编辑中的数据

// 输入框 ID
const INPUT_URL = "CustomTextureURLInput";
const INPUT_OFFSET_X = "CustomTextureOffsetXInput";
const INPUT_OFFSET_Y = "CustomTextureOffsetYInput";
const INPUT_SCALE = "CustomTextureScaleInput";
const INPUT_ROTATION = "CustomTextureRotationInput";

/**
 * 道具定义
 * @type {CustomAssetDefinition}
 */
const asset = {
    Name: "自定义贴图",
    Random: false,
    Gender: "F",
    Top: 0,
    Left: 0,
    Difficulty: 1,
    Time: 3,
    RemoveTime: 1,
    DrawImages: false,
    AllowColorize: false,
    Extended: true,
    Prerequisite: [],
    ParentGroup: {},
    PoseMapping: { BaseUpper: "BaseUpper" },
    Block: [],
    Layer: [
        { Name: "Main", Priority: 46 }
    ]
};

const translation = {
    CN: "自定义贴图",
    EN: "Custom Texture"
};

const layerNames = {
    CN: { Main: "主体" },
    EN: { Main: "Main" }
};

/**
 * 绘制游戏风格的按钮
 */
function drawButton(Text, X, Y, W, H, Color, HoverColor, Disabled = false) {
    const Hover = MouseIn(X, Y, W, H);
    const BgColor = Disabled ? "#666" : (Hover ? HoverColor : Color);
    
    DrawRect(X, Y, W, H, BgColor);
    DrawTextFit(Text, X + W / 2, Y + H / 2, W - 10, "White", "Black");
    
    return Hover && !Disabled;
}

/**
 * 扩展配置
 */
const extended = {
    Archetype: "noarch",
    DrawImages: false,
    ScriptHooks: {
        // ===== 加载 =====
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            // 确保 Property 存在
            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Layers) item.Property.Layers = [];
            
            // 重置 UI 状态
            currentEditLayer = -1;
            tempLayerData = null;
            
            // 清理可能存在的输入框
            ElementRemove(INPUT_URL);
            ElementRemove(INPUT_OFFSET_X);
            ElementRemove(INPUT_OFFSET_Y);
            ElementRemove(INPUT_SCALE);
            ElementRemove(INPUT_ROTATION);
        },

        // ===== 绘制界面 =====
        Draw: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (currentEditLayer === -1) {
                // === 主界面：图层列表 ===
                drawLayerListMain(item);
            } else {
                // === 图层编辑界面 ===
                drawLayerEditPanel(item, currentEditLayer, data);
            }
        },

        // ===== 点击处理 =====
        Click: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (currentEditLayer === -1) {
                // 主界面点击
                handleLayerListClick(item, data);
            } else {
                // 编辑界面点击
                handleLayerEditClick(item, currentEditLayer, data);
            }
        },

        // ===== 退出清理 =====
        Exit: (data) => {
            currentEditLayer = -1;
            tempLayerData = null;
            // 清理输入框
            ElementRemove(INPUT_URL);
            ElementRemove(INPUT_OFFSET_X);
            ElementRemove(INPUT_OFFSET_Y);
            ElementRemove(INPUT_SCALE);
            ElementRemove(INPUT_ROTATION);
        },

        // ===== 绘制到角色身上 =====
        AfterDraw: (data, originalFunction, drawData) => {
            const { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L } = drawData;
            
            if (L !== "Main") return;
            
            const item = CA;
            const layers = item?.Property?.Layers;
            if (!layers || layers.length === 0) return;

            // 遍历所有图层并绘制
            for (const layer of layers) {
                const url = layer?.TextureURL;
                if (!url || !isValidImageUrl(url)) continue;

                const offsetX = layer.OffsetX || 0;
                const offsetY = layer.OffsetY || 0;
                const scale = (layer.Scale || 100) / 100;
                const rotation = layer.Rotation || 0;

                const img = DrawGetImage(url);
                if (!img.complete || img.naturalWidth <= 0) continue;

                const width = Math.round(img.naturalWidth * scale);
                const height = Math.round(img.naturalHeight * scale);
                
                const cacheKey = `${url}_${width}_${height}_${rotation}`;
                let tempCanvas = data.PersistentData?.[cacheKey];
                
                if (!tempCanvas) {
                    tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
                    const ctx = tempCanvas.getContext("2d");
                    ctx.clearRect(0, 0, width, height);
                    ctx.save();
                    ctx.translate(width / 2, height / 2);
                    ctx.rotate(rotation * Math.PI / 180);
                    ctx.translate(-width / 2, -height / 2);
                    ctx.drawImage(img, 0, 0, width, height);
                    ctx.restore();
                    
                    if (!data.PersistentData) data.PersistentData = {};
                    data.PersistentData[cacheKey] = tempCanvas;
                }
                
                const drawX = X + offsetX;
                const drawY = Y + offsetY;
                drawCanvas(tempCanvas, drawX, drawY);
                drawCanvasBlink(tempCanvas, drawX, drawY);
            }
        }
    }
};

/**
 * 绘制主界面：图层列表
 */
function drawLayerListMain(item) {
    const layers = item.Property?.Layers || [];
    
    // 标题
    DrawText("图层管理", 1200, 350, "White", "Gray");
    DrawText(`共 ${layers.length} 个图层`, 1200, 380, "Yellow", "Gray");
    
    // 绘制图层列表
    const startY = 420;
    const itemHeight = 50;
    
    for (let i = 0; i < layers.length; i++) {
        const y = startY + i * itemHeight;
        const layer = layers[i];
        
        // 图层背景
        DrawRect(1150, y, 400, itemHeight - 5, "rgba(0,0,0,0.5)");
        
        // 图层名称/URL 预览（限制长度）
        const urlPreview = layer?.TextureURL 
            ? (layer.TextureURL.length > 20 ? layer.TextureURL.substring(0, 20) + "..." : layer.TextureURL)
            : "(空)";
        DrawText(`图层 ${i + 1}: ${urlPreview}`, 1160, y + 25, "White", "Black");
        
        // 编辑按钮
        DrawButton(1480, y + 5, 60, 35, "编辑", "White", null, false);
    }
    
    // 底部按钮
    const btnY = startY + Math.max(layers.length, 1) * itemHeight + 20;
    DrawButton(1150, btnY, 195, 40, "添加新图层", "#4CAF50", "#66BB6A", false);
    DrawButton(1355, btnY, 195, 40, "确认保存", "#2196F3", "#42A5F5", false);
    
    // 说明
    DrawText("点击图层右侧的「编辑」按钮调整参数", 1200, btnY + 60, "Gray", "Black");
}

/**
 * 处理主界面点击
 */
function handleLayerListClick(item, data) {
    const layers = item.Property?.Layers || [];
    const startY = 420;
    const itemHeight = 50;
    
    // 检查图层编辑按钮
    for (let i = 0; i < layers.length; i++) {
        const y = startY + i * itemHeight;
        if (MouseIn(1480, y + 5, 60, 35)) {
            currentEditLayer = i;
            tempLayerData = { ...layers[i] };
            // 保存原始数据以便取消时恢复
            if (!data.PersistentData) data.PersistentData = {};
            data.PersistentData._originalLayer = { ...layers[i] };
            // 创建输入框
            createEditInputs(layers[i]);
            return;
        }
    }
    
    // 检查添加按钮
    const btnY = startY + Math.max(layers.length, 1) * itemHeight + 20;
    if (MouseIn(1150, btnY, 195, 40)) {
        const newLayer = { ...DEFAULT_LAYER };
        item.Property.Layers.push(newLayer);
        currentEditLayer = layers.length - 1;
        tempLayerData = { ...newLayer };
        // 保存原始数据
        if (!data.PersistentData) data.PersistentData = {};
        data.PersistentData._originalLayer = { ...newLayer };
        // 创建输入框
        createEditInputs(newLayer);
        return;
    }
    
    // 检查确认保存按钮
    if (MouseIn(1355, btnY, 195, 40)) {
        const C = CharacterGetCurrent();
        if (C && item) {
            ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
            CharacterRefresh(C, false);
            Logger.info("贴图设置已保存并同步");
        }
    }
}

/**
 * 创建编辑输入框
 */
function createEditInputs(layer) {
    // URL 输入框
    let input = ElementCreateInput(INPUT_URL, "text", layer.TextureURL || "", "1000");
    if (input) {
        input.setAttribute("placeholder", "https://...");
        input.style.width = "350px";
    }
    
    // X 偏移
    input = ElementCreateInput(INPUT_OFFSET_X, "number", String(layer.OffsetX || 0), "10");
    if (input) input.style.width = "80px";
    
    // Y 偏移
    input = ElementCreateInput(INPUT_OFFSET_Y, "number", String(layer.OffsetY || 0), "10");
    if (input) input.style.width = "80px";
    
    // 缩放
    input = ElementCreateInput(INPUT_SCALE, "number", String(layer.Scale || 100), "10");
    if (input) input.style.width = "80px";
    
    // 旋转
    input = ElementCreateInput(INPUT_ROTATION, "number", String(layer.Rotation || 0), "10");
    if (input) input.style.width = "80px";
}

/**
 * 绘制图层编辑面板
 */
function drawLayerEditPanel(item, layerIndex, data) {
    // 从输入框获取最新值
    const urlInput = document.getElementById(INPUT_URL);
    const offsetXInput = document.getElementById(INPUT_OFFSET_X);
    const offsetYInput = document.getElementById(INPUT_OFFSET_Y);
    const scaleInput = document.getElementById(INPUT_SCALE);
    const rotationInput = document.getElementById(INPUT_ROTATION);
    
    // 更新临时数据
    if (tempLayerData) {
        const newUrl = urlInput?.value?.trim() || "";
        const newOffsetX = parseInt(offsetXInput?.value) || 0;
        const newOffsetY = parseInt(offsetYInput?.value) || 0;
        const newScale = parseInt(scaleInput?.value) || 100;
        const newRotation = parseInt(rotationInput?.value) || 0;
        
        // 检查是否有变化
        if (tempLayerData.TextureURL !== newUrl ||
            tempLayerData.OffsetX !== newOffsetX ||
            tempLayerData.OffsetY !== newOffsetY ||
            tempLayerData.Scale !== newScale ||
            tempLayerData.Rotation !== newRotation) {
            
            tempLayerData.TextureURL = newUrl;
            tempLayerData.OffsetX = newOffsetX;
            tempLayerData.OffsetY = newOffsetY;
            tempLayerData.Scale = newScale;
            tempLayerData.Rotation = newRotation;
            
            // 实时应用到图层并刷新角色
            const layers = item.Property?.Layers || [];
            layers[layerIndex] = { ...tempLayerData };
            
            const C = CharacterGetCurrent();
            if (C) {
                CharacterRefresh(C, false);
            }
            
            // 预加载图片
            if (isValidImageUrl(newUrl)) {
                DrawGetImage(newUrl);
            }
        }
    }
    
    // 标题
    DrawText(`编辑图层 ${layerIndex + 1}`, 1200, 350, "White", "Gray");
    
    let y = 400;
    const lineHeight = 45;
    
    // URL 输入
    DrawText("贴图 URL:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_URL, 1300, y - 5, 350, 35);
    y += lineHeight;
    
    // X 偏移
    DrawText("X 偏移:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_OFFSET_X, 1300, y - 5, 100, 30);
    y += lineHeight;
    
    // Y 偏移
    DrawText("Y 偏移:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_OFFSET_Y, 1300, y - 5, 100, 30);
    y += lineHeight;
    
    // 缩放
    DrawText("缩放 %:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_SCALE, 1300, y - 5, 100, 30);
    y += lineHeight;
    
    // 旋转
    DrawText("旋转 °:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_ROTATION, 1300, y - 5, 100, 30);
    y += lineHeight + 20;
    
    // 提示
    DrawText("修改后自动预览，点击「确认」返回列表", 1300, y, "Yellow", "Black");
    y += 30;
    
    // 删除图层按钮
    DrawButton(1150, y, 150, 35, "删除此图层", "#F44336", "#E57373", false);
    // 确认按钮
    DrawButton(1310, y, 120, 35, "确认", "#4CAF50", "#66BB6A", false);
    // 取消按钮
    DrawButton(1440, y, 120, 35, "取消", "#9E9E9E", "#BDBDBD", false);
}

/**
 * 处理编辑界面点击
 */
function handleLayerEditClick(item, layerIndex, data) {
    // 计算 y 位置
    let y = 400;
    const lineHeight = 45;
    y += lineHeight * 5 + 20 + 30;  // 5个输入行 + 额外间距 + 提示行
    
    // 删除图层
    if (MouseIn(1150, y, 150, 35)) {
        const layers = item.Property?.Layers || [];
        layers.splice(layerIndex, 1);
        currentEditLayer = -1;
        tempLayerData = null;
        // 清理输入框
        ElementRemove(INPUT_URL);
        ElementRemove(INPUT_OFFSET_X);
        ElementRemove(INPUT_OFFSET_Y);
        ElementRemove(INPUT_SCALE);
        ElementRemove(INPUT_ROTATION);
        // 刷新角色
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false);
        return;
    }
    
    // 确认按钮
    if (MouseIn(1310, y, 120, 35)) {
        // 将临时数据应用到图层
        if (tempLayerData) {
            const layers = item.Property?.Layers || [];
            layers[layerIndex] = { ...tempLayerData };
        }
        currentEditLayer = -1;
        tempLayerData = null;
        // 清理输入框
        ElementRemove(INPUT_URL);
        ElementRemove(INPUT_OFFSET_X);
        ElementRemove(INPUT_OFFSET_Y);
        ElementRemove(INPUT_SCALE);
        ElementRemove(INPUT_ROTATION);
        return;
    }
    
    // 取消按钮
    if (MouseIn(1440, y, 120, 35)) {
        // 恢复原数据
        const layers = item.Property?.Layers || [];
        if (tempLayerData) {
            // 恢复到编辑前的状态
            const originalLayer = data.PersistentData?._originalLayer;
            if (originalLayer) {
                layers[layerIndex] = { ...originalLayer };
            }
        }
        currentEditLayer = -1;
        tempLayerData = null;
        // 清理输入框
        ElementRemove(INPUT_URL);
        ElementRemove(INPUT_OFFSET_X);
        ElementRemove(INPUT_OFFSET_Y);
        ElementRemove(INPUT_SCALE);
        ElementRemove(INPUT_ROTATION);
        // 刷新角色
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false);
        return;
    }
}

const assetStrings = {
    CN: { SelectBase: "图层管理" },
    EN: { SelectBase: "Layer Manager" }
};

export default function register(AssetManager) {
    AssetManager.addAssetWithConfig("ItemHands", asset, {
        layerNames,
        extended,
        translation,
        assetStrings
    });
}