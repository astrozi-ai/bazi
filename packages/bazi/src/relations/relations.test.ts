/**
 * 关系表一致性测试。
 *
 * 目的不是重复表的内容，而是守住"收口时不会悄悄删成员、也不会悄悄多出成员"：
 * 对称性、双射（无重复指向）、12 支覆盖、刑组闭合、争议成员不得有默认值。
 */

import { describe, expect, test } from "bun:test";
import { BRANCHES, STEMS } from "../chart/constants";
import type { BranchName, StemName } from "../core-types";
import * as relations from "./index";

const ALL_BRANCHES = BRANCHES as readonly BranchName[];
const ALL_STEMS = STEMS as readonly StemName[];

/** 把一元查询铺成一张表，只保留有值的条目。 */
function pairTable(
  get: (branch: BranchName) => BranchName | null,
): Partial<Record<BranchName, BranchName>> {
  const table: Partial<Record<BranchName, BranchName>> = {};
  for (const branch of ALL_BRANCHES) {
    const target = get(branch);
    if (target !== null) table[branch] = target;
  }
  return table;
}

/** 对称双射：a→b 必有 b→a，且没有两个源指向同一个目标。 */
function expectSymmetricBijection(
  table: Partial<Record<BranchName, BranchName>>,
  expectedSize: number,
): void {
  expect(Object.keys(table)).toHaveLength(expectedSize);
  const seenTargets = new Set<BranchName>();
  for (const [source, target] of Object.entries(table) as [BranchName, BranchName][]) {
    expect(table[target]).toBe(source);
    expect(source).not.toBe(target);
    expect(seenTargets.has(target)).toBe(false);
    seenTargets.add(target);
  }
  expect(seenTargets.size).toBe(expectedSize);
}

describe("六冲", () => {
  const table = pairTable(relations.getBranchClash);

  test("12 支全覆盖且两两对称", () => {
    expectSymmetricBijection(table, 12);
  });

  test("isClash 与查表一致", () => {
    for (const a of ALL_BRANCHES) {
      for (const b of ALL_BRANCHES) {
        expect(relations.isClash(a, b)).toBe(table[a] === b);
      }
    }
  });
});

describe("六合", () => {
  const table = pairTable(relations.getBranchHarmony);

  test("12 支全覆盖且两两对称", () => {
    expectSymmetricBijection(table, 12);
  });

  test("化神表与合表同覆盖，且双向同一个化神", () => {
    for (const a of ALL_BRANCHES) {
      for (const b of ALL_BRANCHES) {
        const element = relations.isSixCombination(a, b);
        if (table[a] === b) {
          expect(element).toBeTruthy();
          expect(relations.isSixCombination(b, a)).toBe(element);
        } else {
          expect(element).toBeNull();
        }
      }
    }
  });
});

describe("六穿（害）", () => {
  const table = pairTable(relations.getBranchHarm);

  test("12 支全覆盖且两两对称", () => {
    expectSymmetricBijection(table, 12);
  });

  test("getBranchPiercing 是 getBranchHarm 的同义入口", () => {
    for (const branch of ALL_BRANCHES) {
      expect(relations.getBranchPiercing(branch)).toBe(relations.getBranchHarm(branch));
      for (const other of ALL_BRANCHES) {
        expect(relations.isPiercing(branch, other)).toBe(relations.isHarm(branch, other));
      }
    }
  });
});

describe("六破", () => {
  const table = pairTable((branch) => relations.getBranchDestruction(branch) ?? null);

  test("12 支全覆盖且两两对称", () => {
    expectSymmetricBijection(table, 12);
  });
});

describe("三刑 / 自刑", () => {
  test("12 支全覆盖，刑组闭合且对称", () => {
    for (const branch of ALL_BRANCHES) {
      const targets = relations.getBranchPunishments(branch);
      expect(targets.length).toBeGreaterThan(0);
      expect(new Set(targets).size).toBe(targets.length);
      for (const target of targets) {
        expect(relations.getBranchPunishments(target)).toContain(branch);
        expect(relations.isPunishment(branch, target)).toBe(true);
      }
    }
  });

  test("自刑只有 辰午酉亥 四支", () => {
    const selfPunishing = ALL_BRANCHES.filter((branch) =>
      relations.getBranchPunishments(branch).includes(branch),
    );
    expect(selfPunishing).toEqual(["辰", "午", "酉", "亥"]);
  });

  test("不收 辰午 / 酉丑 伪刑对", () => {
    expect(relations.isPunishment("辰", "午")).toBe(false);
    expect(relations.isPunishment("午", "辰")).toBe(false);
    expect(relations.isPunishment("酉", "丑")).toBe(false);
    expect(relations.isPunishment("丑", "酉")).toBe(false);
  });
});

describe("三合 / 半合 / 拱", () => {
  test("四局各三支，合起来正好覆盖 12 支且互不重叠", () => {
    const seen = new Set<BranchName>();
    const localElements = new Set<string>();
    for (const branch of ALL_BRANCHES) {
      const combo = relations.getBranchThreeCombination(branch);
      expect(combo).not.toBeNull();
      if (!combo) continue;
      expect(combo.members).toContain(branch);
      expect(combo.members).toHaveLength(3);
      localElements.add(combo.element);
      seen.add(branch);
    }
    expect(seen.size).toBe(12);
    expect(localElements.size).toBe(4);
  });

  test("半合（拱）给出缺位的第三支，且左右对称", () => {
    for (const branch of ALL_BRANCHES) {
      const combo = relations.getBranchThreeCombination(branch);
      if (!combo) continue;
      for (const other of combo.members) {
        if (other === branch) continue;
        const half = relations.isPartialThreeCombination(branch, other);
        expect(half).not.toBeNull();
        if (!half) continue;
        expect(half.element).toBe(combo.element);
        expect(combo.members).toContain(half.missing);
        expect(half.missing).not.toBe(branch);
        expect(half.missing).not.toBe(other);
        expect(relations.isPartialThreeCombination(other, branch)?.missing).toBe(half.missing);
        expect(relations.isThreeCombination(branch, other, half.missing)).toBe(combo.element);
      }
    }
  });
});

describe("三会", () => {
  test("四局各三支，合起来正好覆盖 12 支且方位互不相同", () => {
    const seen = new Set<BranchName>();
    const directions = new Set<string>();
    for (const branch of ALL_BRANCHES) {
      const gathering = relations.getBranchThreeGathering(branch);
      expect(gathering).not.toBeNull();
      if (!gathering) continue;
      expect(gathering.members).toContain(branch);
      expect(gathering.members).toHaveLength(3);
      directions.add(gathering.direction);
      seen.add(branch);
      expect(
        relations.isThreeGathering(
          gathering.members[0] as BranchName,
          gathering.members[1] as BranchName,
          gathering.members[2] as BranchName,
        ),
      ).toEqual({ element: gathering.element, direction: gathering.direction });
    }
    expect(seen.size).toBe(12);
    expect(directions.size).toBe(4);
  });
});

describe("支对支暗合", () => {
  const table = pairTable(relations.getBranchHiddenHarmony);

  test("寅丑 午亥 卯申 子戌 四对，对称且不多不少", () => {
    expect(table).toEqual({ 寅: "丑", 丑: "寅", 午: "亥", 亥: "午", 卯: "申", 申: "卯", 子: "戌", 戌: "子" });
    expectSymmetricBijection(table, 8);
  });

  test("巳 不入暗合表：子巳本气癸丙不合（author_guidance: AstroZi, 2026-09-20）", () => {
    expect(relations.getBranchHiddenHarmony("巳")).toBeNull();
    expect(relations.isBranchHiddenHarmony("子", "巳")).toBe(false);
  });

  test("辰未酉 不入暗合表", () => {
    for (const branch of ["辰", "未", "酉"] as BranchName[]) {
      expect(relations.getBranchHiddenHarmony(branch)).toBeNull();
    }
  });

  test("天干×藏干暗合是另一个函数，互不冒充", () => {
    // 甲与丑本气己暗合，但地支"甲"不存在，两张表不共享入口。
    expect(relations.stemHiddenHarmony("甲", "丑").hasHiddenHarmony).toBe(true);
    expect(relations.stemHiddenHarmony("甲", "子").hasHiddenHarmony).toBe(false);
    expect(relations.analyzeStemHiddenHarmonies("甲", ["子", "丑", "未"]).harmonies).toHaveLength(2);
  });
});

describe("禄", () => {
  test("10 天干各有禄位，阳干禄在长生后的临官支", () => {
    const table: Partial<Record<StemName, BranchName>> = {};
    for (const stem of ALL_STEMS) table[stem] = relations.getLuPosition(stem);
    expect(table).toEqual({
      甲: "寅",
      乙: "卯",
      丙: "巳",
      丁: "午",
      戊: "巳",
      己: "午",
      庚: "申",
      辛: "酉",
      壬: "亥",
      癸: "子",
    });
    for (const stem of ALL_STEMS) {
      expect(relations.isLuPosition(stem, table[stem] as BranchName)).toBe(true);
    }
  });

  test("禄位不落在四墓库", () => {
    for (const stem of ALL_STEMS) {
      expect(["辰", "戌", "丑", "未"]).not.toContain(relations.getLuPosition(stem));
    }
  });
});

describe("羊刃", () => {
  test("只有五阳干立刃：甲卯 丙午 戊午 庚酉 壬子", () => {
    const table: Partial<Record<StemName, BranchName>> = {};
    for (const stem of ALL_STEMS) {
      const position = relations.getYangRenPosition(stem);
      if (position !== null) table[stem] = position;
    }
    expect(table).toEqual({ 甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子" });
  });

  test("阴干无刃", () => {
    for (const stem of ["乙", "丁", "己", "辛", "癸"] as StemName[]) {
      expect(relations.getYangRenPosition(stem)).toBeNull();
      for (const branch of ALL_BRANCHES) {
        expect(relations.isYangRenPosition(stem, branch)).toBe(false);
      }
    }
  });

  test("刃与禄不同支（帝旺 ≠ 临官）", () => {
    for (const stem of ALL_STEMS) {
      const yangRen = relations.getYangRenPosition(stem);
      if (yangRen === null) continue;
      expect(yangRen).not.toBe(relations.getLuPosition(stem));
    }
  });
});

describe("库（墓）", () => {
  test("默认表只收经核实一致的四行，土缺位", () => {
    expect(relations.getKuPosition("木")).toBe("未");
    expect(relations.getKuPosition("火")).toBe("戌");
    expect(relations.getKuPosition("金")).toBe("丑");
    expect(relations.getKuPosition("水")).toBe("辰");
    expect(relations.getKuPosition("土")).toBeNull();
  });

  test("土库缺位是因为争议，已登记在 contested", () => {
    expect(relations.CONTESTED_STORAGE_ELEMENTS).toEqual(["土"]);
    expect(relations.isKuPosition("土", "辰")).toBe(false);
    expect(relations.isKuPosition("土", "戌")).toBe(false);
  });

  test("库位都落在四墓库支", () => {
    for (const element of ["木", "火", "金", "水"] as const) {
      expect(["辰", "戌", "丑", "未"]).toContain(relations.getKuPosition(element) as string);
    }
  });
});

describe("天干五合", () => {
  test("10 天干构成 5 组对合，互为对方的 partner 且化神一致", () => {
    const seen = new Set<StemName>();
    for (const stem of ALL_STEMS) {
      const combo = relations.getStemCombination(stem);
      expect(combo).toBeDefined();
      expect(relations.getStemCombination(combo.partner).partner).toBe(stem);
      expect(relations.getStemCombination(combo.partner).result).toBe(combo.result);
      expect(relations.isStemCombination(stem, combo.partner)).toBe(combo.result);
      expect(combo.partner).not.toBe(stem);
      seen.add(stem);
    }
    expect(seen.size).toBe(10);
  });

  test("非合的干对返回 null", () => {
    for (const a of ALL_STEMS) {
      for (const b of ALL_STEMS) {
        const isPartner = relations.getStemCombination(a).partner === b;
        expect(relations.isStemCombination(a, b) !== null).toBe(isPartner);
      }
    }
  });

  test("只有一张五合表：analyzeStemRelation 与 isStemCombination 同源", () => {
    for (const a of ALL_STEMS) {
      for (const b of ALL_STEMS) {
        const element = relations.isStemCombination(a, b);
        const analysis = relations.analyzeStemRelation(a, b);
        if (element !== null) {
          expect(analysis.type).toBe("combination");
          expect(analysis.element).toBe(element);
        } else {
          expect(analysis.type).not.toBe("combination");
        }
      }
    }
  });
});

describe("天干相克", () => {
  test("每个天干克两个天干，且不自克、不互克", () => {
    for (const stem of ALL_STEMS) {
      const targets = relations.getStemClashTargets(stem);
      expect(targets).toHaveLength(2);
      expect(new Set(targets).size).toBe(2);
      for (const target of targets) {
        expect(target).not.toBe(stem);
        expect(relations.isStemClash(stem, target)).toBe(true);
        expect(relations.isStemClash(target, stem)).toBe(false);
        expect(relations.getStemClashDescription(stem, target)).toContain(stem);
      }
    }
  });
});

describe("争议成员不得有默认值", () => {
  test("relations 不导出任何相绝查询入口", () => {
    const exported = Object.keys(relations);
    expect(exported).not.toContain("getBranchAbsolute");
    expect(exported).not.toContain("isBranchAbsolute");
    expect(exported.filter((name) => name.toLowerCase().includes("absolute"))).toEqual([
      "BRANCH_ABSOLUTE_CONTEST",
    ]);
  });

  test("contested 只记来源差异，每条变体都有出处", () => {
    expect(relations.CONTESTED_RELATIONS).toHaveLength(2);
    for (const contest of relations.CONTESTED_RELATIONS) {
      expect(contest.variants.length).toBeGreaterThanOrEqual(2);
      for (const variant of contest.variants) {
        expect(variant.provenance).toMatch(/^AstroZi \S+：.+$/);
        expect(variant.note.length).toBeGreaterThan(0);
      }
      // 互斥：不同变体不得主张同一份数据
      const claims = contest.variants.map((variant) => JSON.stringify(variant.claim));
      expect(new Set(claims).size).toBe(claims.length);
    }
  });

  test("相绝的两个变体确实不同：有向表含对称表没有的条目", () => {
    const [symmetric, directed] = relations.BRANCH_ABSOLUTE_CONTEST.variants;
    expect(symmetric?.claim["戌"]).toBeUndefined();
    expect(directed?.claim["戌"]).toEqual(["卯"]);
  });
});
