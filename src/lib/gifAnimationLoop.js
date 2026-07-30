/**
 * GIF 动图的「主动推进」机制。
 *
 * 背景 / 为什么需要这个文件：
 * BC 的 AfterDraw（renderTexture 的入口）只会在角色外观画布被重新生成时才触发
 * ——也就是 CharacterRefresh(C, ...) 实际执行的时候，而不是每个动画帧都会自动调用。
 * 这一点在本项目的 editPanel.js 里也能看到同样的假设：拖拽/调值之后，必须显式呼叫
 * CharacterRefresh 才能让预览更新，并且特意做了节流（TEXTURE_REFRESH_INTERVAL /
 * TEXTURE_DRAG_REFRESH_INTERVAL）。
 *
 * getCurrentGifFrameIndex() 依据「实际经过的时间」算出来的帧索引本身没有问题，
 * 对 totalDuration 取模一定会正确循环。问题是：如果没有人主动叫 BC 重新生成角色
 * 画布，这个新算出来的帧索引根本没有机会被画出来。
 *
 * 这里用一个共用的计时器，每 tick 都无条件对所有「已知在播放动图」的角色强制呼叫一次
 * CharacterRefresh，让 BC 重新生成外观画布（进而重新把新的一帧绘制、上传成 WebGL 贴图）。
 *
 * 曾经的做法（已放弃）：只有侦测到「这一帧的索引跟上次不一样」时，才把角色排进下一次
 * tick 要刷新的名单，用意是省掉不必要的 CharacterRefresh 呼叫。但这个判断本身有先有
 * 鸡还是先有蛋的问题——「帧有没有换」只有在真的呼叫过 CharacterRefresh、让 AfterDraw
 * 重新跑一次之后才会知道。只要某一帧刚好显示得比一次轮询间隔久，就会变成：这一帧刚
 * 开始显示时侦测到「换了」一次 -> 下一次 tick 刷新后发现还是同一帧 -> 判定「没有变化」
 * -> 不会再排进任何一次 tick -> 之后没有任何东西会再主动检查「现在该换下一帧了没」，
 * 因为唯一会呼叫 CharacterRefresh 的机制就是「被排进名单」，而名单已经空了。只能靠恰好
 * 发生的、跟动图完全无关的其他操作（换装、聊天讯息等）顺带触发一次 CharacterRefresh，
 * 才会补算一次目前该显示哪一帧。这正是「播一下就卡住」「时快时停」的成因：不是帧计算
 * 错了，而是自己把「继续检查」的机会锁死了。现在改成每个 tick 都无条件刷新，用固定的
 * 轮询开销换取播放的连续性；没有动图的角色完全不会被打扰（不在名单里，不会被处理）。
 *
 * 分页切到背景时的例外处理：
 * 浏览器对背景分页的 setInterval 会大幅节流甚至直接暂停，导致上面这个计时器停摆。
 * 这里额外监听 visibilitychange，分页一切回前景，就主动把所有「已知在播放动图」的
 * 角色都强制刷新一次，把循环重新踢起来，不用等下一次 tick。
 */
import { Logger } from "./utils.js";
import { pruneCachesNow } from "./cacheGC.js";
import { getGifFrameRate } from "../assets/settings.js";

/** 轮询间隔的默认值（毫秒）。实际运行时通过 getGifFrameRate() 读取玩家设置，
 *  用 setTimeout 递归而非 setInterval，这样每次 tick 都能拿到最新的设置值 */
const GIF_POLL_INTERVAL_DEFAULT_MS = 100;

/** 超过这么久没有被 notifyGifFrame 呼叫到的角色，视为「场上已经看不到了」
 *  （道具移除、角色离开聊天室等），从追踪名单中清掉，避免名单无限增长 */
const STALE_CHARACTER_TIMEOUT_MS = 5 * 60 * 1000;


/**
 * 目前已知「场上有正在播放动图」的角色，及其最后一次被看到的时间戳。
 * 用普通 Map（而非 WeakMap）是因为需要在计时器 tick / visibilitychange 时遍历整个名单；
 * 靠 STALE_CHARACTER_TIMEOUT_MS 做超时清理，避免长时间挂机造成累积。
 * @type {Map<object, number>}
 */
const _knownAnimatedCharacters = new Map();

let _timerStarted = false;

function forceRefresh(C) {
    try {
        if (typeof CharacterRefresh === "function") {
            // 与 editPanel.js 的实时预览用法一致：GLDraw2DCanvas 的纹理泄漏
            // 已经修复，可以安全地较高频率调用 CharacterRefresh
            CharacterRefresh(C, false, false);
        }
    } catch (err) {
        Logger.error("[ShuangAssets] GIF 动画刷新失败", err);
    }
}

/**
 * 强制刷新目前所有「已知在播放动图」的角色。
 * 用于三种场景：
 * 1）计时器每个 tick（见下方 ensureTimerStarted）——这是让动图持续播放的主要驱动力；
 * 2）分页从背景切回前景（见下方 visibilitychange 监听）；
 * 3）游戏内画面切换 / 刚登入时（见 setupGifAnimationHooks）。
 */
export function kickAllKnownAnimated() {
    if (_knownAnimatedCharacters.size === 0) return;
    for (const C of _knownAnimatedCharacters.keys()) forceRefresh(C);
}

function pruneStaleCharacters() {
    const now = Date.now();
    for (const [C, lastSeen] of _knownAnimatedCharacters) {
        if (now - lastSeen > STALE_CHARACTER_TIMEOUT_MS) {
            _knownAnimatedCharacters.delete(C);
        }
    }
}

function ensureTimerStarted() {
    if (_timerStarted) return;
    _timerStarted = true;

    // 用 setTimeout 递归而非 setInterval，每次 tick 都读取最新的帧率设置
    const tick = () => {
        pruneStaleCharacters();
        kickAllKnownAnimated();
        setTimeout(tick, getGifFrameRate());
    };
    setTimeout(tick, GIF_POLL_INTERVAL_DEFAULT_MS);

    if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState !== "visible") return;
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
            setTimeout(kickAllKnownAnimated, 0);
            pruneCachesNow();
            return ret;
        });
    } catch (err) {
        Logger.error("[ShuangAssets] 注册画面切换动图钩子失败", err);
    }

    // 玩家刚登入时也补踢一次，避免登入后第一屏动图卡在静止帧
    if (typeof HookManager.afterPlayerLogin === "function") {
        try {
            HookManager.afterPlayerLogin(() => setTimeout(kickAllKnownAnimated, 0));
        } catch (err) {
            Logger.error("[ShuangAssets] 注册登入动图钩子失败", err);
        }
    }
}

/**
 * 由 render.js 在每次画到「isAnimated 的 GIF 图层」时调用。
 * 只需要把角色记入「目前已知在播放动图」的名单（并刷新其存活时间戳）；
 * 实际让画面持续前进的，是计时器每个 tick 对所有已知角色的无条件强制刷新
 * （见上方 ensureTimerStarted / kickAllKnownAnimated），而不是靠这里侦测
 * 「帧有没有换」来决定要不要排队——那个判断本身就有先有鸡还是先有蛋的问题。
 * @param {object} C - 角色对象
 * @param {number} layerIndex - 保留参数以兼容既有呼叫端，目前未使用
 * @param {number} frameIndex - getCurrentGifFrameIndex 算出的帧索引（>=0）
 */
export function notifyGifFrame(C, layerIndex, frameIndex) {
    if (!C || frameIndex < 0) return;

    ensureTimerStarted();
    _knownAnimatedCharacters.set(C, Date.now());
}

export default { notifyGifFrame, kickAllKnownAnimated, setupGifAnimationHooks };
