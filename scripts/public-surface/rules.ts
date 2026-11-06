// Public-surface rules for this repository.
//
// The repository is public. Everything pushed here is readable by anyone, and
// the code is exported from private research repositories. These rules stop
// the categories of private material that such an export can carry. They are
// written as generic patterns on purpose: a rule that named the private paths
// or issue numbers it guards against would itself publish them.

export type Finding = { rule: string; path: string; line: number; excerpt: string };

export type Rule = {
  id: string;
  /** Why the rule exists, shown with every finding. */
  reason: string;
  pattern: RegExp;
  /** Paths (glob-like prefixes or suffixes) where the pattern is expected. */
  allowIn?: (path: string) => boolean;
  /** Return false to drop a match that the pattern alone cannot rule out. */
  accept?: (match: RegExpExecArray) => boolean;
};

/** GitHub owners whose public repositories may be linked. Extend deliberately. */
export const ALLOWED_GITHUB_OWNERS = new Set([
  "astrozi-ai",
  "longbridge",
  "6tail",
  "colinhacks",
  "oven-sh",
  "changesets",
  "actions",
]);

const isLockfile = (path: string) => path === "bun.lock" || path.endsWith("/bun.lock");
const isSyntheticFixture = (path: string) => path.includes("/fixtures/synthetic/");
const isGolden = (path: string) => path.endsWith(".golden.json");

export const RULES: Rule[] = [
  {
    id: "absolute-home-path",
    reason: "an absolute path under a user's home directory reveals a machine and account",
    pattern: /(?:\/Users\/|\/home\/|C:\\Users\\)[A-Za-z0-9._-]+[\\/]/g,
  },
  {
    id: "foreign-github-link",
    reason: "links may point only at allowed public owners; anything else may be a private repository",
    pattern: /github\.com\/([A-Za-z0-9-]+)/g,
    accept: (m) => !ALLOWED_GITHUB_OWNERS.has((m[1] ?? "").toLowerCase()),
  },
  {
    id: "digest-shape",
    reason: "a bare sha256 digest usually pins a private artifact or export; golden and lock files are exempt",
    pattern: /\b[a-f0-9]{64}\b/g,
    allowIn: (path) => isLockfile(path) || isGolden(path) || isSyntheticFixture(path),
  },
  {
    id: "birth-datetime",
    reason: "a date with an hour and minute can be a real person's birth time; only synthetic fixtures may carry one",
    pattern: /\b(?:1[89]|20)\d{2}[-/.年](?:0?[1-9]|1[0-2])[-/.月](?:0?[1-9]|[12]\d|3[01])日?[ T]?(?:[01]?\d|2[0-3])[:时點点](?:[0-5]\d)/g,
    allowIn: isSyntheticFixture,
  },
  {
    id: "personal-attribution",
    reason: "public provenance is signed by the organization, never by a person",
    pattern: /author_guidance:\s*(?!AstroZi\b)[^\s,`'"]+/g,
  },
  {
    id: "secret-token",
    reason: "looks like a credential",
    pattern:
      /\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|npm_[A-Za-z0-9]{36}|sk-[A-Za-z0-9_-]{32,}|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
];

/** Paths that must never be tracked in this repository. */
export const FORBIDDEN_PATHS: { id: string; test: (path: string) => boolean; reason: string }[] = [
  {
    id: "local-state-path",
    test: (path) => /(^|\/)(_ops|_ref|vault)\//.test(path),
    reason: "local operations, reference or vault material belongs to private repositories",
  },
  {
    id: "env-file",
    test: (path) => /(^|\/)\.env(\.|$)/.test(path) && !path.endsWith(".env.example"),
    reason: "environment files hold credentials",
  },
];

/** The rule definitions spell out the patterns they look for, so they are not scanned. */
export const SELF = "scripts/public-surface/rules.ts";

export function scanText(path: string, text: string): Finding[] {
  if (path === SELF) return [];
  const findings: Finding[] = [];
  for (const rule of RULES) {
    if (rule.allowIn?.(path)) continue;
    rule.pattern.lastIndex = 0;
    for (let m = rule.pattern.exec(text); m !== null; m = rule.pattern.exec(text)) {
      if (rule.accept && !rule.accept(m)) continue;
      const line = text.slice(0, m.index).split("\n").length;
      findings.push({ rule: rule.id, path, line, excerpt: m[0].slice(0, 80) });
    }
  }
  return findings;
}

export function scanPath(path: string): Finding[] {
  return FORBIDDEN_PATHS.filter((p) => p.test(path)).map((p) => ({
    rule: p.id,
    path,
    line: 0,
    excerpt: p.reason,
  }));
}
