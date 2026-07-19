/**
 * 道具注册入口
 * 在这里导入并注册所有道具
 */

// 导入道具
import customTexture from "./customTexture.js";

/**
 * 所有道具列表
 * 格式: [名称, 注册函数]
 */
const assets = [
    ["自定义贴图", customTexture],
    
    // 在这里添加更多道具
    // ["另一个道具", anotherAsset],
];

export default assets;