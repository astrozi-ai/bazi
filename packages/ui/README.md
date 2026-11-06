# @iching/ui

[NSH](https://github.com/longbridge/nsh) TSX components for 命理 apps, not tied to one system.

| Component | What it is |
| --- | --- |
| `Wheel` | A snapping wheel of labelled items, as phones pick dates and times |
| `NumberColumn` | A label over a compact number field, with an optional hint under it |
| `ChoicePair` | Exactly one of two options, as two bordered buttons |
| `SwitchRow` | A labelled row with a switch at its end |
| `Header` | A page header for the desktops and the web; a back button when given `onBack` |

The components read their colors, radii and type sizes from theme tokens. [`theme.json`](theme.json) declares every token they use, with default values. An NSH app takes one theme file, so an app merges this one with the themes of the other kits it uses (see `scripts/theme/merge.ts` in this repository, which refuses a token two kits both declare).

## Using it

NSH imports relative files only, not packages by name. In this repository the playground imports the source directly. An app elsewhere copies `src/` into its own tree and merges `theme.json` into its theme.

> Pre-release: not published yet. See the [repository README](../../README.md).

By [AstroZi](https://astrozi.ai) · MIT
