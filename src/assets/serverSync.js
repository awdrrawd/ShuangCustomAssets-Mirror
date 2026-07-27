/**
 * 自定义贴图道具 - 服务器同步
 */

import { Logger } from "@lib/utils.js";

/**
 * 同步道具属性到服务器
 * ChatRoomCharacterItemUpdate: 实时同步给房间内在线玩家（不更新服务器端 ChatRoomData）
 * ChatRoomCharacterUpdate: 更新服务器端 ChatRoomData，确保新进入房间的玩家能获取最新配置
 * ServerPlayerAppearanceSync: 持久化到 Player 账号数据，确保玩家重新登录时能恢复配置
 */
export function syncItemToServer(item) {
    // 在制作(Crafting)页面中不同步到服务器，制作页面有自己的保存机制
    if (CurrentScreen === "Crafting") return;

    const C = CharacterGetCurrent();
    if (!C || typeof ChatRoomCharacterItemUpdate !== "function") return;

    // 实时同步给房间内在线玩家
    ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);

    // 如果是玩家自己的道具，更新服务器端 ChatRoomData 和账号数据
    // 确保离线玩家上线后进入房间时能从 ChatRoomData 获取最新配置
    if (C.IsPlayer()) {
        if (typeof ChatRoomCharacterUpdate === "function") {
            ChatRoomCharacterUpdate(C);
        }
        if (typeof ServerPlayerAppearanceSync === "function") {
            ServerPlayerAppearanceSync();
        }
    }

    Logger.info(`[ShuangAssets] 已同步道具到服务器`);
}
