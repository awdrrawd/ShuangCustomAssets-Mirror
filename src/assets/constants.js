/**
 * 自定义贴图道具 - 常量定义
 * 所有常量集中管理，避免分散在各模块中
 */

/**
 * 道具名称（用于 dialogHooks 中判断 DialogFocusItem 是否为本道具，避免循环依赖）
 */
export const ASSET_NAME = "自定义贴图";

/**
 * 单个贴图的默认属性
 * 全局设置作为所有姿势的默认值，PoseSettings 按姿势独立开启覆盖
 */
export const DEFAULT_TEXTURE = {
    // === 全局设置（所有姿势共用）===
    TextureURL: "",
    OffsetX: 1,
    OffsetY: 1,
    Scale: 100,
    Rotation: 0,
    Visible: true,   // 可见开关
    Opacity: 100,    // 透明度（0-100）
    MirrorH: false,  // 水平镜射
    MirrorV: false,  // 垂直镜射
    // === 姿势设置 ===
    // 每个姿势可独立开启，开启后其设置覆盖全局
    // 未设置的字段自动回退到全局值
    // 格式: { "Yoked": { enabled: true, OffsetX: 15, TextureURL: "..." }, ... }
    PoseSettings: {}
};

/**
 * 道具的默认属性
 */
export const DEFAULT_PROPS = {
    Textures: [],          // 贴图数组
    HideEmoticon: false,   // 隐藏表情图标
    HideCosplay: false,    // 隐藏 cosplay 部位
    HideFacial: false,     // 隐藏五官
    HideBody: false,       // 隐藏身体
    HideClothing: false,   // 隐藏服饰
    HideItems: false       // 隐藏拘束道具
};

// === 姿势分类 ===
// BC 的姿势系统按 Category 分为上半身(手臂)、下半身(腿)、全身三类
// 手臂和腿部姿势可两两组合；全身姿势覆盖手臂和腿部姿势
export const POSE_CATEGORIES = {
    BodyUpper: {
        label: "手部姿势",
        labelEn: "Arm Pose",
        poses: ["BaseUpper", "Yoked", "OverTheHead", "BackBoxTie", "BackElbowTouch", "BackCuffs"]
    },
    BodyLower: {
        label: "腿部姿势",
        labelEn: "Leg Pose",
        poses: ["BaseLower", "Kneel", "KneelingSpread", "LegsClosed", "Spread"]
    },
    BodyFull: {
        label: "全身姿势",
        labelEn: "Full Body Pose",
        poses: ["Hogtied", "AllFours"]
    }
};

// 所有姿势名（扁平数组，用于快速查找）
export const ALL_POSE_NAMES = Object.values(POSE_CATEGORIES).flatMap(c => c.poses);

// 姿势中文/英文标签（用于 UI 显示）
export const POSE_LABELS = {
    BaseUpper:      { cn: "基础手势",   en: "Arms Down" },
    Yoked:          { cn: "举手",       en: "Yoked" },
    OverTheHead:    { cn: "高举双手",   en: "Over The Head" },
    BackBoxTie:     { cn: "轻松背手",   en: "Box Tie" },
    BackElbowTouch: { cn: "紧绷背手",   en: "Elbow Touch" },
    BackCuffs:      { cn: "背后手铐",   en: "Back Cuffs" },
    BaseLower:      { cn: "站立",       en: "Standing" },
    Kneel:          { cn: "跪姿",       en: "Kneel" },
    KneelingSpread: { cn: "跪地张腿",   en: "Kneeling Spread" },
    LegsClosed:     { cn: "站立闭合",       en: "Legs Closed" },
    Spread:         { cn: "站立张腿",       en: "Spread" },
    Hogtied:        { cn: "仰卧",       en: "Hogtied" },
    AllFours:       { cn: "四肢着地",   en: "All Fours" }
};

/**
 * 根据角色当前姿势生成 PoseSettings 的键名
 * - 全身姿势：直接返回姿势名（如 "Hogtied"）
 * - 上身+下身组合：返回 "Upper+Lower"（如 "Yoked+Kneel"、"BaseUpper+BaseLower"）
 * - 基础站姿也返回键名 "BaseUpper+BaseLower"，不区分特殊处理
 * @param {string[]} drawPose - C.DrawPose 数组
 * @returns {string|null}
 */
export function getPoseKey(drawPose) {
    if (!drawPose || drawPose.length === 0) return null;

    const fullPoses = POSE_CATEGORIES.BodyFull.poses;
    const upperPoses = POSE_CATEGORIES.BodyUpper.poses;
    const lowerPoses = POSE_CATEGORIES.BodyLower.poses;

    // 全身姿势优先
    const fullPose = drawPose.find(p => fullPoses.includes(p));
    if (fullPose) return fullPose;

    // 上下身组合（包含 BaseUpper/BaseLower）
    const upperPose = drawPose.find(p => upperPoses.includes(p));
    const lowerPose = drawPose.find(p => lowerPoses.includes(p));

    if (upperPose && lowerPose) return `${upperPose}+${lowerPose}`;
    if (upperPose) return upperPose;
    if (lowerPose) return lowerPose;
    return null;
}

// 姿势信息栏 UI 坐标
export const POSE_BAR_Y = 855;           // 姿势信息行 Y 坐标（底部，图层优先级字段下方）
export const POSE_BTN_Y = 890;           // 独立配置开关和切换姿势按钮行 Y 坐标（姿势文字下方单独一行）
export const POSE_TOGGLE_X = 1100;       // 独立配置开关按钮 X 坐标
export const POSE_TOGGLE_W = 170;        // 独立配置开关按钮宽度
export const POSE_TOGGLE_H = 35;         // 独立配置开关按钮高度
export const POSE_SWITCH_X = 1520;       // 切换姿势按钮 X 坐标
export const POSE_SWITCH_W = 130;        // 切换姿势按钮宽度

// 姿势切换页面 UI 坐标
export const POSE_PAGE_BTN_W = 150;      // 单个姿势按钮宽度
export const POSE_PAGE_BTN_H = 40;       // 单个姿势按钮高度
export const POSE_PAGE_BTN_GAP = 5;      // 按钮间距
export const POSE_PAGE_START_X = 1010;   // 按钮起始 X 坐标

// 每页显示的贴图数量
export const TEXTURES_PER_PAGE = 6;

// 最大贴图数量
export const MAX_TEXTURE_COUNT = 16;

// 可见开关按钮 ID 前缀
export const VISIBLE_BTN_PREFIX = "CustomTextureVisibleBtn_";

// 预定义的图层名称
export const LAYER_NAMES = Array.from({ length: MAX_TEXTURE_COUNT }, (_, i) => `Layer${i + 1}`);

// 所有物品部位组（覆盖游戏所有 Item 分类）
export const ALL_ITEM_GROUPS = [
    "ItemAddon", "ItemArms", "ItemBoots", "ItemBreast", "ItemButt",
    "ItemDevices", "ItemEars", "ItemFeet", "ItemHands", "ItemHead",
    "ItemHood", "ItemLegs", "ItemMisc", "ItemMouth", "ItemMouth2",
    "ItemMouth3", "ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints",
    "ItemNipples", "ItemNipplesPiercings", "ItemNose", "ItemPelvis",
    "ItemTorso", "ItemTorso2", "ItemVulva", "ItemVulvaPiercings",
    "ItemHandheld"
];

// === CharacterRefresh 节流（防止步进按钮长按时高频刷新导致 WebGL Context Lost） ===
// stepper 长按时的最小刷新间隔（ms），5 次/秒
export const TEXTURE_REFRESH_INTERVAL = 200;
// “移动”拖拽时鼠标位置每帧都在变，仍用 200ms（5 次/秒）会让预览明显跟不上手，产生“卡卡的”的感觉；
// 拖拽只是单一数值的连续变化（不像长按 stepper 会越按越快），可以放宽到更高频率而不会失控，
// 这里用更短的间隔（约 20 次/秒）换取更跟手的拖拽手感，同时仍能避免每帧都刷新导致的性能问题
export const TEXTURE_DRAG_REFRESH_INTERVAL = 50;

// === 固定资源 CDN（Cloudflare Pages 主源 + Netlify 备用源）===
// 两端部署相同资源，主源加载失败时自动回退到备用源（见 resolveFixedAssetUrl）
export const ASSETS_CDN_PRIMARY = "https://shuang-custom-assets.pages.dev";
export const ASSETS_CDN_FALLBACK = "https://shuang-custom-assets.netlify.app";

/**
 * 隐藏分类配置
 * 每个分类包含: key(属性名), label(显示名称), groups(组名数组)
 */
export const HIDE_CATEGORIES = [
    {
        key: "HideEmoticon",
        label: "表情图标",
        labelEn: "Emoticon",
        groups: [
            "Emoticon"
        ]
    },
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
            "Head", "BodyUpper", "BodyLower", "Height",
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
export const ALL_HIDEABLE_GROUPS = HIDE_CATEGORIES.flatMap(c => c.groups);

// 数值字段标识符（X偏移/Y偏移/缩放/旋转/透明度/图层优先级均为真实 DOM <input type="number">，
// 支持鼠标滚轮调值，同时用于 stepperPress 长按状态追踪）
export const INPUT_OFFSET_X = "CustomTextureOffsetXInput";
export const INPUT_OFFSET_Y = "CustomTextureOffsetYInput";
export const INPUT_SCALE = "CustomTextureScaleInput";
export const INPUT_ROTATION = "CustomTextureRotationInput";
export const INPUT_OPACITY = "CustomTextureOpacityInput";
export const INPUT_PRIORITY = "CustomTexturePriorityInput";

// === 真实 DOM 元素 ID（贴图网址输入框 + 透明度滑桿）===
// 均会遮挡其下方 canvas 绘制的内容，因此仅在编辑图层时定位到对应坐标，
// 其余时间（列表页等）统一移出画面外（见 positionEditPanelInputs）
export const URL_INPUT_ID = "ShuangTextureUrlInput";
export const OPACITY_SLIDER_ID = "ShuangTextureOpacitySlider";

// 透明度滑桿位置：放在透明度 +/- 按钮右侧
export const OPACITY_SLIDER_X = 1435;
export const OPACITY_SLIDER_W = 260;

// === 步进按钮（+/-）配置 ===
// 在每个数值输入框两侧放置加减按钮，支持长按加速
export const STEPPER_BTN_W = 40;
export const STEPPER_BTN_H = 40;
export const STEPPER_MINUS_X = 1220;   // 减号按钮 X 坐标
export const STEPPER_PLUS_X = 1380;    // 加号按钮 X 坐标
export const STEPPER_INPUT_X = 1265;   // 输入框 X 坐标（位于两按钮之间）
export const STEPPER_INPUT_W = 110;    // 输入框容器宽度

// 数值字段的步进配置（顺序对应 OffsetX/Y, 缩放, 旋转, 透明度, 优先级）
// 注意：以下坐标均为手动写死（非动态排列）。"镜射"整行现位于 Y偏移与缩放% 之间，
// 缩放/旋转 两个字段的 y / labelY 因此下移 50px，透明度/图层优先级 的 y 维持不变
export const STEPPER_FIELDS = [
    { id: INPUT_OFFSET_X, y: 485, labelCn: "X偏移",   labelEn: "X Offset",   labelY: 505, prop: "OffsetX",  def: 1,   min: null, max: null },
    { id: INPUT_OFFSET_Y, y: 535, labelCn: "Y偏移",   labelEn: "Y Offset",   labelY: 555, prop: "OffsetY",  def: 1,   min: null, max: null },
    { id: INPUT_SCALE,    y: 635, labelCn: "缩放%",   labelEn: "Scale %",    labelY: 655, prop: "Scale",    def: 100, min: null, max: null },
    { id: INPUT_ROTATION, y: 685, labelCn: "旋转%",   labelEn: "Rotation %",  labelY: 705, prop: "Rotation", def: 0,   min: null, max: null },
    { id: INPUT_OPACITY,  y: 735, labelCn: "透明度%", labelEn: "Opacity %",  labelY: 755, prop: "Opacity",  def: 100, min: 0,    max: 100 },
    { id: INPUT_PRIORITY, y: 785, labelCn: "图层优先级",  labelEn: "Layer Priority",   labelY: 805, prop: null,      def: 50,  min: -99,  max: 99 }
];

// === 镜射（水平/垂直）：现移至"Y偏移"与"缩放%"两行之间 ===
export const MIRROR_ROW_Y = 585;          // 镜射行 Y 坐标（Y偏移 535 与 缩放% 635 的正中间）
export const MIRROR_ROW_LABEL_Y = 605;    // 镜射行文字标签 Y 坐标
export const MIRROR_H_BTN_X = 1220;       // 水平镜射按钮 X 坐标（复用步进按钮左侧列位置）
export const MIRROR_V_BTN_X = 1330;       // 垂直镜射按钮 X 坐标
export const MIRROR_BTN_W = 90;
export const MIRROR_BTN_H = 40;

// === "移动"拖拽模式按钮：点击后可在角色预览区域用鼠标/触摸自由拖动图片位置 ===
export const MOVE_BTN_X = 1435;
export const MOVE_BTN_Y = 510;
export const MOVE_BTN_W = 150;
export const MOVE_BTN_H = 40;

// 长按步进状态跟踪（可变对象，在各模块间共享同一引用）
export const stepperPress = {
    fieldId: null,     // 当前按住的字段 ID
    direction: 0,      // -1（减）或 +1（加）
    startTime: 0,      // 按下开始时间戳（ms）
    lastUpdate: 0      // 上次值变更时间戳（ms）
};

// 贴图网址输入框位置
export const URL_BOX_X = 1220;
export const URL_BOX_Y = 435;
export const URL_BOX_W = 490;
export const URL_BOX_H = 40;

// === 登录页面加载标识贴图配置 ===
export const BADGE_IMAGE_URL = "https://shuang-custom-assets.pages.dev/SCA_logo.png";

export const LOGIN_BADGE_TEXTURE = {
    TextureURL: BADGE_IMAGE_URL,
    OffsetX: 153,
    OffsetY: -200,
    Scale: 21,
    Rotation: 0,
    Opacity: 100,
    Visible: true
};

export const LOGIN_BADGE_ASSET_NAME = "自定义贴图";
export const LOGIN_BADGE_GROUP = "ItemTorso";

// 道具字符串资源
export const assetStrings = {
    CN: { SelectBase: "贴图管理" },
    EN: { SelectBase: "Texture Manager" }
};
