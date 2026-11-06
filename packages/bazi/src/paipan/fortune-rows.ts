import { buildBaziDayunPageItems, buildBaziLiuyuePageItems } from "./paging";
import { type BaziPaipanLiunianCell, selectBaziPaipanLiunianWindow } from "./liunian-window";
import type { BaziPaipanFortuneDayun, BaziPaipanLiuyue, BaziPaipanView } from "./types";

/**
 * Cells of the 大运 / 流年 / 流月 fortune table, framework-free. Cells carry 干支 glyphs only;
 * renderers read each glyph's element key and ten god from `view.glyphs` and map the key to
 * their own colour (a theme token, a CSS variable).
 */
export type BaziFortuneCell =
	| { type: "back" | "back_liyue" | "empty" | "more" | "more_liyue" }
	| { type: "xiaoyun"; age: number; endAge: number; isActive: boolean; label: string }
	| {
			type: "dayun";
			age: number;
			endAge: number;
			gan: string;
			isActive: boolean;
			year: number;
			zhi: string;
	  }
	| { type: "liunian"; age: number; gan: string; isActive: boolean; year: number; zhi: string }
	| {
			type: "liyue_detail" | "liyue_simple";
			dateStr: string;
			gan: string;
			isActive: boolean;
			month: number;
			solarTerm: string;
			year: number;
			zhi: string;
	  };

/** Paging and expansion state of the fortune table (local to the view). */
export type BaziFortuneTableState = {
	dayunPage: number;
	expandedDayunAge: number | null;
	expandedLiunianYear: number | null;
	liuyuePage: number;
};

export const BAZI_FORTUNE_INITIAL_STATE: BaziFortuneTableState = {
	dayunPage: 0,
	expandedDayunAge: null,
	expandedLiunianYear: null,
	liuyuePage: 0,
};

const ROW_SIZE = 10;
const DAYUN_FIRST_PAGE_SIZE = 8;

function emptyRow(): BaziFortuneCell[] {
	return Array.from({ length: ROW_SIZE }, () => ({ type: "empty" }));
}

function xiaoyunCell(view: BaziPaipanView, selectedYear: number): BaziFortuneCell | null {
	const { firstDayunStartYear, xiaoyun } = view.fortune;
	if (!xiaoyun) return null;
	return {
		type: "xiaoyun",
		label: xiaoyun.label,
		age: xiaoyun.startAge,
		endAge: xiaoyun.endAge,
		isActive: selectedYear >= view.birthYear && selectedYear < firstDayunStartYear,
	};
}

function dayunCell(item: BaziPaipanFortuneDayun, selectedYear: number): BaziFortuneCell {
	return {
		type: "dayun",
		year: item.startYear,
		age: item.startAge,
		endAge: item.endAge,
		gan: item.stem,
		zhi: item.branch,
		isActive: selectedYear >= item.startYear && selectedYear < item.startYear + 10,
	};
}

/**
 * 大运 row: 小运 (when the chart has one) then eight 大运 on page 0; the later 大运 on page 1;
 * a pager in the last cell.
 */
function dayunRow(view: BaziPaipanView, selectedYear: number, page: number): BaziFortuneCell[] {
	const row = emptyRow();
	const xiaoyun = page === 0 ? xiaoyunCell(view, selectedYear) : null;
	if (xiaoyun) row[0] = xiaoyun;
	const offset = xiaoyun ? 1 : 0;
	const items = buildBaziDayunPageItems(view.fortune.dayun, page);
	for (const [index, item] of items.entries()) {
		row[offset + index] = dayunCell(item, selectedYear);
	}
	if (view.fortune.dayun.length > DAYUN_FIRST_PAGE_SIZE) {
		row[ROW_SIZE - 1] = { type: page === 0 ? "more" : "back" };
	}
	return row;
}

function liunianCell(cell: BaziPaipanLiunianCell | null, selectedYear: number): BaziFortuneCell {
	if (!cell) return { type: "empty" };
	const { age, ganZhi, year } = cell;
	return {
		type: "liunian",
		year,
		age,
		gan: ganZhi.stem,
		zhi: ganZhi.branch,
		isActive: year === selectedYear,
	};
}

function yearLiuyue(view: BaziPaipanView, year: number): BaziPaipanLiuyue[] {
	const entry = view.years[year - view.yearRange.from];
	if (!entry || entry.year !== year) {
		throw new Error(
			`BaZi 排盘 流月 year ${year} is outside ${view.yearRange.from}..${view.yearRange.to}`,
		);
	}
	return entry.liuyue;
}

type LiuyueSource = { cellType: "liyue_detail" | "liyue_simple"; year: number };

/** The expanded 流年 when it is in the visible row, else the selected year. */
function liuyueSource(
	liunian: BaziFortuneCell[],
	selectedYear: number,
	expandedYear: number | null,
): LiuyueSource {
	const expanded = liunian.find((cell) => cell.type === "liunian" && cell.year === expandedYear);
	if (expanded?.type === "liunian") return { cellType: "liyue_detail", year: expanded.year };
	return { cellType: "liyue_simple", year: selectedYear };
}

function liuyueCell(
	month: BaziPaipanLiuyue,
	source: LiuyueSource,
	isActive: boolean,
): BaziFortuneCell {
	return {
		type: source.cellType,
		year: source.year,
		month: month.month,
		gan: month.stem,
		zhi: month.branch,
		solarTerm: month.solarTerm,
		dateStr: month.dateStr,
		isActive,
	};
}

/** 流月 row: one page of the year's twelve months, active on the reference month. */
function liuyueRow(
	view: BaziPaipanView,
	source: LiuyueSource,
	selectedYear: number,
	page: number,
): BaziFortuneCell[] {
	const row = emptyRow();
	const months = buildBaziLiuyuePageItems(yearLiuyue(view, source.year), page);
	for (const [index, month] of months.entries()) {
		const isActive = source.year === selectedYear && view.reference.month === month.month;
		row[index] = liuyueCell(month, source, isActive);
	}
	row[ROW_SIZE - 1] = { type: page === 0 ? "more_liyue" : "back_liyue" };
	return row;
}

function pagedDayunState(state: BaziFortuneTableState, pager: "more" | "back") {
	const dayunPage = pager === "more" ? 1 : 0;
	return { ...state, dayunPage, expandedDayunAge: null, expandedLiunianYear: null };
}

/**
 * 大运 row press: a 大运 toggles its decade; 小运 has no decade to expand, so it clears the
 * expansion and the 流年 row follows the selected (birth) year — the 小运 years.
 */
function nextDayunState(state: BaziFortuneTableState, cell: BaziFortuneCell) {
	if (cell.type === "more" || cell.type === "back") return pagedDayunState(state, cell.type);
	if (cell.type === "xiaoyun")
		return { ...state, expandedDayunAge: null, expandedLiunianYear: null };
	if (cell.type !== "dayun") return state;
	const expandedDayunAge = state.expandedDayunAge === cell.age ? null : cell.age;
	return { ...state, expandedDayunAge, expandedLiunianYear: null };
}

function nextLiunianState(state: BaziFortuneTableState, cell: BaziFortuneCell) {
	if (cell.type !== "liunian") return state;
	const expandedLiunianYear = state.expandedLiunianYear === cell.year ? null : cell.year;
	return { ...state, expandedLiunianYear, liuyuePage: 0 };
}

function nextLiuyueState(state: BaziFortuneTableState, cell: BaziFortuneCell) {
	if (cell.type === "more_liyue") return { ...state, liuyuePage: 1 };
	if (cell.type === "back_liyue") return { ...state, liuyuePage: 0 };
	return state;
}

const NEXT_STATE_BY_ROW = [nextDayunState, nextLiunianState, nextLiuyueState];

/** Paging / expansion after a cell press in row `rowIndex` (0 大运, 1 流年, 2 流月). */
export function nextBaziFortuneState(
	state: BaziFortuneTableState,
	rowIndex: number,
	cell: BaziFortuneCell,
): BaziFortuneTableState {
	const next = NEXT_STATE_BY_ROW[rowIndex];
	return next ? next(state, cell) : state;
}

/** The fortune table's three rows (大运, 流年, 流月) for a selected year; lookups only. */
export function buildBaziFortuneRows(
	view: BaziPaipanView,
	selectedYear: number,
	state: BaziFortuneTableState,
): BaziFortuneCell[][] {
	const dayun = dayunRow(view, selectedYear, state.dayunPage);
	const liunian = selectBaziPaipanLiunianWindow(view, selectedYear, state.expandedDayunAge).map(
		(cell) => liunianCell(cell, selectedYear),
	);
	const source = liuyueSource(liunian, selectedYear, state.expandedLiunianYear);
	return [dayun, liunian, liuyueRow(view, source, selectedYear, state.liuyuePage)];
}
