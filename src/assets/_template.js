/**
 * 道具模板
 * 复制此文件并修改以创建新道具
 */

/**
 * 道具定义
 * @type {AddAssetWithConfigParams}
 * 
 * 参数说明:
 * [物品组名称, 物品属性, 扩展配置]
 * 
 * 物品组名称: 如 "ItemAddon", "Cloth", "ItemDevices" 等
 */
const asset = [
    "ItemAddon", // TODO: 修改为正确的物品组
    {
        Name: "道具名称", // TODO: 修改道具名称
        Random: false,
        DrawImages: false, // true = 使用默认图片, false = 自定义渲染
        AllowColorize: true,
        
        // 可选：图层定义
        Layer: [
            { Name: "Layer1" },
            // { Name: "Layer2", ColorGroup: "Shade" }
        ]
    },
    {
        // 翻译
        translation: {
            CN: "道具中文名",
            EN: "Asset English Name"
        },
        
        // 扩展配置
        extended: {
            // 架构类型:
            // - "noarch": 完全自定义行为
            // - "modular": 模块化道具（多选项）
            // - "typed": 类型道具（单选）
            Archetype: "noarch",
            
            DrawImages: false,
            
            // ScriptHooks: 自定义行为钩子
            ScriptHooks: {
                // Load: 面板加载时
                Load: (data, originalFunction) => {
                    originalFunction();
                    // TODO: 初始化逻辑
                },
                
                // Draw: 绘制面板时
                Draw: (data, originalFunction) => {
                    originalFunction();
                    // TODO: 绘制自定义 UI
                },
                
                // Click: 点击面板时
                Click: (data, originalFunction) => {
                    originalFunction();
                    // TODO: 处理点击事件
                },
                
                // Exit: 退出面板时
                Exit: (data, originalFunction) => {
                    originalFunction();
                    // TODO: 清理逻辑
                },
                
                // ScriptDraw: 渲染物品时（每帧）
                ScriptDraw: ({ C, Item, PersistentData }) => {
                    // TODO: 自定义渲染逻辑
                    // 使用 DrawImageEx 等函数绘制
                }
            }
        },
        
        // 界面文字
        assetStrings: {
            CN: {
                SelectBase: "选择道具"
            },
            EN: {
                SelectBase: "Select Asset"
            }
        },
        
        // 可选：图层名称翻译
        layerNames: {
            CN: {},
            EN: {}
        }
    }
];

/**
 * 注册函数
 * @param {import("@sugarch/bc-asset-manager").AssetManager} AssetManager
 */
export default function register(AssetManager) {
    AssetManager.addAssetWithConfig(asset);
    
    // 可选：注册图片映射
    // AssetManager.addImageMapping({
    //     "Assets/Female3DCG/ItemAddon/道具名称.png": "https://your-cdn.com/image.png"
    // });
}