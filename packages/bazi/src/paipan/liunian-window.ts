import type { BaziPaipanFortuneDayun, BaziPaipanGanZhi, BaziPaipanView } from "./types";
import { yearGanZhi } from "./year-ganzhi";

/** One 流年 cell of the fortune table's second row. */
export interface BaziPaipanLiunianCell {
	year: number;
	/** year - birthYear + 1, the age the fortune table prints. */
	age: number;
	ganZhi: BaziPaipanGanZhi;
}

const WINDOW_SIZE = 10;

function liunianCell(view: BaziPaipanView, year: number): BaziPaipanLiunianCell {
	return { year, age: year - view.birthYear + 1, ganZhi: yearGanZhi(year) };
}

function tenYears(view: BaziPaipanView, startYear: number): BaziPaipanLiunianCell[] {
	return Array.from({ length: WINDOW_SIZE }, (_, offset) => liunianCell(view, startYear + offset));
}

/** 小运 years `birthYear..firstDayunStartYear - 1`; the rest of the row stays empty. */
function xiaoyunYears(view: BaziPaipanView): (BaziPaipanLiunianCell | null)[] {
	const count = view.fortune.firstDayunStartYear - view.birthYear;
	return Array.from({ length: WINDOW_SIZE }, (_, offset) =>
		offset < count ? liunianCell(view, view.birthYear + offset) : null,
	);
}

function containingDayun(view: BaziPaipanView, year: number): BaziPaipanFortuneDayun | undefined {
	return view.fortune.dayun.find((item) => year >= item.startYear && year < item.startYear + 10);
}

/**
 * Start year of the decade the table shows when no fortune 大运 holds the selected year (the
 * fortune 大运 are contiguous from the first engine period, so only a year past the last one):
 * the age decade counted from the 起运 age, never earlier than the 起运 age itself.
 */
function uncoveredDecadeStart(view: BaziPaipanView, year: number): number {
	const startAge = view.table.qiyun.years;
	if (startAge === null) {
		throw new Error("BaZi 排盘 view has no 起运 age to place the 流年 row");
	}
	const age = year - view.birthYear + 1;
	const decadeAge = Math.max(startAge, age - ((age - startAge) % 10));
	return view.birthYear + decadeAge - 1;
}

/**
 * The fortune table's 流年 row (ten cells, `null` = empty cell): the expanded 大运's decade,
 * else the 小运 years before the first 大运, else the decade of the 大运 holding the selected
 * year. Every cell's year is inside `view.yearRange` (birth year to the last fortune 流年), so
 * any pressed cell is selectable and none precedes birth.
 */
export function selectBaziPaipanLiunianWindow(
	view: BaziPaipanView,
	selectedYear: number,
	expandedDayunAge: number | null,
): (BaziPaipanLiunianCell | null)[] {
	const expanded = view.fortune.dayun.find((item) => item.startAge === expandedDayunAge);
	if (expanded) return tenYears(view, expanded.startYear);
	if (selectedYear < view.fortune.firstDayunStartYear) return xiaoyunYears(view);
	const matched = containingDayun(view, selectedYear);
	return tenYears(view, matched?.startYear ?? uncoveredDecadeStart(view, selectedYear));
}
