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
    Alias: "",        // 图层别名（玩家自定义，方便管理）
    TextureURL: "",
    OffsetX: 1,
    OffsetY: 1,
    ScaleX: 100,     // 水平缩放 %
    ScaleY: 100,     // 垂直缩放 %
    ScaleLocked: true, // "等比"开关：开启时修改 ScaleX/ScaleY 任一方都会同步另一方
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
    HideHead: false,       // 隐藏头部
    HideBodyUpper: false,  // 隐藏上半身
    HideBodyLower: false,  // 隐藏下半身
    HideClothing: false,   // 隐藏服饰
    HideItems: false,      // 隐藏拘束道具
    // 兼容字段：v5 及以前用单一 HideBody 开关，v6 拆为 头部/上半身/下半身 三个。
    // 这里保留 HideBody 是为了让 BC 的 CraftingValidate (ItemProperty.Validate) 能通过
    // ——否则老自制道具的 ItemProperty 里带 HideBody，而新 BaselineProperty 没有该键时，
    // typeof 校验会失败，导致整个 ItemProperty 被判废、Textures 一起丢失。
    // HideBody 已不在 HIDE_CATEGORIES 中，updateHideArray 不读取它，纯兼容用途。
    HideBody: false
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
        poses: ["BaseLower", "LegsClosed", "Kneel", "KneelingSpread", "Spread"]
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
    LegsClosed:     { cn: "站立闭合",   en: "Legs Closed" },
    Kneel:          { cn: "跪姿",       en: "Kneel" },
    KneelingSpread: { cn: "跪地张腿",   en: "Kneeling Spread" },
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
/**
 * 清除数组尾部的 null 元素（槽位制：删除中间槽位设为 null，尾部连续 null 可安全移除以节省空间）
 * 就地修改传入数组
 * @param {Array} textures
 */
export function trimTrailingNulls(textures) {
    if (!Array.isArray(textures)) return;
    while (textures.length > 0 && textures[textures.length - 1] === null) {
        textures.pop();
    }
}

/**
 * 旧数据兼容：单一 Scale 字段拆分为 ScaleX/ScaleY 两个字段（保留缩放比例的旧行为，默认等比锁定）
 * 就地修改传入对象；同时处理 texture 本身与其 PoseSettings 里每个姿势覆盖对象
 * @param {object} texture - 单个贴图配置对象
 */
export function migrateScaleField(texture) {
    if (!texture || typeof texture !== "object") return;
    if (texture.Scale !== undefined && texture.ScaleX === undefined) {
        texture.ScaleX = texture.Scale;
        texture.ScaleY = texture.Scale;
        // 旧版单一 Scale 等价于 X/Y 等比锁定，显式设置以保留行为
        texture.ScaleLocked = true;
        delete texture.Scale;
    }
    if (texture.PoseSettings && typeof texture.PoseSettings === "object") {
        for (const ps of Object.values(texture.PoseSettings)) {
            if (ps && ps.Scale !== undefined && ps.ScaleX === undefined) {
                ps.ScaleX = ps.Scale;
                ps.ScaleY = ps.Scale;
                delete ps.Scale;
            }
        }
    }
}

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

// 姿势信息栏 UI 坐标（下移以容纳新增的 缩放Y 行 + 旋转/图层优先级 BAR）
// item5：整行（标签+姿势名称值）X 坐标整体左移 40；独立配置开关 / "设定"按钮不再单独占一行，
// 改为紧接在姿势名称值框之后、同一行（POSE_BAR_Y）
export const POSE_BAR_Y = 930;           // 姿势信息行 Y 坐标（下移避开图层优先级BAR滑桿）
export const POSE_TOGGLE_H = 40;         // 开关按钮高度

// 双开关系统："单独设置"(编辑目标) + "生效设置"(是否使用独立配置)
// 布局：标签 | 姿势名 | 单独设置 | 生效设置 | 设定
export const POSE_EDIT_TOGGLE_X = 1450;     // "单独设置"开关 X
export const POSE_EDIT_TOGGLE_W = 110;      // "单独设置"开关宽
export const POSE_ACTIVE_TOGGLE_X = 1570;   // "生效设置"开关 X
export const POSE_ACTIVE_TOGGLE_W = 110;    // "生效设置"开关宽
export const POSE_SWITCH_X = POSE_ACTIVE_TOGGLE_X + POSE_ACTIVE_TOGGLE_W + 10; // "设定"按钮 X
export const POSE_SWITCH_W = 100;        // "设定"按钮宽度

// 姿势切换页面 UI 坐标
// 布局：分类标题在左侧(X1100)，与该分类第一行按钮同一行对齐；按钮从 X1265 开始，每行固定 3 个，超过自动换行
// 手部姿势 6 个 = 3+3（两行），腿部姿势 4 个 = 3+1（两行），全身姿势 2 个（一行）
export const POSE_PAGE_BTN_W = 150;      // 单个姿势按钮宽度
export const POSE_PAGE_BTN_H = 40;       // 单个姿势按钮高度
export const POSE_PAGE_BTN_GAP = 20;     // 按钮间距（同一行内）
export const POSE_PAGE_START_X = 1265;   // 按钮起始 X 坐标
export const POSE_PAGE_COLS = 3;         // 每行固定按钮数
export const POSE_PAGE_START_Y = 435;    // 第一个分类第一行按钮的 Y 坐标（手部姿势标题 Y455 = 435+20）
export const POSE_PAGE_ROW_STEP = 50;    // 同一分类内，相邻两行按钮 Y 坐标间距
export const POSE_PAGE_CATEGORY_GAP = 30;// 换到下一个分类时，在 ROW_STEP 之外额外增加的间距
export const POSE_PAGE_LABEL_X = 1100;   // 分类标题 X 坐标
export const POSE_PAGE_LABEL_Y_OFFSET = 20; // 分类标题 Y = 该分类第一行按钮 Y + 此偏移（与按钮垂直居中对齐）

// 姿势切换页面底部按钮（进入特殊配置 / 确认）
export const POSE_PAGE_BOTTOM_Y = 760;       // 底部按钮行 Y 坐标
export const POSE_SPECIAL_BTN_X = 1265;      // "进入特殊配置"按钮 X
export const POSE_SPECIAL_BTN_W = 200;       // "进入特殊配置"按钮宽
export const POSE_CONFIRM_BTN_X = 1700;      // "确认"按钮 X
export const POSE_CONFIRM_BTN_W = 150;       // "确认"按钮宽

// 特殊配置页面：组合选择器（左/右按钮 + 名称 + 自动轮询开关）
export const POSE_COMBO_LEFT_X = 1265;       // 上一组合按钮 X
export const POSE_COMBO_RIGHT_X = 1700;      // 下一组合按钮 X
export const POSE_COMBO_BTN_W = 60;          // 左右按钮宽
export const POSE_COMBO_NAME_Y = 405;        // 组合名称行 Y
export const POSE_COMBO_DROPDOWN_ID = "ShuangPoseComboDropdown"; // 下拉框 DOM 元素 ID
export const POSE_COMBO_DROPDOWN_X = 1330;   // 下拉框 X（左箭头右侧）
export const POSE_COMBO_DROPDOWN_Y = 385;    // 下拉框 Y
export const POSE_COMBO_DROPDOWN_W = 360;    // 下拉框宽（到右箭头左侧）
export const POSE_COMBO_DROPDOWN_H = 40;     // 下拉框高
export const POSE_COMBO_SAVE_X = 1700;       // "保存并返回"按钮 X
export const POSE_COMBO_SAVE_Y = 900;        // "保存并返回"按钮 Y

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
        key: "HideHead",
        label: "头部",
        labelEn: "Head",
        groups: [
            "Head"
        ]
    },
    {
        key: "HideBodyUpper",
        label: "上半身",
        labelEn: "Body Upper",
        groups: [
            "BodyUpper", "Nipples",
            "ArmsLeft", "ArmsRight", "HandsLeft", "HandsRight"
        ]
    },
    {
        key: "HideBodyLower",
        label: "下半身",
        labelEn: "Body Lower",
        groups: [
            "BodyLower", "Pussy",
            "Height", "BodyStyle", "Pronouns",
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

// 数值字段标识符（X偏移/Y偏移/缩放X/缩放Y/透明度：真实 DOM <input type="number">，可直接输入，
// 旁边配自绘 +/- 步进按钮；同时用于 stepperPress 长按状态追踪的字段 id，
// 也直接作为对应 DOM <input> 的元素 id 使用（见 editPanel.js 的 createEditPanelDomInputs）
export const FIELD_OFFSET_X = "CustomTextureOffsetX";
export const FIELD_OFFSET_Y = "CustomTextureOffsetY";
export const FIELD_SCALE_X = "CustomTextureScaleX";
export const FIELD_SCALE_Y = "CustomTextureScaleY";
export const FIELD_OPACITY = "CustomTextureOpacity";
// BAR 滑桿字段标识符（旋转 0~360 / 图层优先级 -99~99）：与其余数值字段布局一致
// （标签 + [-] + 数值框(DOM input) + [+]），数值框右侧额外追加一条可拖动的 BAR 滑桿（item2）
export const FIELD_ROTATION = "CustomTextureRotation";
export const FIELD_PRIORITY = "CustomTexturePriority";
// 贴图网址输入框（真实 DOM <input type="text">，可直接输入，见 item1）
export const FIELD_URL = "CustomTextureURLInput";

// === 步进按钮（+/-）配置 ===
// 在每个数值框两侧放置加减按钮，支持长按加速；数值框本体为 canvas 绘制，点击弹出 prompt() 直接输入精确值
export const STEPPER_BTN_W = 40;
export const STEPPER_BTN_H = 40;
export const STEPPER_MINUS_X = 1220;   // 减号按钮 X 坐标
export const STEPPER_PLUS_X = 1380;    // 加号按钮 X 坐标
export const STEPPER_INPUT_X = 1265;   // 数值框 X 坐标（位于两按钮之间）
export const STEPPER_INPUT_W = 110;    // 数值框宽度
export const STEPPER_INPUT_H = 40;     // 数值框高度

// 数值字段配置（X偏移/Y偏移/缩放X/缩放Y/透明度）：真实 DOM <input type="number">，可直接输入（item1）
// 注意：以下坐标均为手动写死（非动态排列）。"镜射"整行位于 Y偏移与缩放X之间；
// 缩放X/缩放Y 两行之后依次是 旋转(BAR)/透明度/图层优先级(BAR)
export const STEPPER_FIELDS = [
    { id: FIELD_OFFSET_X, y: 485, labelCn: "X偏移",   labelEn: "X Offset",   labelY: 505, prop: "OffsetX", def: 1,   min: null, max: null },
    { id: FIELD_OFFSET_Y, y: 535, labelCn: "Y偏移",   labelEn: "Y Offset",   labelY: 555, prop: "OffsetY", def: 1,   min: null, max: null },
    { id: FIELD_SCALE_X,  y: 635, labelCn: "缩放X%",  labelEn: "Scale X %",  labelY: 655, prop: "ScaleX",  def: 100, min: null, max: null },
    { id: FIELD_SCALE_Y,  y: 680, labelCn: "缩放Y%",  labelEn: "Scale Y %",  labelY: 700, prop: "ScaleY",  def: 100, min: null, max: null }
];

// BAR 滑桿字段配置（旋转 / 图层优先级 / 透明度，item2）：与 STEPPER_FIELDS 共用同一套
// [-] / 数值框(DOM input) / [+] 横向布局（复用 STEPPER_MINUS_X/STEPPER_INPUT_X/STEPPER_PLUS_X），
// 保持与 X偏移/Y偏移/缩放 等字段完全一致的外观；数值框右侧额外追加一条可拖动的 BAR 滑桿
// （方形手柄，轨道可点击跳转/拖动手柄两种方式调值，与旁边的数值框相互同步）
export const BAR_FIELDS = [
    { id: FIELD_ROTATION, y: 730, labelCn: "旋转",     labelEn: "Rotation",      labelY: 750, prop: "Rotation", def: 0,   min: 0,   max: 360, bar: true },
    { id: FIELD_OPACITY,  y: 780, labelCn: "透明度%", labelEn: "Opacity %",     labelY: 800, prop: "Opacity",   def: 100, min: 0,   max: 100, bar: true },
    { id: FIELD_PRIORITY, y: 830, labelCn: "图层优先级", labelEn: "Layer Priority", labelY: 850, prop: null,       def: 50,  min: -99, max: 99,  bar: true }
];

// BAR 轨道 + 方形手柄的绘制参数：紧跟在 [+] 步进按钮（STEPPER_PLUS_X 结束于 1420）之后，
// 留出与其余控件一致的间距
export const BAR_TRACK_X = 1445;      // 轨道起始 X 坐标（STEPPER_PLUS_X(1380) + STEPPER_BTN_W(40) + 25 间距）
export const BAR_TRACK_W = 220;       // 轨道宽度（1445~1665，未超出面板可用宽度）
export const BAR_TRACK_H = 8;         // 轨道厚度
export const BAR_HANDLE_SIZE = 24;    // 方形手柄边长

// === "移动"拖拽模式按钮：点击后可在角色预览区域用鼠标/触摸自由拖动图片位置 ===
// （提前到此处声明，供下方"拖移"按钮 item4 对齐 X 坐标引用）
export const MOVE_BTN_X = 1435;
export const MOVE_BTN_Y = 510;
export const MOVE_BTN_W = 100;           // 与"信任"按钮同尺寸（100x40），保持按钮框大小统一
export const MOVE_BTN_H = 40;

// === 缩放X/Y："拖移"拖动缩放按钮 + "等比"锁定按钮 ===
// item4：「拖移」按钮的 X 对齐「移动」按钮的 X（MOVE_BTN_X），Y 在原基础上 -20，
// 与「移动」按钮的定位方式保持一致（UI 一致性）；「等比」按钮的 X 按同样的位移量一并补正，
// 以维持与「拖移」按钮原本的相对间距，Y 同步对齐
export const SCALE_DRAG_BTN_X = MOVE_BTN_X;      // 1435（原 1510，对齐「移动」按钮 X）
export const SCALE_DRAG_BTN_Y = 660;             // 原 680 - 20
export const SCALE_DRAG_BTN_W = 100;             // 与"信任"按钮同尺寸
export const SCALE_DRAG_BTN_H = 40;
export const ASPECT_LOCK_BTN_X = SCALE_DRAG_BTN_X + SCALE_DRAG_BTN_W + 20; // 紧跟「拖移」按钮，间距 20
export const ASPECT_LOCK_BTN_Y = SCALE_DRAG_BTN_Y;       // 与「拖移」按钮同一行
export const ASPECT_LOCK_BTN_W = 100;            // 与"信任"按钮同尺寸
export const ASPECT_LOCK_BTN_H = 40;
// 拖动缩放的灵敏度：每 1px 鼠标位移对应的缩放 % 变化量
export const SCALE_DRAG_SENSITIVITY = 0.5;

// === 镜射（水平/垂直）：现移至"Y偏移"与"缩放%"两行之间 ===
export const MIRROR_ROW_Y = 585;          // 镜射行 Y 坐标（Y偏移 535 与 缩放% 635 的正中间）
export const MIRROR_ROW_LABEL_Y = 605;    // 镜射行文字标签 Y 坐标
export const MIRROR_H_BTN_X = 1220;       // 水平镜射按钮 X 坐标（复用步进按钮左侧列位置）
export const MIRROR_V_BTN_X = 1330;       // 垂直镜射按钮 X 坐标
export const MIRROR_BTN_W = 90;
export const MIRROR_BTN_H = 40;

// 长按步进状态跟踪（可变对象，在各模块间共享同一引用）
export const stepperPress = {
    fieldId: null,     // 当前按住的字段 ID
    direction: 0,      // -1（减）或 +1（加）
    startTime: 0,      // 按下开始时间戳（ms）
    lastUpdate: 0      // 上次值变更时间戳（ms）
};

// 贴图网址输入框位置（真实 DOM <input type="text">，可直接输入网址，item1）
export const URL_BOX_X = 1220;
export const URL_BOX_Y = 435;
export const URL_BOX_W = 490;
export const URL_BOX_H = 40;

// BAR 滑桿的拖动状态跟踪（可变对象，在各模块间共享同一引用）
export const barDrag = {
    fieldId: null   // 当前正在拖动的 BAR 字段 id，未拖动时为 null
};

// 缩放拖动模式的状态跟踪（可变对象，在各模块间共享同一引用）
export const scaleDrag = {
    active: false,
    startMouseX: 0,
    startMouseY: 0,
    startScaleX: 100,
    startScaleY: 100
};

// === 登录页面加载标识贴图配置 ===
export const BADGE_IMAGE_URL = "https://shuang-custom-assets.pages.dev/SCA_logo.png";

export const LOGIN_BADGE_TEXTURE = {
    TextureURL: BADGE_IMAGE_URL,
    OffsetX: 153,
    OffsetY: -200,
    ScaleX: 21,
    ScaleY: 21,
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