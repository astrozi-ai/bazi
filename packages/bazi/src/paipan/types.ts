import type { ElementName as BaziWuxing } from "../core-types";

/**
 * BaZi 排盘 tab view-model.
 *
 * One pure, JSON-serializable projection of a `BasicChartResult` that holds every cell the
 * 排盘 sheet shows (main table, 起运, 大运/流年/流月 rows) for every year a
 * user can select. Renderers (NSH, a web page, an MCP widget) read it and never
 * call the chart engine. Missing values use the same placeholders the table shows ("-").
 */
export interface BaziPaipanView {
	version: typeof BAZI_PAIPAN_VIEW_VERSION;
	reference: BaziPaipanReference;
	birthYear: number;
	gender: "male" | "female";
	dayMaster: { stem: string; element: BaziWuxing | null };
	/**
	 * Inclusive range of selectable years, birth year to the last fortune 流年 (the years with 流年
	 * cells); `years[i].year === yearRange.from + i`. `reference.year` may lie outside it.
	 */
	yearRange: { from: number; to: number };
	table: BaziPaipanTable;
	fortune: BaziPaipanFortune;
	glyphs: BaziPaipanGlyphs;
	years: BaziPaipanYear[];
}

export const BAZI_PAIPAN_VIEW_VERSION = 1 as const;

/** "Today" for the default selection (clamped into `yearRange`) and the active 流月 cell. */
export interface BaziPaipanReference {
	year: number;
	month: number;
}

export interface BaziPaipanHiddenStem {
	stem: string;
	tenGod: string;
	element: BaziWuxing | null;
}

/** One column of the main table (流年 / 大运 / 年柱 / 月柱 / 日柱 / 时柱), minus 神煞. */
export interface BaziPaipanPillarColumn {
	stem: string;
	branch: string;
	stemElement: BaziWuxing | null;
	branchElement: BaziWuxing | null;
	/** 主星: ten god of the stem against the day master, "日主" on the day pillar. */
	mainStar: string;
	/** 藏干 with their ten gods; empty when the branch is unknown (table shows "-"). */
	hiddenStems: BaziPaipanHiddenStem[];
	/** 星运 (十二长生 of the day master on this branch). */
	lifeStage: string;
	/** 旺衰 (seasonal 旺相休囚死 of this column's stem element against the natal 月令). */
	strength: string;
	naYin: string;
}

export type BaziPaipanColumnKey = "liunian" | "dayun" | "year" | "month" | "day" | "hour";

/** 神煞 labels per column, already display-sanitized; the tables show the first four. */
export type BaziPaipanShenSha = Record<BaziPaipanColumnKey, string[]>;

export interface BaziPaipanQiyun {
	/** 起运 whole years / months; `years` is null when the engine gave no start age. */
	years: number | null;
	months: number;
	/** 换大运: last digit of the switch year and the switch month. */
	changeYearDigit: number | null;
	changeMonth: number | null;
	/** zh-CN cell text exactly as the table shows it ("7岁2个月", "逢7字年8月换大运", "-"). */
	ageText: string;
	changeText: string;
}

export interface BaziPaipanTable {
	natal: Record<"year" | "month" | "day" | "hour", BaziPaipanPillarColumn>;
	/** One column per engine major period (`majorPeriods.periods` order). */
	dayunColumns: BaziPaipanPillarColumn[];
	/** One column per projected fortune 大运 (`fortune.dayun` entries with `projected`, in order). */
	projectedDayunColumns: BaziPaipanPillarColumn[];
	qiyun: BaziPaipanQiyun;
}

/**
 * Which 大运 column the main table shows for a selected year: the engine period or projected
 * 大运 whose calendar years `startYear..startYear + 9` hold it, `none` before 起运.
 */
export type BaziPaipanDayunRef =
	| { kind: "period"; index: number }
	| { kind: "projected"; index: number }
	| { kind: "none" };

/** Element and ten god per stem / branch (branch ten god = its primary hidden stem). */
export interface BaziPaipanGlyphs {
	stems: Record<string, { element: BaziWuxing; tenGod: string }>;
	branches: Record<string, { element: BaziWuxing; tenGod: string }>;
}

export interface BaziPaipanGanZhi {
	stem: string;
	branch: string;
}

export interface BaziPaipanFortuneDayun extends BaziPaipanGanZhi {
	startAge: number;
	endAge: number;
	startYear: number;
	/** True when the fortune list extends past the engine's periods (projected 大运). */
	projected: boolean;
}

export interface BaziPaipanFortune {
	/**
	 * 小运 cell: calendar years `birthYear..firstDayunStartYear - 1` (ages 1..endAge, label
	 * "1-endAge"); `null` when the first 大运 starts in the birth year (no 小运 cell).
	 */
	xiaoyun: { label: string; startAge: 1; endAge: number } | null;
	/** Start year of the first engine 大运 (also the fortune row's first 大运); 小运 ends before it. */
	firstDayunStartYear: number;
	/** The fortune table's twelve 大运 cells. */
	dayun: BaziPaipanFortuneDayun[];
}

export interface BaziPaipanLiuyue extends BaziPaipanGanZhi {
	month: number;
	solarTerm: string;
	/** "M/D" of the month's starting solar term. */
	dateStr: string;
}

export interface BaziPaipanYear {
	year: number;
	/** year - birthYear + 1, the age both tables print. */
	age: number;
	/** The year's 干支 (流年 cell in the fortune table). */
	ganZhi: BaziPaipanGanZhi;
	/** Main-table data when this year is selected. */
	table: {
		liunian: BaziPaipanPillarColumn;
		dayun: BaziPaipanDayunRef;
		shenSha: BaziPaipanShenSha;
	};
	liuyue: BaziPaipanLiuyue[];
}

/** Everything the 排盘 sheet shows for one selected year, resolved by lookup only. */
export interface BaziPaipanSelection {
	year: BaziPaipanYear;
	columns: Record<BaziPaipanColumnKey, BaziPaipanPillarColumn>;
	shenSha: BaziPaipanShenSha;
	qiyun: BaziPaipanQiyun;
}

export interface BuildBaziPaipanViewOptions {
	referenceYear: number;
	referenceMonth: number;
}
