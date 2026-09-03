# Texture management

Each item has 18 fixed slots, six per page across three pages.

- Hover a URL to preview the image used by the active pose; click it to edit the alias.
- Actions flow in order: Shown/Hidden, Edit, Trust. Empty slots put Add in the first action position.
- A red ! means the image failed to load (missing resource, network, CORS or resource limit). Hover for details. Untrusted or blocked images are never fetched just for previews.
- Tutorial is to the left of Confirm. Prev, Next and Got it have no redundant tooltip.
- The trash icon toggles delete mode. All normal slot actions are replaced by a single Delete button on occupied slots. Click individual slots to delete them quickly; click the trash icon again to leave this mode.
- Deleting a slot clears its priority while preserving the positions of later slots.
- Locked items cannot be changed without unlock permission.

Confirm saves edits; cancelling restores both texture properties and layer priority. Export, Replace and Append are at the bottom. Append fills holes first and rejects an oversized import without partially changing the item.

See [editing](./usage-edit-panel.md), [import/export](./usage-import-export.md), and [persistence/loading](../architecture.md).
