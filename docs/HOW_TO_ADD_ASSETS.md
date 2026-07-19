# 如何添加新道具

## 步骤 1: 复制模板

复制 `src/assets/_template.js` 到同一目录，重命名为你的道具名称。

例如: `myCustomAsset.js`

## 步骤 2: 修改道具定义

打开文件，修改以下内容：

### 基本属性

```javascript
const asset = [
    "ItemAddon",        // 物品组（根据道具类型选择）
    {
        Name: "道具名称",  // 唯一标识符（英文）
        Random: false,
        DrawImages: false  // 是否使用默认图片
    },
    // ...
];
```

### 物品组说明

| 组名 | 说明 |
|------|------|
| `ItemAddon` | 附加物品 |
| `Cloth` | 衣服 |
| `ClothLower` | 下装 |
| `ItemDevices` | 设备 |
| `ItemHood` | 头套 |
| `Mask` | 面具 |
| `Socks` | 袜子 |
| `Gloves` | 手套 |
| `Shoes` | 鞋子 |
| `Hat` | 帽子 |
| `Necklace` | 项链 |

### 架构类型

**noarch（无原型）** - 完全自定义行为
```javascript
extended: {
    Archetype: "noarch",
    ScriptHooks: { /* 自定义钩子 */ }
}
```

**typed（类型道具）** - 单选类型切换
```javascript
extended: {
    Archetype: "typed",
    Options: [
        { Name: "类型1" },
        { Name: "类型2" }
    ]
}
```

**modular（模块化道具）** - 多选项组合
```javascript
extended: {
    Archetype: "modular",
    Modules: [
        { Name: "模块1", Key: "m1", Options: [{}, {}] },
        { Name: "模块2", Key: "m2", Options: [{}, {}, {}] }
    ]
}
```

## 步骤 3: 注册道具

编辑 `src/assets/index.js`：

```javascript
import myCustomAsset from "./myCustomAsset.js";

const assets = [
    ["自定义贴图", customTexture],
    ["我的道具", myCustomAsset],  // 添加这行
];

export default assets;
```

## 步骤 4: 测试

```bash
pnpm build
```

构建后的文件在 `dist/shuang-assets.js`

## 示例

### 简单道具（固定图片）

```javascript
const asset = [
    "ItemAddon",
    { Name: "简单道具" },
    {
        translation: { CN: "简单道具", EN: "Simple Asset" },
        extended: { Archetype: "noarch" }
    }
];
```

### 动态道具（自定义渲染）

```javascript
ScriptDraw: ({ C, Item, PersistentData }) => {
    // 每帧调用，用于自定义渲染
    const url = Item.Property?.CustomURL;
    if (url) {
        DrawImageEx(url, TempCanvas, 0, 0, { Width: 500, Height: 1000 });
    }
}
```

### 带输入框的道具

```javascript
Load: (data, originalFunction) => {
    originalFunction();
    const input = ElementCreateInput("MyInput", "text", "", "100");
    input.addEventListener("input", function() {
        // 处理输入
    });
},

Draw: (data, originalFunction) => {
    originalFunction();
    ElementPosition("MyInput", 1500, 500, 300, 40);
},

Exit: (data, originalFunction) => {
    ElementRemove("MyInput");
    originalFunction();
}
```

## 更多参考

- [echo-clothing-ext](https://github.com/SugarChain-Studio/echo-clothing-ext) - 完整的服装扩展示例
- [BC AssetManager 文档](https://github.com/SugarChain-Studio/bc-modding-utilities)