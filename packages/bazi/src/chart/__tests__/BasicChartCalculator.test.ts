/**
 * 基础排盘计算器测试
 *
 * 源自 AstroZi 排盘引擎的同名测试，断言逐条保留。引擎只收公历（农历由输入层换算，
 * 见 `chart-time-input.test.ts`）：ChartUtils 组的 1985-12-25 按公历算，该组只断言
 * 字段存在。
 */

import { afterEach, beforeEach, describe, expect, it, setSystemTime } from "bun:test";
import type { GenderType } from "../../core-types";
import { BasicChartCalculator, type ChartCalculationInput, ChartUtils } from "../index";

afterEach(() => {
  setSystemTime();
});

describe("BasicChartCalculator", () => {
  let calculator: BasicChartCalculator;

  beforeEach(() => {
    calculator = new BasicChartCalculator();
  });

  const testInput: ChartCalculationInput = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    gender: "male",
  };

  describe("calculateBasicChart", () => {
    it("应该成功计算基础排盘", async () => {
      const result = await calculator.calculateBasicChart(testInput);

      expect(result).toBeDefined();
      expect(result.fourPillars).toBeDefined();
      expect(result.fourPillars.dayMaster).toBeTruthy();
      expect(result.calculationTime).toBeGreaterThanOrEqual(0);
      expect(result.algorithm).toBeTruthy();
    });

    it("应该包含四柱信息", async () => {
      const result = await calculator.calculateBasicChart(testInput);

      const { fourPillars } = result;
      expect(fourPillars.year).toBeDefined();
      expect(fourPillars.month).toBeDefined();
      expect(fourPillars.day).toBeDefined();
      expect(fourPillars.hour).toBeDefined();

      expect(fourPillars.year.stem).toBeTruthy();
      expect(fourPillars.year.branch).toBeTruthy();
      expect(fourPillars.dayMaster).toBeTruthy();
      expect(fourPillars.season).toBeTruthy();
    });

    it("应该正确计算十神信息", async () => {
      const result = await calculator.calculateBasicChart(testInput, {
        includeTenGods: true,
      });

      expect(result.tenGodAnalysis).toBeDefined();
      expect(result.tenGodAnalysis.dayMaster).toBeTruthy();
      expect(result.tenGodAnalysis.summary).toBeDefined();
      expect(result.tenGodAnalysis.summary.strongest).toBeTruthy();
    });

    it("应该正确计算大运信息", async () => {
      const result = await calculator.calculateBasicChart(testInput, {
        includeMajorPeriods: true,
      });

      expect(result.majorPeriods).toBeDefined();
      expect(result.majorPeriods?.periods).toBeInstanceOf(Array);
      expect(result.majorPeriods?.periods.length ?? 0).toBeGreaterThan(0);
      expect(result.majorPeriods?.direction).toBeTruthy();
    });

    it("Given backward dayun exceeds one stem cycle When calculating 12 periods Then every period has a stem and branch", async () => {
      const result = await calculator.calculateBasicChart(
        {
          year: 1981,
          month: 6,
          day: 17,
          hour: 19,
          minute: 0,
          gender: "male",
        },
        {
          includeMajorPeriods: true,
          majorPeriodCount: 12,
          asOfContext: { asOfYear: 2022, source: "contest_cutoff" },
        },
      );

      const periods = result.majorPeriods?.periods ?? [];
      expect(result.majorPeriods?.direction).toBe("backward");
      expect(periods).toHaveLength(12);
      expect(periods.every((period) => period.stem && period.branch)).toBe(true);
      expect(periods[10]).toMatchObject({ stem: "癸", branch: "未" });
      expect(periods[11]).toMatchObject({ stem: "壬", branch: "午" });
    });

    it("在未显式传入 asOfContext 时应该保持 runtime-current 语义", async () => {
      try {
        setSystemTime(new Date(Date.UTC(2026, 5, 1)));
        const implicit = await calculator.calculateBasicChart(testInput, {
          includeMajorPeriods: true,
        });
        const explicit = await calculator.calculateBasicChart(testInput, {
          includeMajorPeriods: true,
          asOfContext: {
            asOfYear: 2026,
            asOfMonth: 6,
            asOfDay: 1,
            source: "runtime_current",
          },
        });

        expect(implicit.majorPeriods?.currentPeriod).toEqual(explicit.majorPeriods?.currentPeriod);
        expect(implicit.majorPeriods?.nextPeriod).toEqual(explicit.majorPeriods?.nextPeriod);
      } finally {
        setSystemTime();
      }
    });

    it("应该正确计算纳音信息", async () => {
      const result = await calculator.calculateBasicChart(testInput, {
        includeNaYin: true,
      });

      const naYin = result.naYin;
      expect(naYin).toBeDefined();
      if (!naYin) return;
      expect(naYin.dayMasterNaYin).toBeTruthy();
      expect(naYin.element).toBeTruthy();
      expect(naYin.characteristics).toBeInstanceOf(Array);
    });
  });

  describe("calculateFourPillarsOnly", () => {
    it("应该快速计算四柱", async () => {
      const result = await calculator.calculateFourPillarsOnly(testInput);

      expect(result.fourPillars).toBeDefined();
      expect(result.calculationTime).toBeGreaterThanOrEqual(0);
      expect(result.calculationTime).toBeLessThan(100); // 应该很快
    });
  });

  describe("getChartSummary", () => {
    it("应该生成排盘摘要", async () => {
      const result = await calculator.calculateBasicChart(testInput, {
        includeTenGods: true,
      });

      const summary = calculator.getChartSummary(result);

      expect(summary.dayMaster).toBeTruthy();
      expect(summary.dayMasterElement).toBeTruthy();
      expect(summary.season).toBeTruthy();
      expect(summary.strongestTenGod).toBeTruthy();
      expect(summary.description).toBeTruthy();
    });
  });

  describe("checkSpecialPatterns", () => {
    it("应该检查特殊格局", async () => {
      const result = await calculator.calculateBasicChart(testInput, {
        includeTenGods: true,
      });

      const patterns = calculator.checkSpecialPatterns(result);

      expect(patterns).toBeDefined();
      expect(patterns.hasSpecialPattern).toBeDefined();
      expect(patterns.patterns).toBeInstanceOf(Array);
    });
  });

  describe("输入验证", () => {
    it("应该拒绝无效年份", async () => {
      const invalidInput = { ...testInput, year: 1800 };

      await expect(calculator.calculateBasicChart(invalidInput)).rejects.toThrow("输入验证失败");
    });

    it("应该拒绝无效月份", async () => {
      const invalidInput = { ...testInput, month: 13 };

      await expect(calculator.calculateBasicChart(invalidInput)).rejects.toThrow("输入验证失败");
    });

    it("应该拒绝无效性别", async () => {
      const invalidInput = { ...testInput, gender: "unknown" as GenderType };

      await expect(calculator.calculateBasicChart(invalidInput)).rejects.toThrow("输入验证失败");
    });
  });
});

describe("ChartUtils", () => {
  const testInput: ChartCalculationInput = {
    year: 1985,
    month: 12,
    day: 25,
    hour: 8,
    gender: "female",
  };

  describe("createBasicCalculator", () => {
    it("应该创建计算器实例", () => {
      const calculator = ChartUtils.createBasicCalculator();
      expect(calculator).toBeInstanceOf(BasicChartCalculator);
    });
  });

  describe("calculateQuickChart", () => {
    it("应该快速计算排盘", async () => {
      const result = await ChartUtils.calculateQuickChart(testInput);

      expect(result).toBeDefined();
      expect(result.fourPillars).toBeDefined();
      expect(result.tenGodAnalysis).toBeDefined();
      expect(result.majorPeriods).toBeUndefined(); // 快速模式不包含大运
      expect(result.naYin).toBeUndefined(); // 快速模式不包含纳音
    });
  });

  describe("calculateFullChart", () => {
    it("应该计算完整排盘", async () => {
      const result = await ChartUtils.calculateFullChart(testInput);

      expect(result).toBeDefined();
      expect(result.fourPillars).toBeDefined();
      expect(result.tenGodAnalysis).toBeDefined();
      expect(result.majorPeriods).toBeDefined();
      expect(result.naYin).toBeDefined();
    });
  });

  describe("calculateFourPillarsOnly", () => {
    it("应该仅计算四柱", async () => {
      const result = await ChartUtils.calculateFourPillarsOnly(testInput);

      expect(result.fourPillars).toBeDefined();
      expect(result.calculationTime).toBeGreaterThan(0);
    });
  });
});

describe("性能测试", () => {
  const testInput: ChartCalculationInput = {
    year: 1990,
    month: 6,
    day: 15,
    hour: 12,
    gender: "male",
  };

  it("单次计算应该在合理时间内完成", async () => {
    const startTime = performance.now();
    await ChartUtils.calculateFullChart(testInput);
    const endTime = performance.now();

    const calculationTime = endTime - startTime;
    expect(calculationTime).toBeLessThan(200); // 应该在200ms内完成
  });

  it("批量计算应该保持稳定性能", async () => {
    const iterations = 10;
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await ChartUtils.calculateQuickChart(testInput);
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const maxTime = Math.max(...times);

    expect(avgTime).toBeLessThan(100); // 平均时间应该很快
    expect(maxTime).toBeLessThan(200); // 最大时间也应该合理
  });
});
