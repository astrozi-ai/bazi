import { SolarTerm, SixtyCycleYear } from "tyme4ts";
import type { BaziPaipanGanZhi } from "./types";

/** The twelve 节 that open the months of a year, 立春 first; 小寒 falls in the next calendar year. */
const LIUYUE_TERMS = [
	{ term: "立春", yearOffset: 0 },
	{ term: "惊蛰", yearOffset: 0 },
	{ term: "清明", yearOffset: 0 },
	{ term: "立夏", yearOffset: 0 },
	{ term: "芒种", yearOffset: 0 },
	{ term: "小暑", yearOffset: 0 },
	{ term: "立秋", yearOffset: 0 },
	{ term: "白露", yearOffset: 0 },
	{ term: "寒露", yearOffset: 0 },
	{ term: "立冬", yearOffset: 0 },
	{ term: "大雪", yearOffset: 0 },
	{ term: "小寒", yearOffset: 1 },
] as const;

function ganZhiOf(name: string): BaziPaipanGanZhi {
	const [stem, branch] = [...name];
	if (!stem || !branch) throw new Error(`tyme4ts gave no 干支 for "${name}"`);
	return { stem, branch };
}

/** The 干支 a calendar year is labelled with (the 流年 cell), from tyme4ts. */
export function yearGanZhi(year: number): BaziPaipanGanZhi {
	return ganZhiOf(SixtyCycleYear.fromYear(Math.trunc(year)).getSixtyCycle().getName());
}

export interface LiuyueBoundary extends BaziPaipanGanZhi {
	month: number;
	solarTerm: string;
	/** "M/D" of the day the 节 falls on. */
	dateStr: string;
}

/** A year's twelve 流月: each 节's day and the month pillar it opens, both from tyme4ts. */
export function liuyueBoundaries(year: number): LiuyueBoundary[] {
	const base = Math.trunc(year);
	return LIUYUE_TERMS.map((item, index) => {
		const day = SolarTerm.fromName(base + item.yearOffset, item.term).getSolarDay();
		const month = ganZhiOf(day.next(1).getSixtyCycleDay().getMonth().getName());
		return { ...month, month: index + 1, solarTerm: item.term, dateStr: `${day.getMonth()}/${day.getDay()}` };
	});
}
