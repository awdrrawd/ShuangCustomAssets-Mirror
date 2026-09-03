# Import / Export

## What It Does

Supports exporting the texture config as JSON text (copied to the clipboard) and importing a config from the clipboard. Useful for sharing configs between characters or backing up the current config.

## Export

1. On the texture management list page, click the "Export" button at the bottom
2. The config JSON is copied to the clipboard automatically (falls back to downloading a JSON file if the clipboard is unavailable)
3. The UI shows "✔ Copied to clipboard, N layers"

The exported content includes:
- All layer configs (URL, offset, scale, rotation, opacity, mirror, per-pose settings)
- Layer priorities (OverridePriority)
- Hide category toggles

## Import

The list page provides two separate import buttons at the bottom — click either one directly to import in that mode (no need to pick a mode first):

### Import (Replace)

1. Copy the config JSON to the clipboard
2. Click the "Import (Replace)" button
3. All current layers and hide toggles are replaced by the imported content
4. Layer priorities are replaced as well

### Import (Append)

1. Copy the config JSON to the clipboard
2. Click the "Import (Append)" button
3. Empty slots are filled first, then remaining layers are appended (occupied slots and hide toggles are not modified)
4. Layer priorities are remapped to the actual destination slots

> If the total layer count would exceed 18 (the cap) on append, an error is shown and the import is aborted.
> If the current layer count is already at the 18 cap, the append button shows an error immediately without executing.

## Config Format

```json
{
  "type": "ShuangCustomAssets",
  "version": 7,
  "textures": [
    {
      "TextureURL": "https://example.com/image1.png",
      "OffsetX": 1,
      "OffsetY": 1,
      "ScaleX": 100,
      "ScaleY": 100,
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

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `textures` | array | Layer list; each element is a texture config |
| `TextureURL` | string | Image URL |
| `OffsetX` / `OffsetY` | number | Offset |
| `Scale` | number | Scale percentage |
| `Rotation` | number | Rotation angle |
| `Visible` | boolean | Whether visible |
| `Opacity` | number | Opacity (0–100) |
| `MirrorH` / `MirrorV` | boolean | Horizontal / vertical mirror |
| `PoseSettings` | object | Per-pose settings; keys are pose-combination names |
| `overridePriority` | object | Layer priorities; keys are LayerN |
| `hide*` | boolean | Hide category toggles (`hideEmoticon` / `hideCosplay` / `hideFacial` / `hideHead` / `hideBodyUpper` / `hideBodyLower` / `hideClothing` / `hideItems`) |

## Compatibility

- When importing older config versions, missing fields use default values
- `PoseSettings` is optional; when absent, the layer has no per-pose overrides
- When importing v5 and earlier configs, the old `hideBody=true` is automatically migrated to `hideHead` / `hideBodyUpper` / `hideBodyLower` all enabled (applies in replace mode; append mode does not modify hide toggles)
