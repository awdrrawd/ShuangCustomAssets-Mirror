const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");

const pkg = require("./package.json");

const isProd = process.env.NODE_ENV === "production";

// 构建时从 git 推算版本号：用 git tag(如 v0.2.0)标记版本起点，patch = tag 之后的 commit 数
// 升 minor/major 时打新 tag(如 v0.3.0)，patch 自动从 0 重新计数；没 tag 时回退 package.json
function getBuildVersion() {
    try {
        const tag = execSync("git describe --tags --abbrev=0", { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
        if (tag) {
            const patch = execSync(`git rev-list --count ${tag}..HEAD`, { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
            const [major, minor] = tag.replace(/^v/, "").split(".");
            return `${major}.${minor}.${patch}`;
        }
    } catch {}
    return pkg.version;
}
const buildVersion = getBuildVersion();

module.exports = {
    input: pkg.modConfig.entry,
    output: {
        dir: "dist",
        entryFileNames: "assets/main.js",
        chunkFileNames: "assets/[name]-[hash].js",
        format: "es",  // Bootstrap and application are separate modules with a shared startup guard
        sourcemap: !isProd,
        compact: false
    },
    plugins: [
        {
            name: "distribution-assets",
            writeBundle(output, bundle) {
                // Only prune generated scripts after a successful write, preserving the last working build on errors.
                const root = path.resolve(output.dir);
                const current = new Set(Object.keys(bundle));
                for (const chunk of Object.values(bundle)) {
                    if (chunk.type === "chunk" && chunk.map && output.sourcemap) {
                        current.add(`${chunk.fileName}.map`);
                    }
                }
                for (const relativeDir of ["", "assets"]) {
                    const directory = path.join(root, relativeDir);
                    if (!fs.existsSync(directory)) continue;
                    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                        const relative = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;
                        const generated = relativeDir === "assets"
                            ? /^(?:main|app-[\w-]+)\.js(?:\.map)?$/.test(entry.name)
                            : entry.name === "shuang-assets.js.map";
                        if (entry.isFile() && generated && !current.has(relative)) {
                            fs.unlinkSync(path.join(directory, entry.name));
                        }
                    }
                }
            },
            generateBundle() {
                this.emitFile({ type: "asset", fileName: "shuang-assets.js", source: 'import "./assets/main.js";\n' });
                for (const file of fs.readdirSync(path.join(__dirname, "assets"))) {
                    if (!file.endsWith(".png")) continue;
                    this.emitFile({ type: "asset", fileName: file, source: fs.readFileSync(path.join(__dirname, "assets", file)) });
                }
            }
        },
        {
            // 把 modInfo.js 的 version 字段替换为构建版本号（含 git commit 数）
            name: "version-inject",
            transform(code, id) {
                if (!id.endsWith("modInfo.js")) return null;
                if (!/version:\s*"[^"]*"/.test(code)) return null;
                return {
                    code: code.replace(/version:\s*"[^"]*"/, `version: "${buildVersion}"`),
                    map: { mappings: "" }
                };
            }
        },
        alias({
            entries: [
                { find: /^@lib\/(.*)/, replacement: path.resolve(__dirname, "src/lib/$1") },
                { find: /^@assets\/(.*)/, replacement: path.resolve(__dirname, "src/assets/$1") }
            ]
        }),
        resolve(),
        commonjs(),
        cleanup({
            comments: "some",
            sourcemap: !isProd
        })
    ].filter(Boolean),
    external: []
};
