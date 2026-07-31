/**
 * GIF 动图的「主动推进」机制。
 *
 * 背景：BC 的 AfterDraw（渲染自定义贴图的入口）只在角色外观画布被重新生成时
 * 才会执行一次，不会随动画帧自动触发；所以需要一个共用计时器，定期主动叫醒
 * 「已知在播放动图」的角色，让 BC 重新生成一次外观画布，新的一帧才有机会被画出来。
 *
 * 真正负责「用什么方式重绘」的逻辑已抽到 refreshScheduler.js（只重绘像素，
 * 不重算姿势 / 特效 / 图层排序，比完整 CharacterRefresh 轻得多），本文件只负责
 * 「维护名单」与「决定什么时候该叫醒谁」：
 * 1. 计时器每个 tick：这是让动图持续播放的主要驱动力。但不是每个已知角色都无差别
 *    叫醒——每个角色都记录了「下一次真的该换帧的时间戳」（nextDue，见 notifyGifFrame），
 *    tick 只会叫醒「已经到期」且「这一帧确实被画到屏幕上」的角色（用 BC 自己的
 *    DrawLastCharacters 判断可见性），避免对着一个 500ms 才换一次帧的 GIF、
 *    却用 100ms 的轮询间隔白白重绘 4 次。房间人越多、每次白白重绘省下的开销
 *    就越明显。
 * 2. 分页从背景切回前景 / 画面切换（进出聊天室、开关菜单）/ 刚登入：
 *    这几种情况改动幅度大且频率低，直接无差别叫醒全部已知角色，确保不会
 *    停在切换前的旧的一帧。
 * 3. 道具异动（他人穿脱道具的 ChatRoomSyncItem 广播）：主动把该角色从名单中
 *    移除，而不是被动等 STALE_CHARACTER_TIMEOUT_MS（5 分钟）超时才清掉。
 *    如果该角色其实还有其他动图图层在播放，BC 自己在道具异动后会触发一次
 *    完整刷新，render.js 的 AfterDraw 马上就会替还在播的图层重新调用一次
 *    notifyGifFrame，不会有真的停播的空窗，只是不用再对着一个已经不存在的
 *    图层的旧到期时间瞎等。
 */
import { Logger } from "./utils.js";
import { pruneCachesNow } from "./cacheGC.js";
import { getGifFrameRate } from "../assets/settings.js";
import { refreshCharacterAppearance } from "./refreshScheduler.js";

/** 轮询间隔的默认值（毫秒）。实际运行时通过 getGifFrameRate() 读取玩家设置，
 *  用 setTimeout 递归而非 setInterval，这样每次 tick 都能拿到最新的设置值。
 *  这个值现在只决定「检查一次到期名单」的粒度，不再等于「重绘一次」的粒度——
 *  真正决定重绘频率的是每个角色各自的 nextDue（见 notifyGifFrame） */
const GIF_POLL_INTERVAL_DEFAULT_MS = 100;

/** 超过这么久没有被 notifyGifFrame 呼叫到的角色，视为「场上已经看不到了」
 *  （道具移除、角色离开聊天室等），从追踪名单中清掉，避免名单无限增长。
 *  正常情况下道具移除会走 ChatRoomSyncItem 主动清除，这里是兜底 */
const STALE_CHARACTER_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * @typedef {object} AnimatedCharacterEntry
 * @property {number} lastSeen - 最近一次被 notifyGifFrame 呼叫到的时间戳，供 stale 超时判断
 * @property {number} nextDue - 该角色目前已知「最快」会换帧的时间戳（取所有动图图层中最早的那个）。
 *   tick 只会在 now >= nextDue 时才触发一次重绘；重绘前会先重置为 Infinity，
 *   重绘过程中 render.js 会替每个还在播放的图层重新调用 notifyGifFrame，
 *   届时会自然写回一个新的、真实的 nextDue
 */

/**
 * 目前已知「场上有正在播放动图」的角色，及其调度状态。
 * 用普通 Map（而非 WeakMap）是因为需要在计时器 tick / visibilitychange 时遍历整个名单；
 * 靠 STALE_CHARACTER_TIMEOUT_MS 做超时清理，避免长时间挂机造成累积。
 * @type {Map<object, AnimatedCharacterEntry>}
 */
const _knownAnimatedCharacters = new Map();

let _timerStarted = false;

/**
 * 判断角色是否在「最近一次完整渲染」中真的被画到了屏幕上。
 * BC 每个 requestAnimationFrame 都会清空并重新填充全局的 DrawLastCharacters
 * （见 Scripts/Drawing.js），可以直接拿来当「目前看不看得到」的判断依据，
 * 不需要自己额外维护一套可见性追踪。找不到这个全局变量时（理论上不会发生）
 * 保守地当作「看得到」处理，不影响功能，只是失去这一层过滤效果。
 * @param {object} C
 * @returns {boolean}
 */
function isCurrentlyVisible(C) {
    if (typeof DrawLastCharacters === "undefined" || !Array.isArray(DrawLastCharacters)) {
        return true;
    }
    return DrawLastCharacters.includes(C);
}

/**
 * 强制重绘目前所有「已知在播放动图」的角色，不管是否到期。
 * 用于一次性的「补踢」场景（画面切换、分页切回前景、登入），这几种情况改动
 * 幅度大且频率低，直接无差别叫醒确保不会停在切换前的旧的一帧比较划算，
 * 不需要在意「是否到期」这件事。
 */
export function kickAllKnownAnimated() {
    if (_knownAnimatedCharacters.size === 0) return;
    for (const [C, entry] of _knownAnimatedCharacters) {
        // 重绘前先重置到期时间：即将触发的这次重绘会让 render.js 替每个还在播的
        // 图层重新调用一次 notifyGifFrame，届时会写回真实的新到期时间；这里重置
        // 只是避免沿用一个「本来就要被这次重绘覆盖掉」的旧数值
        entry.nextDue = Infinity;
        refreshCharacterAppearance(C);
    }
}

/**
 * 计时器 tick 专用：只重绘「已经到了该换帧时间」且「画面上看得到」的角色。
 * 这是这次调度改动的核心——旧版本每个 tick 无差别重绘所有已知角色，不管该角色
 * 的 GIF 这一帧到底有没有真的该换了；现在改成每个角色各自记录 nextDue，
 * 只有到期的才会触发一次（成本较高的）CharacterAppearanceBuildCanvas 全量重绘，
 * 房间人多、且各角色 GIF 帧延迟长短不一时，能省下相当比例的无效重绘。
 */
function kickDueAnimated() {
    if (_knownAnimatedCharacters.size === 0) return;
    const now = Date.now();
    for (const [C, entry] of _knownAnimatedCharacters) {
        if (now < entry.nextDue) continue; // 还没到期，跳过，这正是这次优化省下来的部分
        if (!isCurrentlyVisible(C)) continue;
        entry.nextDue = Infinity; // 重绘过程会由 notifyGifFrame 重新写回真实到期时间
        refreshCharacterAppearance(C);
    }
}

/**
 * 道具异动时调用：把该角色从「已知在播放动图」名单中移除。
 * 用于 ChatRoomSyncItem 广播命中时主动清除，取代被动等 STALE_CHARACTER_TIMEOUT_MS
 * 超时。如果该角色其实还有其他动图图层在播放，BC 自己在道具异动后触发的完整刷新
 * 会让 render.js 马上重新调用一次 notifyGifFrame，不会有真正停播的空窗。
 * @param {object} C - 角色对象
 */
export function forgetCharacter(C) {
    if (C) _knownAnimatedCharacters.delete(C);
}

function pruneStaleCharacters() {
    const now = Date.now();
    for (const [C, entry] of _knownAnimatedCharacters) {
        if (now - entry.lastSeen > STALE_CHARACTER_TIMEOUT_MS) {
            _knownAnimatedCharacters.delete(C);
        }
    }
}

function ensureTimerStarted() {
    if (_timerStarted) return;
    _timerStarted = true;

    // 用 setTimeout 递归而非 setInterval，每次 tick 都读取最新的帧率设置；
    // tick 本身只是「检查一次谁到期了」，真正决定要不要重绘的是各角色自己的 nextDue
    const tick = () => {
        pruneStaleCharacters();
        kickDueAnimated();
        setTimeout(tick, getGifFrameRate());
    };
    setTimeout(tick, GIF_POLL_INTERVAL_DEFAULT_MS);

    if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState !== "visible") return;
            // 浏览器对背景分页的计时器会大幅节流甚至暂停，切回前景时无差别
            // 全部补踢一次，把循环重新踢起来，不用等下一次 tick
            kickAllKnownAnimated();
        });
    }
}

/**
 * 注册「游戏内画面切换 / 刚登入」时的动图续播钩子。
 * 由 main.js 在初始化阶段调用一次。
 * @param {object} HookManager
 */
export function setupGifAnimationHooks(HookManager) {
    if (!HookManager || typeof HookManager.hookFunction !== "function") return;

    // BC 切换画面（模块/screen）时的统一入口，覆盖登入后进入大厅、
    // 进出聊天室、打开各种菜单等绝大多数场景。切换后角色的外观画布
    // 会被重新构建一次，这里补踢一次，避免停在刚切换过去时的那一帧。
    //
    // 顺便触发一次快取的机会性清理（见 cacheGC.js）：画面切换（尤其是离开聊天室）
    // 是「哪些图片接下来还看得到」最容易起变化的时间点，不需要另外维护一套「这个
    // 网址还有没有人在用」的引用计数，只是把原本反正会跑、最多等 60 秒的那次扫描
    // 提前在这个天然的时机点做一次，之后没有活动时仍然交给背景计时器兜底
    try {
        HookManager.hookFunction("CommonSetScreen", 0, (args, next) => {
            const ret = next(args);
            // 新画面的角色外观可能要到这次同步调用结束后才真正就绪，
            // 用一个 0ms 的 setTimeout 让它先跑完，再补一次强制刷新
            setTimeout(() => kickAllKnownAnimated(), 0);
            pruneCachesNow();
            return ret;
        });
    } catch (err) {
        Logger.error("[ShuangAssets] 注册画面切换动图钩子失败", err);
    }

    // 玩家刚登入时也补踢一次，避免登入后第一屏动图卡在静止帧
    if (typeof HookManager.afterPlayerLogin === "function") {
        try {
            HookManager.afterPlayerLogin(() => setTimeout(() => kickAllKnownAnimated(), 0));
        } catch (err) {
            Logger.error("[ShuangAssets] 注册登入动图钩子失败", err);
        }
    }

    // 他人道具增删/更换时的广播入口。命中时主动把该角色从追踪名单移除，
    // 不用被动等 5 分钟 stale 超时——道具被拿掉的角色，接下来最多 5 分钟内
    // 每个 tick 都会白白检查一次到期时间，人多的房间里这个成本会被放大。
    // 若该角色其实还有其他动图图层，BC 自身在道具异动后会照常触发一次完整
    // 刷新，render.js 马上就会替还在播的图层重新登记，不会造成真正的停播。
    try {
        HookManager.hookFunction("ChatRoomSyncItem", 0, (args, next) => {
            const ret = next(args);
            try {
                const data = args[0];
                const target = data?.Item?.Target;
                if (
                    typeof target === "number"
                    && typeof ChatRoomCharacter !== "undefined"
                    && Array.isArray(ChatRoomCharacter)
                ) {
                    const C = ChatRoomCharacter.find((c) => c.MemberNumber === target);
                    if (C) forgetCharacter(C);
                }
            } catch (err) {
                Logger.error("[ShuangAssets] 处理道具同步事件失败", err);
            }
            return ret;
        });
    } catch (err) {
        Logger.error("[ShuangAssets] 注册道具同步动图钩子失败", err);
    }
}

/**
 * 由 render.js 在每次画到「isAnimated 的 GIF 图层」时调用。
 * 把角色记入「目前已知在播放动图」的名单（刷新存活时间戳），并把这一层
 * 「下一次真的该换帧」的时间戳并入该角色的 nextDue（取所有图层中最早的）。
 * 实际让画面持续前进的，是计时器 tick 对「已到期」角色的重绘（见上方
 * ensureTimerStarted / kickDueAnimated），这里只负责登记时间表，不主动触发重绘。
 * @param {object} C - 角色对象
 * @param {number} layerIndex - 保留参数以兼容既有呼叫端，目前未使用
 * @param {number} frameIndex - getGifFrameState 算出的帧索引（>=0）
 * @param {number} [nextDueAt] - 这一图层预期下一次换帧的时间戳（Date.now() + remainingMs）。
 *   未传入时退回「视为立即到期」，等同旧行为，避免呼叫端未更新时功能整个失效
 */
export function notifyGifFrame(C, layerIndex, frameIndex, nextDueAt) {
    if (!C || frameIndex < 0) return;

    ensureTimerStarted();
    const now = Date.now();
    const due = typeof nextDueAt === "number" ? nextDueAt : now;
    let entry = _knownAnimatedCharacters.get(C);
    if (!entry) {
        entry = { lastSeen: now, nextDue: due };
        _knownAnimatedCharacters.set(C, entry);
    } else {
        entry.lastSeen = now;
        // 取最早的到期时间：同一次重绘中，角色身上多个动图图层会各自呼叫一次，
        // 该角色真正该被叫醒的时机是其中最快到期的那一层
        entry.nextDue = Math.min(entry.nextDue, due);
    }
}

export default { notifyGifFrame, kickAllKnownAnimated, forgetCharacter, setupGifAnimationHooks };