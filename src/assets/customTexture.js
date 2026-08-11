/**
 * 自定义贴图道具 - 游戏多图层版本
 * 每个贴图对应一个游戏图层
 *
 * 主模块：道具定义 + extended hooks + register
 * 各子模块按职责拆分到同目录下的独立文件中
 */

import {
    ASSET_NAME, LAYER_NAMES,
    ALL_ITEM_GROUPS, ALL_HIDEABLE_GROUPS,
    DEFAULT_PROPS, HIDE_CATEGORIES,
    BADGE_IMAGE_URL, assetStrings, migrateScaleField
} from "./constants.js";
import { state, resetDragState } from "./state.js";
import { updateHideArray } from "./hideArray.js";
import { syncItemToServer, recordItemBaseline } from "./serverSync.js";
import {
    drawTextureEditPanel, handleTextureEditClick,
    unregisterPoseHook, createEditPanelDomInputs, positionEditPanelInputs, removeEditPanelInputs
} from "./editPanel.js";
import {
    drawAddDomainConfirm, handleAddDomainConfirmClick,
    drawHideSettings, handleHideSettingsClick,
    drawTextureListMain, handleTextureListClick
} from "./listView.js";
import { drawTutorial, handleTutorialClick } from "./tutorial.js";
import { renderTexture } from "./render.js";
import { L } from "@lib/utils.js";

// 为 main.js 向后兼容重新导出
export { setupLoginBadge } from "./loginBadge.js";
export { setupDialogHooks } from "./dialogHooks.js";

/**
 * 检查道具是否被锁且当前玩家无权解锁
 * noarch archetype 的 ChangeWhenLocked 不会自动生效，需手动检查
 */
function isItemLockedForPlayer(item) {
    if (!item?.Property?.LockedBy) return false;
    const C = CharacterGetCurrent();
    if (!C) return false;
    return !DialogCanUnlock(C, item);
}

/**
 * 道具定义
 * 参考 echo 玩偶设计：注册到 ItemMisc + ItemHandheld，所有部位可用
 * @type {CustomAssetDefinition}
 */
const asset = {
    Name: ASSET_NAME,
    Random: false,
    Left: 125,
    Top: 225,
    ParentGroup: {},
    Priority: 50,
    PoseMapping: {},
    DynamicGroupName: "ItemMisc",
    AllowColorize: false,
    Extended: true,
    AllowLock: true,       // 允许上锁
    AllowTighten: true,    // 允许调节松紧度
    DrawLocks: false,      // 不自动添加 Lock 图层（避免干扰 16 层贴图结构）
    Difficulty: 2,         // 基础松紧度
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
    ChangeWhenLocked: false, // 上锁后禁止切换配置（标准束缚道具行为）
    // 声明自定义属性的字段及默认值类型
    // BC 的 Crafting 系统会根据 baselineProperty 的键来决定保存哪些属性
    //
    // 注意：这里刻意不把 Hide 列进来。BC 核心的 ValidationSanitizeProperties() 每次解析外观
    // 差异时都会用这份 BaselineProperty 去检查 item.Property 是否缺栏位，只要少一个就会印出
    // "Initializing one or more missing extended item properties from ..." 的警告（Push=false，
    // 只在本地补一次，不会写回服务器）。而 hideArray.js 的 updateHideArray 是刻意在没有任何
    // 分类需要隐藏时 delete item.Property.Hide（省流量，不送一个空数组上服务器）--如果这里把
    // Hide 也列进 BaselineProperty，就会变成：validation 侦测到 Hide 缺栏位 -> 本地补回 []
    // -> 下一次 updateHideArray 又把它删掉 -> 下一次 validation 又侦测到缺栏位……无限反复触发
    // 同一句核心警告。Hide 本身有 BC 原生的 ValidationSanitizeAllowedPropertyArray /
    // ValidationSanitizeStringArray 负责校验，不需要也不应该被这份 BaselineProperty 强制要求
    // 「必须存在」。
    BaselineProperty: {
        Textures: [],          // 贴图数组
        HideEmoticon: false,   // 隐藏表情图标
        HideCosplay: false,    // 隐藏 cosplay 部位
        HideFacial: false,     // 隐藏五官
        HideHead: false,       // 隐藏头部
        HideBodyUpper: false,  // 隐藏上半身
        HideBodyLower: false,  // 隐藏下半身
        HideClothing: false,   // 隐藏服饰
        HideItems: false,      // 隐藏拘束道具
        // 兼容字段：保留 HideBody 让老自制道具(v5)的 ItemProperty 能通过 CraftingValidate，
        // 避免 Textures 被连带丢弃。详见 DEFAULT_PROPS 中同样位置的注释。
        HideBody: false
    },
    ScriptHooks: {
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            if (!item.Property.Textures) item.Property.Textures = [];
            // 兼容旧数据：v5 及以前用单一 HideBody 开关，v6 拆为 头部/上半身/下半身 三个
            // 旧 HideBody=true 时，三个新分类全部置 true（等价于原来的「隐藏整个身体」），然后删除旧字段
            if (item.Property.HideBody === true) {
                item.Property.HideHead = true;
                item.Property.HideBodyUpper = true;
                item.Property.HideBodyLower = true;
                delete item.Property.HideBody;
            }
            // 兼容旧数据：补齐分类开关字段
            for (const cat of HIDE_CATEGORIES) {
                if (item.Property[cat.key] === undefined) item.Property[cat.key] = false;
            }
            // 根据开关刷新 Hide 数组，确保生效
            updateHideArray(item);

            // 兼容旧数据：v6 及以前贴图用单一 Scale 字段，v7 拆分为 ScaleX/ScaleY（默认等比锁定，行为不变）
            for (const texture of item.Property.Textures) {
                migrateScaleField(texture);
            }

            state.currentEditTexture = -1;
            state.tempTextureData = null;
            state.originalEditTexture = null;
            state.originalOverridePriority = undefined;
            state.currentListPage = 0;
            state.currentView = "list";
            state._pendingTextureRefresh = false;
            resetDragState();
            // 记录配置基线：让后续配置变化有对比依据（供 syncItemToServer 检测并广播编辑动作）
            recordItemBaseline(item);
        },

        Draw: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            // 每帧同步编辑面板 DOM 输入框的创建/位置（含隐藏）：无论当前显示的是哪个子视图，
            // 都要跑这一步，否则切到列表/隐藏设置/姿势切换等页面时输入框会残留在原位置
            createEditPanelDomInputs();
            positionEditPanelInputs();

            if (state.currentView === "addDomainConfirm") {
                drawAddDomainConfirm();
            } else if (state.currentView === "tutorial") {
                drawTutorial();
            } else if (state.currentEditTexture >= 0) {
                drawTextureEditPanel(item, state.currentEditTexture, data);
            } else if (state.currentView === "hide") {
                drawHideSettings(item);
            } else {
                drawTextureListMain(item);
            }

            // 锁状态指示器：道具被锁且当前玩家无权解锁时，在顶部显示红色提示
            if (isItemLockedForPlayer(item)) {
                DrawText(L("已上锁", "Locked"), 1500, 95, "#FF4444", "Black");
            }

            // 前往设置按钮（1775,25）：基础 Draw 会在此画权限模式图标（且带反灰效果），
            // 本插件把它重定向为「前往插件偏好设置」，所以在其上重绘一个正常白底、不反灰的按钮，
            // 并把悬停提示改为「前往设置」（点击逻辑见 Click 钩子顶部对该坐标的拦截）
            DrawButton(1775, 25, 90, 90, "", "White", "Icons/DialogPermissionMode.png",
                L("前往设置", "Go to settings"));
        },

        Click: (data, originalFunction) => {
            const item = DialogFocusItem;

            // 权限模式图标（Icons/DialogPermissionMode.png，坐标 1775,25,90,90，
            // 由扩展道具基础 Draw 统一绘制，见 TypedItem.js 的 TypedItemDraw/TypedItemClick）：
            // 本插件把它改为直接前往插件自身的偏好设置，而不是切换权限模式；
            // 必须在 originalFunction() 之前判断并 return，否则默认行为会先被触发
            if (item?.Asset?.Name === ASSET_NAME && MouseIn(1775, 25, 90, 90)) {
                // 先完整退出本道具的编辑状态和整个物品对话框，避免残留贴图网址/数值输入框等 DOM 元素
                // 以及仍处于 focus 状态的道具，导致跳转后的偏好设置界面显示错乱。
                if (DialogFocusItem !== null) {
                    DialogFocusItem = null;
                }
                if (typeof DialogLeave === "function") {
                    DialogLeave();
                }
                PreferenceSubscreenExtensionsOpen("ShuangCustomAssets");
                return;
            }

            originalFunction();
            if (!item) return;

            // 锁权限检查：道具被锁且当前玩家无权解锁时，阻止所有自定义操作
            // noarch archetype 不会自动检查 ChangeWhenLocked，需在此手动拦截
            // 例外：允许翻页浏览（列表页翻页按钮 1885,810,90,90）
            const isLocked = isItemLockedForPlayer(item);
            const isPaginationClick = state.currentView === "list"
                && state.currentEditTexture < 0
                && MouseIn(1885, 810, 90, 90);
            if (isLocked && !isPaginationClick) {
                DialogExtendedMessage = L(
                    "此道具已上锁，无权限的玩家无法修改配置",
                    "This item is locked. Players without permission cannot modify configuration."
                );
                return;
            }

            if (state.currentView === "addDomainConfirm") {
                handleAddDomainConfirmClick(item, data);
            } else if (state.currentView === "tutorial") {
                handleTutorialClick();
            } else if (state.currentEditTexture >= 0) {
                handleTextureEditClick(item, state.currentEditTexture, data);
            } else if (state.currentView === "hide") {
                handleHideSettingsClick(item);
            } else {
                handleTextureListClick(item, data);
            }
        },

        Exit: (data) => {
            // 若正在编辑某个图层，退出前还原为编辑前的原始数据（相当于「取消」）
            if (state.currentEditTexture >= 0) {
                const item = DialogFocusItem;
                const originalTexture = data.PersistentData?._originalTexture;
                if (item && originalTexture) {
                    if (!item.Property) item.Property = { Textures: [] };
                    if (!item.Property.Textures) item.Property.Textures = [];
                    item.Property.Textures[state.currentEditTexture] = { ...originalTexture };
                    // 还原 OverridePriority（取消编辑时恢复原始图层优先级）
                    if (state.originalOverridePriority !== undefined) {
                        item.Property.OverridePriority = JSON.parse(JSON.stringify(state.originalOverridePriority));
                    } else {
                        delete item.Property.OverridePriority;
                    }
                    syncItemToServer(item);
                    const C = CharacterGetCurrent();
                    if (C) CharacterRefresh(C, false, false);
                }
            }
            state.currentEditTexture = -1;
            state.tempTextureData = null;
            state.originalEditTexture = null;
            state.originalOverridePriority = undefined;
            state.currentListPage = 0;
            state.currentView = "list";
            state.tutorialPage = 0;
            state.poseSwitchMode = false;
            state.poseSelectedList = [];
            state.poseComboList = [];
            state.poseComboIndex = 0;
            state.poseViewMode = false;
            resetDragState();
            unregisterPoseHook();
            removeEditPanelInputs();
        },

        // 绘制每个图层
        AfterDraw: (data, originalFunction, drawData) => {
            renderTexture(data, originalFunction, drawData);
        }
    }
};

export default function register(AssetManager) {
    // 注册到所有物品部位组，让玩家可以在任何部位使用
    // 注意：ALL_ITEM_GROUPS 已经显式包含了 ItemTorso 与 ItemTorso2 两者，
    // 而 SDK 默认会把这两个组互相镜像注册（ItemTorso <-> ItemTorso2）。
    // 若不关闭镜像，注册 ItemTorso 时会自动带出 ItemTorso2，随后再显式注册
    // ItemTorso2 时就会撞上刚才镜像出来的同名道具，触发
    // "[AssetManager] Asset {ItemTorso2:...} already existed!" 警告。
    // 这里两个组都已经在列表里手动列出，因此不需要 SDK 的自动镜像，关闭即可。
    AssetManager.addAssetWithConfig(ALL_ITEM_GROUPS, asset, {
        layerNames,
        extended,
        translation,
        assetStrings,
        noMirror: true
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
                // 自定义贴图不应 block 任何其他部位（不阻止其他道具装备/使用）
                assetObj.Block = [];
                // 允许上锁和松紧度（SDK 可能不透传，在此确保）
                assetObj.AllowLock = true;
                assetObj.AllowTighten = true;
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
