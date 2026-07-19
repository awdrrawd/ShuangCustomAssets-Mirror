/**
 * 自定义贴图道具示例
 * 演示如何创建一个支持动态贴图 URL 的道具
 */

import { isValidImageUrl, Logger } from "@lib/utils.js";

// 输入框 ID
const INPUT_ID = "CustomTextureURLInput";

/**
 * 道具定义 - 使用对象格式（与 echo-clothing-ext 一致）
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
    Prerequisite: [],  // 空数组 = 无需特殊条件
    ParentGroup: {},   // 有父组
    PoseMapping: { BaseUpper: "BaseUpper" },
    Block: [],
    Layer: [
        { Name: "Main", Priority: 46 }
    ]
};

/**
 * 翻译
 */
const translation = {
    CN: "自定义贴图",
    EN: "Custom Texture"
};

/**
 * 图层名称
 */
const layerNames = {
    CN: { Main: "主体" },
    EN: { Main: "Main" }
};

/**
 * 扩展配置
 * @type {ExtendedItemConfig}
 */
const extended = {
    Archetype: "noarch",
    DrawImages: false,
    ScriptHooks: {
        // ===== 加载时创建输入框 =====
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            // 创建文本输入框
            const input = ElementCreateInput(
                INPUT_ID,
                "text",
                item.Property?.TextureURL ?? "",
                "500"
            );
            
            if (input) {
                input.setAttribute("placeholder", "输入图片 URL (https://...)");
                input.style.width = "400px";
                
                // 监听输入变化
                input.addEventListener("input", function() {
                    const url = this.value.trim();
                    const C = CharacterGetCurrent();
                    
                    // 确保 Property 对象存在
                    if (!item.Property) item.Property = {};
                    
                    if (isValidImageUrl(url)) {
                        item.Property.TextureURL = url;
                        Logger.info("贴图 URL 已更新:", url);
                    } else {
                        item.Property.TextureURL = "";
                    }
                    
                    // 立即触发同步（让其他玩家看到）
                    if (C) {
                        ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
                    }
                });
            }
        },

        // ===== 绘制界面 =====
        Draw: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            // 绘制标签
            DrawText("贴图 URL:", 1200, 450, "White", "Gray");
            
            // 显示输入框
            ElementPosition(INPUT_ID, 1500, 450, 400, 40);

            // 显示预览
            const url = item.Property?.TextureURL;
            if (url && isValidImageUrl(url)) {
                DrawText("预览:", 1200, 530, "White", "Gray");
                
                try {
                    const img = DrawGetImage(url);
                    if (img.complete && img.naturalWidth > 0) {
                        // 绘制预览图（缩小显示）
                        DrawImageEx(url, MainCanvas, 1200, 550, {
                            Width: 200,
                            Height: 150
                        });
                    } else {
                        DrawText("加载中...", 1400, 625, "Yellow", "Gray");
                    }
                } catch (e) {
                    DrawText("加载失败", 1400, 625, "Red", "Gray");
                }
            } else if (url) {
                DrawText("URL 格式无效", 1400, 530, "Red", "Gray");
            }
        },

        // ===== 退出时保存 =====
        Exit: (data) => {
            const item = DialogFocusItem;
            const C = CharacterGetCurrent();
            
            if (item?.Property?.TextureURL) {
                // 触发同步
                if (C) {
                    ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
                }
            }
            
            // 清理输入框
            ElementRemove(INPUT_ID);
        },

        // ===== 渲染物品（角色身上） =====
        ScriptDraw: (itemData, originalFunction, { C, Item, PersistentData }) => {
            // 安全检查：Item 可能为 undefined
            if (!Item) return;
            
            const url = Item.Property?.TextureURL;
            if (!url || !isValidImageUrl(url)) return;  // 无 URL 时不显示

            try {
                const img = DrawGetImage(url);
                if (img.complete && img.naturalWidth > 0) {
                    // 绘制贴图到角色身上
                    // 使用正确的绘制方式
                    DrawImageEx(url, MainCanvas, 0, 0, {
                        Width: 500,
                        Height: 1000
                    });
                }
            } catch (e) {
                // 静默失败，不影响其他渲染
            }
        }
    }
};

/**
 * 对话文本
 */
const assetStrings = {
    CN: {
        SelectBase: "设置自定义贴图"
    },
    EN: {
        SelectBase: "Set Custom Texture"
    }
};

/**
 * 注册函数 - 使用正确的参数格式
 * @param {import("@sugarch/bc-asset-manager").AssetManager} AssetManager
 */
export default function register(AssetManager) {
    AssetManager.addAssetWithConfig("ItemHands", asset, {
        layerNames,
        extended,
        translation,
        assetStrings
    });
}