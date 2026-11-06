/**
 * 边界盘回归：节气交接前后、子时换日、闰月、年份上下限。
 *
 * golden 由迁出前的排盘引擎对同一批合成输入生成；本包必须逐字段复现 solarDate、纳音、
 * 起运细节与 ChartSnapshot。
 */
import { describe, expect, it } from "bun:test";
import { toChartSnapshot } from "../../snapshot/chart-snapshot";
import { BasicChartCalculator } from "../index";
import type { ChartCalculationInput } from "../types";
import golden from "./fixtures/synthetic/boundaries.golden.json";

const calculator = new BasicChartCalculator();
const conventions = golden.conventions as Parameters<typeof toChartSnapshot>[1];

describe("边界盘与迁出前的引擎逐字段相同", () => {
  for (const entry of golden.cases) {
    it(entry.label, async () => {
      const result = await calculator.calculateBasicChart(entry.input as ChartCalculationInput, {
        includeNaYin: true,
        includeMajorPeriods: true,
      });
      expect(result.solarDate).toEqual(entry.solarDate);
      expect(result.naYin as unknown).toEqual(entry.naYin);
      expect(result.qiyunDetail as unknown).toEqual(entry.qiyunDetail);
      expect(toChartSnapshot(result, conventions) as unknown).toEqual(entry.snapshot);
    });
  }
});
