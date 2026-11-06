# Playground design standards

The playground is the reference UI for `@iching/bazi`, built with [NSH](https://github.com/longbridge/nsh) TSX.
Its chart is AstroZi's mobile 排盘 sheet: the classic 7 × 13 grid, laid out cell for cell.

## Data flow

input → tyme4ts → chart engine → hooks → cached view → UI

- **Input** (`pages/InputPage.tsx`): wheels on a phone, a typed line and number fields on a desktop
  (`platform.desktop` picks); 公历 or 农历, whose month list is the year's own, 闰月 included; 男 / 女.
- **tyme4ts**: `toChartInput` converts the entry to the engine's Gregorian moment once; a date or leap month that
  does not exist is refused before anything is computed.
- **Chart engine**: `@iching/bazi`, bundled into `packages/bazi/nsh/` by `bun run engine:nsh` (NSH imports only
  relative files). The bundle is a build product; the package source is the only authority.
- **Hooks** (`engine/hooks.ts`): `useSheet` loads the chart as a resource; `useSelection` holds the selected year
  and the fortune table's paging and expansion.
- **Cache** (`engine/sheet.ts`): one computation per moment, keyed by the engine's own moment, so a lunar and a
  Gregorian entry of the same day share it; switching 大运, 流年 or pages only looks up the view.
- **UI** renders `selectBaziPaipanYear` and `buildBaziFortuneRows` and computes nothing.

## Where the UI lives

The components are packages, so other apps (and AstroZi's own) build on the same ones. The playground keeps only
its pages, hooks, cache and samples.

| Package | Holds |
| --- | --- |
| `/ui` (`packages/ui`) | Wheel, NumberColumn, ChoicePair, SwitchRow, Header: nothing 八字-specific |
| `/bazi-ui` (`packages/bazi-ui`) | PaipanGrid, FortuneTable, the two birth forms and their shared form model |

The playground imports their source by relative path, as NSH requires.

## The sheet

| Rows | Columns |
| --- | --- |
| 日期 (headings), 主星, 天干, 地支, 藏干, 星运, 旺衰, 纳音, 神煞, 起运 | 日期 / 流年 / 大运 / 年柱 / 月柱 / 日柱 / 时柱 |
| 大运, 流年, 流月 | ten cells each, a pager in the last |

The heading column is 10% of the width, the fortune label column 8%. 天干 and 地支 are 18 pt bold in their
element's color over a faint wash of it; the other cells are 11 pt, headings 10 pt semibold, fortune cells
7–10 pt. 神煞 shows at most four per column.

## Tokens (`theme.json`)

`theme.json` is generated (`bun run theme:playground`): it is the merge of `packages/ui/theme.json` and
`packages/bazi-ui/theme.json`, and a test fails when it drifts. Change a token in its package, not here. Colors come
from AstroZi's 八字 palette, light and dark:

| Role | Tokens |
| --- | --- |
| Surfaces | `background`, `card`, `muted`, `secondary` |
| Grid | `grid-cell`, `grid-header`, `grid-row-header`, their foregrounds, `grid-secondary` |
| Fortune table | `fortune-label`, `fortune-cell`, `fortune-border`, `fortune-active`, `fortune-more`, their foregrounds |
| Action | `primary` (brand purple in light, gold in dark) |
| 五行 | `wood`, `fire`, `earth`, `metal`, `water`, the same in both appearances |
| Type | `text-grid`, `text-grid-head`, `text-glyph`, `text-shensha`, `text-fortune*` (bazi-ui); `text-info`, `text-wheel` (ui) |

No literal colors outside `theme.json`. Colors carry 五行 identity, never a judgement.

## Language

Simplified Chinese. Domain terms (八字, 大运, 十神, 纳音, 神煞) stay in Chinese in every locale. The sheet shows
chart facts; 神煞 is labelled as AstroZi's current method, not yet checked rule by rule against the source.
