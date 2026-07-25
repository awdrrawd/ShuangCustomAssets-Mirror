# ShuangCustomAssets (霜自定义道具)

霜系列插件 - 自定义道具与外观扩展，让玩家上传图床链接实现动态贴图效果

## 📦 安装教程

### 油猴脚本安装

**方法一：一键安装（推荐）**
1. 点击这个链接：[loader.user.js](https://gitgud.io/yeshuang26/shuangcustomassets/-/raw/master/loader.user.js)
2. Tampermonkey 会自动弹出安装界面
3. 点击 **安装** 完成

**方法二：手动安装**
1. 点击这里下载脚本：[`loader.user.js`](loader.user.js)
2. 打开 Tampermonkey 管理面板
3. 点击 **添加新脚本**
4. 将下载的脚本内容粘贴进去
5. 保存并刷新游戏页面

### 开发版安装

本地开发请使用开发版加载器：[`loader.dev.user.js`](loader.dev.user.js)

1. 启动本地构建和服务器：
   ```bash
   npm install
   npm run dev      # 终端1: 构建监听
   npm run serve    # 终端2: 本地服务器
   ```
2. 安装 `loader.dev.user.js` 到油猴
3. 刷新游戏页面

### 安装验证

安装完成后：
- 刷新游戏页面
- 控制台会显示 `[ShuangAssets] Shuang自定义道具扩展 v0.1.0 正在初始化...`
- 进入任意部位的物品栏，可找到"自定义贴图"道具

## ✨ 功能特性

### 自定义贴图道具

- **多图层支持**：单个道具支持最多 16 个独立图层
- **全部位可用**：注册到所有物品部位组，任意位置都可使用
- **URL 贴图**：玩家输入图床链接，动态加载自定义贴图
- **参数调节**：每个图层可独立调整 X/Y 偏移、缩放、旋转
- **实时预览**：参数修改后自动刷新角色模型
- **本地调节**：调整时不上传服务器，确认后才同步
- **导入导出**：支持 JSON 配置导入导出，方便分享

### 编辑器界面

```
贴图管理
├── 图层列表（最多 16 个）
├── 添加新贴图
├── 确认保存（同步到服务器）
├── 导出配置（复制到剪贴板）
└── 导入配置（从剪贴板读取）

图层编辑
├── 贴图 URL
├── X 偏移 / Y 偏移
├── 缩放 / 旋转
└── 删除 / 确认 / 取消
```

## 🎮 使用方法

### 添加自定义贴图

1. 在任意部位物品栏找到"自定义贴图"并装备
2. 点击道具打开编辑面板
3. 点击"添加新贴图"创建图层
4. 输入图床 URL（需支持 CORS）
5. 调整偏移、缩放、旋转参数
6. 点击"确认"返回列表
7. 点击"确认保存"同步到服务器

### 推荐图床

需支持 CORS 的图床服务：
- GitHub Pages
- jsDelivr CDN
- imgur（需配置）

### 配置导入导出

- **导出**：点击"导出配置"，配置 JSON 自动复制到剪贴板
- **导入**：复制配置 JSON 到剪贴板，点击"导入配置"

配置格式：
```json
{
  "type": "ShuangCustomAssets",
  "version": 1,
  "textures": [
    {
      "TextureURL": "https://...",
      "OffsetX": 0,
      "OffsetY": 0,
      "Scale": 100,
      "Rotation": 0
    }
  ]
}
```

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建
npm run build

# 本地测试服务器
npm run serve
```

### 部署到 Cloudflare Pages

使用 wrangler 部署到 CF Pages：

```bash
# 安装 wrangler（如果还没安装）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署到 Cloudflare Pages（项目名：shuang-custom-assets）
wrangler pages deploy dist --project-name=shuang-custom-assets
netlify deploy --prod
```

部署后会得到类似这样的 URL：
- `https://shuang-custom-assets.pages.dev/shuang-assets.js`

更新 `loader.user.js` 中的 `SCRIPT_URL` 指向新地址即可。

### 添加新道具

1. 在 `src/assets/` 目录下创建新文件，例如 `myAsset.js`
2. 编写道具定义并导出注册函数
3. 在 `src/assets/index.js` 中导入并注册

详细教程请参考 [docs/HOW_TO_ADD_ASSETS.md](./docs/HOW_TO_ADD_ASSETS.md)

## 📁 目录结构

```
ShuangCustomAssets/
├── src/
│   ├── assets/               # 道具定义目录
│   │   ├── index.js          # 道具注册入口
│   │   ├── _template.js      # 道具模板
│   │   └── customTexture.js  # 自定义贴图道具
│   ├── lib/
│   │   ├── assetManager.js   # 资产管理器封装
│   │   └── utils.js          # 工具函数
│   ├── main.js               # 主入口
│   └── modInfo.js            # 插件信息
├── dist/                     # 构建输出
│   └── shuang-assets.js      # 编译后的代码
├── docs/                     # 文档
├── loader.dev.user.js        # 开发版油猴脚本
├── loader.user.js            # 生产版油猴脚本
├── package.json
├── rollup.config.js
└── README.md
```

## 📋 技术细节

### 道具注册

道具注册到所有物品部位组，确保玩家可以在任意位置使用：

```javascript
const ALL_ITEM_GROUPS = [
    "ItemAddon", "ItemArms", "ItemBoots", "ItemBreast", "ItemButt",
    "ItemDevices", "ItemEars", "ItemFeet", "ItemHands", "ItemHead",
    "ItemHood", "ItemLegs", "ItemMisc", "ItemMouth", "ItemMouth2",
    "ItemMouth3", "ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints",
    "ItemNipples", "ItemNipplesPiercings", "ItemNose", "ItemPelvis",
    "ItemTorso", "ItemTorso2", "ItemVulva", "ItemVulvaPiercings",
    "ItemHandheld"
];
```

### 数据同步

道具属性通过 `Item.Property.Textures` 存储并自动同步到其他玩家：

- `ChatRoomCharacterItemUpdate` - 同步到服务器
- `CharacterRefresh` - 刷新角色画布
- 其他玩家收到同步后会自动加载相同 URL 的贴图

## 📦 依赖

- [@sugarch/bc-asset-manager](https://github.com/SugarChain-Studio/bc-modding-utilities)
- [@sugarch/bc-mod-hook-manager](https://github.com/SugarChain-Studio/bc-modding-utilities)
- bondage-club-mod-sdk

## License

MIT
