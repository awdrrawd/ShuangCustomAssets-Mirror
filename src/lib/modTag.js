/**
 * Mod 安装状态广播与状态图标
 *
 * 参考 echo-clothing-ext 的 CharacterTag 与 BC 原生 ChatRoomDrawCharacterStatusIcons：
 * - 通过 ChatRoomChat Type:"Hidden" 消息在房间内交换插件安装情况（Hidden 消息不显示在聊天栏）
 * - 收到他人广播后，在其角色模型顶部状态图标的「第二行」绘制本插件 logo
 *
 * Hidden 消息是 BC 原生 + mod 通用的在线状态交换通道：服务器正常路由给房内成员，
 * 但 ChatRoomMessage 内 `if (data.Type === "Hidden") return;` 保证不进聊天 UI。
 * BC 自己的 RuleInfoGet / HoldLeash / TakeSuitcase 等也走同一通道。
 */

import ModInfo from "../modInfo.js";
import { BADGE_IMAGE_URL } from "../assets/constants.js";
import { Logger } from "./utils.js";

// Hidden 消息标识符（需独特，避开 echo 的 "ECHO_INFO2" 及 BC 原生 Content）
const TAG_CONTENT = "SCA_INFO";
// 收到他人广播后，写入对方角色对象的字段名
const TAG_KEY = "SCA_INFO";

// 图标位置与大小（角色顶部状态图标第一行下方，单独占第二行，避免与 BC 原生 / echo 图标重叠）
// BC 原生图标：X=70/110/150/310/350/390，Y=CharY，大小 40；echo：X=420，Y=CharY+5，大小 35
const ICON_X = 340;     // 与 echo 图标水平对齐（echo 在 CharX+420, CharY+5）
const ICON_Y = 0;      // echo 图标正下方（echo 底部约 CharY+40，留 5 间距）
const ICON_SIZE = 40;   // 略小于 BC 原生 40，按实际效果调整

/**
 * 广播本机插件安装信息给房间成员
 * @param {number} [target] - 指定 MemberNumber 则定向发送（如发给刚进房的人），不填则广播全员
 */
function sendTag(target) {
    if (typeof ServerSend !== "function") return;
    if (!Player?.MemberNumber) return;
    // 兜底：确保本地自读字段存在（绘制自己图标时用）
    if (!Player[TAG_KEY]) Player[TAG_KEY] = { version: ModInfo.version };
    const msg = {
        Content: TAG_CONTENT,
        Type: "Hidden",
        Dictionary: [{ Type: TAG_CONTENT, Content: { version: ModInfo.version } }]
    };
    if (typeof target === "number") msg.Target = target;
    ServerSend("ChatRoomChat", msg);
}

/**
 * 注册 mod 状态广播与图标绘制钩子
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupModTagHooks(HookManager) {
    if (!HookManager || typeof HookManager.hookFunction !== "function") return;

    // ① 登录后给自己打本地 tag（绘制自己图标时自读）
    if (typeof HookManager.afterPlayerLogin === "function") {
        HookManager.afterPlayerLogin(() => {
            Player[TAG_KEY] = { version: ModInfo.version };
        });
    }

    // ② 房间同步时广播给全员（进房 / 房间更新都会触发，频率不高）
    if (typeof ChatRoomSync === "function") {
        HookManager.hookFunction("ChatRoomSync", 0, (args, next) => {
            const ret = next(args);
            try { sendTag(); } catch (e) { Logger.error("[ShuangAssets] 广播 mod 状态失败", e); }
            return ret;
        });
    }

    // ③ 有人进房时定向发给进房者（让新人立即看到老成员的图标，不必等下次 ChatRoomSync）
    if (typeof ChatRoomSyncMemberJoin === "function") {
        HookManager.hookFunction("ChatRoomSyncMemberJoin", 0, (args, next) => {
            const ret = next(args);
            try {
                const source = args[0]?.SourceMemberNumber;
                if (typeof source === "number") sendTag(source);
            } catch (e) { Logger.error("[ShuangAssets] 定向发送 mod 状态失败", e); }
            return ret;
        });
    }

    // ④ 接收他人的 Hidden 广播，把载荷写到发送方角色对象上
    if (typeof ChatRoomMessage === "function") {
        HookManager.hookFunction("ChatRoomMessage", 0, (args, next) => {
            const data = args[0];
            try {
                if (data?.Type === "Hidden" && data?.Content === TAG_CONTENT) {
                    const sender = data.Sender;
                    const payload = Array.isArray(data.Dictionary)
                        ? data.Dictionary.find(d => d?.Type === TAG_CONTENT)?.Content
                        : undefined;
                    if (typeof sender === "number" && payload
                        && typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter)) {
                        const C = ChatRoomCharacter.find(c => c.MemberNumber === sender);
                        if (C) C[TAG_KEY] = payload;
                    }
                }
            } catch (e) { Logger.error("[ShuangAssets] 接收 mod 状态失败", e); }
            return next(args);
        });
    }

    // ⑤ 在角色模型第二行绘制本插件图标
    // 先 next 让 BC 原生状态图标（第一行）画完，再画第二行，避免互相遮挡
    if (typeof ChatRoomDrawCharacterStatusIcons === "function") {
        HookManager.hookFunction("ChatRoomDrawCharacterStatusIcons", 10, (args, next) => {
            next(args);
            try {
                const [C, CharX, CharY, Zoom] = args;
                // ChatRoomHideIconState === 0 (SHOW_ALL) 时才画，尊重玩家「隐藏状态图标」设置
                if (typeof ChatRoomHideIconState !== "undefined" && ChatRoomHideIconState !== 0) return;
                if (!C?.[TAG_KEY]) return;
                const iconX = CharX + ICON_X * Zoom;
                const iconY = CharY + ICON_Y * Zoom;
                const iconW = ICON_SIZE * Zoom;
                const iconH = ICON_SIZE * Zoom;
                DrawImageResize(BADGE_IMAGE_URL, iconX, iconY, iconW, iconH);
                // 鼠标悬停时显示简称+版本号：在图标正下方画一个小悬浮框（SCA v0.2.x）
                // DrawHoverElements 在主绘制末尾统一渲染，保证悬浮框在最上层不被遮挡
                if (typeof MouseIn === "function" && typeof MainCanvas !== "undefined"
                    && MouseIn(iconX, iconY, iconW, iconH) && Array.isArray(DrawHoverElements)) {
                    const ver = C[TAG_KEY]?.version ?? ModInfo.version;
                    DrawHoverElements.push(() => {
                        const boxW = 120 * Zoom;
                        const boxH = 24 * Zoom;
                        const boxX = iconX + (iconW - boxW) / 2;  // 水平居中于图标
                        const boxY = iconY + iconH + 3 * Zoom;     // 图标下方留 3 间距
                        MainCanvas.save();
                        MainCanvas.fillStyle = "rgba(0,0,0,0.8)";
                        MainCanvas.fillRect(boxX, boxY, boxW, boxH);
                        MainCanvas.textAlign = "center";
                        MainCanvas.textBaseline = "middle";
                        MainCanvas.font = `${Math.round(13 * Zoom)}px Arial`;
                        MainCanvas.fillStyle = "#FFF";
                        MainCanvas.fillText(`SCA v${ver}`, boxX + boxW / 2, boxY + boxH / 2);
                        MainCanvas.restore();
                    });
                }
            } catch (e) { Logger.error("[ShuangAssets] 绘制 mod 图标失败", e); }
        });
    }
}
