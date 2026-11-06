import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { mergeThemes, PLAYGROUND_THEME, playgroundTheme, serialize } from "./merge";

describe("the playground's theme", () => {
  test("is the merge of the UI packages' themes, as committed (run `bun run theme:playground`)", () => {
    expect(readFileSync(PLAYGROUND_THEME.out, "utf8")).toBe(serialize(playgroundTheme()));
  });
});

describe("mergeThemes", () => {
  test("keeps every part's tokens, scheme by scheme", () => {
    const merged = mergeThemes("t", [
      { source: "a", theme: { name: "a", cssVars: { theme: { radius: "4px" }, light: { primary: "#000" } } } },
      { source: "b", theme: { name: "b", cssVars: { light: { wood: "#0f0" } } } },
    ]);
    expect(merged).toEqual({ name: "t", cssVars: { theme: { radius: "4px" }, light: { primary: "#000", wood: "#0f0" } } });
  });

  test("refuses a token two parts both declare, instead of letting one win", () => {
    expect(() =>
      mergeThemes("t", [
        { source: "a", theme: { name: "a", cssVars: { dark: { primary: "#000" } } } },
        { source: "b", theme: { name: "b", cssVars: { dark: { primary: "#fff" } } } },
      ]),
    ).toThrow("theme token dark.primary is declared by both a and b");
  });
});
