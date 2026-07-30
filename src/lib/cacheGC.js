/**
 * 图片缓存的「已经不存在」清理机制。
 *
 * getCorsImage（utils.js）与 getAnimatedImage（gifPlayer.js）各自维护一个以网址为 key
 * 的 Map 做缓存，确保同一网址只下载 / 解码一次；但如果某张图片已经不再被任何贴图引用
 * （道具被移除、图层网址被改掉、角色离开视野等），缓存条目会一直留着占用内存（含 GIF
 * 解码出来的一整批帧 canvas），永远不会释放，长时间游玩下来会持续累积。
 *
 * 这里提供一个通用、与具体缓存实现无关的清理机制：
 * - 每次 getCorsImage / getAnimatedImage 命中或建立一个 entry 时，
 *   呼叫端都会把该 entry 的 lastUsed 戳记刷新成现在（见 utils.js / gifPlayer.js）
 * - 背景计时器每隔 CLEANUP_INTERVAL_MS 扫过所有已注册的缓存，把「已经下载/解析完成、
 *   但超过 STALE_ENTRY_TIMEOUT_MS 没有再被渲染引用到」的条目删除，等同于判定这张
 *   图片「画面上已经不存在了」，释放它占用的内存（图片元素 / GIF 帧 canvas 数组）
 * - 仍在下载 / 解析中的条目（loaded !== true）不会被清理，避免打断进行中的请求，
 *   也避免同一网址因为请求还没回来就被误删、导致重复发起请求
 * - 计时器只在第一次有缓存注册进来时才惰性启动（与 gifAnimationLoop 的做法一致），
 *   不会在插件刚加载、还没有任何图片被用到时就空转
 */

const CLEANUP_INTERVAL_MS = 60 * 1000; // 每 60 秒检查一次即可，不需要很高频率
const STALE_ENTRY_TIMEOUT_MS = 5 * 60 * 1000; // 超过 5 分钟没被用到，视为已经不存在

/** @type {{cache: Map<string, {loaded?: boolean, lastUsed?: number}>, name: string}[]} */
const _prunableCaches = [];
let _timerStarted = false;

function pruneAll() {
    const now = Date.now();
    for (const { cache, name } of _prunableCaches) {
        let pruned = 0;
        for (const [key, entry] of cache) {
            // 只清理「已经确定加载完成/失败」且「够久没被用到」的条目；
            // 还在飞行中的请求（loaded 为 false）留着，避免误删正在进行的下载
            if (entry?.loaded && now - (entry.lastUsed || 0) > STALE_ENTRY_TIMEOUT_MS) {
                cache.delete(key);
                pruned++;
            }
        }
        if (pruned > 0) {
            console.log(`[ShuangAssets] 已释放 ${pruned} 个不再使用的${name}缓存（画面上已经看不到的图片）`);
        }
    }
}

function ensureTimerStarted() {
    if (_timerStarted) return;
    _timerStarted = true;
    setInterval(pruneAll, CLEANUP_INTERVAL_MS);
}

/**
 * 立即执行一次清理，不等下一次计时器 tick。
 * 用于「切换画面」这类天然的时机点做一次机会性清理（见 gifAnimationLoop.js 的
 * CommonSetScreen 钩子）——复用同一套以时间戳判断的扫描逻辑，不需要额外维护
 * 任何「这个网址现在还有没有人在用」的引用计数，开销极小（只是把原本要等最多
 * 60 秒的下一次 tick 提前执行一次而已）。
 */
export function pruneCachesNow() {
    pruneAll();
}

/**
 * 注册一个可被自动清理的 URL -> entry 缓存。
 * entry 至少要有 `loaded`（是否已完成）与 `lastUsed`（最近一次被使用的时间戳，
 * 由呼叫端在每次读取该 entry 时自行更新）两个欄位。
 * @param {Map<string, {loaded?: boolean, lastUsed?: number}>} cache
 * @param {string} name - 仅用于日志说明，例如「静态图片」「GIF」
 */
export function registerPrunableCache(cache, name) {
    _prunableCaches.push({ cache, name });
    ensureTimerStarted();
}

export default { registerPrunableCache, pruneCachesNow };
