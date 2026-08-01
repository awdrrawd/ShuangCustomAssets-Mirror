# Edit Panel Details

After entering layer editing, the right panel shows all adjustable parameters.

## Panel Layout

```
┌──────────────────────────────────────────────────────┐
│ Edit Layer 1                                          │
│ Auto-previews on change; click checkmark to return    │
├──────────────────────────────────────────────────────┤
│ Texture  [_________URL_________] [Trust]             │
│                                                       │
│ [Move]                                               │
│                                                       │
│ X Offset  [-] [___] [+]                              │
│ Y Offset  [-] [___] [+]                              │
│ Mirror    [Horizontal] [Vertical]                    │
│ Scale %   [-] [___] [+]                              │
│ Rotation % [-] [___] [+]                             │
│ Opacity % [-] [___] [+] [====slider====]            │
│ Layer Priority [-] [___] [+]                         │
│                                                       │
│ Current pose: Box Tie + Kneel  [Per-Pose: Off]       │
├──────────────────────────────────────────────────────┤
│ [Confirm]  [Delete]               (top-right)        │
└──────────────────────────────────────────────────────┘
```

## Texture URL

Enter the full image URL (must start with `https://`).

Requirements:
- The image server must support CORS (Cross-Origin Resource Sharing)
- Recommended hosts: GitHub Pages, jsDelivr CDN, a self-hosted static server
- `http://` is not supported (non-encrypted)

The image is preloaded automatically when the URL changes, and the preview refreshes once loading completes.

## X Offset / Y Offset

Controls the horizontal/vertical displacement of the texture relative to the item's anchor point.

- The number box supports direct input and mouse-wheel adjustment
- The `[-]` `[+]` buttons support click and **long-press acceleration**
- The longer you hold, the faster the step speed

## Move Button

Click "Move" to toggle drag mode:
- When on (green), **hold and drag** in the left character preview area to move the texture directly
- X Offset and Y Offset update in real time while dragging
- Click "Move" again to exit drag mode

> Drag mode is more intuitive than typing offsets manually — great for initial positioning.

## Mirror

Two toggle buttons; click to flip:
- **Horizontal**: flips the image on its central vertical axis
- **Vertical**: flips the image on its central horizontal axis

Green = flip enabled, white = no flip. Both directions can be enabled at once.

## Scale %

Controls the texture size as a percentage. 100% = original size.

- `[-]` `[+]` buttons step by 1
- Long-press to accelerate

## Rotation %

Controls the texture rotation angle (degrees).

- `[-]` `[+]` buttons step by 1
- Positive = clockwise, negative = counter-clockwise

## Opacity %

Controls the texture opacity (0–100).

- `[-]` `[+]` buttons step by 1
- A **slider** on the right allows quick dragging
- 0 = fully transparent (invisible), 100 = fully opaque

The number box and slider stay in sync — adjusting either updates the other.

## Layer Priority

Controls the render order of this layer on the character (−99 to 99).

- Smaller value = further back (bottom), larger value = further front (top)
- Syncs with BC's native Layering interface
- `[-]` `[+]` buttons step by 1

> This is independent of the layer index. The layer index determines edit order; priority determines render order.

## Confirm & Cancel

- **Confirm** (top-right checkmark): save the current layer config and return to the list
- **Delete** (bottom-right trash): delete the current layer and return to the list
- **Direct exit** (closing the dialog): discard this edit and restore the original config

> Parameter adjustments during editing are local preview only. Only after clicking "Confirm" are they written to the item property, and only after "Confirm & Exit" are they synced to the server.
