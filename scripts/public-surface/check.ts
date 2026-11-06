// Scan every tracked file against the public-surface rules. Exit 1 on any finding.
// Usage: bun scripts/public-surface/check.ts
import { readFileSync } from "node:fs";
import { scanPath, scanText, type Finding } from "./rules";

const MAX_BYTES = 2 * 1024 * 1024;

function trackedFiles(): string[] {
  const out = Bun.spawnSync(["git", "ls-files", "-z"], { stdout: "pipe", stderr: "pipe" });
  if (out.exitCode !== 0) throw new Error(`git ls-files failed: ${out.stderr.toString()}`);
  return out.stdout.toString().split("\0").filter(Boolean);
}

export function scanRepository(files: string[] = trackedFiles()): Finding[] {
  const findings: Finding[] = [];
  for (const path of files) {
    findings.push(...scanPath(path));
    const bytes = readFileSync(path);
    if (bytes.length > MAX_BYTES || bytes.includes(0)) continue;
    findings.push(...scanText(path, bytes.toString("utf8")));
  }
  return findings;
}

if (import.meta.main) {
  const findings = scanRepository();
  for (const f of findings) console.error(`${f.path}:${f.line} [${f.rule}] ${f.excerpt}`);
  if (findings.length > 0) {
    console.error(`public-surface: ${findings.length} finding(s); see scripts/public-surface/rules.ts for each rule's reason`);
    process.exit(1);
  }
  console.log("public-surface: clean");
}
