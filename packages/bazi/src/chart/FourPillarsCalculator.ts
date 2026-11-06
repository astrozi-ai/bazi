/**
 * 四柱计算器
 * 负责计算年月日时四柱的核心算法
 */

import type { BranchName, StemName } from "../core-types";
import { assertGregorianChartInput, buildChartTimeContext } from "./chartTimeContext";
import {
  BRANCH_ELEMENTS,
  BRANCH_HIDDEN_STEMS,
  MONTH_ORDER_ELEMENTS,
  NAYIN_TABLE,
  SEASON_MAP,
  STEM_ELEMENTS,
} from "./constants";
import type {
  ChartCalculationInput,
  ChartTimeContext,
  EightChar,
  FourPillars,
  HiddenStem,
  IChartCalculator,
  SixtyCycle,
  StemBranchPair,
} from "./types";
import { ChartCalculationError } from "./types";

export class FourPillarsCalculator implements IChartCalculator {
  /**
   * 计算四柱八字
   */
  async calculateFourPillars(
    input: ChartCalculationInput,
    context?: ChartTimeContext
  ): Promise<FourPillars> {
    assertGregorianChartInput(input);
    try {
      // 0. 验证输入参数
      this.validateInput(input);

      // 1. 转换时间对象
      const { solarTime } = context ?? buildChartTimeContext(input);

      // 2. 计算八字（基于具体时辰）
      // 注意：tyme4ts 的 LunarDay 不提供 getEightChar()
      // 需从 SolarTime 获取对应的 LunarHour 再取八字
      const eightChar = solarTime.getLunarHour().getEightChar() as EightChar;

      // 3. 构建四柱
      const fourPillars: FourPillars = {
        year: this.createPillar(eightChar.getYear(), "year", 0),
        month: this.createPillar(eightChar.getMonth(), "month", 1),
        day: this.createPillar(eightChar.getDay(), "day", 2),
        hour: this.createPillar(eightChar.getHour(), "hour", 3),

        // 计算附加信息
        dayMaster: eightChar.getDay().getHeavenStem().getName() as StemName,
        monthOrder:
          MONTH_ORDER_ELEMENTS[eightChar.getMonth().getEarthBranch().getName() as BranchName],
        season: SEASON_MAP[eightChar.getMonth().getEarthBranch().getName() as BranchName],

        // 初始化统计
        elementCount: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
        tenGodCount: {
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
        },
        hiddenStemCount: { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 },
      };

      // 4. 计算统计信息
      this.calculateStatistics(fourPillars);

      return fourPillars;
    } catch (error) {
      throw new ChartCalculationError(
        `四柱计算失败: ${error instanceof Error ? error.message : "未知错误"}`,
        "FOUR_PILLARS_CALCULATION_ERROR",
        input
      );
    }
  }

  /**
   * 创建柱对象
   */
  private createPillar(
    sixtyCycle: SixtyCycle,
    pillarType: "year" | "month" | "day" | "hour",
    pillarIndex: number
  ): StemBranchPair {
    const stem = sixtyCycle.getHeavenStem().getName() as StemName;
    const branch = sixtyCycle.getEarthBranch().getName() as BranchName;

    const element = STEM_ELEMENTS[stem];
    const branchElement = BRANCH_ELEMENTS[branch];
    const stemBranchKey = `${stem}${branch}`;
    const naYin = NAYIN_TABLE[stemBranchKey];

    // 验证元素存在，防止运行时错误
    if (!element || !branchElement) {
      throw new ChartCalculationError(
        `无效的干支组合: ${stem}, ${branch}`,
        "INVALID_STEM_BRANCH_ERROR",
        { stem, branch }
      );
    }

    const ganZhi = sixtyCycle.toString();

    const pillar: StemBranchPair = {
      stem,
      branch,
      ganZhi,
      naYin: naYin || "未知",
      element,
      branchElement,
      hiddenStems: this.calculateHiddenStems(branch),
      pillarType,
      pillarIndex,
    };

    return pillar;
  }

  /**
   * 计算地支藏干
   */
  private calculateHiddenStems(branch: BranchName): HiddenStem[] {
    const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
    if (!hiddenStems) {
      throw new ChartCalculationError(
        `无法找到地支 ${branch} 的藏干信息`,
        "HIDDEN_STEM_NOT_FOUND",
        { branch }
      );
    }

    // 深拷贝藏干数据，避免修改原始数据
    return hiddenStems.map((stem) => ({
      ...stem,
    }));
  }

  /**
   * 计算统计信息
   */
  private calculateStatistics(fourPillars: FourPillars): void {
    const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];

    // 重置计数器
    fourPillars.elementCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    fourPillars.hiddenStemCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

    pillars.forEach((pillar) => {
      // 统计天干五行
      if (pillar.element) {
        fourPillars.elementCount[pillar.element]++;
      }

      // 统计地支本气五行
      if (pillar.branchElement) {
        fourPillars.elementCount[pillar.branchElement]++;
      }

      // 统计藏干五行
      pillar.hiddenStems?.forEach((hiddenStem) => {
        fourPillars.hiddenStemCount[hiddenStem.element] += hiddenStem.weight;
      });
    });
  }

  /**
   * 验证输入参数
   */
  private validateInput(input: ChartCalculationInput): void {
    if (!input.year || input.year < 1900 || input.year > 2100) {
      throw new ChartCalculationError("年份必须在1900-2100之间", "INVALID_YEAR", input);
    }

    if (!input.month || input.month < 1 || input.month > 12) {
      throw new ChartCalculationError("月份必须在1-12之间", "INVALID_MONTH", input);
    }

    if (!input.day || input.day < 1 || input.day > 31) {
      throw new ChartCalculationError("日期必须在1-31之间", "INVALID_DAY", input);
    }

    if (input.hour < 0 || input.hour > 23) {
      throw new ChartCalculationError("小时必须在0-23之间", "INVALID_HOUR", input);
    }

    if (input.minute && (input.minute < 0 || input.minute > 59)) {
      throw new ChartCalculationError("分钟必须在0-59之间", "INVALID_MINUTE", input);
    }

    if (!["male", "female"].includes(input.gender)) {
      throw new ChartCalculationError("性别必须是male或female", "INVALID_GENDER", input);
    }
  }

  /**
   * 获取日主信息
   */
  getDayMasterInfo(fourPillars: FourPillars): {
    stem: string;
    element: string;
    season: string;
    monthOrder: string;
    isInSeason: boolean;
  } {
    const dayMaster = fourPillars.dayMaster;
    const dayMasterElement = STEM_ELEMENTS[dayMaster];
    const monthOrder = fourPillars.monthOrder;
    const season = fourPillars.season;

    // 判断日主是否当令
    const isInSeason = dayMasterElement === monthOrder;

    return {
      stem: dayMaster,
      element: dayMasterElement,
      season,
      monthOrder,
      isInSeason,
    };
  }

  /**
   * 获取四柱干支数组
   */
  getFourPillarsArray(fourPillars: FourPillars): string[] {
    return [
      fourPillars.year.stem,
      fourPillars.year.branch,
      fourPillars.month.stem,
      fourPillars.month.branch,
      fourPillars.day.stem,
      fourPillars.day.branch,
      fourPillars.hour.stem,
      fourPillars.hour.branch,
    ];
  }

  /**
   * 获取所有天干
   */
  getAllStems(fourPillars: FourPillars): StemName[] {
    return [
      fourPillars.year.stem,
      fourPillars.month.stem,
      fourPillars.day.stem,
      fourPillars.hour.stem,
    ];
  }

  /**
   * 获取所有地支
   */
  getAllBranches(fourPillars: FourPillars): BranchName[] {
    return [
      fourPillars.year.branch,
      fourPillars.month.branch,
      fourPillars.day.branch,
      fourPillars.hour.branch,
    ];
  }

  /**
   * 检查是否有特定干支组合
   */
  hasStemBranchCombination(fourPillars: FourPillars, stem: string, branch: string): boolean {
    const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour];
    return pillars.some((pillar) => pillar.stem === stem && pillar.branch === branch);
  }

  /**
   * 获取柱位名称
   */
  getPillarName(index: number): string {
    const names = ["年柱", "月柱", "日柱", "时柱"];
    return names[index] || "未知柱";
  }

  /**
   * 检查透干情况
   */
  checkStemTransparency(fourPillars: FourPillars): {
    transparent: Array<{ stem: StemName; positions: string[] }>;
    hidden: Array<{ stem: StemName; branches: string[] }>;
  } {
    const stems = this.getAllStems(fourPillars);
    const branches = this.getAllBranches(fourPillars);

    const transparent: Array<{ stem: StemName; positions: string[] }> = [];
    const hidden: Array<{ stem: StemName; branches: string[] }> = [];

    // 统计所有可能的干支
    const stemSet = new Set(stems);
    const allHiddenStems = new Set<StemName>();

    // 收集所有藏干
    branches.forEach((branch: BranchName) => {
      const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
      if (hiddenStems) {
        hiddenStems.forEach((hiddenStem: HiddenStem) => {
          allHiddenStems.add(hiddenStem.stem);
        });
      }
    });

    // 分析透干情况
    stemSet.forEach((stem) => {
      const positions: string[] = [];
      stems.forEach((s, index) => {
        if (s === stem) {
          positions.push(this.getPillarName(index));
        }
      });

      if (positions.length > 0) {
        transparent.push({ stem, positions });
      }
    });

    // 分析藏而不透的情况
    allHiddenStems.forEach((hiddenStem) => {
      if (!stemSet.has(hiddenStem)) {
        const branchPositions: string[] = [];
        branches.forEach((branch: BranchName, index) => {
          const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
          if (hiddenStems?.some((hs: HiddenStem) => hs.stem === hiddenStem)) {
            branchPositions.push(this.getPillarName(index));
          }
        });

        if (branchPositions.length > 0) {
          hidden.push({ stem: hiddenStem, branches: branchPositions });
        }
      }
    });

    return { transparent, hidden };
  }
}
