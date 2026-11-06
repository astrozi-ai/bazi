import type { BasicChartResult } from "../chart/types";
import {
	buildDayunSpans,
	buildFortune,
	buildGlyphs,
	projectedDayunOf,
	requireMajorPeriods,
} from "./fortune";
import {
	buildPillarColumn,
	buildStemColumn,
	type ColumnContext,
	naYinOf,
	PAIPAN_PLACEHOLDER,
	stemElementOf,
} from "./pillar-column";
import { buildQiyun } from "./qiyun";
import {
	BAZI_PAIPAN_VIEW_VERSION,
	type BaziPaipanFortune,
	type BaziPaipanTable,
	type BaziPaipanView,
	type BuildBaziPaipanViewOptions,
} from "./types";
import { buildYears } from "./years";

function yearNaYinOf(chart: BasicChartResult): string {
	const { stem, branch } = chart.fourPillars.year;
	return chart.naYin?.year ?? naYinOf(stem, branch) ?? PAIPAN_PLACEHOLDER;
}

function columnContextOf(chart: BasicChartResult): ColumnContext {
	return { dayMaster: chart.fourPillars.day.stem, monthBranch: chart.fourPillars.month.branch };
}

function buildNatal(chart: BasicChartResult): BaziPaipanTable["natal"] {
	const { year, month, day, hour } = chart.fourPillars;
	const context = columnContextOf(chart);
	const dayNaYin = naYinOf(day.stem, day.branch) ?? PAIPAN_PLACEHOLDER;
	return {
		year: buildStemColumn(context, year.stem, year.branch, yearNaYinOf(chart)),
		month: buildStemColumn(context, month.stem, month.branch),
		day: buildPillarColumn({
			...context,
			stem: day.stem,
			branch: day.branch,
			mainStar: "日主",
			naYin: dayNaYin,
		}),
		hour: buildStemColumn(context, hour.stem, hour.branch),
	};
}

function buildTable(
	chart: BasicChartResult,
	birthYear: number,
	fortune: BaziPaipanFortune,
): BaziPaipanTable {
	const periods = requireMajorPeriods(chart);
	const context = columnContextOf(chart);
	const toColumn = (period: { stem: string; branch: string; naYin?: string }) =>
		buildStemColumn(context, period.stem, period.branch, period.naYin);
	return {
		natal: buildNatal(chart),
		dayunColumns: periods.periods.map(toColumn),
		projectedDayunColumns: projectedDayunOf(fortune).map(toColumn),
		qiyun: buildQiyun(chart, birthYear),
	};
}

/**
 * Selectable years: exactly the years with 流年 cells, birth year (the first 小运 or 大运 year)
 * through the last fortune 流年. "Today" may lie outside; `selectBaziPaipanDefaultYear` clamps it.
 */
function selectableRange(fortune: BaziPaipanFortune, birthYear: number) {
	const lastDayun = fortune.dayun[fortune.dayun.length - 1];
	return { from: birthYear, to: (lastDayun?.startYear ?? birthYear) + 9 };
}

/** The year-dependent part: selectable range and per-year entries. */
function buildTimeline(chart: BasicChartResult, fortune: BaziPaipanFortune) {
	const birthYear = chart.input.year;
	const yearRange = selectableRange(fortune, birthYear);
	const dayunSpans = buildDayunSpans(chart, fortune);
	const context = {
		chart,
		birthYear,
		column: columnContextOf(chart),
		yearNaYin: yearNaYinOf(chart),
		dayunSpans,
	};
	const years = buildYears(context, yearRange.from, yearRange.to);
	return { yearRange, years };
}

/**
 * Builds the serializable 排盘 view-model for a chart computed with major periods.
 * Pure: the only clock input is `options`; `majorPeriods.currentPeriod` is taken from the chart.
 */
export function buildBaziPaipanView(
	chart: BasicChartResult,
	options: BuildBaziPaipanViewOptions,
): BaziPaipanView {
	const birthYear = chart.input.year;
	const dayMaster = chart.fourPillars.day.stem;
	const fortune = buildFortune(chart);
	const table = buildTable(chart, birthYear, fortune);
	const timeline = buildTimeline(chart, fortune);
	return {
		version: BAZI_PAIPAN_VIEW_VERSION,
		reference: { year: options.referenceYear, month: options.referenceMonth },
		birthYear,
		gender: chart.input.gender,
		dayMaster: { stem: dayMaster, element: stemElementOf(dayMaster) },
		yearRange: timeline.yearRange,
		table,
		fortune,
		glyphs: buildGlyphs(dayMaster),
		years: timeline.years,
	};
}
