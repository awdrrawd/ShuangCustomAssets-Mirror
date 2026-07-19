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
    OffsetX: 1,
    OffsetY: 1,
    Scale: 100,
    Rotation: 0,
    Visible: true,   // 可见开关
    Opacity: 100     // 透明度（0-100）
};

/**
 * 道具的默认属性
 */
const DEFAULT_PROPS = {
    Textures: [],          // 贴图数组
    HideBody: false,       // 隐藏玩家身体（非道具）模型
    HideOtherItems: false  // 隐藏其他道具模型
};

// UI 状态
let currentEditTexture = -1;
let tempTextureData = null;

/**
 * 身体/外观组（非 Item 开头的组）
 * 用于 HideBody 开关：打开后这些组全部不渲染
 */
const BODY_GROUPS = [
    "BodyUpper", "BodyLower", "Head", "Mouth", "Eyes", "Eyes2", "Eyebrows",
    "Blush", "HairFront", "HairBack", "HairAccessory1", "Hat", "Glasses",
    "Mask", "Necklace", "Bra", "Panties", "Pussy", "Nipples", "Suit",
    "SuitLower", "Cloth", "ClothLower", "ClothOuter", "ClothAccessory",
    "Corset", "Garters", "Socks", "SocksLeft", "SocksRight", "Shoes",
    "Gloves", "Bracelet", "AnkletLeft", "AnkletRight", "HandsLeft",
    "HandsRight", "HandAccessoryLeft", "HandAccessoryRight", "TailStraps",
    "Wings", "Jewelry", "BodyMarkings", "FaceMarkings", "FacialHair",
    "EyeShadow", "Fluids", "Decals", "Activity", "Emoticon"
];

/**
 * 根据 HideBody / HideOtherItems 开关，重新计算 Property.Hide 数组
 * Property.Hide 是 BC 原生支持的隐藏机制：数组中列出的组名对应的图层都不渲染
 * 注意：必须排除当前道具自己所在的组，否则会把自己也隐藏掉
 * @param {Item} item - 当前道具
 */
function updateHideArray(item) {
    if (!item || !item.Property) return;
    const hideBody = item.Property.HideBody === true;
    const hideOtherItems = item.Property.HideOtherItems === true;

    /** @type {string[]} */
    const hide = [];
    if (hideBody) hide.push(...BODY_GROUPS);
    if (hideOtherItems) {
        const currentGroup = item.Asset?.Group?.Name;
        ALL_ITEM_GROUPS.forEach(g => {
            if (g !== currentGroup) hide.push(g);
        });
    }

    if (hide.length > 0) {
        item.Property.Hide = hide;
    } else {
        // 清理空数组，避免持久化时产生冗余数据
        delete item.Property.Hide;
    }
}

// 输入框 ID
const INPUT_URL = "CustomTextureURLInput";
const INPUT_OFFSET_X = "CustomTextureOffsetXInput";
const INPUT_OFFSET_Y = "CustomTextureOffsetYInput";
const INPUT_SCALE = "CustomTextureScaleInput";
const INPUT_ROTATION = "CustomTextureRotationInput";
const INPUT_OPACITY = "CustomTextureOpacityInput";

// 可见开关按钮 ID 前缀
const VISIBLE_BTN_PREFIX = "CustomTextureVisibleBtn_";

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
    // 声明自定义属性的字段及默认值类型
    // BC 的 Crafting 系统会根据 baselineProperty 的键来决定保存哪些属性
    BaselineProperty: {
        Textures: [],          // 贴图数组，每个元素包含 TextureURL/OffsetX/OffsetY/Scale/Rotation
        HideBody: false,       // 隐藏玩家身体模型开关
        HideOtherItems: false, // 隐藏其他道具模型开关
        Hide: []               // 隐藏组数组（由 HideBody/HideOtherItems 派生，需同步保存）
    },
    ScriptHooks: {
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Textures) item.Property.Textures = [];
            // 兼容旧数据：补齐新开关字段
            if (item.Property.HideBody === undefined) item.Property.HideBody = false;
            if (item.Property.HideOtherItems === undefined) item.Property.HideOtherItems = false;
            // 根据开关刷新 Hide 数组，确保生效
            updateHideArray(item);

            currentEditTexture = -1;
            tempTextureData = null;

            // 清理输入框
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
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
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
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
            // 不可见则跳过
            if (texture.Visible === false) return;

            const offsetX = texture.OffsetX || 0;
            const offsetY = texture.OffsetY || 0;
            const scale = (texture.Scale || 100) / 100;
            const rotation = texture.Rotation || 0;
            const opacity = Math.max(0, Math.min(100, texture.Opacity ?? 100)) / 100;

            const img = DrawGetImage(texture.TextureURL);
            if (!img.complete || img.naturalWidth <= 0) return;

            const width = Math.round(img.naturalWidth * scale);
            const height = Math.round(img.naturalHeight * scale);
            
            // 缓存键包含透明度，透明度变化时重新生成 canvas
            const cacheKey = `${texture.TextureURL}_${width}_${height}_${rotation}_${opacity}_${layerIndex}`;
            let tempCanvas = data.PersistentData?.[cacheKey];
            
            if (!tempCanvas) {
                tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
                const ctx = tempCanvas.getContext("2d");
                ctx.clearRect(0, 0, width, height);
                ctx.save();
                ctx.globalAlpha = opacity;
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
    
    // 模型隐藏开关区（位于副标题下方，列表上方）
    const hideBody = item.Property?.HideBody === true;
    const hideOtherItems = item.Property?.HideOtherItems === true;
    const HIDE_BTN_Y = 405;
    DrawText("隐藏身体模型:", 1150, HIDE_BTN_Y + 22, "White", "Gray");
    DrawButton(1500, HIDE_BTN_Y, 70, 35, hideBody ? "开" : "关",
        hideBody ? "#F44336" : "#666666",
        hideBody ? "#E57373" : "#999999", false);
    if (hideBody) {
        DrawText("(已屏蔽所有身体/服装组)", 1580, HIDE_BTN_Y + 22, "#FFB74D", "Black");
    }
    
    const HIDE_OTHER_Y = 445;
    DrawText("隐藏其他道具:", 1150, HIDE_OTHER_Y + 22, "White", "Gray");
    DrawButton(1500, HIDE_OTHER_Y, 70, 35, hideOtherItems ? "开" : "关",
        hideOtherItems ? "#F44336" : "#666666",
        hideOtherItems ? "#E57373" : "#999999", false);
    if (hideOtherItems) {
        DrawText("(仅保留本道具所在组)", 1580, HIDE_OTHER_Y + 22, "#FFB74D", "Black");
    }
    
    if (hideBody && hideOtherItems) {
        DrawText("⚠ 双开模式：仅渲染当前自定义贴图图层", 1200, 495, "#FF5252", "Black");
    }
    
    const startY = 530;
    const itemHeight = 50;
    
    for (let i = 0; i < textures.length; i++) {
        const y = startY + i * itemHeight;
        const texture = textures[i];
        
        DrawRect(1150, y, 400, itemHeight - 5, "rgba(0,0,0,0.5)");
        
        const urlPreview = texture?.TextureURL 
            ? (texture.TextureURL.length > 12 ? texture.TextureURL.substring(0, 12) + "..." : texture.TextureURL)
            : "(空)";
        
        DrawText(`图层${i + 1}: ${urlPreview}`, 1160, y + 20, "White", "Black");
        
        // 可见开关
        const isVisible = texture?.Visible !== false;
        DrawButton(1390, y + 5, 70, 35, isVisible ? "可见" : "隐藏", 
            isVisible ? "#4CAF50" : "#666666", 
            isVisible ? "#66BB6A" : "#999999", false);
        
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

    // 隐藏身体模型开关
    if (MouseIn(1500, 405, 70, 35)) {
        if (!item.Property) item.Property = { ...DEFAULT_PROPS };
        item.Property.HideBody = !(item.Property.HideBody === true);
        updateHideArray(item);
        Logger.info(`HideBody 切换为: ${item.Property.HideBody}, Hide 数组长度: ${item.Property.Hide?.length || 0}`);
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false);
        return;
    }

    // 隐藏其他道具开关
    if (MouseIn(1500, 445, 70, 35)) {
        if (!item.Property) item.Property = { ...DEFAULT_PROPS };
        item.Property.HideOtherItems = !(item.Property.HideOtherItems === true);
        updateHideArray(item);
        Logger.info(`HideOtherItems 切换为: ${item.Property.HideOtherItems}, Hide 数组长度: ${item.Property.Hide?.length || 0}`);
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false);
        return;
    }

    const startY = 530;
    const itemHeight = 50;
    
    for (let i = 0; i < textures.length; i++) {
        const y = startY + i * itemHeight;
        // 可见开关
        if (MouseIn(1390, y + 5, 70, 35)) {
            textures[i].Visible = textures[i].Visible === false ? true : false;
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false);
            return;
        }
        // 编辑按钮
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
            // 保存前确保 Hide 数组与开关一致
            updateHideArray(item);
            
            Logger.info("保存贴图数据:", JSON.stringify(item.Property.Textures));
            Logger.info(`隐藏开关 - HideBody: ${item.Property.HideBody}, HideOtherItems: ${item.Property.HideOtherItems}`);
            
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
        version: 2,
        textures: textures,
        hideBody: item.Property?.HideBody === true,
        hideOtherItems: item.Property?.HideOtherItems === true
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
                Rotation: parseInt(t.Rotation) || 0,
                Visible: t.Visible !== false,
                Opacity: Math.max(0, Math.min(100, parseInt(t.Opacity) || 100))
            }));
            
            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            item.Property.Textures = validTextures;
            // 同步导入隐藏开关（兼容 v1 旧配置：无该字段时默认 false）
            item.Property.HideBody = config.hideBody === true;
            item.Property.HideOtherItems = config.hideOtherItems === true;
            updateHideArray(item);
            
            Logger.info("配置导入成功:", validTextures.length, "个图层", `HideBody=${item.Property.HideBody}, HideOtherItems=${item.Property.HideOtherItems}`);
            
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
    
    input = ElementCreateInput(INPUT_OFFSET_X, "number", String(texture.OffsetX ?? 1), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_OFFSET_Y, "number", String(texture.OffsetY ?? 1), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_SCALE, "number", String(texture.Scale || 100), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_ROTATION, "number", String(texture.Rotation || 0), "10");
    if (input) input.style.width = "80px";
    
    input = ElementCreateInput(INPUT_OPACITY, "number", String(texture.Opacity ?? 100), "10");
    if (input) {
        input.style.width = "80px";
        input.min = "0";
        input.max = "100";
    }
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
    const opacityInput = document.getElementById(INPUT_OPACITY);
    
    if (tempTextureData) {
        const newUrl = urlInput?.value?.trim() || "";
        const newOffsetX = parseInt(offsetXInput?.value) || 0;
        const newOffsetY = parseInt(offsetYInput?.value) || 0;
        const newScale = parseInt(scaleInput?.value) || 100;
        const newRotation = parseInt(rotationInput?.value) || 0;
        const newOpacity = Math.max(0, Math.min(100, parseInt(opacityInput?.value) || 100));
        
        if (tempTextureData.TextureURL !== newUrl ||
            tempTextureData.OffsetX !== newOffsetX ||
            tempTextureData.OffsetY !== newOffsetY ||
            tempTextureData.Scale !== newScale ||
            tempTextureData.Rotation !== newRotation ||
            tempTextureData.Opacity !== newOpacity) {
            
            tempTextureData.TextureURL = newUrl;
            tempTextureData.OffsetX = newOffsetX;
            tempTextureData.OffsetY = newOffsetY;
            tempTextureData.Scale = newScale;
            tempTextureData.Rotation = newRotation;
            tempTextureData.Opacity = newOpacity;
            
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
    y += lineHeight;
    
    DrawText("透明度 %:", 1150, y, "White", "Gray");
    ElementPosition(INPUT_OPACITY, 1300, y - 5, 100, 30);
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
    y += lineHeight * 6 + 20 + 30;  // 6个输入行 + 提示行
    
    if (MouseIn(1150, y, 150, 35)) {
        item.Property.Textures.splice(textureIndex, 1);
        currentEditTexture = -1;
        tempTextureData = null;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
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
        const opacityInput = document.getElementById(INPUT_OPACITY);
        
        const finalTexture = {
            TextureURL: urlInput?.value?.trim() || "",
            OffsetX: parseInt(offsetXInput?.value) || 0,
            OffsetY: parseInt(offsetYInput?.value) || 0,
            Scale: parseInt(scaleInput?.value) || 100,
            Rotation: parseInt(rotationInput?.value) || 0,
            Opacity: Math.max(0, Math.min(100, parseInt(opacityInput?.value) || 100))
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
        
        currentEditTexture = -1;
        tempTextureData = null;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        return;
    }
    
    if (MouseIn(1440, y, 120, 35)) {
        const originalTexture = data.PersistentData?._originalTexture;
        if (originalTexture) {
            item.Property.Textures[textureIndex] = { ...originalTexture };
        }
        currentEditTexture = -1;
        tempTextureData = null;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
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
