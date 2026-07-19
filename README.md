# ShuangCustomAssets

Shuang 的自定义道具扩展 - 轻量级、易扩展的 BC 插件框架。

## 特性

- ✅ 轻量级架构
- ✅ 支持动态贴图 URL
- ✅ 模块化设计，方便添加新道具
- ✅ 基于 AssetManager 和 HookManager

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 开发模式

```bash
# 终端 1: 启动构建监听
npm run dev

# 终端 2: 启动本地服务器
npm run serve
```

### 3. 安装油猴脚本

在油猴中安装开发版加载器：

- **开发版**: [loader.dev.user.js](./loader.dev.user.js) - 从 `localhost:8080` 加载
- **生产版**: [loader.user.js](./loader.user.js) - 从 CDN 加载

### 4. 打开游戏

访问 https://bondageprojects.elementfx.com/ 插件会自动加载。

## 开发

### 构建

```bash
npm run build
```

### 本地测试服务器

```bash
npm run serve
```

服务器会在 http://localhost:8080 启动。

## 添加新道具

1. 在 `src/assets/` 目录下创建新文件，例如 `myAsset.js`

2. 编写道具定义：

```javascript
import { Logger } from "@lib/utils.js";

const asset = [
    "ItemAddon",
    {
        Name: "我的道具",
        Random: false,
        // ... 其他属性
    },
    {
        translation: { CN: "我的道具", EN: "My Asset" },
        extended: {
            Archetype: "noarch",
            // ... 扩展配置
        }
    }
];

export default function register(AssetManager) {
    AssetManager.addAssetWithConfig(asset);
}
```

3. 在 `src/assets/index.js` 中导入并注册：

```javascript
import myAsset from "./myAsset.js";

const assets = [
    ["我的道具", myAsset],
    // ...
];

export default assets;
```

## 目录结构

```
ShuangCustomAssets/
├── src/
│   ├── assets/           # 道具定义目录
│   │   ├── index.js      # 道具注册入口
│   │   ├── _template.js  # 道具模板
│   │   └── customTexture.js  # 示例：自定义贴图
│   ├── lib/
│   │   ├── assetManager.js   # 资产管理器封装
│   │   └── utils.js          # 工具函数
│   ├── main.js           # 主入口
│   └── modInfo.js        # 插件信息
├── dist/                 # 构建输出
│   └── shuang-assets.js  # 编译后的代码
├── loader.dev.user.js    # 开发版油猴脚本
├── loader.user.js        # 生产版油猴脚本
├── package.json
├── rollup.config.js
└── README.md
```

## 依赖

- [@sugarch/bc-asset-manager](https://github.com/SugarChain-Studio/bc-modding-utilities)
- [@sugarch/bc-mod-hook-manager](https://github.com/SugarChain-Studio/bc-modding-utilities)
- bondage-club-mod-sdk

## License

MIT