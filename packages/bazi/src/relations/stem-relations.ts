/**
 * ============================================================
 * 天干关系表 (Stem Relations) — 本仓唯一关系 authority
 * ============================================================
 * @module relations/stem-relations
 * @description 天干五合(+化神)与天干相克。五合表在上游有两份同数据副本
 *              (`chart/stemRelations.ts` 的 `STEM_HARMONY_PAIRS` 与
 *              `chart/branchRelations.ts` 的 `STEM_COMBINATION_PAIRS`)，
 *              本仓只保留一份，即下面的 `STEM_COMBINATION_PAIRS`。
 *
 * 源自 AstroZi 排盘引擎的关系表，按作者裁定重写。
 */

import type { ElementName, StemName } from "../core-types";

// ============================================================
// 🤝 天干五合关系 (Five Combinations)
// ============================================================

/**
 * 天干五合表
 * 甲己合化土, 乙庚合化金, 丙辛合化水, 丁壬合化木, 戊癸合化火
 */
export const STEM_COMBINATION_PAIRS: Record<StemName, { partner: StemName; result: ElementName }> =
  {
    甲: { partner: "己", result: "土" },
    己: { partner: "甲", result: "土" },
    乙: { partner: "庚", result: "金" },
    庚: { partner: "乙", result: "金" },
    丙: { partner: "辛", result: "水" },
    辛: { partner: "丙", result: "水" },
    丁: { partner: "壬", result: "木" },
    壬: { partner: "丁", result: "木" },
    戊: { partner: "癸", result: "火" },
    癸: { partner: "戊", result: "火" },
  };

/**
 * 获取天干的合化对象
 * @param stem 天干
 * @returns { partner: 合化天干, result: 化神五行 }
 * @example
 * getStemCombination('甲') // → { partner: '己', result: '土' }
 * getStemCombination('丙') // → { partner: '辛', result: '水' }
 */
export function getStemCombination(stem: StemName): { partner: StemName; result: ElementName } {
  return STEM_COMBINATION_PAIRS[stem];
}

/**
 * 检查两个天干是否构成五合
 * @param stem1 天干1
 * @param stem2 天干2
 * @returns 化神五行,如果不构成合返回null
 * @example
 * isStemCombination('甲', '己') // → '土'
 * isStemCombination('甲', '乙') // → null
 */
export function isStemCombination(stem1: StemName, stem2: StemName): ElementName | null {
  if (STEM_COMBINATION_PAIRS[stem1]?.partner === stem2) {
    return STEM_COMBINATION_PAIRS[stem1].result;
  }
  return null;
}

// ============================================================
// ⚔️ 天干相克关系 (Stem Clashes)
// ============================================================

/**
 * 天干相克关系 (克者 → 被克者)
 * 五行相克: 金克木, 木克土, 土克水, 水克火, 火克金
 */
const STEM_CLASH_MAP: Record<StemName, StemName[]> = {
  // 金克木
  庚: ["甲", "乙"],
  辛: ["甲", "乙"],
  // 木克土
  甲: ["戊", "己"],
  乙: ["戊", "己"],
  // 土克水
  戊: ["壬", "癸"],
  己: ["壬", "癸"],
  // 水克火
  壬: ["丙", "丁"],
  癸: ["丙", "丁"],
  // 火克金
  丙: ["庚", "辛"],
  丁: ["庚", "辛"],
};

/**
 * 获取天干所克的天干列表
 * @param stem 天干
 * @returns 被克的天干列表
 * @example
 * getStemClashTargets('甲') // → ['戊', '己']
 * getStemClashTargets('庚') // → ['甲', '乙']
 */
export function getStemClashTargets(stem: StemName): StemName[] {
  return STEM_CLASH_MAP[stem] || [];
}

/**
 * 检查天干1是否克天干2
 * @param stem1 天干1 (克者)
 * @param stem2 天干2 (被克者)
 * @returns 是否相克
 * @example
 * isStemClash('甲', '戊') // → true (木克土)
 * isStemClash('庚', '甲') // → true (金克木)
 * isStemClash('甲', '乙') // → false
 */
export function isStemClash(stem1: StemName, stem2: StemName): boolean {
  const targets = STEM_CLASH_MAP[stem1];
  return targets ? targets.includes(stem2) : false;
}

/**
 * 获取克制关系描述
 * @param stem1 天干1
 * @param stem2 天干2
 * @returns 克制关系描述,如果无克制返回null
 * @example
 * getStemClashDescription('甲', '戊') // → '甲木克戊土'
 * getStemClashDescription('庚', '甲') // → '庚金克甲木'
 * getStemClashDescription('甲', '乙') // → null
 */
export function getStemClashDescription(stem1: StemName, stem2: StemName): string | null {
  if (isStemClash(stem1, stem2)) {
    const element1Map: Record<StemName, string> = {
      甲: "木",
      乙: "木",
      丙: "火",
      丁: "火",
      戊: "土",
      己: "土",
      庚: "金",
      辛: "金",
      壬: "水",
      癸: "水",
    };
    return `${stem1}${element1Map[stem1]}克${stem2}${element1Map[stem2]}`;
  }
  return null;
}

// ============================================================
// 🔍 综合关系查询 (Comprehensive Query)
// ============================================================

/**
 * 分析两个天干的关系
 * @param stem1 天干1
 * @param stem2 天干2
 * @returns 关系类型和描述
 * @example
 * analyzeStemRelation('甲', '己') // → { type: 'combination', element: '土', description: '甲己合土' }
 * analyzeStemRelation('甲', '戊') // → { type: 'clash', description: '甲木克戊土' }
 * analyzeStemRelation('甲', '乙') // → { type: 'none', description: '无明显关系' }
 */
export function analyzeStemRelation(
  stem1: StemName,
  stem2: StemName
): {
  type: "combination" | "clash" | "clashed_by" | "none";
  description: string;
  element?: ElementName;
} {
  // 检查合化
  const combinationElement = isStemCombination(stem1, stem2);
  if (combinationElement) {
    return {
      type: "combination",
      element: combinationElement,
      description: `${stem1}${stem2}合${combinationElement}`,
    };
  }

  // 检查克制 (stem1克stem2)
  if (isStemClash(stem1, stem2)) {
    return {
      type: "clash",
      description: getStemClashDescription(stem1, stem2)!,
    };
  }

  // 检查被克 (stem2克stem1)
  if (isStemClash(stem2, stem1)) {
    return {
      type: "clashed_by",
      description: getStemClashDescription(stem2, stem1)!,
    };
  }

  // 无明显关系
  return {
    type: "none",
    description: "无明显关系",
  };
}
