const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const {
    patchAssetManagerForR133,
    buildFilteredPatchExpression,
    ANCHORED_PATCH_TARGETS
} = require("../build/assetManagerCompat.cjs");

const LIBRARY = path.join(__dirname, "../node_modules/@sugarch/bc-asset-manager/dist/index.mjs");

// 补丁表字面量的源码形态（String.raw 保留 \t 转义，交给表达式里的字符串解析）
const RECORD_SOURCE =
    String.raw`{"\tImg.src = url;":'\tImg.crossOrigin = "Anonymous";\n\t\t\tImg.src = url;',` +
    String.raw`"\ttmpImg.src = url;":'\ttmpImg.crossOrigin = "Anonymous";\n\t\t\ttmpImg.src = url;'}`;

const legacy =
    String.raw`ae("ImgMappingOnce.GLDrawLoadImage.crossOrigin",()=>{e.patchFunction("GLDrawLoadImage",` +
    RECORD_SOURCE +
    `)}),["DrawImageEx"].forEach(t=>{});` +
    "e.patchFunction(\"ItemColorLoad\",{\"ItemColorGroupNames = new TextCache(`Assets/${c.AssetFamily}/ColorGroups.csv`);\":`ItemColorGroupNames = new TextCache(\\`Assets/\\${c.AssetFamily}/ColorGroups.csv\\`);${t.globalFuncName}(()=>ItemColorLayerNames, ()=>ItemColorGroupNames);`})";

// 只保留与锚点判断相关的函数体，模拟 BC 两个版本里 GLDrawLoadImage 的写法
const R132_BODY = "let Img = GLDrawImageCache.get(url);\n\tif (Img) {\n\t\tImg.src = url;\n\t} else {\n\t\tconst tmpImg = new Image();\n\t\ttmpImg.src = url;\n\t}";
const R133_BODY = "const image = GLDrawImageCache.get(url);\n\treturn image.isLoaded() ? image.data : null;";

/** 用假的 globalThis 求值过滤表达式（模拟函式库在游戏里的执行环境） */
function runFilterExpression(expression, { globals = {}, patched = {} } = {}) {
    const fake = Object.assign({}, globals, {
        bcModSdk: { getPatchingInfo: () => new Map(Object.entries(patched)) }
    });
    // eslint-disable-next-line no-new-func
    return new Function("fake", `const globalThis = fake; return ${expression};`)(fake);
}

function captureDebug(run) {
    const original = console.debug;
    const logged = [];
    console.debug = (...args) => logged.push(args);
    try {
        return [run(), logged];
    } finally {
        console.debug = original;
    }
}

/** 复刻 ModSDK 的 ApplyPatches：锚点没命中时会 WarnUnique 并原样保留 */
function simulateModSdkApplyPatches(body, patch) {
    const warnings = [];
    let source = `function anonymous() {\n${body}\n}`;
    for (const [key, value] of Object.entries(patch)) {
        if (!source.includes(key)) warnings.push(key);
        source = source.split(key).join(value);
    }
    return { warnings, source };
}

test("打包转换保留 GLDrawLoadImage 补丁表并改为运行时过滤，同时更新 ItemColorLoad 锚点", () => {
    const out = patchAssetManagerForR133(legacy);
    for (const functionName of ANCHORED_PATCH_TARGETS) {
        assert.ok(out.includes(`patchFunction("${functionName}",(()=>{`), `${functionName} 应改成过滤表达式`);
    }
    assert.ok(out.includes("bcModSdk?.getPatchingInfo"), "应优先取 ModSDK 记录的原函数");
    assert.equal(out.includes("AssetFamily"), false, "旧锚点文字应已更新");
    assert.ok(out.includes('ItemColorGroupNames = new TextCache(`Assets/ColorGroups.csv`);"'));
    assert.ok(out.includes("new TextCache(\\`Assets/ColorGroups.csv\\`);${t.globalFuncName}"));
    assert.ok(out.includes('["DrawImageEx"].forEach'), "不应误伤其他 hook");
    assert.doesNotThrow(() => new Function(out));
});

test("转换幂等，且不含目标调用时原样返回", () => {
    const once = patchAssetManagerForR133(legacy);
    assert.equal(patchAssetManagerForR133(once), once);
    const plain = "foo(()=>{});";
    assert.equal(patchAssetManagerForR133(plain), plain);
});

test("运行时过滤：R132 锚点仍在 -> 补丁照常生效且无警告", () => {
    const expression = buildFilteredPatchExpression("GLDrawLoadImage", RECORD_SOURCE);
    const record = runFilterExpression(expression, { globals: { GLDrawLoadImage: new Function(R132_BODY) } });
    assert.deepEqual(Object.keys(record), ["\tImg.src = url;", "\ttmpImg.src = url;"]);

    const { warnings, source } = simulateModSdkApplyPatches(R132_BODY, record);
    assert.deepEqual(warnings, [], "R132 上不应出现 not applied 警告");
    assert.ok(source.includes('\tImg.crossOrigin = "Anonymous";'), "R132 的 crossOrigin 补丁应照旧写入");
    assert.ok(source.includes('\ttmpImg.crossOrigin = "Anonymous";'));
});

test("运行时过滤：R133 锚点消失 -> 空补丁表，不产生 not applied 警告", () => {
    const expression = buildFilteredPatchExpression("GLDrawLoadImage", RECORD_SOURCE);
    const [record, logged] = captureDebug(() =>
        runFilterExpression(expression, { globals: { GLDrawLoadImage: new Function(R133_BODY) } })
    );
    assert.deepEqual(Object.keys(record), []);
    assert.equal(logged.length, 2, "两个失效锚点各留一条 debug 线索");

    const { warnings, source } = simulateModSdkApplyPatches(R133_BODY, record);
    assert.deepEqual(warnings, []);
    assert.equal(source, `function anonymous() {\n${R133_BODY}\n}`, "R133 上不应改动游戏函数");
});

test("运行时过滤优先取 ModSDK 记录的原始函数（全局已是 router 时仍然正确）", () => {
    const expression = buildFilteredPatchExpression("GLDrawLoadImage", RECORD_SOURCE);
    const router = () => {};
    const record = runFilterExpression(expression, {
        globals: { GLDrawLoadImage: router },
        patched: { GLDrawLoadImage: { original: new Function(R132_BODY) } }
    });
    assert.equal(Object.keys(record).length, 2);

    const emptyOnR133 = runFilterExpression(expression, {
        globals: { GLDrawLoadImage: router },
        patched: { GLDrawLoadImage: { original: new Function(R133_BODY) } }
    });
    assert.deepEqual(Object.keys(emptyOnR133), []);
});

test("转换后的实际函式库仍是合法 ESM（node --check）", { skip: !fs.existsSync(LIBRARY) }, () => {
    const out = patchAssetManagerForR133(fs.readFileSync(LIBRARY, "utf8"));
    for (const functionName of ANCHORED_PATCH_TARGETS) {
        assert.ok(out.includes(`patchFunction("${functionName}",(()=>{`));
    }
    assert.equal(out.includes("${c.AssetFamily}/ColorGroups.csv"), false);
    assert.ok(out.includes("Assets/ColorGroups.csv"));

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sca-compat-"));
    const file = path.join(dir, "index.mjs");
    fs.writeFileSync(file, out);
    try {
        execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
