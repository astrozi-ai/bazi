import {
	BRANCH_ELEMENTS,
	BRANCH_HIDDEN_STEMS,
	MONTH_ORDER_ELEMENTS,
	NAYIN_TABLE,
	STEM_ELEMENTS,
	TEN_GOD_RELATIONSHIPS,
} from "../chart/constants";
import { getLongevityState } from "../chart/longevityStates";
import type { BranchName, StemName } from "../core-types";
import type { ElementName as BaziWuxing } from "../core-types";
import { PAIPAN_PLACEHOLDER } from "./placeholder";
import type { BaziPaipanHiddenStem, BaziPaipanPillarColumn } from "./types";

const STEM_ELEMENT: Readonly<Record<string, BaziWuxing | undefined>> = STEM_ELEMENTS;
const BRANCH_ELEMENT: Readonly<Record<string, BaziWuxing | undefined>> = BRANCH_ELEMENTS;
const HIDDEN_STEMS: Readonly<Record<string, readonly { stem: string }[] | undefined>> =
	BRANCH_HIDDEN_STEMS;
const NAYIN: Readonly<Record<string, string | undefined>> = NAYIN_TABLE;
const TEN_GOD: Readonly<Record<string, string | undefined>> = TEN_GOD_RELATIONSHIPS;
/** 月令 season element: 寅卯木 巳午火 申酉金 亥子水 辰戌丑未土. */
const SEASON_ELEMENT: Readonly<Record<string, BaziWuxing | undefined>> = MONTH_ORDER_ELEMENTS;

export { PAIPAN_PLACEHOLDER };

const GENERATES: Readonly<Record<BaziWuxing, BaziWuxing>> = {
	木: "火",
	火: "土",
	土: "金",
	金: "水",
	水: "木",
};
const RESTRAINS: Readonly<Record<BaziWuxing, BaziWuxing>> = {
	木: "土",
	火: "金",
	土: "水",
	金: "木",
	水: "火",
};

export function stemElementOf(stem: string): BaziWuxing | null {
	return STEM_ELEMENT[stem] ?? null;
}

export function branchElementOf(branch: string): BaziWuxing | null {
	return BRANCH_ELEMENT[branch] ?? null;
}

/** 十神 of `otherStem` against the day master, or `missing` when either side is unknown. */
export function tenGodOf(dayMaster: string, otherStem: string, missing: string): string {
	return TEN_GOD[dayMaster + otherStem] ?? missing;
}

export function hiddenStemsOf(branch: string): string[] {
	return (HIDDEN_STEMS[branch] ?? []).map((item) => item.stem);
}

export function naYinOf(stem: string, branch: string): string | undefined {
	return NAYIN[stem + branch];
}

/** Narrows a cell glyph to an engine stem (placeholders are not stems). */
export function isStemGlyph(value: string): value is StemName {
	return STEM_ELEMENT[value] !== undefined;
}

/** Narrows a cell glyph to an engine branch (placeholders are not branches). */
export function isBranchGlyph(value: string): value is BranchName {
	return BRANCH_ELEMENT[value] !== undefined;
}

/**
 * 星运: 十二长生 of the day master on `branch`, from the chart layer's `getLongevityState` (阳顺阴逆,
 * 戊 follows 丙 and 己 follows 丁). Placeholder glyphs ("-") stay placeholders.
 */
export function lifeStageOf(dayMaster: string, branch: string): string {
	if (!isStemGlyph(dayMaster) || !isBranchGlyph(branch)) return PAIPAN_PLACEHOLDER;
	return getLongevityState(dayMaster, branch);
}

/**
 * 旺衰: seasonal 旺相休囚死 of the column stem's element against the natal 月令 season
 * (当令旺, 令生者相, 生令者休, 克令者囚, 令克者死).
 */
export function seasonalStrengthOf(stem: string, monthBranch: string): string {
	const self = STEM_ELEMENT[stem];
	const season = SEASON_ELEMENT[monthBranch];
	if (!self || !season) return PAIPAN_PLACEHOLDER;
	return seasonalLabel(self, season);
}

function seasonalLabel(self: BaziWuxing, season: BaziWuxing): string {
	const labels: [boolean, string][] = [
		[self === season, "旺"],
		[GENERATES[season] === self, "相"],
		[GENERATES[self] === season, "休"],
		[RESTRAINS[self] === season, "囚"],
		[RESTRAINS[season] === self, "死"],
	];
	return labels.find(([matches]) => matches)?.[1] ?? PAIPAN_PLACEHOLDER;
}

function hiddenStemCells(dayMaster: string, branch: string): BaziPaipanHiddenStem[] {
	return hiddenStemsOf(branch).map((stem) => ({
		stem,
		tenGod: tenGodOf(dayMaster, stem, PAIPAN_PLACEHOLDER),
		element: stemElementOf(stem),
	}));
}

/** Natal context every column reads: the day master (星运, 十神) and the 月令 branch (旺衰). */
export interface ColumnContext {
	dayMaster: string;
	monthBranch: string;
}

export interface PillarColumnInput extends ColumnContext {
	stem: string;
	branch: string;
	mainStar: string;
	naYin: string;
}

export function buildPillarColumn(input: PillarColumnInput): BaziPaipanPillarColumn {
	const { dayMaster, stem, branch } = input;
	return {
		stem,
		branch,
		stemElement: stemElementOf(stem),
		branchElement: branchElementOf(branch),
		mainStar: input.mainStar,
		hiddenStems: hiddenStemCells(dayMaster, branch),
		lifeStage: lifeStageOf(dayMaster, branch),
		strength: seasonalStrengthOf(stem, input.monthBranch),
		naYin: input.naYin,
	};
}

/** A non-day column: 主星 is the stem's ten god and 纳音 falls back to the 60-甲子 table. */
export function buildStemColumn(
	context: ColumnContext,
	stem: string,
	branch: string,
	naYin?: string,
): BaziPaipanPillarColumn {
	return buildPillarColumn({
		...context,
		stem,
		branch,
		mainStar: tenGodOf(context.dayMaster, stem, PAIPAN_PLACEHOLDER),
		naYin: naYin ?? naYinOf(stem, branch) ?? PAIPAN_PLACEHOLDER,
	});
}
