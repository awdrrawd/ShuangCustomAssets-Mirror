# Loading, persistence and maintenance

## Distribution

`npm run build` produces `dist/assets/main.js` and a content-hashed application module in the same directory. The bootstrap checks existing SDK registrations and claims a shared promise before importing application code; it rechecks registration after waiting for BC, waits for the BC functions used during registration, and bundles the Mod SDK locally. Deploy the **whole `dist` directory**, not just `main.js`. A compatibility entry remains at `dist/shuang-assets.js`; the two PNG resources are copied to the distribution root. Existing mirror hosts remain supported.

The target is modern Chrome/Edge, Firefox and Safari with ES modules, top-level await, optional chaining, Fetch streams and AbortController (Chrome/Edge 89+, Firefox 89+, Safari 15+). Animated WebP uses `ImageDecoder` where available and otherwise falls back to the browser image pipeline. This is the source syntax baseline, not a claim that every BC/browser version has been tested.

Production builds omit source maps. After a successful write, Rollup prunes obsolete `app-*.js` files and generated source maps; failed builds leave the previous output available. `npm run dev` watches sources and includes maps for debugging. `npm run serve` serves `dist` on port 8080 with CORS and caching disabled.

For local gameplay testing, run `npm run build` then `npm run serve`, install `loader.dev.user.js` in the userscript manager, disable other loaders for this plugin, and refresh the game. Keep the server running. For repeated edits, run `npm run dev` in a second terminal and refresh the game after each successful rebuild.

To verify late startup, first save a disposable appearance and Craft with the new plugin active and confirm both `Player.ExtensionSettings.ShuangCustomAssets.appearanceBackup` and `Player.ExtensionSettings.ShuangCustomAssetsCraft` exist. Export a separate backup before testing. Disable the loader, reload and enter the game, then run `import('http://localhost:8080/assets/main.js?t=' + Date.now())` in the game console. Confirm both appearance and Craft restore; re-enable the development loader afterward. Existing data lost before the first backup cannot be recovered by this test.

## Account backup

`Player.ExtensionSettings.ShuangCustomAssets.appearanceBackup` and `Player.ExtensionSettings.ShuangCustomAssetsCraft` are versioned backups; appearanceBackup shares the existing preference key. They store only this plugin's equipped appearance bundles and crafted items indexed by their original Craft slots. It preserves item properties, locking/crafting metadata and pose configurations; it does not change the exported texture configuration version (v7).

- Hook `LoginResponse` before the game validates the incoming appearance/Craft data. Copy raw custom items before BC can clear them.
- Wait for asset registration and a logged-in player before restoring. Already logged-in players are handled immediately when registration finishes.
- Restore missing items and texture properties lost to sanitation. Never replace a different equipped asset or a different Craft in an occupied slot. Conflicting records remain in the backup for recovery on a later login when the slot is free.
- Hook `ServerPlayerAppearanceSync` and `CraftingSaveServer` for subsequent saves. Suppress snapshots during login/restoration and appearance previews; explicit editor commits save the final state. Normal removals update the backup so deleted items do not reappear next login.
- If the previous version already permanently removed data and no backup exists, it cannot be reconstructed; import an external configuration backup instead.

The backup is private account ExtensionSettings data; other players' appearance is not backed up. Configuration backup failures are logged without discarding the existing snapshot.

## Texture list and images

`textureListCanvas.js` shares ordered rectangles between Canvas drawing and hit testing. Slot labels reserve two digits. After Show and Edit, untrusted URLs show Trust; trusted URLs show a square Explore button (Warning on load failure). Hover previews fit proportionally inside the Canvas region (1150, 25, 700, 400). Long slot labels keep a readable prefix followed by an ellipsis. Action callbacks recheck the focused item and lock permissions. Delete mode removes one slot per click, leaves middle holes in place, and clears that slot's priority.

Hover previews use the active pose's URL and the existing image cache. Neither previews nor checks bypass domain trust or blocked-player settings. The Warning icon means the resource failed to load, which may be deletion, CORS, network failure or a resource limit; blocked and loading URLs are distinguished from failures.

Image downloads time out after 15 seconds and are limited to 20 MiB, including streamed bodies without Content-Length. Animation decoding checks dimensions/frame counts before expanding frames: 300 frames, 16 megapixels per frame, 32 megapixels across one animation and 64 megapixels reserved across the animation cache. Turning animation off avoids the JavaScript full-frame decoder. Render canvases also have a pixel limit. These bounds trade unusually large animations for predictable memory use.

## Drag movement

The editor keeps the original direct MouseX/MouseY delta controls alongside the free-transform tool described below. Move changes texture offsets; Drag changes scale by 0.5 percentage points per pixel, using horizontal movement for both axes when aspect lock is enabled. Otherwise X/Y are independent. These two 100×40 buttons and Transform are mutually exclusive. Scale drag retains the existing 0–2000% field range. All modes use the temporary pose target and existing preview/save/cancel lifecycle.

SCA_slider.png is distributed alongside the bundle and drawn at 35×35; its URL resolves relative to the application module so localhost and mirrors serve their own image.

## Translation and tests

`src/i18n/index.js` owns language selection and interpolation. `messages.js` owns CN/EN text, including labels and multiline hints; TW currently uses the existing Chinese catalog. `tutorial.js` in that directory owns the tutorial's page structure. UI code uses `t(key, values)`; bilingual data labels may use `L(cn, en)`. Translate placeholders consistently and escape values when placing them in HTML.

`npm test` bundles source modules into isolated BC fixtures and covers import atomicity, rollback, slot actions, lock checks, login restoration, backup deletion, decoding/download limits and localization. These fixtures do not replace testing a real account through a fresh login, Craft save and room transition.

## Image controls and account capacity

The plugin and texture-loading switches both default to enabled. Either disabled means neither renderer nor list previews request player textures. Only the plugin switch also rejects remote custom-texture additions/edits on the local player through ValidationResolveAppearanceDiff; unchanged items, self edits, removals and unrelated assets continue through normal BC validation. Pending texture downloads are cancelled; queued animated-image downloads respect the switch. UI icons still load. Blocking a member applies to the wearer as well as source/configurator metadata. The other-player list shortcut changes only local viewing preferences and works even on locked items.

The wider settings panel starts at game Y=75 and uses a fixed title/version and four section jump buttons and a 200px bordered backup capacity readout with a Craft usage bar above a scrollable list. Each setting places its description on the left and controls on the right. Capacity displays only the ShuangCustomAssetsCraft key packet estimate against a 180,000-byte reference budget, without summing keys or showing transmission history. These are UTF-8 JSON client estimates, not server acknowledgements.

Backup management downloads/imports a versioned JSON file of the local player’s saved appearance and Craft data, excluding image binaries and preferences. Imports validate all records and both independent key packet budgets before writing; missing items can be restored while occupied/conflicting slots keep their current content. Invalid or oversized imports preserve the previous backup.

Before restoration, refresh CraftingAssets after custom assets register. Preserve complete backup properties if incoming login data lacks textures, and retain Craft records if validation strips them or another named craft occupies the slot. Malformed Craft packets do not prevent capture of raw appearance data.

## Hook boundaries

Own editor behavior uses direct functions, with shared mouse/touch gesture lifecycle handlers. Capacity is a pure JSON-size calculation; no ServerSend observer or historical packet state remains. Free transform observes BC drawing functions without replacing native Canvas methods. The player-block shortcut dispatches once at the item click entry so it also works on locked items.

BC integration hooks remain for login capture/restoration, asset registration, incoming appearance validation, animation refresh and dialog behavior. The older GLDraw2DCanvas cleanup workaround is retained: the checked local BC implementation deletes the texture-cache entry without deleting the old GPU texture. It is a game workaround, not an overlay on our own editor code. Loader concurrency checks and backup validation remain necessary to preserve initialization and saved-data behavior.

Only two storage keys are used: ShuangCustomAssets contains unchanged preference fields and a version-1 appearanceBackup; ShuangCustomAssetsCraft contains the version-1 Craft envelope. Each key is synced separately. Appearance updates preserve preferences and do not resend Craft. Login still restores both after assets become available. Portable exports combine both into one ShuangCustomAssetsBackupFile JSON; import validates both packet budgets before writing either key. No migration from unpublished backup keys or old export types is supported. Craft remains uncompressed JSON for now; no codec dependency or decode failure path is introduced. Empty Craft still has a small JSON/key envelope cost. Each send can fail independently; local rollback is per key and a successful send is not a server acknowledgement.

## Experimental free transform

The existing Move/Drag controls remain available. A separate Transform button at (1555,510,150,40) enables SVG handles only for CharacterGetCurrent() and the exact current item/layer. `render.js` records the dimensions and center actually used by its draw calls, including integer size rounding; this is refreshed when BC rebuilds the character, not by independently guessing image bounds. Hidden/failed/untrusted layers clear or omit the capture. The final DrawImageEx inside the selected DrawCharacter call supplies the source crop, destination size, inversion and context matrix. The SVG uses the main canvas intrinsic dimensions; client pointer coordinates go through its bounding rectangle and the inverse captured matrix. Resizing and rotation preserve the image center; mirrored sprites retain the same geometric bounds. Inactive pose previews have no handles.

Only BC functions are hooked (DrawCharacter, DrawImageEx, DrawProcess, GLDraw2DCanvas); no native Canvas methods are replaced. DrawProcess hides stale/closed overlays. Pointer capture covers release outside the handle; blur, cancel and editor state changes terminate drags. The normal temporary edit data, save/cancel and refresh throttling remain authoritative. The outline follows the last rendered geometry rather than showing a speculative position ahead of the image.

Validation: controlled browser tests used the actual SCA renderTexture and local BC DrawImageEx with a rectangular test image. Move, rotated side resize, center rotation, 0.7 height scaling, inverted movement and closure were verified. This does not establish live-game correctness; test the previously failing texture, pose changes, save/cancel and room transitions before publishing. The full image rectangle includes transparent padding; it is not an alpha-trimmed outline.

The normal selected-layer draw is now scoped through GLDraw2DCanvas: its actual X/Y plus atlas offset are included in both anchor and center, while the blink draw is excluded. This accounts for ECHO's 250px atlas origin without hardcoding it or inferring it from canvas width. The controlled fixture now includes an expanded 1000px character canvas, 250px atlas shift and the corresponding final display crop. Minimum transform extents are approximately 32 CSS pixels on each local axis (subject to the existing source-size maximum); zero/tiny scales are restored when the tool is active. The SVG disables aspect-ratio letterboxing to match the canvas CSS dimensions. Actual game verification remains required.
