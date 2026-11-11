// 兼容 BC R133：@sugarch/bc-asset-manager（<=1.4.3）内置的两处 patchFunction 锚点已不匹配新版游戏源码，
// 启动时会各打印 "ModSDK: Patching ...: Patch ... not applied"。
//  1. GLDrawLoadImage：R133 起改用 GLDrawImageCache（fetch + ImageCache），函数内不再有 new Image()，
//     crossOrigin 补丁在 R133 已无对象；但 R132 及更早版本仍需要它。
//  2. ItemColorLoad：R133 把 `Assets/${c.AssetFamily}/ColorGroups.csv` 改成 `Assets/ColorGroups.csv`，
//     锚点文字需要跟着更新（旧版本仍是带 AssetFamily 的那种写法）。
//
// 所以这里不做「删掉 / 写死新锚点」这种单向改法，而是在打包时给这两处 patchFunction 的补丁表包一层
// 运行时过滤：只把「当前游戏那份函数源码里仍然存在」的锚点交给 ModSDK，其余丢弃（不会触发 not applied 警告）。
// 于是同一份产物在 R132（锚点仍在 -> crossOrigin 补丁照常生效）与 R133（锚点已消失 -> 自动跳过）都正确；
// 函式库升级修好锚点后，本转换自动退化成「原样传递补丁表」（幂等，再次运行不再改动）。
//
// 取「当前游戏函数源码」时优先用 ModSDK 记录的原函数：别的 mod 可能已经把全局函数换成了 ModSDK router,
// 直接读 globalThis[name] 会拿到 router 的源码而不是游戏原函数。

/** 需要做运行时锚点过滤的 patchFunction 目标 */
const ANCHORED_PATCH_TARGETS = ["GLDrawLoadImage", "ItemColorLoad"];

/** 丢弃失效锚点时打印的调试讯息（console.debug 默认不显示，只留排查线索） */
const SKIPPED_ANCHOR_MESSAGE = "[ShuangAssets] bc-asset-manager 补丁锚点已失效，已跳过";

/**
 * 生成「按当前游戏函数源码过滤补丁表」的表达式：锚点仍在 -> 原样保留；已失效 -> 丢弃并 debug 记录。
 * @param {string} functionName 目标函数名（可以是点路径）
 * @param {string} recordSource 补丁表字面量源码，如 `{"\tImg.src = url;":"..."}`
 */
function buildFilteredPatchExpression(functionName, recordSource) {
    const name = JSON.stringify(functionName);
    return [
        "(()=>{",
        "const resolve=n=>n.split(\".\").reduce((o,k)=>o?.[k],globalThis);",
        `const original=globalThis.bcModSdk?.getPatchingInfo?.().get(${name})?.original;`,
        `const source=String(original??resolve(${name})??"");`,
        "const result={};",
        `for(const [key,value] of Object.entries(${recordSource})){`,
        "if(source.includes(key))result[key]=value;",
        `else console.debug(${JSON.stringify(SKIPPED_ANCHOR_MESSAGE)},key);`,
        "}",
        "return result;",
        "})()"
    ].join("");
}

/** 跳过一段字符串/模板字面量，返回结束引号的下标 */
function skipStringLiteral(code, start) {
    const quote = code[start];
    let index = start + 1;
    while (index < code.length) {
        const char = code[index];
        if (char === "\\") {
            index += 2;
            continue;
        }
        if (quote === "`" && char === "$" && code[index + 1] === "{") {
            index = skipBalanced(code, index + 1) + 1;
            continue;
        }
        if (char === quote) return index;
        index++;
    }
    return code.length - 1;
}

/** 从 `{`/`[` 开始跳过成对括号（忽略字符串与模板内文），返回闭合括号的下标 */
function skipBalanced(code, start) {
    let depth = 0;
    let index = start;
    while (index < code.length) {
        const char = code[index];
        if (char === `"` || char === "'" || char === "`") {
            index = skipStringLiteral(code, index);
        } else if (char === "{" || char === "[") {
            depth++;
        } else if (char === "}" || char === "]") {
            depth--;
            if (depth === 0) return index;
        }
        index++;
    }
    return -1;
}

/** 把 `patchFunction("name",{...})` 的补丁表换成运行时过滤版本 */
function filterPatchRecord(code, functionName) {
    const marker = `patchFunction(${JSON.stringify(functionName)},{`;
    let out = code;
    let from = 0;
    for (;;) {
        const at = out.indexOf(marker, from);
        if (at < 0) return out;
        const recordStart = at + marker.length - 1;
        const recordEnd = skipBalanced(out, recordStart);
        if (recordEnd < 0) {
            throw new Error(`asset-manager compat: 无法解析 ${functionName} 的补丁表`);
        }
        const filtered = buildFilteredPatchExpression(functionName, out.slice(recordStart, recordEnd + 1));
        out = out.slice(0, recordStart) + filtered + out.slice(recordEnd + 1);
        from = recordStart + filtered.length;
    }
}

/**
 * 打包期转换 @sugarch/bc-asset-manager：
 *  1. 更新 ItemColorLoad 的 ColorGroups.csv 锚点文字（R133 起路径不再带 AssetFamily）；
 *  2. 给带锚点的补丁表加运行时过滤，锚点失效时自动跳过而不是报 not applied。
 * 已转换过的代码再次传入不会改动（幂等），函式库自行修好锚点后同样退化为 no-op。
 */
function patchAssetManagerForR133(code) {
    let out = code;
    out = out.split("Assets/${c.AssetFamily}/ColorGroups.csv").join("Assets/ColorGroups.csv");
    out = out.split("Assets/\\${c.AssetFamily}/ColorGroups.csv").join("Assets/ColorGroups.csv");
    for (const functionName of ANCHORED_PATCH_TARGETS) {
        out = filterPatchRecord(out, functionName);
    }
    return out;
}

module.exports = {
    ANCHORED_PATCH_TARGETS,
    buildFilteredPatchExpression,
    patchAssetManagerForR133
};
