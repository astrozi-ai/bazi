import { BRANCHES as BAZI_BRANCHES, STEMS as BAZI_STEMS } from "../chart/constants";
import type { BasicChartResult } from "../chart/types";
import type { ElementName as BaziWuxing } from "../core-types";
import { liuyueBoundaries } from "./calendar";
import {
	branchElementOf,
	hiddenStemsOf,
	PAIPAN_PLACEHOLDER,
	stemElementOf,
	tenGodOf,
} from "./pillar-column";
import type {
	BaziPaipanDayunRef,
	BaziPaipanFortune,
	BaziPaipanFortuneDayun,
	BaziPaipanGanZhi,
	BaziPaipanGlyphs,
	BaziPaipanLiuyue,
} from "./types";

type MajorPeriods = NonNullable<BasicChartResult["majorPeriods"]>;
type DayunSeed = Omit<BaziPaipanFortuneDayun, "projected">;

const FORTUNE_DAYUN_COUNT = 12;

/** Fails closed: the 大运/流年 timeline needs the engine's start date to place calendar years. */
export function requireMajorPeriods(chart: BasicChartResult): MajorPeriods & {
	startDate: NonNullable<MajorPeriods["startDate"]>;
} {
	const periods = chart.majorPeriods;
	if (!periods?.startDate) {
		throw new Error("BaZi 排盘 view requires majorPeriods.startDate to resolve calendar years.");
	}
	return { ...periods, startDate: periods.startDate };
}

function engineDayunSeeds(periods: ReturnType<typeof requireMajorPeriods>): DayunSeed[] {
	return periods.periods.map((period, index) => ({
		stem: period.stem,
		branch: period.branch,
		startAge: period.startAge,
		endAge: period.endAge,
		startYear: periods.startDate.year + 10 * index,
	}));
}

function cycleStep(glyphs: readonly string[], glyph: string, step: number): string {
	const size = glyphs.length;
	return glyphs[(((glyphs.indexOf(glyph) + step) % size) + size) % size] ?? PAIPAN_PLACEHOLDER;
}

/** The 大运 `steps` periods after the engine's last one, in the engine's 顺/逆 direction. */
function projectedDayun(
	last: DayunSeed,
	steps: number,
	direction: MajorPeriods["direction"],
): BaziPaipanFortuneDayun {
	const step = direction === "forward" ? steps : -steps;
	const startAge = last.startAge + steps * 10;
	return {
		stem: cycleStep(BAZI_STEMS, last.stem, step),
		branch: cycleStep(BAZI_BRANCHES, last.branch, step),
		startAge,
		endAge: startAge + 9,
		startYear: last.startYear + steps * 10,
		projected: true,
	};
}

function requireSeedBounds(seeds: DayunSeed[]): { first: DayunSeed; last: DayunSeed } {
	const [first] = seeds;
	const last = seeds[seeds.length - 1];
	if (!first || !last) throw new Error("BaZi 排盘 view requires at least one engine major period.");
	return { first, last };
}

/** 小运 holds the calendar years `birthYear..firstDayunStartYear - 1`; none when that is empty. */
function xiaoyunOf(birthYear: number, firstDayunStartYear: number): BaziPaipanFortune["xiaoyun"] {
	const endAge = firstDayunStartYear - birthYear;
	return endAge > 0 ? { label: `1-${endAge}`, startAge: 1, endAge } : null;
}

/**
 * The fortune table's 大运 row: every engine period (a 0-age one included), then projected
 * entries up to twelve that continue the 大运 sequence past the engine's last period.
 */
export function buildFortune(chart: BasicChartResult): BaziPaipanFortune {
	const periods = requireMajorPeriods(chart);
	const seeds = engineDayunSeeds(periods);
	const { first, last } = requireSeedBounds(seeds);
	const dayun = Array.from({ length: FORTUNE_DAYUN_COUNT }, (_, index) => {
		const seed = seeds[index];
		const steps = index - seeds.length + 1;
		return seed ? { ...seed, projected: false } : projectedDayun(last, steps, periods.direction);
	});
	return {
		xiaoyun: xiaoyunOf(chart.input.year, first.startYear),
		firstDayunStartYear: first.startYear,
		dayun,
	};
}

/** The fortune row's projected 大运, in order (`table.projectedDayunColumns` follows it). */
export function projectedDayunOf(fortune: BaziPaipanFortune): BaziPaipanFortuneDayun[] {
	return fortune.dayun.filter((item) => item.projected);
}

/** One 大运 and the ten calendar years `startYear..startYear + 9` it holds. */
export interface DayunSpan {
	ref: BaziPaipanDayunRef;
	ganZhi: BaziPaipanGanZhi;
	startYear: number;
}

/**
 * Every 大运 on the calendar-year boundaries the fortune list uses: the engine periods
 * (`startDate.year + 10i`), then the projected ones.
 */
export function buildDayunSpans(chart: BasicChartResult, fortune: BaziPaipanFortune): DayunSpan[] {
	const engine = engineDayunSeeds(requireMajorPeriods(chart)).map((seed, index) => ({
		ref: { kind: "period", index } as const,
		ganZhi: { stem: seed.stem, branch: seed.branch },
		startYear: seed.startYear,
	}));
	const projected = projectedDayunOf(fortune).map((item, index) => ({
		ref: { kind: "projected", index } as const,
		ganZhi: { stem: item.stem, branch: item.branch },
		startYear: item.startYear,
	}));
	return [...engine, ...projected];
}

/** 流月 row for a year: twelve 节 boundaries with the month pillar each opens (tyme4ts). */
export function buildLiuyue(year: number): BaziPaipanLiuyue[] {
	return liuyueBoundaries(year).map(({ stem, branch, month, solarTerm, dateStr }) => ({
		stem,
		branch,
		month,
		solarTerm,
		dateStr,
	}));
}

function requireElement(element: BaziWuxing | null, glyph: string): BaziWuxing {
	if (!element) throw new Error(`BaZi 排盘 view has no element for ${glyph}`);
	return element;
}

/** Element and ten god per glyph for the fortune cells (branch ten god = primary hidden stem). */
export function buildGlyphs(dayMaster: string): BaziPaipanGlyphs {
	const stems = BAZI_STEMS.map((stem) => [
		stem,
		{ element: requireElement(stemElementOf(stem), stem), tenGod: tenGodOf(dayMaster, stem, "") },
	]);
	const branches = BAZI_BRANCHES.map((branch) => {
		const primary = hiddenStemsOf(branch)[0];
		const tenGod = primary ? tenGodOf(dayMaster, primary, "") : "";
		return [branch, { element: requireElement(branchElementOf(branch), branch), tenGod }];
	});
	return { stems: Object.fromEntries(stems), branches: Object.fromEntries(branches) };
}
