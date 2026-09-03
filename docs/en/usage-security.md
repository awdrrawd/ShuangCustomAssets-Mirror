# Security Settings

## What It Does

Custom textures load images from external image hosts. To prevent malicious image loading, the mod provides a domain whitelist. It also provides an animated-image (GIF) playback toggle and frame-rate control, balancing security and performance.

The extension settings page has two parts:

- **Texture loading security**: whitelist / unrestricted mode, domain management, untrusted-domain warning
- **Animated images**: playback toggle, frame-rate control, game FPS sync

## Security Mode

On the main settings page, click "Load Mode Settings >>>" to choose a security mode:

### Whitelist Mode (Recommended)

- Only domains in the whitelist are allowed to load images
- Images from non-whitelisted domains are not loaded or rendered
- New domains must be added to the whitelist manually

### Unrestricted Mode

- Allows image loading from any HTTPS domain
- No domain check
- Use only when you fully trust all image sources
- First-time enable requires going through a privacy-risk confirmation page

## Domain Whitelist Management

On the main settings page (in whitelist mode), click "Domain Whitelist >>>" to open the management page.

### Adding a Domain

**Option 1: From the edit panel**
1. In the texture list, layers using a non-whitelisted domain show a "Trust" button
2. Click "Trust"
3. On the confirmation page, review the risk warning and click "Add"

**Option 2: Add manually**
1. In the domain input box at the bottom of the whitelist page, type a domain (e.g. `example.com`)
2. Click the "Add" button

**Option 3: Add recommended domains in one click**
1. Click the "Add Defaults" button
2. Built-in recommended image-host domains (GitHub Pages, imgur, catbox, Discord CDN, etc.) are added automatically
3. Domains already present are not duplicated

**Option 4: Add from room scan**
1. On the whitelist management page, click "Scan Room"
2. The scan page lists all untrusted texture domains from players in the current room
3. Each row shows: player name, domain button, full URL button, "Trust" button
4. Click the domain or URL button to copy it to the clipboard (hover to see the full content)
5. Click "Trust", review the risk warning on the confirmation page, then click "Add"

> When not in a room, your own textures are still scanned. This feature is unavailable in unrestricted mode.

### Deleting a Domain

1. Find the domain in the whitelist list
2. Click the "Delete" button on the right of that row

### Clear All

Click the "Clear All" button; after a confirmation prompt, all trusted domains are removed.

> ⚠ After clearing, the mod's own service domain (`shuang-custom-assets.pages.dev`) is still always allowed, so built-in resource loading is not affected.

### Pagination

The whitelist shows 8 entries per page, with "Prev / Next" pagination. After adding a new domain, the view auto-jumps to the last page.

## Untrusted Domain Warning

On the main settings page you can toggle "Untrusted domain warning":

- **On**: when a non-whitelisted domain is encountered, a fixed warning image is displayed to alert you
- **Off**: skip silently — the image is neither loaded nor rendered

## Animated Images

The main settings page provides GIF-related toggles (below "Untrusted domain warning"):

### Enable animated images

- **On** (default): multi-frame GIFs play normally
- **Off**: GIFs show only the first frame, do not play, and are excluded from the animation refresh timer's polling

> Disabling animated images reduces CPU usage — helpful on low-end devices or in crowded rooms.

### GIF Frame Rate

Type a frame-rate value directly in the input box (unit fps, range **2–30**):

- Higher = smoother playback, more CPU usage
- Lower = saves CPU, but animation looks choppy
- Default 10 fps (100ms interval)

> This is the animation refresh interval; it is independent of the image's own frame rate. Even a 30fps GIF set to 10fps only refreshes at 10fps.

### Game FPS Sync

Check "Game FPS sync: On" to:

- Automatically follow the game's `MaxFPS` setting (`Player.GraphicsSettings.MaxFPS`)
- The frame-rate input box is disabled and shows the current game FPS
- When the game FPS is 0 (unlimited), it is treated as 60 fps

> Uncheck to restore the manually entered frame-rate value.

## Whitelist Import / Export

### Export

1. On the whitelist management page, click "Export"
2. The whitelist is copied to the clipboard as a JSON array
3. If the clipboard is unavailable, it automatically falls back to downloading a JSON file

Format example:
```json
["github.io", "imgur.com", "catbox.moe"]
```

### Import

1. Copy the whitelist JSON array to the clipboard
2. Click "Import"
3. A prompt appears — paste the JSON (e.g. `["domain1.com", "domain2.com"]`)
4. After confirming, it is merged into the existing whitelist (duplicates are skipped)

## Always-Allowed Domains

The mod's own service domain (`shuang-custom-assets.pages.dev`) is always allowed, regardless of the whitelist. This ensures built-in resources like the login badge and the untrusted-domain warning image always load.

> If the primary source (Cloudflare Pages) fails, it automatically falls back to the secondary source (Netlify).

## Recommended Image Hosts

The following hosts support CORS and work correctly:

| Host | Notes |
|------|-------|
| GitHub Pages | Free; great for static image hosting |
| jsDelivr CDN | Free; accelerates images in GitHub repos |
| Cloudflare Pages | Free; supports custom domains |
| Netlify | Free; static hosting |
| imgur / imgbb / imgchest | Public image hosts with CORS support |
| catbox / litterbox | catbox.moe permanent storage; litterbox temporary |
| Discord CDN | Returns CORS headers, but attachment links expire — temporary use only |
| Cloudflare R2 | Requires configuring `Access-Control-Allow-Origin: *` on the bucket |
| Self-hosted server | Must configure the CORS header `Access-Control-Allow-Origin: *` |

> Hosts without CORS support (e.g. some domestic image hosts) cause the browser to reject rendering the image to canvas even after it loads.
