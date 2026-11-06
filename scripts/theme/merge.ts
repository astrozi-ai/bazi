// An NSH app takes one theme file; the UI packages each declare the tokens they use. The app's theme is
// their merge: a projection, never edited by hand (`bun run theme:playground`), checked for drift in tests.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Scheme = "theme" | "light" | "dark";

export interface Theme {
  name: string;
  cssVars: Partial<Record<Scheme, Record<string, string>>>;
}

const root = join(import.meta.dir, "../..");

export const PLAYGROUND_THEME = {
  name: "AstroZi Ink",
  out: join(root, "apps/playground/theme.json"),
  parts: [join(root, "packages/ui/theme.json"), join(root, "packages/bazi-ui/theme.json")],
} as const;

export function readTheme(path: string): Theme {
  return JSON.parse(readFileSync(path, "utf8")) as Theme;
}

/** Merges the parts in order; a token two parts both declare is refused, never overridden silently. */
export function mergeThemes(name: string, parts: readonly { source: string; theme: Theme }[]): Theme {
  const cssVars: Theme["cssVars"] = {};
  const owner = new Map<string, string>();
  for (const { source, theme } of parts) {
    for (const [scheme, values] of Object.entries(theme.cssVars) as [Scheme, Record<string, string>][]) {
      const target = (cssVars[scheme] ??= {});
      for (const [token, value] of Object.entries(values)) {
        const key = `${scheme}.${token}`;
        const first = owner.get(key);
        if (first) throw new Error(`theme token ${key} is declared by both ${first} and ${source}`);
        owner.set(key, source);
        target[token] = value;
      }
    }
  }
  return { name, cssVars };
}

export function playgroundTheme(): Theme {
  return mergeThemes(
    PLAYGROUND_THEME.name,
    PLAYGROUND_THEME.parts.map((source) => ({ source, theme: readTheme(source) })),
  );
}

export function serialize(theme: Theme): string {
  return `${JSON.stringify(theme, null, 2)}\n`;
}
