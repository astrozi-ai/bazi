/**
 * The 7 × 13 排盘 sheet, cell for cell: the main table, 起运, 神煞 and the 大运 / 流年 / 流月
 * rows for the birth year, the first 大运 year, a mid year and the last selectable year.
 */
import { describe, expect, it } from "bun:test";
import { ChartUtils } from "../../chart";
import type { ChartCalculationInput } from "../../chart/types";
import { BAZI_FORTUNE_INITIAL_STATE, buildBaziFortuneRows, buildBaziPaipanView, selectBaziPaipanYear } from "../index";
import golden from "./fixtures/synthetic/paipan.golden.json";

describe("排盘 view reproduces the sheet it was ported from", () => {
  for (const entry of golden.cases) {
    it(entry.label, async () => {
      const chart = await ChartUtils.calculateFullChart(entry.input as ChartCalculationInput);
      const view = buildBaziPaipanView(chart, entry.options);
      expect(view.yearRange).toEqual(entry.yearRange);
      expect(view.fortune as unknown).toEqual(entry.fortune);
      expect(view.glyphs as unknown).toEqual(entry.glyphs);
      for (const { year, selection, rows } of entry.selections) {
        expect(selectBaziPaipanYear(view, year) as unknown).toEqual(selection);
        expect(buildBaziFortuneRows(view, year, BAZI_FORTUNE_INITIAL_STATE) as unknown).toEqual(rows);
      }
    });
  }
});

describe("the sheet fails closed", () => {
  it("refuses a year outside the selectable range", async () => {
    const [first] = golden.cases;
    if (!first) throw new Error("golden has no case");
    const view = buildBaziPaipanView(await ChartUtils.calculateFullChart(first.input as ChartCalculationInput), first.options);
    expect(() => selectBaziPaipanYear(view, view.yearRange.to + 1)).toThrow();
  });
});
