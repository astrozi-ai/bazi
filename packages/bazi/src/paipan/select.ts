import type {
	BaziPaipanDayunRef,
	BaziPaipanPillarColumn,
	BaziPaipanSelection,
	BaziPaipanTable,
	BaziPaipanView,
	BaziPaipanYear,
} from "./types";

/** The 大运 column the table prints when the chart has no period for the year at all. */
export const BAZI_PAIPAN_EMPTY_COLUMN: BaziPaipanPillarColumn = {
	stem: "-",
	branch: "-",
	stemElement: null,
	branchElement: null,
	mainStar: "-",
	hiddenStems: [],
	lifeStage: "-",
	strength: "-",
	naYin: "-",
};

function yearEntry(view: BaziPaipanView, year: number): BaziPaipanYear {
	const entry = view.years[year - view.yearRange.from];
	if (!entry || entry.year !== year) {
		throw new Error(
			`BaZi 排盘 year ${year} is outside ${view.yearRange.from}..${view.yearRange.to}`,
		);
	}
	return entry;
}

function indexedColumns(table: BaziPaipanTable, kind: "period" | "projected") {
	return kind === "period" ? table.dayunColumns : table.projectedDayunColumns;
}

function findDayunColumn(table: BaziPaipanTable, ref: BaziPaipanDayunRef) {
	if (ref.kind === "none") return BAZI_PAIPAN_EMPTY_COLUMN;
	return indexedColumns(table, ref.kind)[ref.index];
}

function dayunColumn(table: BaziPaipanTable, ref: BaziPaipanDayunRef): BaziPaipanPillarColumn {
	const column = findDayunColumn(table, ref);
	if (!column) throw new Error(`BaZi 排盘 view has no 大运 column for ${JSON.stringify(ref)}`);
	return column;
}

/**
 * The year a surface selects first: the reference year ("today") clamped into `yearRange`, so a
 * birth after today starts on the birth year and a today past the last 大运 on the last 流年.
 */
export function selectBaziPaipanDefaultYear(view: BaziPaipanView): number {
	const { from, to } = view.yearRange;
	return Math.min(Math.max(view.reference.year, from), to);
}

/** Everything the 排盘 tab shows for `year`; lookups only, fails closed outside the range. */
export function selectBaziPaipanYear(view: BaziPaipanView, year: number): BaziPaipanSelection {
	const entry = yearEntry(view, year);
	const { natal } = view.table;
	return {
		year: entry,
		columns: {
			liunian: entry.table.liunian,
			dayun: dayunColumn(view.table, entry.table.dayun),
			...natal,
		},
		shenSha: entry.table.shenSha,
		qiyun: view.table.qiyun,
	};
}
