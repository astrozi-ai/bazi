/**
 * 排盘输入的历法边界。
 *
 * 引擎只收公历出生时刻。农历（含闰月）由输入层在边界用 tyme4ts 换算一次，core 见到
 * `isLunar`／`isLeapMonth` 非缺省、非 false 就抛 `LUNAR_INPUT_UNSUPPORTED`，从不把
 * 农历数字当公历算。
 */

import { describe, expect, it } from "bun:test";
import { LunarDay } from "tyme4ts";
import { BasicChartCalculator, ChartUtils, FourPillarsCalculator, MajorPeriodCalculator } from "../index";
import { type ChartCalculationInput, ChartCalculationError } from "../types";

const calculator = new BasicChartCalculator();
const NOON_MALE = { hour: 12, minute: 0, second: 0, gender: "male" as const };

function pillarsOf(result: Awaited<ReturnType<BasicChartCalculator["calculateBasicChart"]>>): string {
  const { year, month, day, hour } = result.fourPillars;
  return [year, month, day, hour].map((pillar) => `${pillar.stem}${pillar.branch}`).join(" ");
}

/** 未声明的历法标记只能以无类型输入的形式出现：这正是 guard 要拦的调用方。 */
function untyped(input: Record<string, unknown>): ChartCalculationInput {
  return input as unknown as ChartCalculationInput;
}

async function expectLunarRefused(run: () => Promise<unknown>): Promise<void> {
  let caught: unknown;
  try {
    await run();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(ChartCalculationError);
  expect((caught as ChartCalculationError).code).toBe("LUNAR_INPUT_UNSUPPORTED");
}

async function codeOf(run: () => Promise<unknown>): Promise<string | undefined> {
  try {
    await run();
    return undefined;
  } catch (error) {
    return (error as ChartCalculationError).code;
  }
}

describe("农历输入在每个公开入口都按具名码拒收", () => {
  const leap = untyped({ year: 1990, month: 5, day: 10, ...NOON_MALE, isLunar: true, isLeapMonth: true });

  it("BasicChartCalculator.calculateBasicChart", async () => {
    await expectLunarRefused(() => calculator.calculateBasicChart(leap));
  });

  it("BasicChartCalculator.calculateFourPillarsOnly 与 ChartUtils.calculateFullChart", async () => {
    await expectLunarRefused(() => calculator.calculateFourPillarsOnly(leap));
    await expectLunarRefused(() => ChartUtils.calculateFullChart(leap));
  });

  it("FourPillarsCalculator 与 MajorPeriodCalculator（带不带 context 都拒）", async () => {
    const gregorian = await calculator.calculateBasicChart({ year: 1990, month: 7, day: 2, ...NOON_MALE });
    await expectLunarRefused(() => new FourPillarsCalculator().calculateFourPillars(leap));
    await expectLunarRefused(() => new MajorPeriodCalculator().calculateMajorPeriods(gregorian.fourPillars, leap));
  });

  it("关掉 validateInput 也拒：guard 不归输入校验管", async () => {
    await expectLunarRefused(() => calculator.calculateBasicChart(leap, { validateInput: false }));
  });
});

describe("闰月农历：拒收；Host 换算后得到正确的盘", () => {
  it("农历 1990 闰五月初十 → 拒（改码前算成平月五月初十的 庚午 辛巳 戊戌 戊午）", async () => {
    await expectLunarRefused(() =>
      calculator.calculateBasicChart(untyped({ year: 1990, month: 5, day: 10, ...NOON_MALE, isLunar: true, isLeapMonth: true })),
    );
  });

  it("Host 换算：闰五月初十 = 公历 1990-07-02 → 庚午 壬午 戊辰 戊午，大运顺排 1.7359 起 癸未 甲申 乙酉", async () => {
    // tyme4ts 以负月表示闰月；这一步属于 Host，这里只作契约说明。
    const solar = LunarDay.fromYmd(1990, -5, 10).getSolarDay();
    expect([solar.getYear(), solar.getMonth(), solar.getDay()]).toEqual([1990, 7, 2]);
    const result = await calculator.calculateBasicChart({ year: 1990, month: 7, day: 2, ...NOON_MALE });
    expect(pillarsOf(result)).toBe("庚午 壬午 戊辰 戊午");
    expect(result.majorPeriods?.direction).toBe("forward");
    expect(result.majorPeriods?.startAgeExact).toBe(1.7359);
    expect(result.majorPeriods?.periods.slice(0, 3).map((period) => `${period.stem}${period.branch}`)).toEqual([
      "癸未",
      "甲申",
      "乙酉",
    ]);
    expect(result.solarDate).toEqual({ year: 1990, month: 7, day: 2, hour: 12, minute: 0 });
  });
});

describe("平月农历：拒收；Host 换算后 solarDate 是公历", () => {
  it("农历 1990 五月初十（无闰月标记）→ 拒", async () => {
    await expectLunarRefused(() =>
      calculator.calculateBasicChart(untyped({ year: 1990, month: 5, day: 10, ...NOON_MALE, isLunar: true })),
    );
  });

  it("Host 换算：五月初十 = 公历 1990-06-02 → 庚午 辛巳 戊戌 戊午，solarDate 为该日正午", async () => {
    const solar = LunarDay.fromYmd(1990, 5, 10).getSolarDay();
    expect([solar.getYear(), solar.getMonth(), solar.getDay()]).toEqual([1990, 6, 2]);
    const result = await calculator.calculateBasicChart({ year: 1990, month: 6, day: 2, ...NOON_MALE });
    expect(pillarsOf(result)).toBe("庚午 辛巳 戊戌 戊午");
    expect(result.solarDate).toEqual({ year: 1990, month: 6, day: 2, hour: 12, minute: 0 });
  });
});

describe("不存在的日期", () => {
  it("农历 1990 闰四月初十不存在 → 拒（改码前静默出 庚午 庚辰 己巳 庚午）", async () => {
    expect(() => LunarDay.fromYmd(1990, -4, 10)).toThrow("illegal leap month 4");
    await expectLunarRefused(() =>
      calculator.calculateBasicChart(untyped({ year: 1990, month: 4, day: 10, ...NOON_MALE, isLunar: true, isLeapMonth: true })),
    );
  });

  it("公历 2023-02-29 → BASIC_CHART_CALCULATION_ERROR；公历 1990-04-31 → INVALID_INPUT（钉现状）", async () => {
    expect(await codeOf(() => calculator.calculateBasicChart({ year: 2023, month: 2, day: 29, ...NOON_MALE }))).toBe(
      "BASIC_CHART_CALCULATION_ERROR",
    );
    expect(await codeOf(() => calculator.calculateBasicChart({ year: 1990, month: 4, day: 31, ...NOON_MALE }))).toBe(
      "INVALID_INPUT",
    );
  });
});

describe("历法标记的取值", () => {
  it("显式 isLunar: false、isLeapMonth: false 照常出盘（输入层就是这样送的）", async () => {
    const result = await calculator.calculateBasicChart(
      untyped({ year: 1990, month: 6, day: 2, ...NOON_MALE, isLunar: false, isLeapMonth: false }),
    );
    expect(pillarsOf(result)).toBe("庚午 辛巳 戊戌 戊午");
  });

  it("非布尔或单独的闰月标记一律拒", async () => {
    const base = { year: 1990, month: 6, day: 2, ...NOON_MALE };
    for (const flags of [{ isLunar: "true" }, { isLunar: null }, { isLunar: 1 }, { isLeapMonth: true }, { isLunar: false, isLeapMonth: true }]) {
      await expectLunarRefused(() => calculator.calculateBasicChart(untyped({ ...base, ...flags })));
    }
  });

  it("结果不再带 lunarDate", async () => {
    const result = await calculator.calculateBasicChart({ year: 1990, month: 6, day: 2, ...NOON_MALE });
    expect("lunarDate" in result).toBe(false);
  });
});
