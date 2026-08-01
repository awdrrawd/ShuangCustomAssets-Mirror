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

## How to Use

1. On the texture management list page, click the "Hide Settings" button (shield icon, top-right)
2. The hide settings page shows 8 category toggles
3. Click a toggle to switch show/hide (green = Shown, gray = Hidden)
4. Click the top-right checkmark "Confirm & back to list"
5. On the list page, click the top-right checkmark "Confirm & Exit" to sync to the server

> Hide settings are written to the item's `Property.Hide` array. BC hides the corresponding part layers based on this array. Other players see the hidden effect too.

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
