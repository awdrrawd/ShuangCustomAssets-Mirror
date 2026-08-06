/**
 * 自定义贴图道具 - AfterDraw 渲染逻辑
 * 提取自 extended.AfterDraw hook，每图层渲染自定义贴图
 */

import { LAYER_NAMES, ASSETS_CDN_PRIMARY, POSE_CATEGORIES, getPoseKey } from "./constants.js";
import { resolveFixedAssetUrl } from "./cdnFallback.js";
import { updateHideArray } from "./hideArray.js";
import { getCorsImage } from "@lib/utils.js";
import { getAnimatedImage, getGifFrameState } from "@lib/gifPlayer.js";
import { notifyGifFrame } from "@lib/gifAnimationLoop.js";
import { queueOneShotRefresh } from "@lib/refreshScheduler.js";
import { isUrlAllowed, isDomainInWhitelist, getDomainWarningEnabled, getAnimatedImageEnabled } from "./settings.js";

/**
 * 解析当前姿势下的有效渲染参数
 * 通过 getPoseKey 生成姿势组合键，在 PoseSettings 中查找对应的独立配置
 * - 找到且 enabled=true：用独立配置覆盖全局（未设置的字段回退到全局）
 * - 未找到或未启用：使用全局配置
 * @param {object} texture - 贴图配置（含 PoseSettings）
 * @param {string[]} drawPose - C.DrawPose 数组
 * @returns {object} 合并后的渲染参数
 */
function resolvePoseParams(texture, drawPose) {
    const base = {
        TextureURL: texture.TextureURL ?? "",
        Visible: texture.Visible ?? true,
        OffsetX: texture.OffsetX ?? 1,
        OffsetY: texture.OffsetY ?? 1,
        // 回退到旧版单一 Scale 字段：其他玩家的贴图数据来自服务器同步，
        // 不经过 Load hook 迁移，可能仍使用旧 Scale 而非 ScaleX/ScaleY
        ScaleX: texture.ScaleX ?? texture.Scale ?? 100,
        ScaleY: texture.ScaleY ?? texture.Scale ?? 100,
        Rotation: texture.Rotation ?? 0,
        Opacity: texture.Opacity ?? 100,
        MirrorH: texture.MirrorH ?? false,
        MirrorV: texture.MirrorV ?? false
    };

    const poseKey = getPoseKey(drawPose);
    if (!poseKey) return base;

    const ps = texture.PoseSettings?.[poseKey];
    if (!ps || ps.enabled !== true) return base;

    // 合并：全局基底 + 姿势覆盖（排除 enabled 和旧版 Scale 字段）
    const { enabled, Scale: legacyScale, ...overrides } = ps;
    // 旧版 PoseSettings 用单一 Scale，迁移到 ScaleX/ScaleY（仅在没有 ScaleX/ScaleY 时回退）
    if (legacyScale !== undefined && overrides.ScaleX === undefined) {
        overrides.ScaleX = legacyScale;
        overrides.ScaleY = legacyScale;
    }
    return { ...base, ...overrides };
}

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
    if (!texture) return;

    // 解析当前姿势下的有效参数（可能覆盖 TextureURL、Visible 及所有数值字段）
    const params = resolvePoseParams(texture, C.DrawPose);
    if (!params.TextureURL) return;
    if (params.Visible === false) return;

    // 屏蔽玩家检查：贴图来源方或配置者在屏蔽列表中时，跳过渲染
    const blockedPlayers = (() => {
        try {
            const s = Player?.ExtensionSettings?.ShuangCustomAssets;
            return Array.isArray(s?.blockedPlayers) ? s.blockedPlayers : [];
        } catch (_) { return []; }
    })();
    if (blockedPlayers.length > 0) {
        const texSource = texture.TextureURLSource || 0;
        const texConfig = texture.CurrentConfigurator || 0;
        if ((texSource > 0 && blockedPlayers.indexOf(texSource) !== -1) ||
            (texConfig > 0 && blockedPlayers.indexOf(texConfig) !== -1)) {
            return;
        }
    }

    // 域名警告处理（检查解析后的 URL，支持姿势级切换不同图片源）
    const warnEnabled = getDomainWarningEnabled();

    let imageUrl, offsetX, offsetY, scaleX, scaleY, rotation, displayOpacity, mirrorH, mirrorV;

    if (isUrlAllowed(params.TextureURL)) {
        // 不限制模式 或 域名在白名单中：正常显示
        imageUrl = params.TextureURL;
        offsetX = params.OffsetX || 0;
        offsetY = params.OffsetY || 0;
        // 用 ?? 而非 ||：ScaleX/Y 合法值可以是 0（完全缩小），不该被当成「未设定」强制拉回 100%
        scaleX = (params.ScaleX ?? 100) / 100;
        scaleY = (params.ScaleY ?? 100) / 100;
        rotation = params.Rotation || 0;
        displayOpacity = Math.max(0, Math.min(100, params.Opacity ?? 100)) / 100;
        mirrorH = params.MirrorH === true;
        mirrorV = params.MirrorV === true;
    } else if (warnEnabled && !isDomainInWhitelist(params.TextureURL)) {
        // 不可信域名：使用固定参数显示警告图片
        imageUrl = 'https://shuang-custom-assets.pages.dev/SCA_untrusted_domain.png';
        offsetX = 167;
        offsetY = -256;
        scaleX = scaleY = 50 / 100;
        rotation = 0;
        displayOpacity = 1.0;
        mirrorH = false;
        mirrorV = false;
    } else {
        // 域不可信提示关闭 且 不限制模式未开启：跳过渲染
        return;
    }

    // 固定资源（插件自身 CDN）：主源加载失败时自动回退到 Netlify 备用源
    if (imageUrl.startsWith(ASSETS_CDN_PRIMARY + "/")) {
        imageUrl = resolveFixedAssetUrl(imageUrl.substring((ASSETS_CDN_PRIMARY + "/").length));
    }

    // 内容导向的 GIF 检测：不管网址后缀写什么，一律先看档案实际内容是不是 GIF、
    // 解压后实际帧数是否 > 1，而不是用 .gif 副檔名去猜
    const gifEntry = getAnimatedImage(imageUrl);

    let img, sourceWidth, sourceHeight, gifFrameIndex = -1;

    if (!gifEntry.loaded) {
        // 内容还在下载 / 解析中，这一帧先不绘制；BC 只有在有人触发 CharacterRefresh
        // 时才会重新执行到这里，光是「解析完成」本身不会自动补一次重绘，所以顺便
        // 注册一个「解析完成后补画一次」的回调，避免这一层贴图从此卡在空白状态，
        // 直到凑巧有其他操作（换装、聊天讯息等）触发重绘才「意外」修好
        getAnimatedImage(imageUrl, () => queueOneShotRefresh(C));
        return;
    } else if (!gifEntry.failed && gifEntry.isAnimated) {
        if (getAnimatedImageEnabled()) {
            // 内容确实是多帧 GIF：从预先解码好的帧数组中，依「实际经过的时间 + 该 GIF 自带的每帧延迟」
            // 选出目前该显示的帧，不会重复下载或重复解码
            const layerGifStartKey = `_gifStart_${layerIndex}`;
            if (!data.PersistentData) data.PersistentData = {};
            if (data.PersistentData[layerGifStartKey] == null) {
                data.PersistentData[layerGifStartKey] = Date.now();
            }
            const elapsed = Date.now() - data.PersistentData[layerGifStartKey];
            const gifFrameState = getGifFrameState(gifEntry, elapsed);
            gifFrameIndex = gifFrameState.index;
            if (gifFrameIndex < 0) return;
            // AfterDraw 只会在 BC 重新生成角色外观画布（CharacterRefresh）时才被调用，
            // 不会随动画帧自动触发；这里登记「这一层预期下一次该换第几帧、什么时候换」，
            // gifAnimationLoop 会依这个到期时间排程，只在真的到期时才主动叫一次
            // CharacterRefresh，让新的一帧真正被重绘、上传成贴图，而不是每个轮询间隔
            // 都不分青红皂白地刷一次。所有正在播放动图的角色共用同一个计时器
            // （见 gifAnimationLoop.js），不会为每张动图各自开一个独立计时器。
            notifyGifFrame(C, layerIndex, gifFrameIndex, Date.now() + gifFrameState.remainingMs);
        } else {
            // 偏好设置关闭了「启用动态图片」：固定显示第一帧，当成静态图处理，
            // 不推进时间轴、也不呼叫 notifyGifFrame——不会把这个角色登记进共用刷新
            // 计时器，画面不会再因为这个图层持续被 CharacterRefresh
            gifFrameIndex = 0;
        }
        img = gifEntry.frames[gifFrameIndex].canvas;
        sourceWidth = gifEntry.width;
        sourceHeight = gifEntry.height;
    } else if (!gifEntry.failed && !gifEntry.isAnimated) {
        // 档案内容确实是 GIF，但解压后只有 1 帧：当成静态图处理，直接用已经解码好的那一帧，
        // 不用再额外发一次 <img> 请求重复下载同一个档案
        const onlyFrame = gifEntry.frames[0];
        if (!onlyFrame) return;
        img = onlyFrame.canvas;
        sourceWidth = gifEntry.width;
        sourceHeight = gifEntry.height;
    } else {
        // 内容不是 GIF（不论网址后缀），交还给原本的静态图片管线：
        // 仅渲染服务器正确返回 Access-Control-Allow-Origin 的图片，
        // 加载失败（如 r2.dev 未开启 CORS）直接跳过，避免污染 canvas 导致 WebGL 黑框
        const imgEntry = getCorsImage(imageUrl);
        if (imgEntry.failed) return;
        if (!imgEntry.img.complete || imgEntry.img.naturalWidth <= 0) {
            // 图片还没下载完成：这是「重新整理页面后，其他玩家身上的贴图效果
            // （含 Scale 等参数）需要手动重设才会出现」的根本成因——角色初次
            // 渲染时贴图往往还没下载完，这一帧被跳过后，除非又凑巧发生一次
            // 重绘，画面会一直停在「没有这个图层」的状态。这里注册「下载完成
            // 后补画一次」，让效果在图片真正就绪的当下就正确显示，不用手动重设
            getCorsImage(imageUrl, () => queueOneShotRefresh(C));
            return;
        }
        img = imgEntry.img;
        sourceWidth = img.naturalWidth;
        sourceHeight = img.naturalHeight;
    }

    const width = Math.round(sourceWidth * scaleX);
    const height = Math.round(sourceHeight * scaleY);

    // 计算旋转后的包围盒，避免旋转后图像被裁剪
    const rad = rotation * Math.PI / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const bboxWidth = Math.round(width * cos + height * sin);
    const bboxHeight = Math.round(width * sin + height * cos);

    // 缓存策略：静态贴图每个图层只保留一个 canvas，参数变化时原地重绘（而非创建新 canvas）
    // 旧策略按 url_width_height_rotation_opacity 做 cacheKey，步进按钮每次调值都产生新 key，
    // 旧 canvas 永远不释放，累积导致 GPU 内存耗尽 -> WebGL Context Lost
    // 动图另外处理：见下方，帧真的换了的时候会换一个新 canvas，理由见下方注释
    const layerCanvasKey = `_canvas_${layerIndex}`;
    const layerParamsKey = `_params_${layerIndex}`;
    // 把目前该显示的 GIF 帧索引也纳入缓存 key：帧没换就不会跟 rotation/opacity 等其他参数一样触发重绘，
    // 帧真正换了（由该 GIF 自己的每帧延迟决定，而不是固定的轮询间隔）才会重绘一次，
    // 不会有「每隔固定时间就强制刷新」的持续开销
    const currentParams = `${imageUrl}_${gifFrameIndex}_${width}_${height}_${rotation}_${displayOpacity}_${mirrorH ? 1 : 0}_${mirrorV ? 1 : 0}`;

    let tempCanvas = data.PersistentData?.[layerCanvasKey];
    const paramsChanged = data.PersistentData?.[layerParamsKey] !== currentParams;

    // 动图帧真正切换时，改用一个全新的 canvas 元素来放新帧，而不是在原本那个 canvas 上就地重绘。
    //
    // 背景：gifAnimationLoop 靠反复调用 CharacterRefresh 来让 BC 重新执行 AfterDraw、
    // 重新把这段代码跑一次；但即使这段代码确实重新执行、tempCanvas 的像素内容也确实换成了
    // 新的一帧，画面在实机测试中仍常常卡住不动，只有道具/服装真的变动过一次之后才会跳一下。
    // 这与「同一个 canvas 元素重绘新内容后，BC 端的 WebGL 贴图不会跟着自动重新上传，
    // 只有出现一个全新的 canvas/img 元素时才会触发重新上传」这个猜测吻合：BC 大概率是用
    // canvas/img 元素本身的身份（而不是像素内容）来判断贴图要不要重新上传的。
    // 静态贴图（不是动图）不受影响，继续维持原本「同一图层只留一个 canvas」的省内存策略，
    // 只有动图、且这一帧真的换了的时候，才换一个新的 canvas 元素。
    // main.js 里已经修了 GLDraw2DCanvas 替换贴图时的显存泄漏（旧贴图会在被替换时正确
    // gl.deleteTexture()），所以这里按帧换 canvas 不会重新引入当初「WebGL Context Lost」
    // 的那个泄漏问题。
    if (!tempCanvas || (gifEntry.isAnimated && paramsChanged)) {
        tempCanvas = AnimationGenerateTempCanvas(C, A, bboxWidth, bboxHeight);
        if (!data.PersistentData) data.PersistentData = {};
        data.PersistentData[layerCanvasKey] = tempCanvas;
        data.PersistentData[layerParamsKey] = null; // 标记需要（重新）绘制
    }

    // 参数变化时重绘 canvas
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
