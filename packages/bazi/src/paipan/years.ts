import type { BasicChartResult } from "../chart/types";
import { getColumnShenSha } from "../shensha/shensha";
import { buildLiuyue, type DayunSpan } from "./fortune";
import { buildStemColumn, type ColumnContext, PAIPAN_PLACEHOLDER } from "./pillar-column";
import type {
	BaziPaipanGanZhi,
	BaziPaipanPillarColumn,
	BaziPaipanShenSha,
	BaziPaipanYear,
} from "./types";
import { yearGanZhi } from "./year-ganzhi";

/** The main table prints a 流年 干支 only for ages 1..100. */
const TABLE_LIUNIAN_AGES = 100;

export interface YearContext {
	chart: BasicChartResult;
	birthYear: number;
	column: ColumnContext;
	/** 年柱 纳音 passed to the 神煞 engine (core result first, 60-甲子 table second). */
	yearNaYin: string;
	/** Every 大运 on calendar-year boundaries (`buildDayunSpans`). */
	dayunSpans: DayunSpan[];
}

function tableLiunianGanZhi(year: number, birthYear: number): BaziPaipanGanZhi {
	const age = year - birthYear + 1;
	if (age < 1 || age > TABLE_LIUNIAN_AGES) {
		return { stem: PAIPAN_PLACEHOLDER, branch: PAIPAN_PLACEHOLDER };
	}
	return yearGanZhi(year);
}

/** Before 起运 no 大运 holds the year: the table prints placeholders. */
const NO_DAYUN: Omit<DayunSpan, "startYear"> = {
	ref: { kind: "none" },
	ganZhi: { stem: PAIPAN_PLACEHOLDER, branch: PAIPAN_PLACEHOLDER },
};

function spanForYear(spans: DayunSpan[], year: number): DayunSpan | undefined {
	return spans.find((span) => span.startYear <= year && year < span.startYear + 10);
}

/** 大运 for a selected year: the span whose calendar years `startYear..startYear + 9` hold it. */
export function dayunForYear(spans: DayunSpan[], year: number): Omit<DayunSpan, "startYear"> {
	return spanForYear(spans, year) ?? NO_DAYUN;
}


/** Removes the parenthesised detail the tables never show on 三奇贵人. */
export function sanitizeShenShaLabel(name: string): string {
	if (!name.includes("三奇贵人")) return name;
	return name.replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "");
}

function natalPillarArray(chart: BasicChartResult): string[] {
	const { year, month, day, hour } = chart.fourPillars;
	return [year, month, day, hour].flatMap((pillar) => [pillar.stem, pillar.branch]);
}

function columnShenSha(
	context: YearContext,
	dayun: BaziPaipanGanZhi,
	liunian: BaziPaipanGanZhi,
): BaziPaipanShenSha {
	const pillars = [...natalPillarArray(context.chart), dayun.stem, dayun.branch];
	const columns = getColumnShenSha([...pillars, liunian.stem, liunian.branch], true, {
		gender: context.chart.input.gender,
		nayinByPillar: { year: context.yearNaYin },
	});
	const at = (index: number) => (columns[index] ?? []).map(sanitizeShenShaLabel);
	return { liunian: at(5), dayun: at(4), year: at(0), month: at(1), day: at(2), hour: at(3) };
}

function cachedShenSha(context: YearContext, cache: Map<string, BaziPaipanShenSha>) {
	return (dayun: BaziPaipanGanZhi, liunian: BaziPaipanGanZhi): BaziPaipanShenSha => {
		const key = `${dayun.stem}${dayun.branch}|${liunian.stem}${liunian.branch}`;
		const cached = cache.get(key) ?? columnShenSha(context, dayun, liunian);
		cache.set(key, cached);
		return cached;
	};
}

function liunianColumn(context: YearContext, ganZhi: BaziPaipanGanZhi): BaziPaipanPillarColumn {
	return buildStemColumn(context.column, ganZhi.stem, ganZhi.branch);
}

/** Per-year entries for every selectable year, in order. */
export function buildYears(context: YearContext, from: number, to: number): BaziPaipanYear[] {
	const shenShaFor = cachedShenSha(context, new Map());
	return Array.from({ length: to - from + 1 }, (_, offset) => {
		const year = from + offset;
		const dayun = dayunForYear(context.dayunSpans, year);
		const liunian = tableLiunianGanZhi(year, context.birthYear);
		const shenSha = shenShaFor(dayun.ganZhi, liunian);
		return {
			year,
			age: year - context.birthYear + 1,
			ganZhi: yearGanZhi(year),
			table: { liunian: liunianColumn(context, liunian), dayun: dayun.ref, shenSha },
			liuyue: buildLiuyue(year),
		};
	});
}
