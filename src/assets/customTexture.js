/**
 * 自定义贴图道具 - 游戏多图层版本
 * 每个贴图对应一个游戏图层
 */

import { isValidImageUrl, Logger, L, getCorsImage, isChineseLang } from "@lib/utils.js";
import { isUrlAllowed, isDomainInWhitelist, extractDomain, addDomainToWhitelist, getDomainWarningEnabled } from "./settings.js";

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

// === UI 状态 ===
let currentEditTexture = -1;
let tempTextureData = null;
let currentListPage = 0;
let currentView = "list"; // "list" | "hide" | "addDomainConfirm"
let pendingDomainToAdd = null; // 待确认添加的域名
// 进入编辑前的原始贴图数据（用于「退出=取消编辑并返回列表」时还原）
let originalEditTexture = null;

// === CharacterRefresh 节流（防止步进按钮长按时高频刷新导致 WebGL Context Lost） ===
let _lastTextureRefresh = 0;       // 上次刷新时间戳
let _pendingTextureRefresh = false; // 是否有待刷新
const TEXTURE_REFRESH_INTERVAL = 200; // 最小刷新间隔（ms），5 次/秒

// === 顶部状态提示（导入/导出等结果，显示在贴图管理页 1505,890） ===
let statusMessage = null;      // { text: string, color: string }
let statusMessageExpiry = 0;   // 时间戳，超过则不再显示

/**
 * 显示一条临时状态提示（用于导入/导出结果）
 * @param {string} text
 * @param {string} [color]
 * @param {number} [durationMs]
 */
function showStatus(text, color = "#4CAF50", durationMs = 5000) {
    statusMessage = { text, color };
    statusMessageExpiry = Date.now() + durationMs;
}

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
        labelEn: "Cosplay",
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
        labelEn: "Face",
        groups: [
            "Eyes", "Eyes2", "Eyebrows", "Blush", "EyeShadow",
            "FacialHair", "Mouth", "左眼_Luzi", "右眼_Luzi"
        ]
    },
    {
        key: "HideBody",
        label: "身体",
        labelEn: "Body",
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
        labelEn: "Clothing",
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
        labelEn: "Restraints",
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

// === 步进按钮（+/-）配置 ===
// 在每个数值输入框两侧放置加减按钮，支持长按加速
const STEPPER_BTN_W = 40;
const STEPPER_BTN_H = 40;
const STEPPER_MINUS_X = 1220;   // 减号按钮 X 坐标
const STEPPER_PLUS_X = 1380;    // 加号按钮 X 坐标
const STEPPER_INPUT_X = 1265;   // 输入框 X 坐标（位于两按钮之间）
const STEPPER_INPUT_W = 110;    // 输入框容器宽度

// 数值字段的步进配置（顺序对应 OffsetX/Y, Scale, Rotation, Opacity）
const STEPPER_FIELDS = [
    { id: INPUT_OFFSET_X, y: 485, labelCn: "X偏移",   labelEn: "X Offset",   labelY: 505, prop: "OffsetX",  def: 1,   min: null, max: null },
    { id: INPUT_OFFSET_Y, y: 535, labelCn: "Y偏移",   labelEn: "Y Offset",   labelY: 555, prop: "OffsetY",  def: 1,   min: null, max: null },
    { id: INPUT_SCALE,    y: 585, labelCn: "缩放%",   labelEn: "Scale %",    labelY: 605, prop: "Scale",    def: 100, min: null, max: null },
    { id: INPUT_ROTATION, y: 635, labelCn: "旋转%",   labelEn: "Rotation %",  labelY: 655, prop: "Rotation", def: 0,   min: null, max: null },
    { id: INPUT_OPACITY,  y: 685, labelCn: "透明度%", labelEn: "Opacity %",  labelY: 705, prop: "Opacity",  def: 100, min: 0,    max: 100 }
];

// 长按步进状态跟踪
const stepperPress = {
    fieldId: null,     // 当前按住的字段 ID
    direction: 0,      // -1（减）或 +1（加）
    startTime: 0,      // 按下开始时间戳（ms）
    lastUpdate: 0      // 上次值变更时间戳（ms）
};

// 鼠标/触摸按下状态（由 document 事件监听器维护）
let _pointerDown = false;
let _stepperListenerReady = false;

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
            originalEditTexture = null;
            currentListPage = 0;
            currentView = "list";
            _pendingTextureRefresh = false;
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
            // 若正在编辑某个图层，退出前还原为编辑前的原始数据（相当于「取消」）
            if (currentEditTexture >= 0) {
                const item = DialogFocusItem;
                const originalTexture = data.PersistentData?._originalTexture;
                if (item && originalTexture) {
                    if (!item.Property) item.Property = { Textures: [] };
                    if (!item.Property.Textures) item.Property.Textures = [];
                    item.Property.Textures[currentEditTexture] = { ...originalTexture };
                    syncItemToServer(item);
                    const C = CharacterGetCurrent();
                    if (C) CharacterRefresh(C, false, false);
                }
            }
            currentEditTexture = -1;
            tempTextureData = null;
            originalEditTexture = null;
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
                // 一次性清理旧的按值缓存条目（url_width_height_rotation_opacity_layer 格式）
                // 新策略改为每图层一个 canvas，旧缓存不再需要，不清理会持续占用内存
                if (data.PersistentData && !data.PersistentData._cacheMigrated) {
                    for (const key in data.PersistentData) {
                        if (!key.startsWith("_")) {
                            delete data.PersistentData[key];
                        }
                    }
                    data.PersistentData._cacheMigrated = true;
                }
            }

            if (layerIndex === -1) return;

            const textures = item?.Property?.Textures;
            if (!textures || layerIndex >= textures.length) return;
            
            const texture = textures[layerIndex];
            if (!texture || !texture.TextureURL) return;
            // 不可见则跳过
            if (texture.Visible === false) return;

            // 域名警告处理
            const warnEnabled = getDomainWarningEnabled();

            let imageUrl, offsetX, offsetY, scale, rotation, displayOpacity;

            if (warnEnabled && !isDomainInWhitelist(texture.TextureURL)) {
                // 不可信域名：使用固定参数显示警告图片
                imageUrl = 'https://shuang-custom-assets.pages.dev/SCA_untrusted_domain.png';
                offsetX = 167;
                offsetY = -256;
                scale = 16 / 100;
                rotation = 0;
                displayOpacity = 1.0;
            } else if (!isUrlAllowed(texture.TextureURL)) {
                // 域不可信提示关闭（或不限制模式）：跳过渲染
                return;
            } else {
                // 正常显示
                imageUrl = texture.TextureURL;
                offsetX = texture.OffsetX || 0;
                offsetY = texture.OffsetY || 0;
                scale = (texture.Scale || 100) / 100;
                rotation = texture.Rotation || 0;
                displayOpacity = Math.max(0, Math.min(100, texture.Opacity ?? 100)) / 100;
            }

            // 使用 CORS 安全加载器：仅渲染服务器正确返回 Access-Control-Allow-Origin 的图片，
            // 加载失败（如 r2.dev 未开启 CORS）直接跳过，避免污染 canvas 导致 WebGL 黑框
            const imgEntry = getCorsImage(imageUrl);
            if (imgEntry.failed) return;
            const img = imgEntry.img;
            if (!img.complete || img.naturalWidth <= 0) return;

            const width = Math.round(img.naturalWidth * scale);
            const height = Math.round(img.naturalHeight * scale);
            
            // 计算旋转后的包围盒，避免旋转后图像被裁剪
            const rad = rotation * Math.PI / 180;
            const cos = Math.abs(Math.cos(rad));
            const sin = Math.abs(Math.sin(rad));
            const bboxWidth = Math.round(width * cos + height * sin);
            const bboxHeight = Math.round(width * sin + height * cos);
            
            // 缓存策略：每个图层只保留一个 canvas，参数变化时重绘（而非创建新 canvas）
            // 旧策略按 url_width_height_rotation_opacity 做 cacheKey，步进按钮每次调值都产生新 key，
            // 旧 canvas 永远不释放，累积导致 GPU 内存耗尽 -> WebGL Context Lost
            const layerCanvasKey = `_canvas_${layerIndex}`;
            const layerParamsKey = `_params_${layerIndex}`;
            const currentParams = `${imageUrl}_${width}_${height}_${rotation}_${displayOpacity}`;

            let tempCanvas = data.PersistentData?.[layerCanvasKey];

            if (!tempCanvas) {
                // 首次创建 canvas
                tempCanvas = AnimationGenerateTempCanvas(C, A, bboxWidth, bboxHeight);
                if (!data.PersistentData) data.PersistentData = {};
                data.PersistentData[layerCanvasKey] = tempCanvas;
                data.PersistentData[layerParamsKey] = null; // 标记需要首次绘制
            }

            // 参数变化时重绘 canvas（复用同一个 canvas 元素，避免内存泄漏）
            if (data.PersistentData[layerParamsKey] !== currentParams) {
                // 包围盒尺寸变化时调整 canvas 大小（设置 width/height 会清空 canvas）
                if (tempCanvas.width !== bboxWidth || tempCanvas.height !== bboxHeight) {
                    tempCanvas.width = bboxWidth;
                    tempCanvas.height = bboxHeight;
                }
                const ctx = tempCanvas.getContext("2d");
                ctx.clearRect(0, 0, bboxWidth, bboxHeight);
                ctx.save();
                ctx.globalAlpha = displayOpacity;
                ctx.translate(bboxWidth / 2, bboxHeight / 2);
                ctx.rotate(rad);
                ctx.translate(-width / 2, -height / 2);
                ctx.drawImage(img, 0, 0, width, height);
                ctx.restore();
                data.PersistentData[layerParamsKey] = currentParams;
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
    DrawText(L("⚠ 添加可信域名确认 ⚠", "⚠ Confirm Trusted Domain ⚠"), 1500, 370, "Red", "Gray");

    let y = 440;
    const lines = isChineseLang() ? [
        { t: `即将添加域名到白名单: ${pendingDomainToAdd}`, c: "Cyan" },
        { t: "", c: "White" },
        { t: "添加后，来自该域名的贴图 URL 将被允许加载", c: "White" },
        { t: "", c: "White" },
        { t: "请注意以下风险：", c: "White" },
        { t: "1. 请确认您信任该域名提供者", c: "White" },
        { t: "2. 该域名的所有 URL 都将被加载", c: "White" },
        { t: "3. 恶意域名可能用于追踪您的 IP 地址", c: "White" },
        { t: "4. 恶意域名可能导致隐私信息泄露", c: "White" },
        { t: "", c: "White" },
        { t: "确定要添加此域名到可信列表吗？", c: "Red" },
    ] : [
        { t: `About to add domain to whitelist: ${pendingDomainToAdd}`, c: "Cyan" },
        { t: "", c: "White" },
        { t: "Once added, texture URLs from this domain will be allowed", c: "White" },
        { t: "", c: "White" },
        { t: "Please note the following risks:", c: "White" },
        { t: "1. Make sure you trust this domain's provider", c: "White" },
        { t: "2. All URLs from this domain will be loaded", c: "White" },
        { t: "3. A malicious domain may track your IP address", c: "White" },
        { t: "4. A malicious domain may leak private info", c: "White" },
        { t: "", c: "White" },
        { t: "Add this domain to the trusted list?", c: "Red" },
    ];

    for (const line of lines) {
        DrawText(line.t, 1500, y, line.c, "Black");
        y += 35;
    }

    y += 10;
    DrawButton(1250, y, 200, 50, L("确认添加", "Add"), "#4CAF50", "#66BB6A", false,
        L(`将 ${pendingDomainToAdd} 加入白名单`, `Add ${pendingDomainToAdd} to whitelist`));
    DrawButton(1500, y, 200, 50, L("取消", "Cancel"), "#9E9E9E", "#BDBDBD", false,
        L("放弃添加并返回", "Discard and go back"));
}

/**
 * 处理添加可信域名确认页面点击
 */
function handleAddDomainConfirmClick(item, data) {
    const baseY = 440 + 35 * 11 + 10;
    // 确认添加
    if (MouseIn(1250, baseY, 200, 50)) {
        if (pendingDomainToAdd) {
            const success = addDomainToWhitelist(pendingDomainToAdd);
            if (success) {
                Logger.info(`已添加可信域名: ${pendingDomainToAdd}`);
                showStatus(L(`✔ 已添加可信域名: ${pendingDomainToAdd}`,
                    `✔ Trusted domain added: ${pendingDomainToAdd}`), "#4CAF50");
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
    if (MouseIn(1500, baseY, 200, 50)) {
        pendingDomainToAdd = null;
        currentView = "list";
        return;
    }
}

/**
 * 绘制隐藏设置页面
 */
function drawHideSettings(item) {
    // 标题 / 副标题：与主列表页共用同一套居中坐标
    DrawText(L("隐藏设置", "Hide Settings"), 1500, 360, "White", "Gray");
    DrawText(L("选择需要隐藏的部位分类", "Choose which part categories to hide"), 1505, 410, "#fff942", "Gray");

    const startY = 450;
    const rowHeight = 60;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        const isHidden = item.Property?.[cat.key] === true;
        const catLabel = L(cat.label, cat.labelEn);

        DrawText(catLabel, 1100, y + 20, "White");
        DrawButton(1200, y, 400, 40, L(`${cat.groups.length}个部位`, `${cat.groups.length} parts`), "White", null,
            L(`该分类包含 ${cat.groups.length} 个部位组`, `This category covers ${cat.groups.length} groups`), false);
        // 与列表页贴图可见开关保持一致的显示/隐藏配色
        DrawButton(1620, y, 100, 40, isHidden ? L("隐藏", "Hidden") : L("显示", "Shown"),
            isHidden ? "#666666" : "#4ba055",
            null, L(`点击切换是否隐藏「${catLabel}」`, `Toggle hiding "${catLabel}"`), false);
    }

    // 确认（返回列表）
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        L("确认并返回列表", "Confirm & back to list"));
}

/**
 * 处理隐藏设置页面点击
 */
function handleHideSettingsClick(item) {
    const startY = 450;
    const rowHeight = 60;

    for (let i = 0; i < HIDE_CATEGORIES.length; i++) {
        const cat = HIDE_CATEGORIES[i];
        const y = startY + i * rowHeight;
        if (MouseIn(1620, y, 100, 40)) {
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

    // 确认（返回列表）
    if (MouseIn(1885, 135, 90, 90)) {
        currentView = "list";
        return;
    }
}

/**
 * 绘制主界面：贴图列表
 */
function drawTextureListMain(item) {
    const textures = item.Property?.Textures || [];

    DrawText(L("贴图管理", "Texture Manager"), 1500, 360, "White", "Gray");
    DrawText(L(`已添加${textures.length}个贴图（最多${MAX_TEXTURE_COUNT}个）`,
        `${textures.length} textures added (max ${MAX_TEXTURE_COUNT})`), 1505, 410, "#ebfe58", "Gray");

    // 隐藏设置跳转（右上角图标按钮）
    DrawButton(1665, 25, 90, 90, "", "White", "Icons/Private.png",
        L("隐藏设置：隐藏身体部位/服饰等", "Hide settings: hide body parts / clothing"));

    const startY = 450;
    const itemHeight = 60;
    // 新增按钮基准 Y 与每多一层的下移步长
    const ADD_BTN_BASE_Y = 450;
    const ADD_BTN_STEP = 60;

    // 分页计算
    const totalPages = Math.max(1, Math.ceil(textures.length / TEXTURES_PER_PAGE));
    if (currentListPage >= totalPages) currentListPage = totalPages - 1;
    if (currentListPage < 0) currentListPage = 0;
    const pageStart = currentListPage * TEXTURES_PER_PAGE;
    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, textures.length);
    // 当前页已有的图层数（0~TEXTURES_PER_PAGE）
    const itemsOnPage = pageEnd - pageStart;

    for (let i = pageStart; i < pageEnd; i++) {
        const y = startY + (i - pageStart) * itemHeight;
        const texture = textures[i];

        const urlPreview = texture?.TextureURL
            ? (texture.TextureURL.length > 12 ? texture.TextureURL.substring(0, 12) + "..." : texture.TextureURL)
            : "(空)";

        DrawText(L(`图层${i + 1} :`, `Layer ${i + 1}:`), 1100, y + 20, "White");
        DrawButton(1200, y, 400, 40, urlPreview, "White", null,
            texture?.TextureURL || L("(空)", "(empty)"), false);

        // 可见开关
        const isVisible = texture?.Visible !== false;
        DrawButton(1620, y, 100, 40, isVisible ? L("显示", "Shown") : L("隐藏", "Hidden"),
            isVisible ? "#4ba055" : "#666666", null,
            L("点击切换该图层显示/隐藏", "Toggle this layer's visibility"), false);

        DrawButton(1740, y, 100, 40, L("编辑", "Edit"), "White", null,
            L("编辑该图层的 URL 与参数", "Edit this layer's URL and parameters"), false);

        // 信任按钮：白名单模式下，URL 域名不在白名单时显示
        if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL)) {
            DrawButton(1860, y, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
        }
    }

    // 新增按钮：紧跟在当前页最后一个图层后面，1 个时 500，2 个时 560，每多一层再 +60；
    // 当本页已满 6 层时，按钮停在对应位置，点击后新图层会落到下一页（沿用原本翻页逻辑）
    if (textures.length < MAX_TEXTURE_COUNT) {
        const addBtnY = ADD_BTN_BASE_Y + itemsOnPage * ADD_BTN_STEP;
        DrawButton(1450, addBtnY, 90, 90, "", "White", "Icons/Plus.png",
            L("添加一个新贴图图层", "Add a new texture layer"));
    }

    // 底部按钮固定位置，基于每页最大行数计算，不随本页图层数变化
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;

    // 翻页按钮：只有「下一页」，循环到最后一页后自动跳回第一页，不显示页码
    // 仅当图层总数 >= 7（即超过一页）时才显示
    const hasPages = totalPages > 1;
    if (textures.length >= 7) {
        DrawButton(1885, 810, 90, 90, "", "White", "Icons/Down.png",
            L("下一页", "Next page"), !hasPages);
    }
    // 确认并退出：保存同步后关闭对话框
    DrawButton(1885, 135, 90, 90, "", "White", "Icons/Accept.png",
        L("确认并退出（保存并关闭）", "Confirm & Exit (save and close)"));

    // 导入导出按钮
    const ioBtnY = btnY + 120;
    DrawButton(1170, ioBtnY, 200, 50, L("导出配置", "Export"), "#4CAF50", "#66BB6A", false,
        L("将当前配置复制到剪贴板", "Copy current config to clipboard"));
    DrawButton(1390, ioBtnY, 200, 50, L("覆盖导入", "Import (Replace)"), "#28639A", null,
        L("用剪贴板配置覆盖当前所有图层", "Replace all layers with clipboard config"), false);
    DrawButton(1610, ioBtnY, 200, 50, L("追加导入", "Import (Append)"), "#28639A", null,
        L("将剪贴板配置追加到当前图层后", "Append clipboard config after current layers"), false);

    // 导入/导出结果提示（任务3：显示在 1505,890）
    if (statusMessage && Date.now() < statusMessageExpiry) {
        DrawText(statusMessage.text, 1505, 890, statusMessage.color, "Black");
    }
}

/**
 * 处理主界面点击
 */
function handleTextureListClick(item, data) {
    const textures = item.Property?.Textures || [];

    // 隐藏设置跳转
    if (MouseIn(1665, 25, 90, 90)) {
        currentView = "hide";
        return;
    }

    const startY = 450;
    const itemHeight = 60;
    const ADD_BTN_BASE_Y = 450;
    const ADD_BTN_STEP = 60;

    // 分页计算
    const totalPages = Math.max(1, Math.ceil(textures.length / TEXTURES_PER_PAGE));
    if (currentListPage >= totalPages) currentListPage = totalPages - 1;
    if (currentListPage < 0) currentListPage = 0;
    const pageStart = currentListPage * TEXTURES_PER_PAGE;
    const pageEnd = Math.min(pageStart + TEXTURES_PER_PAGE, textures.length);
    const itemsOnPage = pageEnd - pageStart;

    for (let i = pageStart; i < pageEnd; i++) {
        const y = startY + (i - pageStart) * itemHeight;
        const texture = textures[i];
        // 可见开关
        if (MouseIn(1620, y, 100, 40)) {
            textures[i].Visible = textures[i].Visible === false ? true : false;
            // 切换可见性后立即同步到服务器
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
            return;
        }
        // 编辑按钮
        if (MouseIn(1740, y, 100, 40)) {
            currentEditTexture = i;
            tempTextureData = { ...textures[i] };
            originalEditTexture = { ...textures[i] };
            if (!data.PersistentData) data.PersistentData = {};
            data.PersistentData._originalTexture = { ...textures[i] };
            createEditInputs(textures[i]);
            return;
        }
        // 信任按钮
        if (texture?.TextureURL && !isDomainInWhitelist(texture.TextureURL) && MouseIn(1860, y, 100, 40)) {
            const domain = extractDomain(texture.TextureURL);
            if (domain) {
                pendingDomainToAdd = domain;
                currentView = "addDomainConfirm";
            }
            return;
        }
    }

    // 新增按钮：位置跟随当前页图层数量浮动，需与绘制逻辑保持一致
    if (textures.length < MAX_TEXTURE_COUNT) {
        const addBtnY = ADD_BTN_BASE_Y + itemsOnPage * ADD_BTN_STEP;
        if (MouseIn(1450, addBtnY, 90, 90)) {
            const newTexture = { ...DEFAULT_TEXTURE };
            item.Property.Textures.push(newTexture);
            currentEditTexture = textures.length - 1;
            tempTextureData = { ...newTexture };
            originalEditTexture = null; // 新增的图层没有「原始数据」，退出=删除该空图层
            if (!data.PersistentData) data.PersistentData = {};
            data.PersistentData._originalTexture = { ...newTexture };
            createEditInputs(newTexture);
            return;
        }
    }

    // 按钮位置固定基于每页最大行数，不随本页图层数变化
    const btnY = startY + TEXTURES_PER_PAGE * itemHeight;
    const hasPages = totalPages > 1;

    // 翻页按钮：只有「下一页」，循环到最后一页后跳回第一页（仅图层>=7时可用）
    if (textures.length >= 7 && hasPages && MouseIn(1885, 810, 90, 90)) {
        currentListPage = (currentListPage + 1) % totalPages;
        return;
    }

    // 确认并退出（任务1）：保存同步后关闭整个对话框
    if (MouseIn(1885, 135, 90, 90)) {
        const C = CharacterGetCurrent();
        if (item) {
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            // 保存前确保 Hide 数组与开关一致
            updateHideArray(item);

            Logger.info("保存贴图数据:", JSON.stringify(item.Property.Textures));
            Logger.info(`隐藏分类 - ${HIDE_CATEGORIES.map(c => `${c.label}: ${item.Property[c.key]}`).join(', ')}`);

            syncItemToServer(item);
            if (C) CharacterRefresh(C, false, false);
            Logger.info("贴图设置已保存并同步");
        }
        // 退出对话框（currentView 为 list，不会被 DialogLeaveFocusItem hook 拦截）
        if (typeof DialogLeaveFocusItem === "function") DialogLeaveFocusItem();
        return;
    }

    // 导入导出按钮
    const ioBtnY = btnY + 120;

    // 导出配置
    if (MouseIn(1170, ioBtnY, 200, 50)) {
        exportConfig(item);
        return;
    }

    // 覆盖导入
    if (MouseIn(1390, ioBtnY, 200, 50)) {
        importConfig(item, "overwrite");
        return;
    }

    // 追加导入
    if (MouseIn(1610, ioBtnY, 200, 50)) {
        // 预检查：当前图层已达上限，无法追加
        if ((item.Property?.Textures || []).length >= MAX_TEXTURE_COUNT) {
            showStatus(L(`✘ 超过贴图数量上限（最多 ${MAX_TEXTURE_COUNT} 个）`,
                `✘ Texture limit reached (max ${MAX_TEXTURE_COUNT})`), "#E53935");
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
        showStatus(L(`✔ 已复制到剪贴板，共 ${textures.length} 个图层`,
            `✔ Copied to clipboard, ${textures.length} layers`), "#4CAF50");
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
        showStatus(L("✔ 剪贴板不可用，已改为下载配置文件", "✔ Clipboard unavailable, downloaded config file"), "#FF9800");
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
            
            const count = item.Property.Textures.length;
            const modeText = mode === "append" ? "追加" : "覆盖";
            const modeTextEn = mode === "append" ? "Append" : "Replace";
            Logger.info(`${modeText}导入成功:`, count, "个图层");
            showStatus(L(`✔ ${modeText}导入成功，共 ${count} 个图层`,
                `✔ ${modeTextEn} import OK, ${count} layers`), "#4CAF50");

            // 同步到服务器并刷新角色
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
        } catch (err) {
            Logger.error("导入失败:", err.message);
            showStatus(L(`✘ 导入失败: ${err.message}`, `✘ Import failed: ${err.message}`), "#E53935");
        }
    }).catch(err => {
        Logger.error("读取剪贴板失败:", err);
        showStatus(L("✘ 读取剪贴板失败，请确保已复制配置 JSON", "✘ Cannot read clipboard, make sure the config JSON is copied"), "#E53935");
    });
}

/**
 * 步进按钮：初始化鼠标/触摸事件监听器（仅执行一次）
 * 跟踪指针按下状态，供 drawTextureEditPanel 每帧检测长按
 */
function setupStepperListeners() {
    if (_stepperListenerReady) return;
    _stepperListenerReady = true;
    // 鼠标
    document.addEventListener("mousedown", () => { _pointerDown = true; });
    document.addEventListener("mouseup", () => {
        _pointerDown = false;
        stepperPress.fieldId = null;
        // 释放后立即允许刷新（绕过节流，让预览马上更新）
        _lastTextureRefresh = 0;
    });
    // 触摸（移动端）
    document.addEventListener("touchstart", () => { _pointerDown = true; }, { passive: true });
    document.addEventListener("touchend", () => {
        _pointerDown = false;
        stepperPress.fieldId = null;
        _lastTextureRefresh = 0;
    });
    document.addEventListener("touchcancel", () => {
        _pointerDown = false;
        stepperPress.fieldId = null;
        _lastTextureRefresh = 0;
    });
}

/**
 * 步进按钮：将变更应用到输入框
 * @param {object} field - STEPPER_FIELDS 中的字段配置
 * @param {number} delta - 变更量（正负整数）
 */
function applyStepperChange(field, delta) {
    const input = document.getElementById(field.id);
    if (!input) return;
    let value = parseInt(input.value);
    if (isNaN(value)) value = field.def;
    value += delta;
    if (field.min !== null) value = Math.max(field.min, value);
    if (field.max !== null) value = Math.min(field.max, value);
    input.value = String(value);
}

/**
 * 步进按钮：每帧检测长按状态并应用加速变更
 * 在 drawTextureEditPanel 中调用（每帧执行）
 * 长按时间越长，步进间隔越短、步长越大
 */
function updateSteppers() {
    if (!_pointerDown) {
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
 * @param {string} tooltip - 悬停提示
 */
function drawStepperButton(x, y, icon, tooltip) {
    DrawButton(x, y, STEPPER_BTN_W, STEPPER_BTN_H, "", "White", null, tooltip);
    DrawImageResize(icon, x + 2, y + 2, STEPPER_BTN_W - 4, STEPPER_BTN_H - 4);
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
    ElementPositionFixed(INPUT_URL, 1220, 435, 490, 40);

    input = ElementCreateInput(INPUT_OFFSET_X, "number", String(texture.OffsetX ?? 1), "10");
    if (input) input.style.width = "80px";
    ElementPositionFixed(INPUT_OFFSET_X, STEPPER_INPUT_X, 485, STEPPER_INPUT_W, 40);

    input = ElementCreateInput(INPUT_OFFSET_Y, "number", String(texture.OffsetY ?? 1), "10");
    if (input) input.style.width = "80px";
    ElementPositionFixed(INPUT_OFFSET_Y, STEPPER_INPUT_X, 535, STEPPER_INPUT_W, 40);

    input = ElementCreateInput(INPUT_SCALE, "number", String(texture.Scale || 100), "10");
    if (input) input.style.width = "80px";
    ElementPositionFixed(INPUT_SCALE, STEPPER_INPUT_X, 585, STEPPER_INPUT_W, 40);

    input = ElementCreateInput(INPUT_ROTATION, "number", String(texture.Rotation || 0), "10");
    if (input) input.style.width = "80px";
    ElementPositionFixed(INPUT_ROTATION, STEPPER_INPUT_X, 635, STEPPER_INPUT_W, 40);

    input = ElementCreateInput(INPUT_OPACITY, "number", String(texture.Opacity ?? 100), "10");
    if (input) {
        input.style.width = "80px";
        input.min = "0";
        input.max = "100";
    }
    ElementPositionFixed(INPUT_OPACITY, STEPPER_INPUT_X, 685, STEPPER_INPUT_W, 40);
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
    // 初始化步进按钮事件监听（仅一次），并在每帧检测长按状态
    // 放在最前面：先应用步进变更，再由下方的 tempTextureData 检测检测变更并刷新预览
    setupStepperListeners();
    updateSteppers();

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
            
            // 标记需要刷新（不直接调用 CharacterRefresh，由下方节流逻辑统一处理）
            _pendingTextureRefresh = true;

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
        if (_pendingTextureRefresh) {
            const now = Date.now();
            if (now - _lastTextureRefresh >= TEXTURE_REFRESH_INTERVAL) {
                const C = CharacterGetCurrent();
                if (C) CharacterRefresh(C, false, false);
                _lastTextureRefresh = now;
                _pendingTextureRefresh = false;
            }
        }
    }
    
    // 标题：id1 (1430,340,140,39.65) → 中心点 (1500,360)
    DrawText(L(`编辑图层${textureIndex + 1}`, `Edit Layer ${textureIndex + 1}`), 1500, 360, "White", "Gray");

    // 说明文字：id2 (1270.42,385,470,40) → 中心点 (1505,405)
    DrawText(L("修改后自动预览，点击「确认」返回列表", "Auto-previews on change; press ✓ to return"), 1505, 405, "Yellow", "Black");

    // 贴图：id9 标签 (1000,435,200,40) → 中心 (1100,455)；id11 输入框 x=1220，Y 对齐标签高度 455
    DrawText(L("贴图", "Image"), 1100, 455, "White", "Gray");
    ElementPositionFixed(INPUT_URL, 1220, 435, 490, 40);
    // 信任按钮：id15 (1730,435,100,40)，与贴图 URL 同一行，固定位置显示，不随其他字段变化
    const currentUrl = urlInput?.value?.trim() || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain) {
            DrawButton(1730, 435, 100, 40, L("信任", "Trust"), "#6F1F1F", null,
                L("将该图片的域名加入可信白名单", "Add this image's domain to the trusted whitelist"), false);
        }
    }

    // X偏移：id3 标签 (1000,485,200,40) → 中心 (1100,505)；输入框 x=1220，Y 对齐标签高度 505
    DrawText(L("X偏移", "X Offset"), 1100, 505, "White", "Gray");
    ElementPositionFixed(INPUT_OFFSET_X, STEPPER_INPUT_X, 485, STEPPER_INPUT_W, 40);
    drawStepperButton(STEPPER_MINUS_X, 485, "Icons/Minus.png", L("减少（长按加速）", "Decrease (hold to accelerate)"));
    drawStepperButton(STEPPER_PLUS_X, 485, "Icons/Plus.png", L("增加（长按加速）", "Increase (hold to accelerate)"));

    // Y偏移：id6 标签 (1000,535,200,40) → 中心 (1100,555)；输入框 Y 对齐 555
    DrawText(L("Y偏移", "Y Offset"), 1100, 555, "White", "Gray");
    ElementPositionFixed(INPUT_OFFSET_Y, STEPPER_INPUT_X, 535, STEPPER_INPUT_W, 40);
    drawStepperButton(STEPPER_MINUS_X, 535, "Icons/Minus.png", L("减少（长按加速）", "Decrease (hold to accelerate)"));
    drawStepperButton(STEPPER_PLUS_X, 535, "Icons/Plus.png", L("增加（长按加速）", "Increase (hold to accelerate)"));

    // 缩放%：id7 标签 (1000,585,200,40) → 中心 (1100,605)；输入框 Y 对齐 605
    DrawText(L("缩放%", "Scale %"), 1100, 605, "White", "Gray");
    ElementPositionFixed(INPUT_SCALE, STEPPER_INPUT_X, 585, STEPPER_INPUT_W, 40);
    drawStepperButton(STEPPER_MINUS_X, 585, "Icons/Minus.png", L("减少（长按加速）", "Decrease (hold to accelerate)"));
    drawStepperButton(STEPPER_PLUS_X, 585, "Icons/Plus.png", L("增加（长按加速）", "Increase (hold to accelerate)"));

    // 旋转%：id8 标签 (1000,635,200,40) → 中心 (1100,655)；输入框 Y 对齐 655
    DrawText(L("旋转%", "Rotation %"), 1100, 655, "White", "Gray");
    ElementPositionFixed(INPUT_ROTATION, STEPPER_INPUT_X, 635, STEPPER_INPUT_W, 40);
    drawStepperButton(STEPPER_MINUS_X, 635, "Icons/Minus.png", L("减少（长按加速）", "Decrease (hold to accelerate)"));
    drawStepperButton(STEPPER_PLUS_X, 635, "Icons/Plus.png", L("增加（长按加速）", "Increase (hold to accelerate)"));

    // 透明度%：id12 标签 (1000,685,200,40) → 中心 (1100,705)；输入框 Y 对齐 705
    DrawText(L("透明度%", "Opacity %"), 1100, 705, "White", "Gray");
    ElementPositionFixed(INPUT_OPACITY, STEPPER_INPUT_X, 685, STEPPER_INPUT_W, 40);
    drawStepperButton(STEPPER_MINUS_X, 685, "Icons/Minus.png", L("减少（长按加速）", "Decrease (hold to accelerate)"));
    drawStepperButton(STEPPER_PLUS_X, 685, "Icons/Plus.png", L("增加（长按加速）", "Increase (hold to accelerate)"));

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
function handleTextureEditClick(item, textureIndex, data) {
    // 可信域名按钮（与贴图 URL 同一行，固定位置，不随其他字段变化）
    const urlInput = document.getElementById(INPUT_URL);
    const currentUrl = urlInput?.value?.trim() || "";
    if (currentUrl && !isDomainInWhitelist(currentUrl)) {
        const domain = extractDomain(currentUrl);
        if (domain && MouseIn(1730, 435, 100, 40)) {
            pendingDomainToAdd = domain;
            currentView = "addDomainConfirm";
            // 移除编辑页面的输入框，避免遮挡确认对话框
            currentEditTexture = -1;
            tempTextureData = null;
            _pendingTextureRefresh = false;
            [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
            return;
        }
    }

    // 删除此贴图（右下角图标按钮）
    if (MouseIn(1885, 245, 90, 90)) {
        item.Property.Textures.splice(textureIndex, 1);
        currentEditTexture = -1;
        tempTextureData = null;
        _pendingTextureRefresh = false;
        currentListPage = 0;
        [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
        syncItemToServer(item);
        const C = CharacterGetCurrent();
        if (C) CharacterRefresh(C, false, false);
        return;
    }

    // 确认保存（右上角图标按钮）
    if (MouseIn(1885, 135, 90, 90)) {
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
        _pendingTextureRefresh = false;
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

/**
 * 从子页面（编辑图层 / 隐藏设置 / 添加域名确认）返回贴图管理列表
 * 若正在编辑图层，则视为「取消编辑」：还原为编辑前数据（新增未保存的空图层则移除）
 */
function returnToListFromSubview() {
    if (currentEditTexture >= 0) {
        const item = DialogFocusItem;
        if (item) {
            if (!item.Property) item.Property = { Textures: [] };
            if (!item.Property.Textures) item.Property.Textures = [];
            if (originalEditTexture) {
                // 编辑已存在图层：还原
                item.Property.Textures[currentEditTexture] = { ...originalEditTexture };
            } else {
                // 新增但未确认的图层：取消即移除
                item.Property.Textures.splice(currentEditTexture, 1);
            }
            syncItemToServer(item);
            const C = CharacterGetCurrent();
            if (C) CharacterRefresh(C, false, false);
        }
    }
    currentEditTexture = -1;
    tempTextureData = null;
    originalEditTexture = null;
    pendingDomainToAdd = null;
    currentView = "list";
    [INPUT_URL, INPUT_OFFSET_X, INPUT_OFFSET_Y, INPUT_SCALE, INPUT_ROTATION, INPUT_OPACITY].forEach(id => ElementRemove(id));
}

/**
 * 注册与对话框交互相关的全局函数 hook
 * 任务5：编辑图层（及其它子页面）时点击退出，应返回贴图管理列表而非整个跳出
 * 任务6：配置本道具时隐藏左侧人物身上的互动格线，避免上传图片时被框线干扰
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupDialogHooks(HookManager) {
    // 任务6：DialogFocusItem 为「自定义贴图」时，跳过角色身上的互动区域格线绘制
    // DrawAssetGroupZone 由 DrawCharacter 在 C.FocusGroup 存在时调用，用于画各部位可点击格子
    if (typeof DrawAssetGroupZone === "function") {
        HookManager.hookFunction("DrawAssetGroupZone", 0, (args, next) => {
            if (DialogFocusItem?.Asset?.Name === asset.Name) return;
            return next(args);
        });
    }

    // 任务5：在子页面时点击退出（DialogLeaveFocusItem）→ 返回列表并阻止真正退出
    if (typeof DialogLeaveFocusItem === "function") {
        HookManager.hookFunction("DialogLeaveFocusItem", 0, (args, next) => {
            const item = DialogFocusItem;
            const inSubview = currentEditTexture >= 0 || currentView !== "list";
            if (item?.Asset?.Name === asset.Name && inSubview) {
                returnToListFromSubview();
                return; // 阻止关闭对话框
            }
            return next(args);
        });
    }
}