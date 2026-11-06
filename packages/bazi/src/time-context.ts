export type BaziAsOfSource = "contest_cutoff" | "runtime_current" | "specified_year";

export interface BaziAsOfContext {
	asOfYear: number;
	asOfMonth?: number;
	asOfDay?: number;
	source: BaziAsOfSource;
}

export function buildRuntimeCurrentAsOfContext(now = new Date()): BaziAsOfContext {
	return {
		asOfYear: now.getFullYear(),
		asOfMonth: now.getMonth() + 1,
		asOfDay: now.getDate(),
		source: "runtime_current",
	};
}

export function normalizeBaziAsOfContext(context: BaziAsOfContext): BaziAsOfContext {
	const normalized: BaziAsOfContext = {
		asOfYear: context.asOfYear,
		source: context.source,
	};
	if (typeof context.asOfMonth === "number") normalized.asOfMonth = context.asOfMonth;
	if (typeof context.asOfDay === "number") normalized.asOfDay = context.asOfDay;
	return normalized;
}

export function deterministicAsOfContextForBirthYear(year: number): BaziAsOfContext {
	return { asOfYear: year, source: "specified_year" };
}

export function resolveBaziAsOfContext(
	context: BaziAsOfContext | undefined,
	fallbackYear: number,
): BaziAsOfContext {
	return normalizeBaziAsOfContext(context ?? deterministicAsOfContextForBirthYear(fallbackYear));
}

export function resolveRuntimeCurrentBaziAsOfContext(
	context: BaziAsOfContext | undefined,
	now = new Date(),
): BaziAsOfContext {
	return normalizeBaziAsOfContext(context ?? buildRuntimeCurrentAsOfContext(now));
}

export function calculateFullAgeAt(
	birth: { year: number; month?: number; day?: number },
	context: BaziAsOfContext,
): number {
	let age = context.asOfYear - birth.year;
	if (
		typeof birth.month === "number" &&
		typeof birth.day === "number" &&
		typeof context.asOfMonth === "number" &&
		typeof context.asOfDay === "number" &&
		(context.asOfMonth < birth.month ||
			(context.asOfMonth === birth.month && context.asOfDay < birth.day))
	) {
		age -= 1;
	}
	return age;
}

export function calculateNominalAgeInYear(birthYear: number, year: number): number {
	return year - birthYear + 1;
}
