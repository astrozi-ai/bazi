// Each rule must catch its violation and leave the allowed case alone.
// Violating strings are assembled at run time so this file stays clean itself.
import { describe, expect, test } from "bun:test";
import { scanPath, scanText } from "./rules";
import { scanRepository } from "./check";

const j = (...parts: string[]) => parts.join("");
const rulesOf = (path: string, text: string) => scanText(path, text).map((f) => f.rule);

describe("public-surface rules", () => {
  test("absolute home paths", () => {
    expect(rulesOf("a.md", j("see ", "/Us", "ers/someone/project"))).toContain("absolute-home-path");
    expect(rulesOf("a.md", "relative/path/only")).toEqual([]);
  });

  test("links to GitHub owners outside the allowlist", () => {
    expect(rulesOf("a.md", j("https://", "github.com/", "some-private-owner/repo/issues/1"))).toContain("foreign-github-link");
    expect(rulesOf("a.md", j("https://", "github.com/", "astrozi-ai/bazi"))).toEqual([]);
  });

  test("bare sha256 digests outside golden, lock and synthetic files", () => {
    const digest = "ab".repeat(32);
    expect(rulesOf("src/a.ts", digest)).toContain("digest-shape");
    expect(rulesOf("src/chart.golden.json", digest)).toEqual([]);
    expect(rulesOf("bun.lock", digest)).toEqual([]);
  });

  test("birth date-times only inside synthetic fixtures", () => {
    const when = j("19", "90-05-17 ", "08:45");
    expect(rulesOf("src/a.ts", when)).toContain("birth-datetime");
    expect(rulesOf("src/a.ts", j("19", "90年5月17日", "8时45"))).toContain("birth-datetime");
    expect(rulesOf("apps/playground/fixtures/synthetic/a.json", when)).toEqual([]);
    expect(rulesOf("src/a.ts", "2026-11-07")).toEqual([]);
  });

  test("personal attribution", () => {
    expect(rulesOf("src/a.ts", j("author_", "guidance: ", "someone, 2026-11-06"))).toContain("personal-attribution");
    expect(rulesOf("src/a.ts", j("author_", "guidance: ", "AstroZi, 2026-11-06"))).toEqual([]);
  });

  test("credential shapes", () => {
    expect(rulesOf("a.ts", j("gh", "p_", "A".repeat(36)))).toContain("secret-token");
    expect(rulesOf("a.ts", j("-----BEGIN ", "PRIVATE KEY-----"))).toContain("secret-token");
  });

  test("forbidden tracked paths", () => {
    expect(scanPath("_ops/notes.md").map((f) => f.rule)).toEqual(["local-state-path"]);
    expect(scanPath("apps/.env.local").map((f) => f.rule)).toEqual(["env-file"]);
    expect(scanPath("apps/.env.example")).toEqual([]);
  });

  test("the repository itself is clean", () => {
    expect(scanRepository()).toEqual([]);
  });
});
