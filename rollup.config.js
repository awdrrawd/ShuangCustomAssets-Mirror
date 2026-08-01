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

// 油猴脚本头部
const userScriptHeader = `// ==UserScript==
// @name         ${pkg.displayName}
// @namespace    https://github.com/shuang/
// @version      ${buildVersion}
// @description  ${pkg.description}
// @author       ${pkg.author}
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.com/*
// @match        https://bondage-club.net/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
`;

module.exports = {
    input: pkg.modConfig.entry,
    output: {
        file: path.join("dist", pkg.modConfig.output),
        format: "iife",  // 立即执行函数格式，避免变量名冲突
        sourcemap: !isProd,
        compact: false
    },
    plugins: [
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
