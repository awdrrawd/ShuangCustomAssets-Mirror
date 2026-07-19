/**
 * 自定义贴图道具 - 游戏多图层版本
 * 每个贴图对应一个游戏图层
 */

import { isValidImageUrl, Logger } from "@lib/utils.js";

/**
 * 单个贴图的默认属性
 */
const DEFAULT_TEXTURE = {
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
    Textures: []  // 贴图数组
};

// UI 状态
let currentEditTexture = -1;
let tempTextureData = null;

// 输入框 ID
const INPUT_URL = "CustomTextureURLInput";
const INPUT_OFFSET_X = "CustomTextureOffsetXInput";
const INPUT_OFFSET_Y = "CustomTextureOffsetYInput";
const INPUT_SCALE = "CustomTextureScaleInput";
const INPUT_ROTATION = "CustomTextureRotationInput";

// 预定义的图层名称（16 个图层）
const LAYER_NAMES = [
    "Layer1", "Layer2", "Layer3", "Layer4",
    "Layer5", "Layer6", "Layer7", "Layer8",
    "Layer9", "Layer10", "Layer11", "Layer12",
    "Layer13", "Layer14", "Layer15", "Layer16"
];

// 所有物品部位组（覆盖游戏所有 Item 分类）
const ALL_ITEM_GROUPS = [
    "ItemAddon", "ItemArms", "ItemBoots", "ItemBreast", "ItemButt",
    "ItemDevices", "ItemEars", "ItemFeet", "ItemHands", "ItemHead",
    "ItemHood", "ItemLegs", "ItemMisc", "ItemMouth", "ItemMouth2",
    "ItemMouth3", "ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints",
    "ItemNipples", "ItemNipplesPiercings", "ItemNose", "ItemPelvis",
    "ItemTorso", "ItemTorso2", "ItemVulva", "ItemVulvaPiercings",
    "ItemHandheld"
];

/**
 * 道具定义
 * 参考 echo 玩偶设计：注册到 ItemMisc + ItemHandheld，所有部位可用
 * @type {CustomAssetDefinition}
 */
const asset = {
    Name: "自定义贴图",
    Random: false,
    Left: 125,
    Top: 225,
    ParentGroup: {},
    Priority: 50,
    PoseMapping: {},
    DynamicGroupName: "ItemMisc",
    AllowColorize: false,
    Extended: true,
    Layer: LAYER_NAMES.map(name => ({ Name: name, AllowColorize: false }))
};

const translation = {
    CN: "自定义贴图",
    EN: "Custom Texture"
};

const layerNames = {
    CN: Object.fromEntries(LAYER_NAMES.map((name, i) => [name, `图层${i + 1}`])),
    EN: Object.fromEntries(LAYER_NAMES.map(name => [name, name]))
};

/**
 * 扩展配置
 */
const extended = {
    Archetype: "noarch",
    DrawImages: false,
    ScriptHooks: {
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Textures) item.Property.Textures = [];
            
            currentEditTexture = -1;
            tempTextureData = null;
            
            // 清理输入框
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION].forEach(id => ElementRemove(id));
        },

        Draw: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (currentEditTexture === -1) {
                drawTextureListMain(item);
            } else {
                drawTextureEditPanel(item, currentEditTexture, data);
            }
        },

        Click: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (currentEditTexture === -1) {
                handleTextureListClick(item, data);
            } else {
                handleTextureEditClick(item, currentEditTexture, data);
            }
        },

        Exit: (data) => {
            currentEditTexture = -1;
            tempTextureData = null;
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION].forEach(id => ElementRemove(id));
        },

        // 绘制每个图层
        AfterDraw: (data, originalFunction, drawData) => {
            const { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L } = drawData;
            
            const layerIndex = LAYER_NAMES.indexOf(L);
            if (layerIndex === -1) return;
            
            const item = CA;
            const textures = item?.Property?.Textures;
            if (!textures || layerIndex >= textures.length) return;
            
            const texture = textures[layerIndex];
            if (!texture || !texture.TextureURL || !isValidImageUrl(texture.TextureURL)) return;

            const offsetX = texture.OffsetX || 0;
            const offsetY = texture.OffsetY || 0;
            const scale = (texture.Scale || 100) / 100;
            const rotation = texture.Rotation || 0;

            const img = DrawGetImage(texture.TextureURL);
            if (!img.complete || img.naturalWidth <= 0) return;

            const width = Math.round(img.naturalWidth * scale);
            const height = Math.round(img.naturalHeight * scale);
            
            const cacheKey = `${texture.TextureURL}_${width}_${height}_${rotation}_${layerIndex}`;
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
            
            drawCanvas(tempCanvas, X + offsetX, Y + offsetY);
            drawCanvasBlink(tempCanvas, X + offsetX, Y + offsetY);
        }
    }
};

/**
 * 绘制主界面：贴图列表
 */
function drawTextureListMain(item) {
    const textures = item.Property?.Textures || [];
    
    DrawText("贴图管理", 1200, 350, "White", "Gray");
    DrawText(`已添加 ${textures.length} 个贴图（最多 16 个）`, 1200, 380, "Yellow", "Gray");
    
    const startY = 420;
    const itemHeight = 50;
    
    for (let i = 0; i < textures.length; i++) {
        const y = startY + i * itemHeight;
        const texture = textures[i];
        
        DrawRect(1150, y, 400, itemHeight - 5, "rgba(0,0,0,0.5)");
        
        const urlPreview = texture?.TextureURL 
            ? (texture.TextureURL.length > 15 ? texture.TextureURL.substring(0, 15) + "..." : texture.TextureURL)
            : "(空)";
        
        DrawText(`图层${i + 1}: ${urlPreview}`, 1160, y + 20, "White", "Black");
        
        DrawButton(1480, y + 5, 60, 35, "编辑", "White", null, false);
    }
    
    const btnY = startY + Math.max(textures.length, 1) * itemHeight + 20;
    
    // 添加按钮（最多 16 个）
    if (textures.length < 16) {
        DrawButton(1150, btnY, 195, 40, "添加新贴图", "#4CAF50", "#66BB6A", false);
    }
    DrawButton(1355, btnY, 195, 40, "确认保存", "#2196F3", "#42A5F5", false);
    
    // 导入导出按钮
    const ioBtnY = btnY + 50;
    DrawButton(1150, ioBtnY, 195, 40, "导出配置", "#FF9800", "#FFB74D", false);
    DrawButton(1355, ioBtnY, 195, 40, "导入配置", "#9C27B0", "#BA68C8", false);
}

/**
 * 处理主界面点击
 */
function handleTextureListClick(item, data) {
    const textures = item.Property?.Textures || [];
    const startY = 420;
    const itemHeight = 50;
    
    for (let i = 0; i < textures.length; i++) {
        const y = startY + i * itemHeight;
        if (MouseIn(1480, y + 5, 60, 35)) {
            currentEditTexture = i;
            tempTextureData = { ...textures[i] };
            if (!data.PersistentData) data.PersistentData = {};
            data.PersistentData._originalTexture = { ...textures[i] };
            createEditInputs(textures[i]);
            return;
        }
    }
    
    const btnY = startY + Math.max(textures.length, 1) * itemHeight + 20;
    
    if (textures.length < 16 && MouseIn(1150, btnY, 195, 40)) {
        const newTexture = { ...DEFAULT_TEXTURE };
        item.Property.Textures.push(newTexture);
        currentEditTexture = textures.length - 1;
        tempTextureData = { ...newTexture };
        if (!data.PersistentData) data.PersistentData = {};
        data.PersistentData._originalTexture = { ...newTexture };
        createEditInputs(newTexture);
        return;
    }
    
    if (MouseIn(1355, btnY, 195, 40)) {
        const C = CharacterGetCurrent();
        if (C && item) {
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            
            Logger.info("保存贴图数据:", JSON.stringify(item.Property.Textures));
            
            ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
            CharacterRefresh(C, false);
            Logger.info("贴图设置已保存并同步");
        }
        return;
    }
    
    // 导入导出按钮
    const ioBtnY = btnY + 50;
    
    // 导出配置
    if (MouseIn(1150, ioBtnY, 195, 40)) {
        exportConfig(item);
        return;
    }
    
    // 导入配置
    if (MouseIn(1355, ioBtnY, 195, 40)) {
        importConfig(item);
        return;
    }
}

/**
 * 导出配置到剪贴板
 */
function exportConfig(item) {
    const textures = item.Property?.Textures || [];
    const config = {
        type: "ShuangCustomAssets",
        version: 1,
        textures: textures
    };
    const json = JSON.stringify(config, null, 2);
    
    // 复制到剪贴板
    navigator.clipboard.writeText(json).then(() => {
        Logger.info("配置已复制到剪贴板");
        // 在游戏中显示通知
        if (typeof ChatRoomSendLocal !== "undefined") {
            ChatRoomSendLocal(`[ShuangAssets] 配置已复制到剪贴板，共 ${textures.length} 个图层`);
        }
    }).catch(err => {
        Logger.error("复制失败:", err);
        // 降级方案：创建下载
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "shuang-custom-assets-config.json";
        a.click();
        URL.revokeObjectURL(url);
    });
}

/**
 * 从剪贴板导入配置
 */
function importConfig(item) {
    navigator.clipboard.readText().then(text => {
        try {
            const config = JSON.parse(text);
            if (config.type !== "ShuangCustomAssets") {
                throw new Error("无效的配置类型");
            }
            if (!Array.isArray(config.textures)) {
                throw new Error("配置格式错误");
            }
            if (config.textures.length > 16) {
                throw new Error(`图层数量超过限制（最多 16 个，当前 ${config.textures.length} 个）`);
            }
            
            // 验证并清理数据
            const validTextures = config.textures.map(t => ({
                TextureURL: String(t.TextureURL || ""),
                OffsetX: parseInt(t.OffsetX) || 0,
                OffsetY: parseInt(t.OffsetY) || 0,
                Scale: parseInt(t.Scale) || 100,
                Rotation: parseInt(t.Rotation) || 0
            }));
            
            if (!item.Property) item.Property = { Textures: [] };
            item.Property.Textures = validTextures;
            
            Logger.info("配置导入成功:", validTextures.length, "个图层");
            
            if (typeof ChatRoomSendLocal !== "undefined") {
                ChatRoomSendLocal(`[ShuangAssets] 配置导入成功，共 ${validTextures.length} 个图层`);
            }
            
            // 刷新角色
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false);
        } catch (err) {
            Logger.error("导入失败:", err.message);
            if (typeof ChatRoomSendLocal !== "undefined") {
                ChatRoomSendLocal(`[ShuangAssets] 导入失败: ${err.message}`);
            }
        }
    }).catch(err => {
        Logger.error("读取剪贴板失败:", err);
        if (typeof ChatRoomSendLocal !== "undefined") {
            ChatRoomSendLocal(`[ShuangAssets] 读取剪贴板失败，请确保已复制配置 JSON`);
        }
    });
}

/**
 * 创建编辑输入框
 */
function createEditInputs(texture) {
    let input = ElementCreateInput(INPUT_URL, "text", texture.TextureURL || "", "1000");
    if (input) {
        input.setAttribute("placeholder", "https://...");
        input.style.width = "350px";
    }
    
    input = ElementCreateInput(INPUT_OFFSET_X, "number", String(texture.OffsetX || 0), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_OFFSET_Y, "number", String(texture.OffsetY || 0), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_SCALE, "number", String(texture.Scale || 100), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_ROTATION, "number", String(texture.Rotation || 0), "10");
    if (input) input.style.width = "80px";
}

/**
 * 绘制编辑面板
 */
function drawTextureEditPanel(item, textureIndex, data) {
    const urlInput = document.getElementById(INPUT_URL);
    const offsetXInput = document.getElementById(INPUT_OFFSET_X);
    const offsetYInput = document.getElementById(INPUT_OFFSET_Y);
    const scaleInput = document.getElementById(INPUT_SCALE);
    const rotationInput = document.getElementById(INPUT_ROTATION);
    
    if (tempTextureData) {
        const newUrl = urlInput?.value?.trim() || "";
        const newOffsetX = parseInt(offsetXInput?.value) || 0;
        const newOffsetY = parseInt(offsetYInput?.value) || 0;
        const newScale = parseInt(scaleInput?.value) || 100;
        const newRotation = parseInt(rotationInput?.value) || 0;
        
        if (tempTextureData.TextureURL !== newUrl ||
            tempTextureData.OffsetX !== newOffsetX ||
            tempTextureData.OffsetY !== newOffsetY ||
            tempTextureData.Scale !== newScale ||
            tempTextureData.Rotation !== newRotation) {
            
            tempTextureData.TextureURL = newUrl;
            tempTextureData.OffsetX = newOffsetX;
            tempTextureData.OffsetY = newOffsetY;
            tempTextureData.Scale = newScale;
            tempTextureData.Rotation = newRotation;
            
            const textures = item.Property?.Textures || [];
            textures[textureIndex] = { ...tempTextureData };
            
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false);
            
            if (isValidImageUrl(newUrl)) DrawGetImage(newUrl);
        }
    }
    
    DrawText(`编辑图层${textureIndex + 1}`, 1200, 350, "White", "Gray");
    
    let y = 400;
    const lineHeight = 45;
    
    DrawText("贴图 URL:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_URL, 1300, y - 5, 350, 35);
    y += lineHeight;
    
    DrawText("X 偏移:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_OFFSET_X, 1300, y - 5, 100, 30);
    y += lineHeight;
    
    DrawText("Y 偏移:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_OFFSET_Y, 1300, y - 5, 100, 30);
    y += lineHeight;
    
    DrawText("缩放 %:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_SCALE, 1300, y - 5, 100, 30);
    y += lineHeight;
    
    DrawText("旋转 °:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_ROTATION, 1300, y - 5, 100, 30);
    y += lineHeight + 20;
    
    DrawText("修改后自动预览，点击「确认」返回列表", 1300, y, "Yellow", "Black");
    y += 30;
    
    DrawButton(1150, y, 150, 35, "删除此贴图", "#F44336", "#E57373", false);
    DrawButton(1310, y, 120, 35, "确认", "#4CAF50", "#66BB6A", false);
    DrawButton(1440, y, 120, 35, "取消", "#9E9E9E", "#BDBDBD", false);
}

/**
 * 处理编辑点击
 */
function handleTextureEditClick(item, textureIndex, data) {
    let y = 400;
    const lineHeight = 45;
    y += lineHeight * 5 + 20 + 30;  // 5个输入行 + 提示行
    
    if (MouseIn(1150, y, 150, 35)) {
        item.Property.Textures.splice(textureIndex, 1);
        currentEditTexture = -1;
        tempTextureData = null;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION].forEach(id => ElementRemove(id));
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false);
        return;
    }
    
    if (MouseIn(1310, y, 120, 35)) {
        const urlInput = document.getElementById(INPUT_URL);
        const offsetXInput = document.getElementById(INPUT_OFFSET_X);
        const offsetYInput = document.getElementById(INPUT_OFFSET_Y);
        const scaleInput = document.getElementById(INPUT_SCALE);
        const rotationInput = document.getElementById(INPUT_ROTATION);
        
        const finalTexture = {
            TextureURL: urlInput?.value?.trim() || "",
            OffsetX: parseInt(offsetXInput?.value) || 0,
            OffsetY: parseInt(offsetYInput?.value) || 0,
            Scale: parseInt(scaleInput?.value) || 100,
            Rotation: parseInt(rotationInput?.value) || 0
        };
        
        if (!item.Property) item.Property = { Textures: [] };
        if (!item.Property.Textures) item.Property.Textures = [];
        
        item.Property.Textures[textureIndex] = finalTexture;
        
        currentEditTexture = -1;
        tempTextureData = null;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION].forEach(id => ElementRemove(id));
        return;
    }
    
    if (MouseIn(1440, y, 120, 35)) {
        const originalTexture = data.PersistentData?._originalTexture;
        if (originalTexture) {
            item.Property.Textures[textureIndex] = { ...originalTexture };
        }
        currentEditTexture = -1;
        tempTextureData = null;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION].forEach(id => ElementRemove(id));
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false);
        return;
    }
}

const assetStrings = {
    CN: { SelectBase: "贴图管理" },
    EN: { SelectBase: "Texture Manager" }
};

export default function register(AssetManager) {
    // 注册到所有物品部位组，让玩家可以在任何部位使用
    AssetManager.addAssetWithConfig(ALL_ITEM_GROUPS, asset, {
        layerNames,
        extended,
        translation,
        assetStrings
    });
}
