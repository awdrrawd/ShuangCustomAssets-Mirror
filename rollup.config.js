const path = require("path");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const alias = require("@rollup/plugin-alias");
const cleanup = require("rollup-plugin-cleanup");

const pkg = require("./package.json");

const isProd = process.env.NODE_ENV === "production";

// 油猴脚本头部
const userScriptHeader = `// ==UserScript==
// @name         ${pkg.displayName}
// @namespace    https://github.com/shuang/
// @version      ${pkg.version}
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