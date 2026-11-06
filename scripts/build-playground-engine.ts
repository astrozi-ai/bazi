// Bundles @iching/bazi (with tyme4ts and zod) into one ESM file for the NSH playground, which
// imports only relative files, and emits its declarations next to it. The output is a build
// product (git-ignored): the package source stays the only authority.
import { rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const out = join(root, "apps/playground/vendor");
const entry = join(root, "packages/bazi/src/index.ts");

rmSync(out, { recursive: true, force: true });

const built = await Bun.build({ entrypoints: [entry], outdir: out, naming: "iching-bazi.js", format: "esm", target: "browser" });
if (!built.success) {
  for (const log of built.logs) console.error(log);
  throw new Error("bundling @iching/bazi failed");
}

const tsc = Bun.spawnSync(
  [
    "bunx",
    "tsc",
    entry,
    "--declaration",
    "--emitDeclarationOnly",
    "--outDir",
    join(out, "types"),
    "--rootDir",
    join(root, "packages/bazi/src"),
    "--module",
    "esnext",
    "--moduleResolution",
    "bundler",
    "--target",
    "es2022",
    "--strict",
    "--skipLibCheck",
    "--resolveJsonModule",
    "--types",
    "bun",
  ],
  { cwd: root, stdout: "inherit", stderr: "inherit" },
);
if (tsc.exitCode !== 0) throw new Error("emitting @iching/bazi declarations failed");

await Bun.write(join(out, "iching-bazi.d.ts"), 'export * from "./types/index";\n');
console.log(`playground engine: ${join(out, "iching-bazi.js")}`);
