# How to Add a New Asset

## Step 1: Copy the Template

Copy `src/assets/_template.js` to the same directory and rename it to your asset name.

For example: `myCustomAsset.js`

## Step 2: Modify the Asset Definition

Open the file and modify the following:

### Basic Properties

```javascript
const asset = [
    "ItemAddon",        // Asset group (pick based on item type)
    {
        Name: "AssetName",  // Unique identifier (English)
        Random: false,
        DrawImages: false  // Whether to use default images
    },
    // ...
];
```

### Asset Groups

| Group | Description |
|-------|-------------|
| `ItemAddon` | Add-on items |
| `Cloth` | Clothing |
| `ClothLower` | Lower clothing |
| `ItemDevices` | Devices |
| `ItemHood` | Hoods |
| `Mask` | Masks |
| `Socks` | Socks |
| `Gloves` | Gloves |
| `Shoes` | Shoes |
| `Hat` | Hats |
| `Necklace` | Necklaces |

### Archetypes

**noarch (no prototype)** — fully custom behavior
```javascript
extended: {
    Archetype: "noarch",
    ScriptHooks: { /* custom hooks */ }
}
```

**typed (typed item)** — single-choice type switching
```javascript
extended: {
    Archetype: "typed",
    Options: [
        { Name: "Type1" },
        { Name: "Type2" }
    ]
}
```

**modular (modular item)** — multi-option combination
```javascript
extended: {
    Archetype: "modular",
    Modules: [
        { Name: "Module1", Key: "m1", Options: [{}, {}] },
        { Name: "Module2", Key: "m2", Options: [{}, {}, {}] }
    ]
}
```

## Step 3: Register the Asset

Edit `src/assets/index.js`:

```javascript
import myCustomAsset from "./myCustomAsset.js";

const assets = [
    ["Custom Texture", customTexture],
    ["My Asset", myCustomAsset],  // add this line
];

export default assets;
```

## Step 4: Test

```bash
pnpm build
```

The built file is at `dist/shuang-assets.js`

## Examples

### Simple asset (fixed image)

```javascript
const asset = [
    "ItemAddon",
    { Name: "SimpleAsset" },
    {
        translation: { CN: "简单道具", EN: "Simple Asset" },
        extended: { Archetype: "noarch" }
    }
];
```

### Dynamic asset (custom rendering)

```javascript
ScriptDraw: ({ C, Item, PersistentData }) => {
    // Called every frame; used for custom rendering
    const url = Item.Property?.CustomURL;
    if (url) {
        DrawImageEx(url, TempCanvas, 0, 0, { Width: 500, Height: 1000 });
    }
}
```

### Asset with an input box

```javascript
Load: (data, originalFunction) => {
    originalFunction();
    const input = ElementCreateInput("MyInput", "text", "", "100");
    input.addEventListener("input", function() {
        // handle input
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

## Further Reading

- [echo-clothing-ext](https://github.com/SugarChain-Studio/echo-clothing-ext) — a full clothing-extension example
- [BC AssetManager docs](https://github.com/SugarChain-Studio/bc-modding-utilities)
