# Texture Management Basics

## Equipping the Item

"Custom Texture" is registered in all body-slot asset groups, so you can find and equip it in any slot.

After equipping, click the item to open the texture management panel.

## Layer List

```
┌──────────────────────────────────────────────────────┐
│ Texture Manager            [Hide Settings] [Confirm]  │
│ N textures added (max 16)                             │
├──────────────────────────────────────────────────────┤
│ Layer 1: [url preview...]  [Shown] [Edit] [Trust]    │
│ Layer 2: [url preview...]  [Hidden] [Edit]           │
│ ...                                                   │
│ [+]                                                    │
│                                                       │
│              [Export] [Import (Replace)] [Import (Append)] │
└──────────────────────────────────────────────────────┘
```

- Supports up to **16 layers**, 6 per page. A "Next page" button appears once you have 7+ layers
- Each layer has an independent show/hide toggle (green = Shown, gray = Hidden)
- Layers render stacked in order; lower index = further back (bottom layer)

### Top-right icon buttons

- **Hide Settings** (shield icon): open the hide settings page to hide body parts
- **Confirm & Exit** (checkmark icon): save and sync to the server, then close the dialog

### Bottom buttons

- **Export**: copy the current config to the clipboard
- **Import (Replace)**: replace all current layers with the clipboard config
- **Import (Append)**: append the clipboard config after the current layers

## Adding a New Texture

1. Click the "+" button (placed right after the last layer on the current page)
2. The edit panel opens automatically
3. Configure the texture parameters in the edit panel
4. Click the checkmark to save the layer

## Editing a Layer

Click the "Edit" button on the right of a layer to open the edit panel, where you can adjust all of that layer's parameters.

See [Edit Panel Details](./usage-edit-panel.md) for full instructions.

## Deleting a Layer

In the edit panel, click the trash icon in the bottom-right corner to delete the current layer.

## Show / Hide Toggle

Each layer can be toggled independently:
- **Green "Shown" button**: the layer is visible
- **Gray "Hidden" button**: the layer is not rendered, but its config is kept

> Toggling visibility syncs to the server and refreshes the character immediately — no extra save needed.

## Saving & Syncing

- **Parameter adjustments while editing a layer**: local preview only, not synced
- **Clicking the checkmark to return to the list**: saved to the local item property
- **Clicking the top-right "Confirm & Exit"**: syncs all layer configs to the server (visible to other players) and closes the dialog

> If you close the dialog without clicking "Confirm & Exit", the server is not updated and the state reverts to the last saved one next time you open it.

## Trusting a Domain

If a layer uses a domain that is not in the whitelist, a "Trust" button appears in the list. Click it to open a confirmation page; after reviewing the risk warning you can add the domain to the trusted whitelist.

See [Security Settings](./usage-security.md) for details.
