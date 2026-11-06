# @iching/bazi-ui

[NSH](https://github.com/longbridge/nsh) TSX components for BaZi (八字), built on [`@iching/ui`](../ui) and computed by [`@iching/bazi`](../bazi).

| Component | What it is |
| --- | --- |
| `PaipanGrid` | The 7 × 13 排盘 sheet for a selected year: 流年, 大运, the four pillars, and their rows |
| `FortuneTable` | The 大运 / 流年 / 流月 rows under the sheet, with paging; pressing a cell selects its year |
| `MobileBirthForm` | Birth-moment input as wheels (年 月 日 时 分) for phones; the month wheel lists the year's own months, 闰月 included |
| `DesktopBirthForm` | Birth-moment input as a typed line (`YYYY-MM-DD HH:mm`) and number fields for desktops |

The birth-form model (`birth-form.ts`) is shared by both layouts. Its months, day counts and 时辰 come from the engine, which reads them from tyme4ts; the components compute no calendar themselves.

The components take the engine's view model as props. They do not compute charts, and they do not cache.

## The engine

`src/engine.ts` is the kit's one import of `@iching/bazi`. NSH resolves relative files only, so it points at the engine bundled for NSH (`bun run engine:nsh` writes `packages/bazi/nsh/`). An app that copies the kit points this one file at its own bundle.

## Theme

[`theme.json`](theme.json) declares the sheet's tokens: grid and fortune-table colors, the 五行 colors, and the sheet's type sizes. Merge it with `@iching/ui`'s.

> Pre-release: not published yet. See the [repository README](../../README.md).

By [AstroZi](https://astrozi.ai) · MIT
