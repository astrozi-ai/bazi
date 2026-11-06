/**
 * ChartSnapshot 投影测试：两种 inputKind 各一条完整路径，加上 schema 的 fail-closed 面。
 */

import { describe, expect, test } from "bun:test";
import { ChartUtils } from "../chart";
import type { ChartCalculationInput, FourPillars } from "../chart/types";
import {
  type CalculationConventions,
  chartSnapshotSchema,
  fourPillarsToChartSnapshot,
  toChartSnapshot,
} from "./chart-snapshot";

const CONVENTIONS: CalculationConventions = {
  calendar: "gregorian",
  timezone: "Asia/Shanghai",
  trueSolarTimePolicy: "none",
  dayBoundaryRule: "zi-hour-23",
  qiyunMethod: "tyme4ts-child-limit",
};

const BIRTH_INPUT: ChartCalculationInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "male",
};

/**
 * 与 BIRTH_INPUT 同盘的四柱，手写为字面量：四柱输入这一侧不经过 BasicChartCalculator，
 * 也就不需要出生日期。等值由下面的 "两种 inputKind 的柱与根一致" 一条守住。
 */
const FOUR_PILLARS: FourPillars = {
  year: { stem: "庚", branch: "午", ganZhi: "庚午" },
  month: { stem: "辛", branch: "巳", ganZhi: "辛巳" },
  day: { stem: "庚", branch: "辰", ganZhi: "庚辰" },
  hour: { stem: "癸", branch: "未", ganZhi: "癸未" },
  dayMaster: "庚",
  monthOrder: "火",
  season: "夏",
  elementCount: { 木: 0, 火: 2, 土: 2, 金: 3, 水: 1 },
  tenGodCount: {
    比肩: 2,
    劫财: 1,
    食神: 0,
    伤官: 2,
    偏财: 0,
    正财: 2,
    七杀: 1,
    正官: 2,
    偏印: 2,
    正印: 2,
  },
  hiddenStemCount: { 木: 0.8, 火: 2.3, 土: 2.8, 金: 0.3, 水: 0.5 },
};

describe("toChartSnapshot — inputKind: birth", () => {
  test("投影出四柱、藏干、十神、根气与岁运输入，并通过 schema", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const snapshot = toChartSnapshot(result, CONVENTIONS);

    expect(chartSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.schemaVersion).toBe(1);
    expect(snapshot.inputKind).toBe("birth");
    expect(snapshot.dayMaster).toBe("庚");
    expect(snapshot.pillars).toHaveLength(4);
    expect(snapshot.pillars.map((pillar) => pillar.pillar)).toEqual([
      "year",
      "month",
      "day",
      "hour",
    ]);
  });

  test("计算约定原样带出，不被 result.options 覆盖或推断", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const snapshot = toChartSnapshot(result, CONVENTIONS);
    expect(snapshot.calculationConventions).toEqual(CONVENTIONS);

    const other: CalculationConventions = {
      ...CONVENTIONS,
      trueSolarTimePolicy: "longitude-corrected",
      dayBoundaryRule: "late-zi-same-day",
    };
    expect(toChartSnapshot(result, other).calculationConventions).toEqual(other);
  });

  test("出生输入完整保留，缺省的秒补 0", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const snapshot = toChartSnapshot(result, CONVENTIONS);
    expect(snapshot.birthInput).toEqual({
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      second: 0,
      gender: "male",
    });
  });

  test("occurrence id 覆盖每个干、支与藏干，且全局唯一", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const snapshot = toChartSnapshot(result, CONVENTIONS);

    const ids: string[] = [];
    for (const pillar of snapshot.pillars) {
      ids.push(pillar.stem.occurrenceId, pillar.branch.occurrenceId);
      for (const hidden of pillar.branch.hiddenStems) ids.push(hidden.occurrenceId);
    }
    for (const dayun of snapshot.luck?.dayun ?? []) {
      ids.push(dayun.stem.occurrenceId, dayun.branch.occurrenceId);
      for (const hidden of dayun.branch.hiddenStems) ids.push(hidden.occurrenceId);
    }

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("year.stem");
    expect(ids).toContain("day.branch");
    expect(ids).toContain("month.branch.hidden.0");
    expect(ids).toContain("dayun.1.stem");

    const day = snapshot.pillars.find((pillar) => pillar.pillar === "day");
    expect(day?.stem).toEqual({
      occurrenceId: "day.stem",
      stem: "庚",
      element: "金",
      tenGod: "比肩",
    });
    // 辰藏 戊(本气) 乙(余气) 癸(中气)，occurrence 顺序即藏干顺序
    expect(day?.branch.hiddenStems.map((hidden) => hidden.occurrenceId)).toEqual([
      "day.branch.hidden.0",
      "day.branch.hidden.1",
      "day.branch.hidden.2",
    ]);
    expect(day?.branch.hiddenStems.map((hidden) => hidden.stem)).toEqual(["戊", "乙", "癸"]);
    expect(day?.branch.hiddenStems.map((hidden) => hidden.role)).toEqual([
      "primary",
      "tertiary",
      "secondary",
    ]);
    expect(day?.branch.hiddenStems.map((hidden) => hidden.tenGod)).toEqual([
      "偏印",
      "正财",
      "伤官",
    ]);
  });

  test("根气按 occurrence 指到具体藏干位置", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const snapshot = toChartSnapshot(result, CONVENTIONS);

    expect(snapshot.roots).toHaveLength(4);
    const dayRoot = snapshot.roots.find((root) => root.stemOccurrenceId === "day.stem");
    expect(dayRoot?.stem).toBe("庚");
    expect(dayRoot?.element).toBe("金");
    // 庚金在本盘只有巳中庚一处金根
    expect(dayRoot?.rootedIn).toEqual([
      {
        branchOccurrenceId: "month.branch",
        hiddenStemOccurrenceId: "month.branch.hidden.2",
        branch: "巳",
        hiddenStem: "庚",
        role: "tertiary",
        sameStem: true,
      },
    ]);

    const hourRoot = snapshot.roots.find((root) => root.stemOccurrenceId === "hour.stem");
    expect(hourRoot?.stem).toBe("癸");
    // 癸水的根都是水藏干，且同字的那处被标出来
    expect(hourRoot?.rootedIn.every((root) => root.hiddenStem === "癸")).toBe(true);
    expect(hourRoot?.rootedIn.some((root) => root.sameStem)).toBe(true);
    expect(hourRoot?.rootedIn.map((root) => root.hiddenStemOccurrenceId)).toContain(
      "day.branch.hidden.2",
    );
  });

  test("岁运输入带出大运列表，流年在此投影下为 null", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const snapshot = toChartSnapshot(result, CONVENTIONS);

    expect(snapshot.luck?.direction).toBe("forward");
    expect(snapshot.luck?.startAge).toBe(7);
    expect(snapshot.luck?.dayun).toHaveLength(8);
    expect(snapshot.luck?.dayun[0]).toMatchObject({
      index: 1,
      startAge: 7,
      endAge: 16,
    });
    expect(snapshot.luck?.dayun[0]?.stem.stem).toBe("壬");
    expect(snapshot.luck?.dayun[0]?.branch.branch).toBe("午");
    expect(snapshot.luck?.annual).toBeNull();
  });

  test("不算大运时 luck 为 null，而不是空壳", async () => {
    const result = await ChartUtils.calculateQuickChart(BIRTH_INPUT);
    expect(toChartSnapshot(result, CONVENTIONS).luck).toBeNull();
  });
});

describe("fourPillarsToChartSnapshot — inputKind: four-pillars", () => {
  test("不需要出生日期，birthInput 为 null 且 luck 为 null", () => {
    const snapshot = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    expect(chartSnapshotSchema.safeParse(snapshot).success).toBe(true);
    expect(snapshot.inputKind).toBe("four-pillars");
    expect(snapshot.birthInput).toBeNull();
    expect(snapshot.luck).toBeNull();
    expect(snapshot.dayMaster).toBe("庚");
  });

  test("两种 inputKind 的柱与根一致（同一盘的两个入口不产生两套事实）", async () => {
    const result = await ChartUtils.calculateFullChart(BIRTH_INPUT);
    const fromBirth = toChartSnapshot(result, CONVENTIONS);
    const fromPillars = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    expect(fromPillars.pillars).toEqual(fromBirth.pillars);
    expect(fromPillars.roots).toEqual(fromBirth.roots);
  });
});

describe("schema 失败面", () => {
  test("四柱快照不得携带出生日期", () => {
    const snapshot = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    const parsed = chartSnapshotSchema.safeParse({
      ...snapshot,
      birthInput: {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
        gender: "male",
      },
    });
    expect(parsed.success).toBe(false);
  });

  test("出生快照必须带出生日期", () => {
    const snapshot = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    expect(chartSnapshotSchema.safeParse({ ...snapshot, inputKind: "birth" }).success).toBe(false);
  });

  test("计算约定缺项直接失败，不补默认值", () => {
    const snapshot = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    for (const key of [
      "calendar",
      "timezone",
      "trueSolarTimePolicy",
      "dayBoundaryRule",
      "qiyunMethod",
    ] as const) {
      const conventions: Record<string, unknown> = { ...snapshot.calculationConventions };
      delete conventions[key];
      const parsed = chartSnapshotSchema.safeParse({
        ...snapshot,
        calculationConventions: conventions,
      });
      expect(parsed.success).toBe(false);
    }
  });

  test("时区必须是 IANA 名，不接受偏移写法", () => {
    const snapshot = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    for (const timezone of ["UTC+8", "+08:00", "", "Asia"]) {
      const parsed = chartSnapshotSchema.safeParse({
        ...snapshot,
        calculationConventions: { ...snapshot.calculationConventions, timezone },
      });
      expect(parsed.success).toBe(false);
    }
  });

  test("未知字段被拒绝（strict），流派判定进不来", () => {
    const snapshot = fourPillarsToChartSnapshot(FOUR_PILLARS, CONVENTIONS);
    expect(
      chartSnapshotSchema.safeParse({ ...snapshot, bodyStrength: "strong" }).success,
    ).toBe(false);
  });
});
