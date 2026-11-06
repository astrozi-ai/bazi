/**
 * 十神计算器
 * 负责计算四柱中所有干支的十神关系
 */

import {
  STEM_ELEMENTS,
  TEN_GOD_CHARACTERISTICS,
  TEN_GOD_RELATIONSHIPS,
  TEN_GOD_SIMPLIFIED,
} from "./constants";

// ========================= 常量定义 =========================

/** 位置权重配置 */
const STEM_POSITION_WEIGHTS = {
  year: 0.8, // 年干
  month: 1.0, // 月干
  day: 1.2, // 日干（日主除外）
  hour: 0.9, // 时干
} as const;

/** 藏干位置权重配置 */
const HIDDEN_STEM_POSITION_WEIGHTS = {
  year: 0.7,
  month: 1.2, // 月令最重要
  day: 1.0,
  hour: 0.8,
} as const;

/** 天干基础强度 */
const BASE_STEM_STRENGTH = 80;

/** 透干加成系数 */
const TRANSPARENT_BONUS = 1.2;

/** 初始化十神计数器 */
function createEmptyTenGodCount(): Record<TenGodType, number> {
  return {
    比肩: 0,
    劫财: 0,
    食神: 0,
    伤官: 0,
    偏财: 0,
    正财: 0,
    七杀: 0,
    正官: 0,
    偏印: 0,
    正印: 0,
  };
}

/** 柱名称数组 */
const PILLAR_NAMES = ["year", "month", "day", "hour"] as const;
type PillarName = (typeof PILLAR_NAMES)[number];

import type { ElementName, TenGodSimplified, TenGodType } from "../core-types";
import {
  ChartCalculationError,
  type FourPillars,
  type ITenGodCalculator,
  type TenGodAnalysis,
  type TenGodPattern,
  type TenGodRelationship,
  type TenGodSummary,
} from "./types";

export class TenGodCalculator implements ITenGodCalculator {
  /**
   * 计算十神关系
   */
  async calculateTenGods(fourPillars: FourPillars): Promise<TenGodAnalysis> {
    try {
      const dayMaster = fourPillars.dayMaster;
      const relationships = this.calculateAllRelationships(fourPillars, dayMaster);
      const summary = this.generateSummary(relationships);
      const patterns = this.analyzePatterns(relationships, fourPillars);

      // 更新四柱中的十神信息
      this.updatePillarsWithTenGods(fourPillars, relationships);

      return {
        dayMaster,
        relationships,
        summary,
        patterns,
      };
    } catch (error) {
      throw new ChartCalculationError(
        `十神计算失败: ${error instanceof Error ? error.message : "未知错误"}`,
        "TEN_GOD_CALCULATION_ERROR",
        fourPillars
      );
    }
  }

  /**
   * 计算所有十神关系
   */
  private calculateAllRelationships(
    fourPillars: FourPillars,
    dayMaster: string
  ): TenGodRelationship[] {
    const relationships: TenGodRelationship[] = [];
    const pillars = [
      { pillar: fourPillars.year, name: "year" as const },
      { pillar: fourPillars.month, name: "month" as const },
      { pillar: fourPillars.day, name: "day" as const },
      { pillar: fourPillars.hour, name: "hour" as const },
    ];

    pillars.forEach(({ pillar, name }) => {
      // 计算天干十神
      if (pillar.stem !== dayMaster || name !== "day") {
        // 日主自己不计算
        const stemRelation = this.calculateTenGodRelationship(dayMaster, pillar.stem, "stem");
        if (stemRelation) {
          relationships.push({
            target: pillar.stem,
            targetType: "stem",
            pillar: name,
            position: "stem",
            tenGod: stemRelation.tenGod,
            tenGodSimplified: stemRelation.tenGodSimplified,
            element: stemRelation.element,
            strength: this.calculateStemStrength(name, true), // 天干透出
            isVisible: true,
          });
        }
      }

      // 计算地支本气十神（通过藏干）
      const hiddenStems = pillar.hiddenStems || [];
      hiddenStems.forEach((hiddenStem, _index) => {
        if (hiddenStem.stem !== dayMaster || name !== "day") {
          // 日主自己不计算
          const hiddenRelation = this.calculateTenGodRelationship(
            dayMaster,
            hiddenStem.stem,
            "hiddenStem"
          );
          if (hiddenRelation) {
            relationships.push({
              target: hiddenStem.stem,
              targetType: "hiddenStem",
              pillar: name,
              position: "hidden",
              tenGod: hiddenRelation.tenGod,
              tenGodSimplified: hiddenRelation.tenGodSimplified,
              element: hiddenStem.element,
              strength: this.calculateHiddenStemStrength(
                hiddenStem.strength,
                hiddenStem.weight,
                name
              ),
              isVisible: this.isStemTransparent(pillar.stem, hiddenStem.stem),
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * 计算单个十神关系
   */
  private calculateTenGodRelationship(
    dayMaster: string,
    targetStem: string,
    _type: "stem" | "hiddenStem"
  ): { tenGod: TenGodType; tenGodSimplified: TenGodSimplified; element: ElementName } | null {
    const relationshipKey = `${dayMaster}${targetStem}`;
    const tenGod = TEN_GOD_RELATIONSHIPS[relationshipKey];

    if (!tenGod) return null;

    // 验证十神简化版本是否存在
    const tenGodSimplified = TEN_GOD_SIMPLIFIED[tenGod];
    if (!tenGodSimplified) {
      throw new ChartCalculationError(
        `十神简化版本未定义: ${tenGod}`,
        "TEN_GOD_SIMPLIFIED_NOT_FOUND",
        { dayMaster, targetStem, tenGod }
      );
    }

    // 使用标准的STEM_ELEMENTS常量获取元素
    const element = STEM_ELEMENTS[targetStem as keyof typeof STEM_ELEMENTS];
    if (!element) {
      throw new ChartCalculationError(`未知天干: ${targetStem}`, "UNKNOWN_STEM", {
        dayMaster,
        targetStem,
      });
    }

    return {
      tenGod,
      tenGodSimplified,
      element,
    };
  }

  /**
   * 计算天干强度
   */
  private calculateStemStrength(pillar: PillarName, isTransparent: boolean): number {
    let baseStrength = BASE_STEM_STRENGTH;

    // 位置权重
    baseStrength *= STEM_POSITION_WEIGHTS[pillar];

    // 透干加成
    if (isTransparent) {
      baseStrength *= TRANSPARENT_BONUS;
    }

    return Math.round(baseStrength);
  }

  /**
   * 计算藏干强度
   */
  private calculateHiddenStemStrength(
    hiddenStrength: number,
    weight: number,
    pillar: PillarName
  ): number {
    let strength = hiddenStrength * weight;

    // 位置权重
    strength *= HIDDEN_STEM_POSITION_WEIGHTS[pillar];

    return Math.round(strength);
  }

  /**
   * 检查天干是否透出
   */
  private isStemTransparent(pillarStem: string, hiddenStem: string): boolean {
    return pillarStem === hiddenStem;
  }

  /**
   * 生成十神总结
   */
  private generateSummary(relationships: TenGodRelationship[]): TenGodSummary {
    const count = createEmptyTenGodCount();

    const visible: TenGodType[] = [];
    const hidden: TenGodType[] = [];

    let maxCount = 0;
    let minCount = Infinity;
    let strongest: TenGodType = "比肩";
    let weakest: TenGodType = "比肩";

    // 统计十神数量和可见性
    relationships.forEach((rel) => {
      count[rel.tenGod]++;

      if (rel.isVisible && !visible.includes(rel.tenGod)) {
        visible.push(rel.tenGod);
      } else if (!rel.isVisible && !hidden.includes(rel.tenGod)) {
        hidden.push(rel.tenGod);
      }
    });

    // 找出最强最弱十神
    Object.entries(count).forEach(([tenGod, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        strongest = tenGod as TenGodType;
      }
      if (cnt < minCount && cnt > 0) {
        minCount = cnt;
        weakest = tenGod as TenGodType;
      }
    });

    // 生成分布描述
    const distribution = this.generateDistributionDescription(count, visible, hidden);

    return {
      strongest,
      weakest,
      visible,
      hidden,
      count,
      distribution,
    };
  }

  /**
   * 生成十神分布描述
   */
  private generateDistributionDescription(
    count: Record<TenGodType, number>,
    visible: TenGodType[],
    hidden: TenGodType[]
  ): string {
    const totalCount = Object.values(count).reduce((sum, cnt) => sum + cnt, 0);
    const visibleCount = visible.length;
    const hiddenCount = hidden.length;

    const majorTenGods = Object.entries(count)
      .filter(([_, cnt]) => cnt >= 2)
      .map(([tenGod, cnt]) => `${tenGod}${cnt}个`)
      .join("、");

    let description = `十神共${totalCount}个，透出${visibleCount}种，藏${hiddenCount}种。`;

    if (majorTenGods) {
      description += `主要有${majorTenGods}。`;
    }

    // 分析十神特点
    const positiveCount = Object.entries(count).reduce((sum, [tenGod, cnt]) => {
      const nature = TEN_GOD_CHARACTERISTICS[tenGod as TenGodType].nature;
      return nature === "positive" ? sum + cnt : sum;
    }, 0);

    const negativeCount = Object.entries(count).reduce((sum, [tenGod, cnt]) => {
      const nature = TEN_GOD_CHARACTERISTICS[tenGod as TenGodType].nature;
      return nature === "negative" ? sum + cnt : sum;
    }, 0);

    if (positiveCount > negativeCount) {
      description += "整体偏向正面发展。";
    } else if (negativeCount > positiveCount) {
      description += "需要注意负面影响。";
    } else {
      description += "正负十神比较均衡。";
    }

    return description;
  }

  /**
   * 分析十神格局
   */
  private analyzePatterns(
    relationships: TenGodRelationship[],
    _fourPillars: FourPillars
  ): TenGodPattern[] {
    const patterns: TenGodPattern[] = [];

    // 分析常见格局
    patterns.push(...this.analyzeWealthPatterns(relationships));
    patterns.push(...this.analyzeOfficialPatterns(relationships));
    patterns.push(...this.analyzeSelfPatterns(relationships));
    patterns.push(...this.analyzeOutputPatterns(relationships));

    return patterns.filter((pattern) => pattern.strength > 30); // 过滤弱格局
  }

  /**
   * 分析财格
   */
  private analyzeWealthPatterns(relationships: TenGodRelationship[]): TenGodPattern[] {
    const patterns: TenGodPattern[] = [];
    const wealthRels = relationships.filter(
      (rel) => rel.tenGod === "正财" || rel.tenGod === "偏财"
    );

    if (wealthRels.length >= 2) {
      const totalStrength = wealthRels.reduce((sum, rel) => sum + rel.strength, 0);
      const avgStrength = totalStrength / wealthRels.length;

      const hasPositiveWealth = wealthRels.some((rel) => rel.tenGod === "正财");
      const hasPartialWealth = wealthRels.some((rel) => rel.tenGod === "偏财");

      if (hasPositiveWealth && hasPartialWealth) {
        patterns.push({
          name: "财多身弱格",
          type: avgStrength > 70 ? "favorable" : "neutral",
          components: ["正财", "偏财"],
          description: "财星众多，需要身强才能胜任，主财运丰厚但需谨慎理财。",
          strength: avgStrength,
        });
      }
    }

    return patterns;
  }

  /**
   * 分析官格
   */
  private analyzeOfficialPatterns(relationships: TenGodRelationship[]): TenGodPattern[] {
    const patterns: TenGodPattern[] = [];
    const officialRels = relationships.filter(
      (rel) => rel.tenGod === "正官" || rel.tenGod === "七杀"
    );

    if (officialRels.length >= 2) {
      const totalStrength = officialRels.reduce((sum, rel) => sum + rel.strength, 0);
      const avgStrength = totalStrength / officialRels.length;

      patterns.push({
        name: "官杀混杂格",
        type: "unfavorable",
        components: ["正官", "七杀"],
        description: "正官七杀并见，主事业波折，人际关系复杂，需要化解。",
        strength: avgStrength,
      });
    }

    return patterns;
  }

  /**
   * 分析比劫格
   */
  private analyzeSelfPatterns(relationships: TenGodRelationship[]): TenGodPattern[] {
    const patterns: TenGodPattern[] = [];
    const selfRels = relationships.filter((rel) => rel.tenGod === "比肩" || rel.tenGod === "劫财");

    if (selfRels.length >= 3) {
      const totalStrength = selfRels.reduce((sum, rel) => sum + rel.strength, 0);
      const avgStrength = totalStrength / selfRels.length;

      patterns.push({
        name: "比劫重重格",
        type: "unfavorable",
        components: ["比肩", "劫财"],
        description: "比劫过多，主破财克妻，需要食伤或官杀制化。",
        strength: avgStrength,
      });
    }

    return patterns;
  }

  /**
   * 分析食伤格
   */
  private analyzeOutputPatterns(relationships: TenGodRelationship[]): TenGodPattern[] {
    const patterns: TenGodPattern[] = [];
    const outputRels = relationships.filter(
      (rel) => rel.tenGod === "食神" || rel.tenGod === "伤官"
    );

    if (outputRels.length >= 2) {
      const totalStrength = outputRels.reduce((sum, rel) => sum + rel.strength, 0);
      const avgStrength = totalStrength / outputRels.length;

      const hasEating = outputRels.some((rel) => rel.tenGod === "食神");
      const hasHurting = outputRels.some((rel) => rel.tenGod === "伤官");

      if (hasEating && hasHurting) {
        patterns.push({
          name: "食伤并透格",
          type: "favorable",
          components: ["食神", "伤官"],
          description: "食伤并见，主聪明才智，艺术天赋，利于创业和表达。",
          strength: avgStrength,
        });
      }
    }

    return patterns;
  }

  /**
   * 更新四柱中的十神信息
   */
  private updatePillarsWithTenGods(
    fourPillars: FourPillars,
    relationships: TenGodRelationship[]
  ): void {
    const pillarsWithNames = [
      { pillar: fourPillars.year, name: "year" as const },
      { pillar: fourPillars.month, name: "month" as const },
      { pillar: fourPillars.day, name: "day" as const },
      { pillar: fourPillars.hour, name: "hour" as const },
    ];

    pillarsWithNames.forEach(({ pillar, name }) => {
      // 找到对应的天干十神
      const stemRelation = relationships.find(
        (rel) => rel.target === pillar.stem && rel.targetType === "stem" && rel.pillar === name
      );

      if (stemRelation) {
        pillar.tenGod = stemRelation.tenGod;
        pillar.tenGodSimplified = stemRelation.tenGodSimplified;
      }

      // 更新藏干十神
      pillar.hiddenStems?.forEach((hiddenStem) => {
        const hiddenRelation = relationships.find(
          (rel) =>
            rel.target === hiddenStem.stem && rel.targetType === "hiddenStem" && rel.pillar === name
        );

        if (hiddenRelation) {
          hiddenStem.tenGod = hiddenRelation.tenGod;
        }
      });
    });

    // 更新四柱的十神统计
    fourPillars.tenGodCount = createEmptyTenGodCount();

    relationships.forEach((rel) => {
      fourPillars.tenGodCount[rel.tenGod]++;
    });
  }

  /**
   * 获取十神强度评级
   */
  getStrengthRating(strength: number): "很强" | "较强" | "中等" | "较弱" | "很弱" {
    if (strength >= 90) return "很强";
    if (strength >= 70) return "较强";
    if (strength >= 50) return "中等";
    if (strength >= 30) return "较弱";
    return "很弱";
  }

  /**
   * 获取十神类型说明
   */
  getTenGodDescription(tenGod: TenGodType): string {
    return TEN_GOD_CHARACTERISTICS[tenGod].description;
  }

  /**
   * 判断十神组合的整体特性
   */
  analyzeTenGodCombination(tenGods: TenGodType[]): {
    nature: "positive" | "negative" | "neutral";
    description: string;
    score: number;
  } {
    let totalScore = 0;
    let positiveCount = 0;
    let negativeCount = 0;

    tenGods.forEach((tenGod) => {
      const char = TEN_GOD_CHARACTERISTICS[tenGod];
      totalScore += char.strength;

      if (char.nature === "positive") positiveCount++;
      if (char.nature === "negative") negativeCount++;
    });

    const avgScore = tenGods.length > 0 ? totalScore / tenGods.length : 0;

    let nature: "positive" | "negative" | "neutral";
    let description: string;

    if (positiveCount > negativeCount) {
      nature = "positive";
      description = "十神组合偏向正面，利于发展和成功";
    } else if (negativeCount > positiveCount) {
      nature = "negative";
      description = "十神组合存在挑战，需要谨慎应对";
    } else {
      nature = "neutral";
      description = "十神组合相对平衡，需要综合分析";
    }

    return {
      nature,
      description,
      score: Math.round(avgScore),
    };
  }
}
