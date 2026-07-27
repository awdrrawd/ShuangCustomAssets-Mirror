/**
 * 自定义贴图道具 - AfterDraw 渲染逻辑
 * 提取自 extended.AfterDraw hook，每图层渲染自定义贴图
 */

import { LAYER_NAMES, ASSETS_CDN_PRIMARY } from "./constants.js";
import { resolveFixedAssetUrl } from "./cdnFallback.js";
import { updateHideArray } from "./hideArray.js";
import { getCorsImage } from "@lib/utils.js";
import { isUrlAllowed, isDomainInWhitelist, getDomainWarningEnabled } from "./settings.js";

/**
 * 渲染单个图层的自定义贴图（由 extended.AfterDraw hook 调用）
 * @param {object} data - ScriptHook 的 PersistentData 容器
 * @param {Function} originalFunction - 原始 AfterDraw 函数（未使用，保留签名）
 * @param {object} drawData - 绘制参数 { X, Y, drawCanvas, drawCanvasBlink, C, A, CA, L }
 */
export function renderTexture(data, originalFunction, drawData) {
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

    let imageUrl, offsetX, offsetY, scale, rotation, displayOpacity, mirrorH, mirrorV;

    if (warnEnabled && !isDomainInWhitelist(texture.TextureURL)) {
        // 不可信域名：使用固定参数显示警告图片
        imageUrl = 'https://shuang-custom-assets.pages.dev/SCA_untrusted_domain.png';
        offsetX = 167;
        offsetY = -256;
        scale = 16 / 100;
        rotation = 0;
        displayOpacity = 1.0;
        mirrorH = false;
        mirrorV = false;
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
        mirrorH = texture.MirrorH === true;
        mirrorV = texture.MirrorV === true;
    }

    // 固定资源（插件自身 CDN）：主源加载失败时自动回退到 Netlify 备用源
    if (imageUrl.startsWith(ASSETS_CDN_PRIMARY + "/")) {
        imageUrl = resolveFixedAssetUrl(imageUrl.substring((ASSETS_CDN_PRIMARY + "/").length));
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
    const currentParams = `${imageUrl}_${width}_${height}_${rotation}_${displayOpacity}_${mirrorH ? 1 : 0}_${mirrorV ? 1 : 0}`;

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
        // 镜射：以图片中心为轴翻转，翻转后用负偏移绘制，等价于 translate(-width/2,-height/2) 再 drawImage(0,0,...)
        ctx.scale(mirrorH ? -1 : 1, mirrorV ? -1 : 1);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();
        data.PersistentData[layerParamsKey] = currentParams;
    }

    // 用包围盒尺寸偏移，保持图像中心对齐到 offsetX/offsetY
    const drawX = X + offsetX - (bboxWidth - width) / 2;
    const drawY = Y + offsetY - (bboxHeight - height) / 2;
    drawCanvas(tempCanvas, drawX, drawY);
    drawCanvasBlink(tempCanvas, drawX, drawY);
}
