/**
 * 自定义贴图道具 - 游戏多图层版本
 * 每个贴图对应一个游戏图层
 */

import { isValidImageUrl, Logger } from "@lib/utils.js";
import { isUrlAllowed, isDomainInWhitelist, extractDomain, addDomainToWhitelist } from "./settings.js";

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
    HideCosplay: false,    // 隐藏 cosplay 部位
    HideFacial: false,     // 隐藏五官
    HideBody: false,       // 隐藏身体
    HideClothing: false,   // 隐藏服饰
    HideItems: false       // 隐藏拘束道具
};

// UI 状态
let currentEditTexture = -1;
let tempTextureData = null;
let currentListPage = 0;
let currentView = "list"; // "list" | "hide" | "addDomainConfirm"
let pendingDomainToAdd = null; // 待确认添加的域名

// 每页显示的贴图数量
const TEXTURES_PER_PAGE = 6;

/**
 * 隐藏分类配置
 * 每个分类包含: key(属性名), label(显示名称), groups(组名数组)
 */
const HIDE_CATEGORIES = [
    {
        key: "HideCosplay",
        label: "cosplay",
        groups: [
            "HairFront", "HairBack", "新前发_Luzi", "新后发_Luzi", "额外头发_Luzi",
            "新前发_Luzi_stack", "新后发_Luzi_stack",
            "TailStraps", "Luzi_TailStraps_0",
            "Wings", "Wings_笨笨蛋Luzi",
            "动物身体_Luzi", "额外身高_Luzi"
        ]
    },
    {
        key: "HideFacial",
        label: "五官",
        groups: [
            "Eyes", "Eyes2", "Eyebrows", "Blush", "EyeShadow",
            "FacialHair", "Mouth", "左眼_Luzi", "右眼_Luzi"
        ]
    },
    {
        key: "HideBody",
        label: "身体",
        groups: [
            "Emoticon", "Head", "BodyUpper", "BodyLower", "Height",
            "BodyStyle", "Pronouns", "Nipples", "Pussy",
            "ArmsLeft", "ArmsRight", "HandsLeft", "HandsRight",
            "外观工具"
        ]
    },
    {
        key: "HideClothing",
        label: "服饰",
        groups: [
            "Fluids", "BodyMarkings", "Decals", "Liquid2_Luzi", "身体痕迹_Luzi", "BodyMarkings2_Luzi",
            "Glasses", "Mask", "Hat", "FaceMarkings", "Mask_笨笨蛋Luzi", "Hat_笨笨蛋Luzi",
            "Cloth", "ClothLower", "ClothOuter", "ClothAccessory",
            "Suit", "SuitLower", "Corset", "Bra", "Panties",
            "Cloth_笨笨蛋Luzi", "Cloth_笨笨笨蛋Luzi2", "ClothLower_笨笨蛋Luzi", "ClothLower_笨笨笨蛋Luzi2",
            "Bra_笨笨蛋Luzi", "Panties_笨笨蛋Luzi", "Suit_笨笨蛋Luzi", "SuitLower_笨笨蛋Luzi",
            "ClothAccessory_笨笨蛋Luzi", "ClothAccessory_笨笨笨蛋Luzi2", "长袖子_Luzi",
            "HairAccessory1", "HairAccessory2", "HairAccessory3",
            "HairAccessory3_笨笨蛋Luzi", "Luzi_HairAccessory3_1", "Luzi_HairAccessory3_2",
            "Necklace", "Necklace_笨笨蛋Luzi",
            "Gloves", "Bracelet", "HandAccessoryLeft", "HandAccessoryRight", "Gloves_笨笨蛋Luzi",
            "Socks", "SocksLeft", "SocksRight", "Shoes", "AnkletLeft", "AnkletRight", "Garters", "Shoes_笨笨蛋Luzi",
            "Jewelry", "Luzi_Jewelry_0"
        ]
    },
    {
        key: "HideItems",
        label: "拘束道具",
        groups: [
            "ItemAddon", "ItemArms", "ItemBoots", "ItemBreast", "ItemButt",
            "ItemDevices", "ItemEars", "ItemFeet", "ItemHands", "ItemHead",
            "ItemHood", "ItemLegs", "ItemMisc", "ItemMouth", "ItemMouth2",
            "ItemMouth3", "ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints",
            "ItemNipples", "ItemNipplesPiercings", "ItemNose", "ItemPelvis",
            "ItemTorso", "ItemTorso2", "ItemVulva", "ItemVulvaPiercings", "ItemHandheld"
        ]
    }
];

// 所有可隐藏的组名（用于 AllowHide）
const ALL_HIDEABLE_GROUPS = HIDE_CATEGORIES.flatMap(c => c.groups);

/**
 * 根据分类开关，重新计算 Property.Hide 数组
 * Property.Hide 是 BC 原生支持的隐藏机制：数组中列出的组名对应的图层都不渲染
 * 注意：拘束道具分类需排除当前道具自己所在的组
 * @param {Item} item - 当前道具
 * @returns {boolean} 是否需要刷新角色
 */
function updateHideArray(item) {
    if (!item || !item.Property) return false;

    /** @type {string[]} */
    const hide = [];
    const currentGroup = item.Asset?.Group?.Name;

    for (const cat of HIDE_CATEGORIES) {
        if (item.Property[cat.key] === true) {
            for (const g of cat.groups) {
                // 拘束道具分类排除当前道具所在组
                if (cat.key === "HideItems" && g === currentGroup) continue;
                hide.push(g);
            }
        }
    }

    // 比较新旧数组内容是否一致
    const oldHide = item.Property.Hide || [];
    const newHideStr = [...hide].sort().join(",");
    const oldHideStr = [...oldHide].sort().join(",");
    const needsRefresh = newHideStr !== oldHideStr;

    if (hide.length > 0) {
        item.Property.Hide = hide;
    } else {
        delete item.Property.Hide;
    }

    return needsRefresh;
}

// 输入框 ID
const INPUT_URL = "CustomTextureURLInput";
const INPUT_OFFSET_X = "CustomTextureOffsetXInput";
const INPUT_OFFSET_Y = "CustomTextureOffsetYInput";
const INPUT_SCALE = "CustomTextureScaleInput";
const INPUT_ROTATION = "CustomTextureRotationInput";
const INPUT_OPACITY = "CustomTextureOpacityInput";

// 最大贴图数量
const MAX_TEXTURE_COUNT = 16;

// 可见开关按钮 ID 前缀
const VISIBLE_BTN_PREFIX = "CustomTextureVisibleBtn_";

// 预定义的图层名称
const LAYER_NAMES = Array.from({ length: MAX_TEXTURE_COUNT }, (_, i) => `Layer${i + 1}`);

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
        Textures: [],          // 贴图数组
        HideCosplay: false,    // 隐藏 cosplay 部位
        HideFacial: false,     // 隐藏五官
        HideBody: false,       // 隐藏身体
        HideClothing: false,   // 隐藏服饰
        HideItems: false,      // 隐藏拘束道具
        Hide: []               // 隐藏组数组（由上述开关派生）
    },
    ScriptHooks: {
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Textures) item.Property.Textures = [];
            // 兼容旧数据：补齐分类开关字段
            for (const cat of HIDE_CATEGORIES) {
                if (item.Property[cat.key] === undefined) item.Property[cat.key] = false;
            }
            // 根据开关刷新 Hide 数组，确保生效
            updateHideArray(item);

            currentEditTexture = -1;
            tempTextureData = null;
            currentListPage = 0;
            currentView = "list";
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        },

        Draw: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (currentView === "addDomainConfirm") {
                drawAddDomainConfirm();
            } else if (currentEditTexture >= 0) {
                drawTextureEditPanel(item, currentEditTexture, data);
            } else if (currentView === "hide") {
                drawHideSettings(item);
            } else {
                drawTextureListMain(item);
            }
        },

        Click: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (currentView === "addDomainConfirm") {
                handleAddDomainConfirmClick(item, data);
            } else if (currentEditTexture >= 0) {
                handleTextureEditClick(item, currentEditTexture, data);
            } else if (currentView === "hide") {
                handleHideSettingsClick(item);
            } else {
                handleTextureListClick(item, data);
            }
        },

        Exit: (data) => {
            currentEditTexture = -1;
            tempTextureData = null;
            currentListPage = 0;
            currentView = "list";
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        },

        // 绘制每个图层
        AfterDraw: (data, originalFunction, drawData) => {
            const { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L } = drawData;

            const item = CA;
            const layerIndex = LAYER_NAMES.indexOf(L);

            // 在第一层渲染时检查并更新 Hide 数组（确保其他玩家也能正确应用隐藏效果）
            // 注意：不在此处调用 CharacterRefresh，避免 AfterDraw -> CharacterRefresh -> AfterDraw 无限循环
            // BC 在接收 ChatRoomCharacterItemUpdate 时会自动刷新角色，Hide 数组会在下次渲染时生效
            if (layerIndex === 0 && item?.Property) {
                updateHideArray(item);
            }

            if (layerIndex === -1) return;

            const textures = item?.Property?.Textures;
            if (!textures || layerIndex >= textures.length) return;
            
            const texture = textures[layerIndex];
            if (!texture || !texture.TextureURL || !isUrlAllowed(texture.TextureURL)) return;
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
            
            // 计算旋转后的包围盒，避免旋转后图像被裁剪
            const rad = rotation * Math.PI / 180;
            const cos = Math.abs(Math.cos(rad));
            const sin = Math.abs(Math.sin(rad));
            const bboxWidth = Math.round(width * cos + height * sin);
            const bboxHeight = Math.round(width * sin + height * cos);
            
            // 缓存键包含透明度，透明度变化时重新生成 canvas
            const cacheKey = `${texture.TextureURL}_${width}_${height}_${rotation}_${opacity}_${layerIndex}`;
            let tempCanvas = data.PersistentData?.[cacheKey];
            
            if (!tempCanvas) {
                // canvas 使用包围盒大小，确保旋转后的图像不被裁剪
                tempCanvas = AnimationGenerateTempCanvas(C, A, bboxWidth, bboxHeight);
                const ctx = tempCanvas.getContext("2d");
                ctx.clearRect(0, 0, bboxWidth, bboxHeight);
                ctx.save();
                ctx.globalAlpha = opacity;
                // 以包围盒中心为旋转锚点
                ctx.translate(bboxWidth / 2, bboxHeight / 2);
                ctx.rotate(rad);
                ctx.translate(-width / 2, -height / 2);
                ctx.drawImage(img, 0, 0, width, height);
                ctx.restore();
                
                if (!data.PersistentData) data.PersistentData = {};
                data.PersistentData[cacheKey] = tempCanvas;
            }
            
            // 用包围盒尺寸偏移，保持图像中心对齐到 offsetX/offsetY
            const drawX = X + offsetX - (bboxWidth - width) / 2;
            const drawY = Y + offsetY - (bboxHeight - height) / 2;
            drawCanvas(tempCanvas, drawX, drawY);
            drawCanvasBlink(tempCanvas, drawX, drawY);
        }
    }
};

/**
 * 绘制添加可信域名确认页面
 */
function drawAddDomainConfirm() {
    DrawText("⚠ 添加可信域名确认 ⚠", 1200, 350, "Red", "Gray");

    let y = 420;
    const lines = [
        `即将添加域名到白名单: ${pendingDomainToAdd}`,
        "",
        "添加后，来自该域名的贴图 URL 将被允许加载",
        "",
        "请注意以下风险：",
        "1. 请确认您信任该域名提供者",
        "2. 该域名的所有 URL 都将被加载",
        "3. 恶意域名可能用于追踪您的 IP 地址",
        "4. 恶意域名可能导致隐私信息泄露",
        "",
        "确定要添加此域名到可信列表吗？",
    ];

    for (const line of lines) {
        const color = line.startsWith("即将") ? "Cyan" : (line.startsWith("确定") ? "Red" : "White");
        DrawText(line, 1200, y, color, "Black");
        y += 35;
    }

    y += 10;
    DrawButton(1050, y, 200, 50, "确认添加", "#4CAF50", "#66BB6A", false);
    DrawButton(1300, y, 200, 50, "取消", "#9E9E9E", "#BDBDBD", false);
}

/**
 * 处理添加可信域名确认页面点击
 */
function handleAddDomainConfirmClick(item, data) {
    const baseY = 420 + 35 * 11 + 10;
    // 确认添加
    if (MouseIn(1050, baseY, 200, 50)) {
        if (pendingDomainToAdd) {
            const success = addDomainToWhitelist(pendingDomainToAdd);
            if (success) {
                Logger.info(`已添加可信域名: ${pendingDomainToAdd}`);
                if (typeof ChatRoomSendLocal !== "undefined") {
                    ChatRoomSendLocal(`[ShuangAssets] 已添加可信域名: ${pendingDomainToAdd}`);
                }
            }
        }
        pendingDomainToAdd = null;
        currentView = "list";
        // 刷新预览
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }
    // 取消
    if (MouseIn(1300, baseY, 200, 50)) {
        pendingDomainToAdd = null;
        currentView = "list";
        return;
    }
}

/**
 * 绘制隐藏设置页面
 */
function drawHideSettings(item) {
    DrawText("隐藏设置", 1200, 350, "White", "Gray");
    DrawText("选择需要隐藏的部位分类", 1200, 380, "Yellow", "Gray");

    const startY = 420;
    const rowHeight = 55;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        const isOn = item.Property?.[cat.key] === true;

        DrawRect(1150, y, 400, rowHeight - 5, "rgba(0,0,0,0.5)");
        DrawText(cat.label, 1170, y + 22, "White", "Black");
        DrawText(`(${cat.groups.length} 个部位)`, 1300, y + 22, "#AAAAAA", "Black");
        DrawButton(1450, y + 5, 80, 35, isOn ? "开" : "关",
            isOn ? "#F44336" : "#666666",
            isOn ? "#E57373" : "#999999", false);
    }

    // 返回按钮
    const backY = startY + HIDE_CATEGORIES.length * rowHeight + 20;
    DrawButton(1150, backY, 200, 40, "返回", "#9E9E9E", "#BDBDBD", false);
}

/**
 * 处理隐藏设置页面点击
 */
function handleHideSettingsClick(item) {
    const startY = 420;
    const rowHeight = 55;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        if (MouseIn(1450, y + 5, 80, 35)) {
            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            item.Property[cat.key] = !(item.Property[cat.key] === true);
            updateHideArray(item);
            Logger.info(`${cat.label} 切换为: ${item.Property[cat.key]}`);
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
            return;
        }
    }

    // 返回按钮
    const backY = startY + HIDE_CATEGORIES.length * rowHeight + 20;
    if (MouseIn(1150, backY, 200, 40)) {
        currentView = "list";
        return;
    }
}

/**
 * 绘制主界面：贴图列表
 */
function drawTextureListMain(item) {
    const textures = item.Property?.Textures || [];
    
    DrawText("贴图管理", 1200, 350, "White", "Gray");
    DrawText(`已添加 ${textures.length} 个贴图（最多 ${MAX_TEXTURE_COUNT} 个）`, 1200, 380, "Yellow", "Gray");
    
    // 隐藏设置跳转按钮
    DrawButton(1150, 405, 400, 40, "隐藏设置 >>>", "#607D8B", "#78909C", false);
    
    const startY = 570;
    const itemHeight = 50;

    // 分页计算
    const totalPages = Math.max(1, Math.ceil(textures.length / TEXTURES_PER_PAGE));
    if (currentListPage >= totalPages) currentListPage = totalPages - 1;
    if (currentListPage < 0) currentListPage = 0;
    const pageStart = currentListPage * TEXTURES_PER_PAGE;
    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, textures.length);

    for (let i = pageStart; i < pageEnd; i++) {
        const y = startY + (i - pageStart) * itemHeight;
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
        
        // 可信域名快捷按钮：白名单模式下，URL 域名不在白名单时显示
        if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL)) {
            DrawButton(1545, y + 5, 55, 35, "+可信", "#FF9800", "#FFB74D", false);
        }
    }
    
    // 按钮位置固定基于每页最大行数，避免分页时按钮跳动
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight + 20;
    
    // 翻页按钮（始终绘制，仅 1 页时禁用）
    const hasPages = totalPages > 1;
    DrawButton(1150, btnY, 80, 35, "上一页", "#555555", "#777777", !hasPages);
    DrawButton(1240, btnY, 80, 35, "下一页", "#555555", "#777777", !hasPages);
    if (hasPages) {
        DrawText(`${currentListPage + 1}/${totalPages}`, 1320, btnY + 17, "Cyan", "Gray");
    }
    
    // 添加按钮
    if (textures.length < MAX_TEXTURE_COUNT) {
        DrawButton(1355, btnY, 95, 40, "添加新贴图", "#4CAF50", "#66BB6A", false);
    }
    DrawButton(1460, btnY, 90, 40, "确认保存", "#2196F3", "#42A5F5", false);
    
    // 导入导出按钮
    const ioBtnY = btnY + 50;
    DrawButton(1150, ioBtnY, 130, 40, "导出配置", "#FF9800", "#FFB74D", false);
    DrawButton(1285, ioBtnY, 130, 40, "覆盖导入", "#9C27B0", "#BA68C8", false);
    DrawButton(1420, ioBtnY, 130, 40, "追加导入", "#7B1FA2", "#9C27B0", false);
}

/**
 * 处理主界面点击
 */
function handleTextureListClick(item, data) {
    const textures = item.Property?.Textures || [];

    // 隐藏设置跳转
    if (MouseIn(1150, 405, 400, 40)) {
        currentView = "hide";
        return;
    }

    const startY = 570;
    const itemHeight = 50;
    
    // 分页计算
    const totalPages = Math.max(1, Math.ceil(textures.length / TEXTURES_PER_PAGE));
    if (currentListPage >= totalPages) currentListPage = totalPages - 1;
    if (currentListPage < 0) currentListPage = 0;
    const pageStart = currentListPage * TEXTURES_PER_PAGE;
    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, textures.length);
    
    for (let i = pageStart; i < pageEnd; i++) {
        const y = startY + (i - pageStart) * itemHeight;
        const texture = textures[i];
        // 可见开关
        if (MouseIn(1390, y + 5, 70, 35)) {
            textures[i].Visible = textures[i].Visible === false ? true : false;
            // 切换可见性后立即同步到服务器
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
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
        // +可信 按钮
        if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL) && MouseIn(1545, y + 5, 55, 35)) {
            const domain = extractDomain(texture.TextureURL);
            if (domain) {
                pendingDomainToAdd = domain;
                currentView = "addDomainConfirm";
            }
            return;
        }
    }
    
    // 按钮位置固定基于每页最大行数
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight + 20;
    const hasPages = totalPages > 1;
    
    // 翻页按钮（循环式）
    if (hasPages && MouseIn(1150, btnY, 80, 35)) {
        currentListPage = (currentListPage - 1 + totalPages) % totalPages;
        return;
    }
    if (hasPages && MouseIn(1240, btnY, 80, 35)) {
        currentListPage = (currentListPage + 1) % totalPages;
        return;
    }
    
    if (textures.length < MAX_TEXTURE_COUNT && MouseIn(1355, btnY, 95, 40)) {
        const newTexture = { ...DEFAULT_TEXTURE };
        item.Property.Textures.push(newTexture);
        currentEditTexture = textures.length - 1;
        tempTextureData = { ...newTexture };
        if (!data.PersistentData) data.PersistentData = {};
        data.PersistentData._originalTexture = { ...newTexture };
        createEditInputs(newTexture);
        return;
    }
    
    if (MouseIn(1460, btnY, 90, 40)) {
        const C = CharacterGetCurrent();
        if (C && item) {
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            // 保存前确保 Hide 数组与开关一致
            updateHideArray(item);
            
            Logger.info("保存贴图数据:", JSON.stringify(item.Property.Textures));
            Logger.info(`隐藏分类 - ${HIDE_CATEGORIES.map(c => `${c.label}: ${item.Property[c.key]}`).join(', ')}`);
            
            syncItemToServer(item);
            CharacterRefresh(C, false, false);
            Logger.info("贴图设置已保存并同步");
        }
        return;
    }
    
    // 导入导出按钮
    const ioBtnY = btnY + 50;
    
    // 导出配置
    if (MouseIn(1150, ioBtnY, 130, 40)) {
        exportConfig(item);
        return;
    }
    
    // 覆盖导入
    if (MouseIn(1285, ioBtnY, 130, 40)) {
        importConfig(item, "overwrite");
        return;
    }
    
    // 追加导入
    if (MouseIn(1420, ioBtnY, 130, 40)) {
        // 预检查：当前图层已达上限，无法追加
        if ((item.Property?.Textures || []).length >= MAX_TEXTURE_COUNT) {
            if (typeof ChatRoomSendLocal !== "undefined") {
                ChatRoomSendLocal(`[ShuangAssets] 超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`);
            }
            return;
        }
        importConfig(item, "append");
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
        version: 4,
        textures: textures,
        hideCosplay: item.Property?.HideCosplay === true,
        hideFacial: item.Property?.HideFacial === true,
        hideBody: item.Property?.HideBody === true,
        hideClothing: item.Property?.HideClothing === true,
        hideItems: item.Property?.HideItems === true
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
 * @param {Object} item - 道具对象
 * @param {"overwrite"|"append"} mode - 导入模式：overwrite=覆盖导入，append=追加导入
 */
function importConfig(item, mode) {
    navigator.clipboard.readText().then(text => {
        try {
            const config = JSON.parse(text);
            if (config.type !== "ShuangCustomAssets") {
                throw new Error("无效的配置类型");
            }
            if (!Array.isArray(config.textures)) {
                throw new Error("配置格式错误");
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
            if (!item.Property.Textures) item.Property.Textures = [];
            
            if (mode === "append") {
                // 追加导入：将剪贴板图层追加到现有图层后
                const currentCount = item.Property.Textures.length;
                const totalCount = currentCount + validTextures.length;
                if (totalCount > MAX_TEXTURE_COUNT) {
                    throw new Error(`超过贴图数量上限（当前 ${currentCount} + 导入 ${validTextures.length} = ${totalCount}，最多 ${MAX_TEXTURE_COUNT}）`);
                }
                item.Property.Textures = [...item.Property.Textures, ...validTextures];
                // 追加模式不修改隐藏开关
            } else {
                // 覆盖导入：用剪贴板内容完全替换
                if (validTextures.length > MAX_TEXTURE_COUNT) {
                    throw new Error(`超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个，当前 ${validTextures.length} 个）`);
                }
                item.Property.Textures = validTextures;
                // 覆盖模式同步导入隐藏分类开关（兼容旧版配置：无该字段时默认 false）
                for (const cat of HIDE_CATEGORIES) {
                    item.Property[cat.key] = config[cat.key.charAt(0).toLowerCase() + cat.key.slice(1)] === true;
                }
            }
            
            updateHideArray(item);
            
            const modeText = mode === "append" ? "追加" : "覆盖";
            Logger.info(`${modeText}导入成功:`, item.Property.Textures.length, "个图层");
            
            if (typeof ChatRoomSendLocal !== "undefined") {
                ChatRoomSendLocal(`[ShuangAssets] ${modeText}导入成功，共 ${item.Property.Textures.length} 个图层`);
            }
            
            // 同步到服务器并刷新角色
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
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
 * 同步道具属性到服务器
 * ChatRoomCharacterItemUpdate: 实时同步给房间内在线玩家（不更新服务器端 ChatRoomData）
 * ChatRoomCharacterUpdate: 更新服务器端 ChatRoomData，确保新进入房间的玩家能获取最新配置
 * ServerPlayerAppearanceSync: 持久化到 Player 账号数据，确保玩家重新登录时能恢复配置
 */
function syncItemToServer(item) {
    // 在制作(Crafting)页面中不同步到服务器，制作页面有自己的保存机制
    if (CurrentScreen === "Crafting") return;

    const C = CharacterGetCurrent();
    if (!C || typeof ChatRoomCharacterItemUpdate !== "function") return;

    // 实时同步给房间内在线玩家
    ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);

    // 如果是玩家自己的道具，更新服务器端 ChatRoomData 和账号数据
    // 确保离线玩家上线后进入房间时能从 ChatRoomData 获取最新配置
    if (C.IsPlayer()) {
        if (typeof ChatRoomCharacterUpdate === "function") {
            ChatRoomCharacterUpdate(C);
        }
        if (typeof ServerPlayerAppearanceSync === "function") {
            ServerPlayerAppearanceSync();
        }
    }

    Logger.info(`[ShuangAssets] 已同步道具到服务器`);
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
            
            const urlChanged = tempTextureData.TextureURL !== newUrl;
            
            tempTextureData.TextureURL = newUrl;
            tempTextureData.OffsetX = newOffsetX;
            tempTextureData.OffsetY = newOffsetY;
            tempTextureData.Scale = newScale;
            tempTextureData.Rotation = newRotation;
            tempTextureData.Opacity = newOpacity;
            
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            item.Property.Textures[textureIndex] = { ...tempTextureData };
            
            // 刷新本地画布（实时预览）
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);

            // URL 变化时预加载图片，加载完成后再次刷新
            if (urlChanged && isUrlAllowed(newUrl)) {
                const img = DrawGetImage(newUrl);
                if (!img.complete) {
                    img.onload = () => {
                        Logger.info(`[ShuangAssets] 图片加载完成: ${newUrl.substring(0, 50)}...`);
                        if (C) CharacterRefresh(C, false, false);
                    };
                }
            }
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
    
    // 可信域名快捷按钮：白名单模式下，URL 域名不在白名单时显示
    const currentUrl = urlInput?.value?.trim() || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain) {
            DrawButton(1150, y, 200, 35, `+可信域名: ${domain.length > 15 ? domain.substring(0, 15) + "..." : domain}`, "#FF9800", "#FFB74D", false);
        }
        y += 40;
    }
    
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

    // 可信域名按钮（如果显示的话）
    const urlInput = document.getElementById(INPUT_URL);
    const currentUrl = urlInput?.value?.trim() || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain && MouseIn(1150, y, 200, 35)) {
            pendingDomainToAdd = domain;
            currentView = "addDomainConfirm";
            return;
        }
        y += 40;
    }
    
    if (MouseIn(1150, y, 150, 35)) {
        item.Property.Textures.splice(textureIndex, 1);
        currentEditTexture = -1;
        tempTextureData = null;
        currentListPage = 0;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        syncItemToServer(item);
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
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

        // 立即同步到服务器
        syncItemToServer(item);

        currentEditTexture = -1;
        tempTextureData = null;
        currentListPage = Math.floor(textureIndex / TEXTURES_PER_PAGE);
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }

    if (MouseIn(1440, y, 120, 35)) {
        const originalTexture = data.PersistentData?._originalTexture;
        if (originalTexture) {
            item.Property.Textures[textureIndex] = { ...originalTexture };
        }
        // 恢复设置后同步到服务器
        syncItemToServer(item);

        currentEditTexture = -1;
        tempTextureData = null;
        currentListPage = Math.floor(textureIndex / TEXTURES_PER_PAGE);
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
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

    // 将道具预览图标映射到远程图片
    // BC 默认从 Assets/Female3DCG/<Group>/Preview/<AssetName>.png 加载图标
    // 由于道具注册到所有 ItemXxx 组，需要为每个组添加映射
    const previewMappings = {};
    for (const group of ALL_ITEM_GROUPS) {
        previewMappings[`Assets/Female3DCG/${group}/Preview/${asset.Name}.png`] = BADGE_IMAGE_URL;
    }
    AssetManager.addImageMapping(previewMappings);

    // 在资源加载完成后，手动设置 AllowHide 和制作系统属性
    // BC 的 Validation 会检查 Property.Hide 中的组名是否在 Asset.AllowHide 中
    // SDK 的 addAssetWithConfig 不会传递 AllowHide，需要手动设置
    // 同时需要设置 Wear/Enable 并重建 CraftingAssets，否则自制道具会丢失
    const allAllowHide = ALL_HIDEABLE_GROUPS;
    AssetManager.afterLoad(() => {
        for (const group of ALL_ITEM_GROUPS) {
            const assetObj = AssetGet("Female3DCG", group, asset.Name);
            if (assetObj) {
                assetObj.AllowHide = allAllowHide;
                // 确保道具可用于制作系统（CraftingAssetsPopulate 会过滤 Wear/Enable）
                if (assetObj.Wear === undefined) assetObj.Wear = true;
                if (assetObj.Enable === undefined) assetObj.Enable = true;
            }
        }
        // 重新构建 CraftingAssets，确保自定义道具被包含
        // CraftingAssetsPopulate 在 AssetLoadAll 结束时调用，可能在自定义道具注册之前
        if (typeof CraftingAssetsPopulate === "function") {
            CraftingAssets = CraftingAssetsPopulate();
        }
    });
}

/**
 * 登录页面加载标识贴图配置
 * 参考 echo 服装扩展的汉堡标识，在 LoginCharacter 身体部位放上自定义贴图
 */
const BADGE_IMAGE_URL = "https://shuang-custom-assets.pages.dev/SCA_logo.png";

const LOGIN_BADGE_TEXTURE = {
    TextureURL: BADGE_IMAGE_URL,
    OffsetX: 153,
    OffsetY: -200,
    Scale: 21,
    Rotation: 0,
    Opacity: 100,
    Visible: true
};

const LOGIN_BADGE_ASSET_NAME = "自定义贴图";
const LOGIN_BADGE_GROUP = "ItemTorso";

/**
 * 在登录页面给 LoginCharacter 穿上自定义贴图作为插件加载标识
 * 需要通过 HookManager 挂载到 LoginDoNextThankYou
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupLoginBadge(HookManager) {
    HookManager.progressiveHook("LoginDoNextThankYou")
        .next()
        .inject((args, next) => {
            if (CurrentScreen !== "Login") return next(args);
            if (typeof LoginCharacter === "undefined" || !LoginCharacter) return next(args);

            // 检查是否已穿戴自定义贴图
            const existing = LoginCharacter.Appearance.find(
                a => a.Asset.Group.Name === LOGIN_BADGE_GROUP && a.Asset.Name === LOGIN_BADGE_ASSET_NAME
            );
            if (!existing) {
                InventoryWear(LoginCharacter, LOGIN_BADGE_ASSET_NAME, LOGIN_BADGE_GROUP);
                const item = LoginCharacter.Appearance.find(
                    a => a.Asset.Group.Name === LOGIN_BADGE_GROUP && a.Asset.Name === LOGIN_BADGE_ASSET_NAME
                );
                if (item) {
                    if (!item.Property) item.Property = {};
                    item.Property.Textures = [{ ...LOGIN_BADGE_TEXTURE }];
                    for (const cat of HIDE_CATEGORIES) {
                        item.Property[cat.key] = false;
                    }
                    item.Property.Hide = [];
                }
                CharacterRefresh(LoginCharacter);
            }
            next(args);
        });
}
