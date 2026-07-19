/**
 * 自定义贴图道具示例
 * 演示如何创建一个支持动态贴图 URL 的道具
 */

import { isValidImageUrl, Logger } from "@lib/utils.js";

// 输入框 ID
const INPUT_URL = "CustomTextureURLInput";
const INPUT_X = "CustomTextureXInput";
const INPUT_Y = "CustomTextureYInput";
const INPUT_SCALE = "CustomTextureScaleInput";
const INPUT_ROTATION = "CustomTextureRotationInput";

/**
 * 默认参数
 */
const DEFAULT_PROPS = {
    TextureURL: "",
    OffsetX: 0,
    OffsetY: 0,
    Scale: 100,
    Rotation: 0
};

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
 * 创建滑块输入
 */
function createSliderInput(id, value, min, max, step, label, y) {
    const container = document.createElement("div");
    container.style.cssText = "display: flex; align-items: center; margin: 5px 0;";
    
    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    labelEl.style.cssText = "width: 80px; color: white;";
    
    const input = document.createElement("input");
    input.type = "range";
    input.id = id;
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = value;
    input.style.cssText = "width: 300px;";
    
    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = value;
    valueDisplay.style.cssText = "width: 50px; color: white; text-align: right;";
    
    input.addEventListener("input", () => {
        valueDisplay.textContent = input.value;
    });
    
    container.appendChild(labelEl);
    container.appendChild(input);
    container.appendChild(valueDisplay);
    
    return { container, input, valueDisplay };
}

/**
 * 扩展配置
 * @type {ExtendedItemConfig}
 */
const extended = {
    Archetype: "noarch",
    DrawImages: false,
    ScriptHooks: {
        // ===== 加载时创建输入界面 =====
        Load: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            // 确保 Property 存在
            if (!item.Property) item.Property = { ...DEFAULT_PROPS };
            
            // 获取当前值
            const props = {
                TextureURL: item.Property.TextureURL || "",
                OffsetX: item.Property.OffsetX || 0,
                OffsetY: item.Property.OffsetY || 0,
                Scale: item.Property.Scale || 100,
                Rotation: item.Property.Rotation || 0
            };

            // 创建 URL 输入框
            const urlInput = ElementCreateInput(INPUT_URL, "text", props.TextureURL, "500");
            if (urlInput) {
                urlInput.setAttribute("placeholder", "输入图片 URL (https://...)");
                urlInput.style.width = "400px";
                urlInput.style.marginBottom = "10px";
            }

            // 创建滑块容器
            const sliderContainer = document.createElement("div");
            sliderContainer.id = "CustomTextureSliders";
            sliderContainer.style.cssText = "position: absolute; left: 1200px; top: 520px; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px;";
            
            // X 偏移
            const xSlider = createSliderInput(INPUT_X, props.OffsetX, -500, 500, 1, "X 偏移:");
            // Y 偏移
            const ySlider = createSliderInput(INPUT_Y, props.OffsetY, -500, 500, 1, "Y 偏移:");
            // 缩放
            const scaleSlider = createSliderInput(INPUT_SCALE, props.Scale, 10, 200, 1, "缩放 %:");
            // 旋转
            const rotSlider = createSliderInput(INPUT_ROTATION, props.Rotation, -180, 180, 1, "旋转 °:");
            
            sliderContainer.appendChild(xSlider.container);
            sliderContainer.appendChild(ySlider.container);
            sliderContainer.appendChild(scaleSlider.container);
            sliderContainer.appendChild(rotSlider.container);
            
            // 添加确认按钮
            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "确认保存";
            confirmBtn.style.cssText = "margin-top: 15px; padding: 8px 20px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-size: 14px;";
            confirmBtn.addEventListener("click", () => {
                const C = CharacterGetCurrent();
                if (C && item) {
                    // 触发同步
                    ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);
                    // 强制刷新角色画布
                    CharacterRefresh(C, false);
                    Logger.info("贴图设置已保存并同步");
                }
            });
            sliderContainer.appendChild(confirmBtn);
            
            document.body.appendChild(sliderContainer);

            // 本地更新 Property（不触发同步）
            const updatePropertyLocal = () => {
                const url = document.getElementById(INPUT_URL)?.value?.trim() || "";
                item.Property.TextureURL = isValidImageUrl(url) ? url : "";
                item.Property.OffsetX = parseInt(document.getElementById(INPUT_X)?.value) || 0;
                item.Property.OffsetY = parseInt(document.getElementById(INPUT_Y)?.value) || 0;
                item.Property.Scale = parseInt(document.getElementById(INPUT_SCALE)?.value) || 100;
                item.Property.Rotation = parseInt(document.getElementById(INPUT_ROTATION)?.value) || 0;
            };

            // 添加监听器（仅本地更新）
            urlInput?.addEventListener("input", updatePropertyLocal);
            xSlider.input.addEventListener("input", updatePropertyLocal);
            ySlider.input.addEventListener("input", updatePropertyLocal);
            scaleSlider.input.addEventListener("input", updatePropertyLocal);
            rotSlider.input.addEventListener("input", updatePropertyLocal);
        },

        // ===== 绘制界面 =====
        Draw: (data, originalFunction) => {
            originalFunction();
            const item = DialogFocusItem;
            if (!item) return;

            // 绘制标签
            DrawText("贴图 URL:", 1200, 450, "White", "Gray");
            DrawText("（调整后点击确认保存）", 1200, 480, "Yellow", "Gray");
            
            // 显示输入框
            ElementPosition(INPUT_URL, 1500, 450, 400, 40);

            // 显示预览
            const url = item.Property?.TextureURL;
            if (url && isValidImageUrl(url)) {
                DrawText("预览:", 1200, 700, "White", "Gray");
                
                try {
                    const img = DrawGetImage(url);
                    if (img.complete && img.naturalWidth > 0) {
                        DrawImageEx(url, MainCanvas, 1200, 720, {
                            Width: 200,
                            Height: 150
                        });
                    }
                } catch (e) {
                    // 忽略
                }
            }
        },

        // ===== 退出时清理 =====
        Exit: (data) => {
            ElementRemove(INPUT_URL);
            const sliderContainer = document.getElementById("CustomTextureSliders");
            if (sliderContainer) sliderContainer.remove();
        },

        // ===== 绘制到角色身上 =====
        AfterDraw: (data, originalFunction, drawData) => {
            const { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L } = drawData;
            
            // 只处理 Main 图层
            if (L !== "Main") return;
            
            // CA 是当前物品，从中获取 Property
            const item = CA;
            const url = item?.Property?.TextureURL;
            
            // 调试：检测 URL 变化
            const lastUrl = data.PersistentData?._lastUrl;
            if (url !== lastUrl && C?.IsPlayer()) {
                Logger.info(`URL 变化: ${lastUrl} -> ${url}`);
                data.PersistentData = data.PersistentData || {};
                data.PersistentData._lastUrl = url;
            }
            
            if (!url || !isValidImageUrl(url)) return;

            const props = item.Property;
            const offsetX = props.OffsetX || 0;
            const offsetY = props.OffsetY || 0;
            const scale = (props.Scale || 100) / 100;
            const rotation = props.Rotation || 0;

            // 获取图片（已缓存在 DrawGetImage 中）
            const img = DrawGetImage(url);
            if (!img.complete) {
                // 图片正在加载，等待
                return;
            }
            if (img.naturalWidth <= 0) {
                Logger.warn(`图片加载失败: ${url}`);
                return;
            }

            const width = Math.round(img.naturalWidth * scale);
            const height = Math.round(img.naturalHeight * scale);
            
            // 使用缓存键
            const cacheKey = `${url}_${width}_${height}_${rotation}`;
            let tempCanvas = data.PersistentData?.[cacheKey];
            
            if (!tempCanvas) {
                Logger.info(`创建新缓存: ${cacheKey}`);
                tempCanvas = AnimationGenerateTempCanvas(C, A, width, height);
                const ctx = tempCanvas.getContext("2d");
                ctx.clearRect(0, 0, width, height);
                
                // 应用变换
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.rotate(rotation * Math.PI / 180);
                ctx.translate(-width / 2, -height / 2);
                ctx.drawImage(img, 0, 0, width, height);
                ctx.restore();
                
                // 缓存
                if (!data.PersistentData) data.PersistentData = {};
                data.PersistentData[cacheKey] = tempCanvas;
            }
            
            // 绘制到角色身上
            const drawX = X + offsetX;
            const drawY = Y + offsetY;
            drawCanvas(tempCanvas, drawX, drawY);
            drawCanvasBlink(tempCanvas, drawX, drawY);
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