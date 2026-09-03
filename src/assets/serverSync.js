import { backupAppearance } from "../lib/persistence.js";
/**
 * 自定义贴图道具 - 服务器同步
 *
 * 除同步外，这里还是所有配置修改提交的汇聚点（listView/editPanel/importExport 等
 * 凡是改动配置都会调用 syncItemToServer）。因此在这里做「前后配置快照对比」，
 * 配置有实质变化才广播编辑动作信标 —— 一劳永逸覆盖所有修改操作，且天然过滤
 * 取消/还原（还原后配置回到原样，对比无差异，不广播）。
 */

import { Logger } from "@lib/utils.js";
import { sendItemEditBeacon } from "./itemEditBeacon.js";

// 配置快照：itemKey -> JSON 字符串（记录上次同步时的配置基线）
const snapshotStore = new Map();
// 广播防抖：itemKey -> 上次广播时间戳
const lastBroadcast = new Map();
const BEACON_DEBOUNCE_MS = 3000;

/** 生成道具唯一标识（不同部位的贴图道具独立快照） */
function itemKeyOf(item) {
    const g = item?.Asset?.Group?.Name || "";
    const n = item?.Asset?.Name || "";
    return `${g}:${n}`;
}

/**
 * 记录道具配置基线。每次打开道具编辑（Load hook）时调用，
 * 让后续配置变化有对比基线，避免"打开后第一次修改"被当成基线不广播。
 */
export function recordItemBaseline(item) {
    if (!item) return;
    snapshotStore.set(itemKeyOf(item), JSON.stringify(item.Property ?? {}));
}

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

    // ===== 配置变化检测 + 编辑动作广播 =====
    // 所有修改操作都汇聚到这里；靠「前后快照对比」自动判断配置是否变化，
    // 有实质变化才广播（并受 3s 防抖限制）。取消/还原/无变化的确认退出因
    // 对比无差异而天然不广播。
    const key = itemKeyOf(item);
    const snap = JSON.stringify(item.Property ?? {});
    const prev = snapshotStore.get(key);
    if (prev !== undefined && prev !== snap) {
        const now = Date.now();
        const last = lastBroadcast.get(key) || 0;
        if (now - last >= BEACON_DEBOUNCE_MS) {
            sendItemEditBeacon(C);
            lastBroadcast.set(key, now);
        }
    }
    snapshotStore.set(key, snap);

    // 实时同步给房间内在线玩家
    ChatRoomCharacterItemUpdate(C, item.Asset.Group.Name);

    // 如果是玩家自己的道具，更新服务器端 ChatRoomData 和账号数据
    // 确保离线玩家上线后进入房间时能从 ChatRoomData 获取最新配置
    if (C.IsPlayer()) {
        backupAppearance(true);
        if (typeof ChatRoomCharacterUpdate === "function") {
            ChatRoomCharacterUpdate(C);
        }
        if (typeof ServerPlayerAppearanceSync === "function") {
            ServerPlayerAppearanceSync();
        }
    }

    Logger.info(`[ShuangAssets] 已同步道具到服务器`);
}
