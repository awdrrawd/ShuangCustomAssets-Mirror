# Hide Settings

## What It Does

Hide Settings lets you hide specific part groups on the character so that custom textures are not occluded by the body model, clothing, or restraint items.

## Categories

There are 8 categories, each toggled independently:

| Category | Description | Parts included |
|----------|-------------|----------------|
| Emoticon | The character's emoticon | Emoticon |
| Cosplay | Cosplay-related parts | Hair front/back, wings, tail, animal body, extra height, etc. |
| Face | Facial features | Eyes, eyebrows, blush, eye shadow, facial hair, mouth, etc. |
| Head | Head model | Head |
| Body Upper | Upper torso and arms | Body upper, nipples, left/right arms, left/right hands |
| Body Lower | Lower torso and overall height | Body lower, pussy, height, body style, pronouns, appearance tool |
| Clothing | Clothing and accessories | Cloth, lower cloth, outer cloth, bra, panties, suit, socks, shoes, gloves, accessories, etc. |
| Restraints | All restraint items | ItemAddon, ItemArms, ItemBoots, and all other Item groups |

> The old "Body" category has been split into "Head", "Body Upper", and "Body Lower". When importing an old config or loading an old item, the previous `HideBody=true` is automatically migrated to all three new categories enabled.

## Texture Failure Guard

The "Texture Failure Guard" switch at the top of the page (off by default) controls whether the original outfit stays visible when textures fail:

- When on, if any texture that should render is still loading, failed to load, is on a domain outside the whitelist / considered untrusted, or comes from a blocked player, no `Property.Hide` is written and the game's original body and clothing remain visible.
- Hiding only takes effect once every texture renders successfully. The character is recalculated and refreshed when textures finish loading, fail, or change trust state.
- With no renderable textures configured there is nothing to wait for, so hiding applies normally.
- The switch is an item property (`HideOnlyWhenReady`) and syncs/exports with the item, but "is this texture visible?" is judged by each player's own network, whitelist, and block settings, so different players may see different hide results.

> Typical use: textures replace the character's clothing while the original outfit is hidden. With the guard on, a dead image host, an untrusted domain, or a blocked source keeps the original outfit instead of leaving the character with hidden clothes and no visible texture.

## Detailed adjustment

Every category row has its own "Details" button, opening per-group control for that category; tabs inside the page still let you switch categories:

- Every part group in the selected category is listed (for example `Cloth`, `Bra`, `Panties`) with its own show/hide toggle.
- A per-group choice overrides the category switch: you can allow one group while its category is hidden, or hide one group while its category is shown. Groups without an override keep following the category.
- Changes are previewed locally only. Click "Confirm & sync" at the top-right to upload once; this sends a single edit broadcast instead of one per toggle.
- Click the back arrow or leave the dialog to discard the session and restore the overrides from before you entered.
- Hover a part group to see the item currently equipped there (for example "Equipped: Hair12"); names use the game's localized asset description.
- Empty groups are drawn in gray with a "None" marker after the group name, and their hover text is just "None", making empty slots easy to spot.
- When a category has per-group exceptions, its outer show/hide button becomes an orange "Partial"; clicking it still toggles the whole category.
- Each page holds 16 groups; use Prev/Next to page. "Clear category overrides" removes all per-group exceptions in the selected category.

> Per-group choices are stored in the item property `HideOverrides` and are saved/exported with the item. `Property.Hide` is still computed from category switches, per-group overrides, and the texture failure guard.

## How to Use

1. On the texture management list page, click the "Hide Settings" button (shield icon, top-right)
2. The hide settings page shows the "Texture Failure Guard" switch at the top and 8 category toggles below it
3. Click a toggle to switch show/hide (green = Shown, gray = Hidden); use the "Details" button on each category row for per-group control
4. Click the top-right checkmark "Confirm & back to list"
5. On the list page, click the top-right checkmark "Confirm & Exit" to sync to the server

> Hide settings are written to the item's `Property.Hide` array. BC hides the corresponding part layers based on this array. Other players apply the hides according to their own texture loading results.

## Use Cases

### Texture occluded by the body

If your texture is positioned on the body but is covered by clothing or the body model:
1. Enable "Body Upper" and "Body Lower" hide (and "Head" if needed)
2. Enable "Clothing" hide
3. The texture will render on top

### Replacing the body appearance

When using textures to fully replace the character's appearance:
1. Enable "Head", "Body Upper", and "Body Lower" hide (hide the original body model)
2. Enable "Face" hide (hide the original face)
3. Enable "Cosplay" hide (hide hair, wings, etc.)
4. The texture becomes the character's only appearance

### Hiding only specific parts

If you only want to hide a specific category (e.g. hide clothes but keep the body):
1. Enable only "Clothing" hide
2. The body parts stay visible
