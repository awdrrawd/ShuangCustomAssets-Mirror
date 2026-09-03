<div align="center">

# ShuangCustomAssets

**Shuang mod series — custom assets & appearance extension for Bondage Club**
Load image-host URLs to achieve dynamic texture effects

[English](./README.en.md) | [简体中文](./README.md)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-Bondage%20Club-green.svg)](https://www.bondageprojects.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

## 📦 Installation

### Tampermonkey install

**Option 1: One-click install (recommended)**
1. Click this link: [loader.user.js](https://gitgud.io/yeshuang26/shuangcustomassets/-/raw/master/loader.user.js)
2. Tampermonkey pops up the install dialog automatically
3. Click **Install**

> Backup link 1: `https://shuang-custom-assets.pages.dev/loader.user.js`
> Backup link 2: `https://shuang-custom-assets.netlify.app/loader.user.js`

**Option 2: Manual install**
1. Download the script: [`loader.user.js`](loader.user.js)
2. Open the Tampermonkey dashboard
3. Click **Create a new script**
4. Paste the downloaded script content
5. Save and refresh the game page

### Dev install

For local development, use the dev loader: [`loader.dev.user.js`](loader.dev.user.js)

1. Start the local build and server:
   ```bash
   npm install
   npm run dev      # terminal 1: build watch
   npm run serve    # terminal 2: local server
   ```
2. Install `loader.dev.user.js` into Tampermonkey
3. Refresh the game page

### Verify the install

After installation:
- Refresh the game page
- The console shows `[ShuangAssets] Shuang自定义道具扩展 v0.1.0 initializing...`
- Enter any body slot inventory; you will find the "Custom Texture" item

## 📚 Usage Guides

Detailed documentation:

| Guide | Description |
|-------|-------------|
| [Usage Overview](./docs/en/usage-overview.md) | Feature list & quick start |
| [Texture Management Basics](./docs/en/usage-textures.md) | Add / edit / delete layers, show/hide toggle |
| [Edit Panel Details](./docs/en/usage-edit-panel.md) | URL, offset, scale, rotation, opacity, mirror, drag-move |
| [Per-Pose Settings](./docs/en/usage-pose-settings.md) | Different texture parameters per pose |
| [Hide Settings](./docs/en/usage-hide-settings.md) | Hide head, body, clothing, restraints (8 categories) |
| [Import / Export](./docs/en/usage-import-export.md) | Export, share, and import JSON configs |
| [Security Settings](./docs/en/usage-security.md) | Domain whitelist & untrusted-domain warning |

> 简体中文教程见 [docs/](./docs/) 目录。

## ✨ Features

### Custom Texture item

- **Multi-layer**: a single item supports up to 16 independent layers
- **All slots**: registered in every body-slot group — usable anywhere
- **URL textures**: players enter an image-host URL to load custom textures dynamically
- **Per-layer parameters**: X/Y offset, scale, rotation, opacity, mirror — all per layer
- **Live preview**: parameter changes refresh the character model automatically
- **Local editing**: adjustments are not uploaded until you confirm
- **Import / Export**: JSON config import/export for easy sharing
- **Per-pose settings**: different parameters per arm/leg/full-body pose
- **Hide settings**: 6 categories to hide body parts, clothing, restraints
- **Animated GIFs**: toggle playback, adjustable frame rate, game FPS sync
- **Security**: domain whitelist, untrusted-domain warning, CDN fallback

## 🎮 Quick Usage

1. Find "Custom Texture" in any body slot inventory and equip it
2. Click the item to open the edit panel
3. Click the "+" button to create a layer
4. Enter an image URL (must support CORS)
5. Adjust offset, scale, rotation, etc.
6. Click the checkmark to return to the list
7. Click the top-right "Confirm & Exit" to sync to the server

### Recommended image hosts

Must support CORS:
- GitHub Pages
- jsDelivr CDN
- imgur / imgbb / imgchest
- catbox / litterbox
- Cloudflare Pages / R2 (CORS must be configured)
- Netlify

See [Security Settings — Recommended Image Hosts](./docs/en/usage-security.md#recommended-image-hosts) for the full list.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Dev mode (watch files)
npm run dev

# Build
npm run build

# Local test server
npm run serve
```

### Deploy to Cloudflare Pages

Deploy with wrangler:

```bash
# Install wrangler (if not yet)
npm install -g wrangler

# Log in to Cloudflare
wrangler login

# Deploy to Cloudflare Pages (project: shuang-custom-assets)
wrangler pages deploy dist --project-name=shuang-custom-assets
```

The deployed URL looks like:
- `https://shuang-custom-assets.pages.dev/shuang-assets.js`

Update `SCRIPT_URL` in `loader.user.js` to point to the new address.

> Quick update
> ```bash
> npm run build
> wrangler pages deploy dist --project-name=shuang-custom-assets
> netlify deploy --prod
> ```

### Adding a new asset

1. Create a new file in `src/assets/`, e.g. `myAsset.js`
2. Write the asset definition and export a registration function
3. Import and register it in `src/assets/index.js`

See [docs/en/HOW_TO_ADD_ASSETS.md](./docs/en/HOW_TO_ADD_ASSETS.md) for the full tutorial.

## 📁 Project Structure

```
ShuangCustomAssets/
├── src/
│   ├── assets/               # Asset definitions
│   │   ├── index.js          # Asset registration entry
│   │   ├── _template.js      # Asset template
│   │   └── customTexture.js  # Custom Texture item (split into modules)
│   ├── lib/
│   │   ├── assetManager.js   # AssetManager wrapper
│   │   ├── utils.js          # Utility functions
│   │   ├── gifPlayer.js      # GIF playback
│   │   └── ...
│   ├── main.js               # Main entry
│   └── modInfo.js            # Mod info
├── dist/                     # Build output
│   └── shuang-assets.js      # Compiled code
├── docs/                     # Docs (Chinese)
├── docs/en/                  # Docs (English)
├── loader.dev.user.js        # Dev Tampermonkey script
├── loader.user.js            # Production Tampermonkey script
├── package.json
├── rollup.config.js
└── README.md
```

## 📋 Technical Details

### Asset registration

The item is registered in all body-slot groups so players can use it anywhere:

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

### Data sync

The item properties are stored in `Item.Property.Textures` and synced to other players automatically:

- `ChatRoomCharacterItemUpdate` — sync to the server
- `CharacterRefresh` — refresh the character canvas
- Other players load the same URL textures after receiving the sync

## 📦 Dependencies

- [@sugarch/bc-asset-manager](https://github.com/SugarChain-Studio/bc-modding-utilities)
- [@sugarch/bc-mod-hook-manager](https://github.com/SugarChain-Studio/bc-modding-utilities)
- bondage-club-mod-sdk

## License

MIT

## Build and maintenance

Run `npm ci`, `npm test`, and `npm run build`. Deploy the whole `dist/` directory; the entry is `dist/assets/main.js`. SDK and application modules are bundled locally. [Loading, backup and translation architecture](./docs/architecture.md).
