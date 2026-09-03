const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const config = require("../rollup.config.js");

test("successful builds prune obsolete scripts and maps while preserving current outputs and unrelated files", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sca-build-"));
    const assets = path.join(root, "assets");
    fs.mkdirSync(assets);
    const names = ["app-old.js", "app-old.js.map", "app-current.js", "app-current.js.map", "main.js", "main.js.map", "custom.png"];
    for (const name of names) fs.writeFileSync(path.join(assets, name), "fixture");
    fs.writeFileSync(path.join(root, "shuang-assets.js.map"), "old map");
    const plugin = config.plugins.find(p => p.name === "distribution-assets");
    const bundle = Object.fromEntries(["main", "app-current"].map(name => [
        `assets/${name}.js`, { type: "chunk", fileName: `assets/${name}.js`, map: {} }
    ]));
    try {
        plugin.writeBundle({ dir: root, sourcemap: true }, bundle);
        assert.deepEqual(fs.readdirSync(assets).sort(), ["app-current.js", "app-current.js.map", "custom.png", "main.js", "main.js.map"]);
        assert.equal(fs.existsSync(path.join(root, "shuang-assets.js.map")), false);
        plugin.writeBundle({ dir: root, sourcemap: false }, bundle);
        assert.deepEqual(fs.readdirSync(assets).sort(), ["app-current.js", "custom.png", "main.js"]);
    } finally {
        for (const name of fs.readdirSync(assets)) fs.unlinkSync(path.join(assets, name));
        fs.rmdirSync(assets);
        for (const name of fs.readdirSync(root)) fs.unlinkSync(path.join(root, name));
        fs.rmdirSync(root);
    }
});
