import type { BasicChartResult } from "../chart/types";
import { PAIPAN_PLACEHOLDER } from "./pillar-column";
import type { BaziPaipanQiyun } from "./types";

type QiyunInputs = {
	startAge: number | null;
	startMonth: number | null;
	endYear: number | null;
	endMonth: number | null;
};

function finite(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nonNegativeInt(value: number): number {
	return Math.max(0, Math.round(value));
}

/** `qiyunDetail` (when present) overrides the major-period start fields, as the table did. */
function readQiyunInputs(chart: BasicChartResult): QiyunInputs {
	const detail = chart.qiyunDetail;
	return {
		startAge: finite(detail?.years) ?? finite(chart.majorPeriods?.startAge),
		startMonth: finite(detail?.months) ?? finite(chart.majorPeriods?.startMonth),
		endYear: finite(detail?.endYear),
		endMonth: finite(detail?.endMonth),
	};
}

function changeYearDigit(inputs: QiyunInputs, birthYear: number): number | null {
	if (inputs.endYear !== null) return Math.abs(Math.round(inputs.endYear) % 10);
	if (inputs.startAge === null) return null;
	return Math.abs(Math.round(birthYear + inputs.startAge - 1) % 10);
}

function changeMonth(inputs: QiyunInputs): number | null {
	if (inputs.endMonth !== null) return Math.max(1, Math.round(inputs.endMonth));
	return inputs.startMonth === null ? null : nonNegativeInt(inputs.startMonth);
}

/** 起运 row: "X岁Y个月" and "逢N字年M月换大运". */
export function buildQiyun(chart: BasicChartResult, birthYear: number): BaziPaipanQiyun {
	const inputs = readQiyunInputs(chart);
	const years = inputs.startAge === null ? null : nonNegativeInt(inputs.startAge);
	const months = nonNegativeInt(inputs.startMonth ?? 0);
	const digit = changeYearDigit(inputs, birthYear);
	const month = changeMonth(inputs);
	return {
		years,
		months,
		changeYearDigit: digit,
		changeMonth: month,
		ageText: years === null ? PAIPAN_PLACEHOLDER : `${years}岁${months}个月`,
		changeText:
			digit === null || month === null ? PAIPAN_PLACEHOLDER : `逢${digit}字年${month}月换大运`,
	};
}
