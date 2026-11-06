/**
 * 纳音计算器
 * 负责计算四柱纳音五行及其特性分析
 */

import type { ElementName } from "../core-types";
import { NAYIN_ELEMENTS, NAYIN_TABLE } from "./constants";
import {
  ChartCalculationError,
  type FourPillars,
  type INaYinCalculator,
  type NaYinCompatibility,
  type NaYinInfo,
} from "./types";

export class NaYinCalculator implements INaYinCalculator {
  /**
   * 计算纳音信息
   */
  async calculateNaYin(fourPillars: FourPillars): Promise<NaYinInfo> {
    try {
      const year = this.getStemBranchNaYin(fourPillars.year.stem, fourPillars.year.branch);
      const month = this.getStemBranchNaYin(fourPillars.month.stem, fourPillars.month.branch);
      const day = this.getStemBranchNaYin(fourPillars.day.stem, fourPillars.day.branch);
      const hour = this.getStemBranchNaYin(fourPillars.hour.stem, fourPillars.hour.branch);

      const dayMasterNaYin = day;
      const element = NAYIN_ELEMENTS[dayMasterNaYin] || "木";

      const characteristics = this.getNaYinCharacteristics(dayMasterNaYin);
      const compatibility = this.analyzeNaYinCompatibility(dayMasterNaYin, [year, month, hour]);

      return {
        year,
        month,
        day,
        hour,
        dayMasterNaYin,
        element,
        characteristics,
        compatibility,
      };
    } catch (error) {
      throw new ChartCalculationError(
        `纳音计算失败: ${error instanceof Error ? error.message : "未知错误"}`,
        "NAYIN_CALCULATION_ERROR",
        fourPillars
      );
    }
  }

  /**
   * 获取干支组合的纳音
   */
  private getStemBranchNaYin(stem: string, branch: string): string {
    const key = `${stem}${branch}`;
    return NAYIN_TABLE[key] || "未知纳音";
  }

  /**
   * 获取纳音特性
   */
  private getNaYinCharacteristics(naYin: string): string[] {
    const characteristics: Record<string, string[]> = {
      海中金: ["深藏不露", "内敛稳重", "大器晚成", "富有潜力"],
      炉中火: ["热情奔放", "光明磊落", "创造力强", "领导天赋"],
      大林木: ["根基深厚", "成长茂盛", "包容大度", "生命力旺"],
      路旁土: ["踏实稳健", "默默奉献", "承载万物", "厚德载福"],
      剑锋金: ["锋芒毕露", "果断刚毅", "切削有力", "威力强劲"],
      山头火: ["高远明亮", "照耀四方", "温暖人心", "影响深远"],
      涧下水: ["清澈纯净", "源远流长", "润物无声", "智慧深邃"],
      城头土: ["坚固稳定", "保护有力", "权威象征", "安全可靠"],
      白蜡金: ["纯净光洁", "装饰美化", "细腻精致", "艺术天赋"],
      杨柳木: ["柔韧适应", "随风摆动", "生命力强", "适应性好"],
      泉中水: ["源头活水", "滋养生命", "纯净清冽", "生生不息"],
      屋上土: ["覆盖保护", "稳固安全", "实用性强", "守护家园"],
      霹雳火: ["威力巨大", "震撼人心", "变化突然", "影响深刻"],
      松柏木: ["坚韧不拔", "四季常青", "长寿象征", "品格高洁"],
      长流水: ["持续不断", "滋润广远", "恒久坚持", "影响深远"],
      砂中金: ["蕴藏丰富", "需要发掘", "价值潜在", "机会无限"],
      山下火: ["温和光明", "普照大地", "平易近人", "温暖可靠"],
      平地木: ["广阔成长", "普及众生", "平易包容", "生机勃勃"],
      壁上土: ["装饰美化", "文化修养", "艺术气质", "精神追求"],
      金箔金: ["华丽装饰", "表面光鲜", "艺术价值", "追求美感"],
      覆灯火: ["照明指路", "奉献光明", "服务他人", "默默发光"],
      天河水: ["宽广包容", "滋养万物", "胸怀宽阔", "惠及众生"],
      大驿土: ["交通要道", "沟通桥梁", "实用价值", "承载功能"],
      钗钏金: ["精美装饰", "贴身陪伴", "珍贵细致", "情感价值"],
    };

    return characteristics[naYin] || ["特性未知"];
  }

  /**
   * 分析纳音相配性
   */
  private analyzeNaYinCompatibility(
    dayMasterNaYin: string,
    otherNaYins: string[]
  ): NaYinCompatibility {
    const favorable: string[] = [];
    const unfavorable: string[] = [];
    const neutral: string[] = [];

    const dayMasterElement = NAYIN_ELEMENTS[dayMasterNaYin] ?? "木";

    otherNaYins.forEach((naYin) => {
      const otherElement = NAYIN_ELEMENTS[naYin] ?? "木";
      const relationship = this.getNaYinElementRelationship(dayMasterElement, otherElement);

      switch (relationship) {
        case "generation":
        case "same":
          favorable.push(naYin);
          break;
        case "restriction":
        case "consumption":
          unfavorable.push(naYin);
          break;
        default:
          neutral.push(naYin);
          break;
      }
    });

    const analysis = this.generateCompatibilityAnalysis(
      favorable.length,
      unfavorable.length,
      neutral.length
    );

    return {
      favorable,
      unfavorable,
      neutral,
      analysis,
    };
  }

  /**
   * 获取纳音五行关系
   */
  private getNaYinElementRelationship(element1: ElementName, element2: ElementName): string {
    if (element1 === element2) {
      return "same"; // 同类
    }

    // 相生关系
    const generationMap: Record<ElementName, ElementName> = {
      木: "火",
      火: "土",
      土: "金",
      金: "水",
      水: "木",
    };

    if (generationMap[element2] === element1) {
      return "generation"; // 生日主纳音
    }

    if (generationMap[element1] === element2) {
      return "consumption"; // 日主纳音生他
    }

    // 相克关系
    const restrictionMap: Record<ElementName, ElementName> = {
      木: "土",
      火: "金",
      土: "水",
      金: "木",
      水: "火",
    };

    if (restrictionMap[element2] === element1) {
      return "restriction"; // 克日主纳音
    }

    if (restrictionMap[element1] === element2) {
      return "overcome"; // 日主纳音克他
    }

    return "neutral";
  }

  /**
   * 生成相配分析
   */
  private generateCompatibilityAnalysis(
    favorableCount: number,
    unfavorableCount: number,
    neutralCount: number
  ): string {
    let analysis = `纳音相配分析：`;

    if (favorableCount > unfavorableCount) {
      analysis += `整体配置较好，有利纳音${favorableCount}个，不利纳音${unfavorableCount}个。`;
      analysis += `纳音组合有助于命主发展，能够得到较好的支持。`;
    } else if (unfavorableCount > favorableCount) {
      analysis += `纳音配置存在挑战，不利纳音${unfavorableCount}个，有利纳音${favorableCount}个。`;
      analysis += `需要注意纳音冲突带来的影响，宜化解不利因素。`;
    } else {
      analysis += `纳音配置相对平衡，各种关系并存。`;
      analysis += `整体比较平和，需要综合考虑其他因素。`;
    }

    if (neutralCount > 0) {
      analysis += `另有中性纳音${neutralCount}个，影响相对较小。`;
    }

    return analysis;
  }

  /**
   * 分析纳音强弱
   */
  analyzeNaYinStrength(
    naYin: string,
    season: string
  ): {
    strength: number;
    level: "旺" | "相" | "休" | "囚" | "死";
    description: string;
  } {
    const element = NAYIN_ELEMENTS[naYin] ?? "木";
    const strengthMap = this.getSeasonalStrengthMap();

    const seasonalStrength = strengthMap[season]?.[element] ?? 50;

    let level: "旺" | "相" | "休" | "囚" | "死";
    if (seasonalStrength >= 80) level = "旺";
    else if (seasonalStrength >= 60) level = "相";
    else if (seasonalStrength >= 40) level = "休";
    else if (seasonalStrength >= 20) level = "囚";
    else level = "死";

    const description = this.generateStrengthDescription(naYin, level, seasonalStrength);

    return {
      strength: seasonalStrength,
      level,
      description,
    };
  }

  /**
   * 获取季节强弱映射表
   */
  private getSeasonalStrengthMap(): Record<string, Record<ElementName, number>> {
    return {
      春: { 木: 100, 火: 70, 土: 30, 金: 20, 水: 50 },
      夏: { 木: 50, 火: 100, 土: 70, 金: 30, 水: 20 },
      秋: { 木: 20, 火: 30, 土: 50, 金: 100, 水: 70 },
      冬: { 木: 30, 火: 20, 土: 30, 金: 50, 水: 100 },
      土月: { 木: 30, 火: 50, 土: 100, 金: 70, 水: 30 },
    };
  }

  /**
   * 生成强度描述
   */
  private generateStrengthDescription(naYin: string, level: string, strength: number): string {
    return (
      `${naYin}在当前季节处于${level}地，强度为${strength}分，` +
      `${
        strength >= 70
          ? "力量充足，有利发展"
          : strength >= 40
            ? "力量一般，需要支持"
            : "力量较弱，需要扶持"
      }。`
    );
  }

  /**
   * 纳音格局分析
   */
  analyzeNaYinPattern(naYinInfo: NaYinInfo): {
    pattern: string;
    type: "superior" | "good" | "average" | "poor";
    description: string;
    advantages: string[];
    challenges: string[];
  } {
    const { year, month, day, hour } = naYinInfo;
    const allNaYins = [year, month, day, hour];

    // 检查特殊格局
    const pattern = this.identifyNaYinPattern(allNaYins);
    const type = this.evaluatePatternType(pattern, allNaYins);
    const description = this.generatePatternDescription(pattern, type);
    const advantages = this.getPatternAdvantages(pattern);
    const challenges = this.getPatternChallenges(pattern);

    return {
      pattern,
      type,
      description,
      advantages,
      challenges,
    };
  }

  /**
   * 识别纳音格局
   */
  private identifyNaYinPattern(naYins: string[]): string {
    const elements = naYins.map((naYin) => NAYIN_ELEMENTS[naYin] ?? "木");
    const elementCounts = this.countElements(elements);

    // 四柱同元素
    const singleElement = Object.entries(elementCounts).find(([_, count]) => count === 4);
    if (singleElement) {
      return `${singleElement[0]}局纯格`;
    }

    // 三个同元素
    const dominantElement = Object.entries(elementCounts).find(([_, count]) => count === 3);
    if (dominantElement) {
      return `${dominantElement[0]}局偏旺格`;
    }

    // 两个同元素
    const majorElement = Object.entries(elementCounts).find(([_, count]) => count === 2);
    if (majorElement) {
      return `${majorElement[0]}局中和格`;
    }

    // 五行俱全或较为分散
    const uniqueElements = Object.keys(elementCounts).length;
    if (uniqueElements >= 4) {
      return "五行流通格";
    } else {
      return "纳音杂格";
    }
  }

  /**
   * 统计五行数量
   */
  private countElements(elements: ElementName[]): Record<ElementName, number> {
    const counts: Record<ElementName, number> = {
      木: 0,
      火: 0,
      土: 0,
      金: 0,
      水: 0,
    };

    elements.forEach((element) => {
      if (element in counts) {
        counts[element]++;
      }
    });

    return counts;
  }

  /**
   * 评估格局类型
   */
  private evaluatePatternType(
    pattern: string,
    _naYins: string[]
  ): "superior" | "good" | "average" | "poor" {
    if (pattern.includes("纯格")) {
      return "superior";
    } else if (pattern.includes("偏旺格") || pattern.includes("流通格")) {
      return "good";
    } else if (pattern.includes("中和格")) {
      return "average";
    } else {
      return "poor";
    }
  }

  /**
   * 生成格局描述
   */
  private generatePatternDescription(pattern: string, type: string): string {
    const typeDescriptions = {
      superior: "上等格局，天赋异禀，发展潜力巨大",
      good: "良好格局，条件优越，容易取得成功",
      average: "中等格局，需要努力，可以稳步发展",
      poor: "一般格局，存在挑战，需要谨慎规划",
    };

    return `${pattern}为${typeDescriptions[type as keyof typeof typeDescriptions]}。`;
  }

  /**
   * 获取格局优势
   */
  private getPatternAdvantages(pattern: string): string[] {
    const advantagesMap: Record<string, string[]> = {
      木局纯格: ["创造力强", "适应性好", "成长潜力大", "仁慈博爱"],
      火局纯格: ["热情奔放", "领导才能", "光明磊落", "影响力强"],
      土局纯格: ["稳重踏实", "诚信可靠", "承载能力强", "包容性大"],
      金局纯格: ["果断刚毅", "执行力强", "意志坚定", "威信力高"],
      水局纯格: ["智慧深邃", "适应性强", "包容性大", "潜力无限"],
      五行流通格: ["平衡发展", "协调性好", "适应性强", "发展全面"],
    };

    return advantagesMap[pattern] || ["需要具体分析"];
  }

  /**
   * 获取格局挑战
   */
  private getPatternChallenges(pattern: string): string[] {
    const challengesMap: Record<string, string[]> = {
      木局纯格: ["过于理想化", "缺乏实际行动", "容易受挫", "需要金制"],
      火局纯格: ["过于冲动", "缺乏耐性", "容易极端", "需要水制"],
      土局纯格: ["过于保守", "缺乏变化", "容易固执", "需要木疏"],
      金局纯格: ["过于刚硬", "缺乏灵活", "容易孤立", "需要火炼"],
      水局纯格: ["过于消极", "缺乏行动", "容易散漫", "需要土制"],
      纳音杂格: ["缺乏重点", "发展不均", "容易混乱", "需要整合"],
    };

    return challengesMap[pattern] || ["需要具体分析"];
  }
}
