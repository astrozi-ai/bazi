# bazi

**BaZi (Four Pillars of Destiny / 八字排盘) for TypeScript — by [AstroZi](https://astrozi.ai)**

Deterministic BaZi charts with every convention stated explicitly: time zone, true solar time, day boundary and luck-period method. No hidden defaults, so the same birth data always gives the same chart.

> **Status: pre-release.** The packages below are reserved and the API is not published yet. Watch the repository for the first release.

想看命盘解读？在 [AstroZi](https://astrozi.ai) 排盘即可看到完整分析。
Want a full reading of your chart? Try it on [AstroZi](https://astrozi.ai).

## Packages

| Package | What it does | Status |
| --- | --- | --- |
| [`@iching/bazi`](packages/bazi) | Four pillars, luck periods (大运), hidden stems (藏干), ten gods (十神), chart snapshot | planned |
| [`@astrozi/bazi-mcp`](packages/mcp) | MCP server so AI assistants can calculate BaZi charts | planned |
| [`@iching/ui`](packages/ui) | NSH TSX components for 命理 apps: wheels, compact fields, page header, theme tokens | planned |
| [`@iching/bazi-ui`](packages/bazi-ui) | NSH TSX components for 八字: the 7 × 13 排盘 sheet, the fortune table, birth input for phones and desktops | planned |

Shared primitives (干支, 五行, 节气) come from [`@iching/core`](https://github.com/astrozi-ai/iching).

## Playground

[`apps/playground`](apps/playground) is the chart UI, written in [NSH](https://github.com/longbridge/nsh) TSX for iOS, Android, the desktops and the web. It computes every chart with `@iching/bazi` and draws it with `@iching/bazi-ui`, AstroZi's 7 × 13 排盘 sheet. Its design standards are in [`DESIGN.md`](apps/playground/DESIGN.md).

```sh
bun run engine:nsh          # bundle @iching/bazi for NSH
cd apps/playground
nsh test .                  # headless tests
nsh run .                   # run it with hot reload
```

## Scope

This repository calculates charts. It does not interpret them: pattern judgement, useful-god selection and readings are not part of these packages.

## Development

```sh
bun install
bun run check
```

## License

[MIT](LICENSE) © AstroZi
