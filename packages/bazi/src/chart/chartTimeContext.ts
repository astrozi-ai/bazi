import { SolarDay, SolarTime } from "tyme4ts";
import type { BasicChartResult, ChartCalculationInput, ChartTimeContext } from "./types";
import { ChartCalculationError } from "./types";

/**
 * The engine takes Gregorian birth input only. A lunar date (leap month
 * included) is converted once by the input layer at its boundary, so a lunar flag reaching core is refused with a
 * named error instead of being read as a Gregorian date.
 */
export function assertGregorianChartInput(input: ChartCalculationInput): void {
	const { isLunar, isLeapMonth } = input as { isLunar?: unknown; isLeapMonth?: unknown };
	const accepted = (value: unknown) => value === undefined || value === false;
	if (!accepted(isLunar) || !accepted(isLeapMonth)) {
		throw new ChartCalculationError(
			`农历输入不受支持：引擎只收公历出生时刻，农历（含闰月）须由 Host 在边界换算为公历（isLunar=${String(isLunar)}, isLeapMonth=${String(isLeapMonth)}）`,
			"LUNAR_INPUT_UNSUPPORTED",
			{ isLunar, isLeapMonth },
		);
	}
}

/**
 * The single derivation of the chart's solar day and time from chart input.
 */
export function buildChartTimeContext(
	input: ChartCalculationInput,
	asOfContext?: ChartTimeContext["asOfContext"],
): ChartTimeContext {
	assertGregorianChartInput(input);
	const solarDay = SolarDay.fromYmd(input.year, input.month, input.day);
	const solarTime = SolarTime.fromYmdHms(
		solarDay.getYear(),
		solarDay.getMonth(),
		solarDay.getDay(),
		input.hour,
		input.minute || 0,
		input.second || 0,
	);
	return { solarDay, solarTime, asOfContext };
}

export function toSolarDate(context: ChartTimeContext): BasicChartResult["solarDate"] {
	const { solarTime } = context;
	return {
		year: solarTime.getYear(),
		month: solarTime.getMonth(),
		day: solarTime.getDay(),
		hour: solarTime.getHour(),
		minute: solarTime.getMinute(),
	};
}
