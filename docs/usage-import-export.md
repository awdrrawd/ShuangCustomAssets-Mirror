# 导入导出

## 功能说明

支持将贴图配置导出为 JSON 文本（复制到剪贴板），以及从剪贴板导入配置。方便在不同角色之间分享配置，或备份当前配置。

## 导出配置

1. 在贴图管理列表页，点击底部的「导出配置」按钮
2. 配置 JSON 自动复制到剪贴板（剪贴板不可用时自动降级为下载 JSON 文件）
3. 界面显示「✔ 已复制到剪贴板，共 N 个图层」

导出的内容包含：
- 所有图层配置（URL、偏移、缩放、旋转、透明度、镜射、姿势独立配置）
- 图层优先级（OverridePriority）
- 隐藏分类开关

## 导入配置

列表页底部提供两个独立的导入按钮，直接点击即可按对应模式导入（无需先选模式）：

### 覆盖导入

1. 将配置 JSON 复制到剪贴板
2. 点击「覆盖导入」按钮
3. 当前所有图层和隐藏开关被替换为导入的内容
4. 图层优先级同步替换

### 追加导入

1. 将配置 JSON 复制到剪贴板
2. 点击「追加导入」按钮
3. 导入的图层追加到现有图层之后（不修改现有图层和隐藏开关）
4. 图层优先级会自动按当前图层数偏移量重新映射（如导入的 Layer1 → Layer(当前数+1)）

> 追加导入时如果总图层数超过 16（上限），会提示错误并中止。
> 追加导入前若当前图层已达 16 个上限，按钮会直接提示错误不执行。

## 配置格式

```json
{
  "type": "ShuangCustomAssets",
  "version": 6,
  "textures": [
    {
      "TextureURL": "https://example.com/image1.png",
      "OffsetX": 1,
      "OffsetY": 1,
      "Scale": 100,
      "Rotation": 0,
      "Visible": true,
      "Opacity": 100,
      "MirrorH": false,
      "MirrorV": false,
      "PoseSettings": {
        "Yoked+Kneel": {
          "enabled": true,
          "TextureURL": "https://example.com/image1_yoked.png",
          "OffsetX": 15
        }
      }
    }
  ],
  "overridePriority": {
    "Layer1": 50,
    "Layer2": -10
  },
  "hideEmoticon": false,
  "hideCosplay": false,
  "hideFacial": false,
  "hideHead": false,
  "hideBodyUpper": false,
  "hideBodyLower": false,
  "hideClothing": false,
  "hideItems": false
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `textures` | 数组 | 图层列表，每个元素是一个贴图配置 |
| `TextureURL` | 字符串 | 图片 URL |
| `OffsetX` / `OffsetY` | 数值 | 偏移量 |
| `Scale` | 数值 | 缩放百分比 |
| `Rotation` | 数值 | 旋转角度 |
| `Visible` | 布尔 | 是否可见 |
| `Opacity` | 数值 | 透明度（0-100） |
| `MirrorH` / `MirrorV` | 布尔 | 水平/垂直镜射 |
| `PoseSettings` | 对象 | 姿势独立配置，键为姿势组合名 |
| `overridePriority` | 对象 | 图层优先级，键为 LayerN |
| `hide*` | 布尔 | 隐藏分类开关（`hideEmoticon` / `hideCosplay` / `hideFacial` / `hideHead` / `hideBodyUpper` / `hideBodyLower` / `hideClothing` / `hideItems`） |

## 兼容性

- 导入旧版本配置时，缺失的字段自动使用默认值
- `PoseSettings` 为可选字段，缺失时该图层无姿势独立配置
- 导入 v5 及更早配置时，旧的 `hideBody=true` 会自动迁移为 `hideHead` / `hideBodyUpper` / `hideBodyLower` 三个开关全部开启（覆盖导入模式下生效；追加导入不修改隐藏开关）
