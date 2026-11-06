// Guards the metadata every published package must carry, so a release
// cannot go out without its license, repository link or public access.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const packageDirs = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe.each(packageDirs)("packages/%s", (dir) => {
  const pkgPath = join(root, "packages", dir);
  const pkg = JSON.parse(readFileSync(join(pkgPath, "package.json"), "utf8"));

  test("is scoped under @iching or @astrozi", () => {
    expect(pkg.name).toMatch(/^@(iching|astrozi)\//);
  });

  test("is MIT and ships its LICENSE and README", () => {
    expect(pkg.license).toBe("MIT");
    expect(existsSync(join(pkgPath, "LICENSE"))).toBe(true);
    expect(existsSync(join(pkgPath, "README.md"))).toBe(true);
  });

  test("points at this repository and publishes publicly with provenance", () => {
    expect(pkg.repository.url).toBe("git+https://github.com/astrozi-ai/bazi.git");
    expect(pkg.repository.directory).toBe(`packages/${dir}`);
    expect(pkg.publishConfig).toEqual({ access: "public", provenance: true });
  });
});
