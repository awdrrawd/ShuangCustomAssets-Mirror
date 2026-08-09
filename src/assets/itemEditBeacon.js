/**
 * 自定义贴图道具 - 编辑动作播报（Action 信标）
 *
 * 需求：不论添加、编辑、删除图层，都在房间内发送一条 Action
 * 「player 编辑了 target 的自定义贴图」。
 *
 * 跨语言方案（利用 Dictionary 夹带信息，无需服务器/CSV 支持）：
 * - Content 用自定义标签 "SCA-itemedit"。BC 在 Interface.csv 找不到该键时，会用
 *   Dictionary 里 Tag 为 `MISSING TEXT IN "Interface.csv": SCA-itemedit` 的 Text 作为
 *   最终显示文本 —— 这就是没装插件的玩家也能看到文字的原因（显示发送方语言的兜底文本）。
 * - 装了插件的玩家：在 ChatRoomMessage 接收钩子里识别该 Content，用 Dictionary 夹带的
 *   双方 MemberNumber 在「接收方本地」重新组装成接收方语言的文本，覆盖上面的兜底 Text，
 *   从而每个人都看到自己语言 + 自己看到的昵称。
 */

import { L, Logger } from "@lib/utils.js";

const BEACON_CONTENT = "SCA-itemedit";
// BC 对缺失 Content 生成的兜底提示 Tag（格式固定，勿改）
const MISSING_TAG = `MISSING TEXT IN "Interface.csv": ${BEACON_CONTENT}`;

/** 解析某 MemberNumber 在本地看到的昵称，回退到夹带的名字，再回退到 "#号" */
function nameOf(mn, carried) {
    try {
        const chars = (typeof ChatRoomCharacter !== "undefined" && Array.isArray(ChatRoomCharacter))
            ? ChatRoomCharacter : [];
        const C = chars.find(c => c?.MemberNumber === mn)
            || (Player?.MemberNumber === mn ? Player : null);
        if (C) {
            const nn = typeof CharacterNickname === "function" ? CharacterNickname(C) : "";
            return nn || C.Nickname || C.Name || carried || `#${mn}`;
        }
    } catch (_) {}
    return carried || `#${mn}`;
}

/** 组装展示文本（cn=isChineseLang 决定），source===target 时用「自己」措辞 */
function buildText(srcName, tgtName, isSelf) {
    if (isSelf) {
        return L(`${srcName} 编辑了自己的自定义贴图`, `${srcName} edited their own custom texture`);
    }
    return L(`${srcName} 编辑了 ${tgtName} 的自定义贴图`, `${srcName} edited ${tgtName}'s custom texture`);
}

/**
 * 发送一条编辑动作信标。任何 添加/编辑/删除 图层的提交点都可调用。
 * @param {Character} targetChar - 被编辑贴图的角色（CharacterGetCurrent()）
 */
export function sendItemEditBeacon(targetChar) {
    try {
        if (typeof ServerSend !== "function") return;
        if (typeof ServerPlayerIsInChatRoom === "function" && !ServerPlayerIsInChatRoom()) return;
        const srcMN = Player?.MemberNumber;
        const tgtMN = targetChar?.MemberNumber;
        if (typeof srcMN !== "number" || typeof tgtMN !== "number") return;

        const srcName = nameOf(srcMN);
        const tgtName = nameOf(tgtMN);
        // 兜底文本用发送方语言（没装插件的人看到的就是这句）
        const fallback = buildText(srcName, tgtName, srcMN === tgtMN);

        ServerSend("ChatRoomChat", {
            Type: "Action",
            Content: BEACON_CONTENT,
            Dictionary: [
                { Tag: MISSING_TAG, Text: fallback },
                // 供装了插件的接收方本地化用
                { Type: BEACON_CONTENT, Source: srcMN, Target: tgtMN },
            ],
        });
    } catch (e) {
        Logger.error("[ShuangAssets] 发送编辑动作信标失败", e);
    }
}

/**
 * 注册接收钩子：装了插件的玩家把信标本地化为自己语言后显示。
 * @param {HookManager} HookManager - SDK 的 HookManager
 */
export function setupItemEditBeacon(HookManager) {
    if (!HookManager || typeof HookManager.hookFunction !== "function") return;
    if (typeof ChatRoomMessage !== "function") return;

    HookManager.hookFunction("ChatRoomMessage", 0, (args, next) => {
        try {
            const data = args[0];
            if (data?.Type === "Action" && data?.Content === BEACON_CONTENT && Array.isArray(data.Dictionary)) {
                const payload = data.Dictionary.find(d => d?.Type === BEACON_CONTENT);
                const missing = data.Dictionary.find(d => d?.Tag === MISSING_TAG);
                if (payload && missing) {
                    const srcName = nameOf(payload.Source);
                    const tgtName = nameOf(payload.Target);
                    // 覆盖兜底 Text -> 接收方语言 + 接收方本地昵称
                    missing.Text = buildText(srcName, tgtName, payload.Source === payload.Target);
                }
            }
        } catch (e) { Logger.error("[ShuangAssets] 本地化编辑动作信标失败", e); }
        return next(args);
    });
}
