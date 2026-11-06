/**
 * 基础排盘计算器
 * 整合四柱、十神、大运、纳音等模块的主计算器
 */

import { assertGregorianChartInput, buildChartTimeContext, toSolarDate } from "./chartTimeContext";
import { CHART_ALGORITHM_VERSION, DEFAULT_CHART_OPTIONS } from "./constants";
import { FourPillarsCalculator } from "./FourPillarsCalculator";
import { validateChartCalculationInput } from "./inputValidation";
import { MajorPeriodCalculator } from "./MajorPeriodCalculator";
import { NaYinCalculator } from "./NaYinCalculator";
import { TenGodCalculator } from "./TenGodCalculator";
import {
	type BasicChartResult,
	ChartCalculationError,
	type ChartCalculationInput,
	type ChartCalculationOptions,
	type ChartTimeContext,
	type MajorPeriodCalculation,
	type NaYinInfo,
	type PerformanceMetrics,
} from "./types";

type ResolvedChartCalculationOptions = Required<Omit<ChartCalculationOptions, "asOfContext">> &
	Pick<ChartCalculationOptions, "asOfContext">;

export class BasicChartCalculator {
	private readonly fourPillarsCalculator: FourPillarsCalculator;
	private readonly tenGodCalculator: TenGodCalculator;
	private readonly majorPeriodCalculator: MajorPeriodCalculator;
	private readonly naYinCalculator: NaYinCalculator;

	constructor() {
		this.fourPillarsCalculator = new FourPillarsCalculator();
		this.tenGodCalculator = new TenGodCalculator();
		this.majorPeriodCalculator = new MajorPeriodCalculator();
		this.naYinCalculator = new NaYinCalculator();
	}

	async calculateBasicChart(
		input: ChartCalculationInput,
		options: ChartCalculationOptions = {},
	): Promise<BasicChartResult> {
		assertGregorianChartInput(input);
		const startTime = performance.now();
		const finalOptions: ResolvedChartCalculationOptions = {
			...DEFAULT_CHART_OPTIONS,
			...options,
		};

		if (finalOptions.validateInput) {
			const validation = validateChartCalculationInput(input);
			if (!validation.isValid) {
				throw new ChartCalculationError(
					`输入验证失败: ${validation.errors.join(", ")}`,
					"INVALID_INPUT",
					input,
				);
			}
		}

		try {
			const metrics: PerformanceMetrics = {
				fourPillarsTime: 0,
				tenGodsTime: 0,
				majorPeriodsTime: 0,
				naYinTime: 0,
				totalTime: 0,
			};
			const timeContext = buildChartTimeContext(input, finalOptions.asOfContext);
			const fourPillarsStart = performance.now();
			const fourPillars = await this.fourPillarsCalculator.calculateFourPillars(input, timeContext);
			metrics.fourPillarsTime = performance.now() - fourPillarsStart;

			const tenGodAnalysis = finalOptions.includeTenGods
				? await this.calculateTenGodAnalysis(fourPillars, metrics)
				: this.createDisabledTenGodAnalysis(fourPillars.dayMaster);

			const naYin = finalOptions.includeNaYin
				? await this.calculateNaYin(fourPillars, metrics)
				: undefined;

			const majorPeriods = finalOptions.includeMajorPeriods
				? await this.calculateMajorPeriods(input, fourPillars, finalOptions, timeContext, metrics)
				: undefined;

			const qiyunDetail = this.buildQiyunDetail(majorPeriods);
			metrics.totalTime = performance.now() - startTime;

			return {
				input,
				fourPillars,
				naYin,
				tenGodAnalysis,
				majorPeriods,
				qiyunDetail,
				solarDate: toSolarDate(timeContext),
				calculationTime: metrics.totalTime,
				algorithm: CHART_ALGORITHM_VERSION,
				options: finalOptions,
			};
		} catch (error) {
			throw new ChartCalculationError(
				`基础排盘计算失败: ${error instanceof Error ? error.message : "未知错误"}`,
				"BASIC_CHART_CALCULATION_ERROR",
				{ input, options },
			);
		}
	}

	async calculateFourPillarsOnly(input: ChartCalculationInput): Promise<{
		fourPillars: BasicChartResult["fourPillars"];
		calculationTime: number;
	}> {
		const startTime = performance.now();
		const fourPillars = await this.fourPillarsCalculator.calculateFourPillars(input);
		return {
			fourPillars,
			calculationTime: performance.now() - startTime,
		};
	}

	getChartSummary(result: BasicChartResult): {
		dayMaster: string;
		dayMasterElement: string;
		season: string;
		strongestTenGod: string;
		currentMajorPeriod?: string | undefined;
		description: string;
	} {
		const dayMaster = result.fourPillars.dayMaster;
		const dayMasterElement = result.fourPillars.day.element || "未知";
		const season = result.fourPillars.season;
		const strongestTenGod = result.tenGodAnalysis.summary.strongest;
		const currentMajorPeriod = result.majorPeriods?.currentPeriod
			? `${result.majorPeriods.currentPeriod.stem}${result.majorPeriods.currentPeriod.branch}(${result.majorPeriods.currentPeriod.startAge}-${result.majorPeriods.currentPeriod.endAge}岁)`
			: undefined;

		return {
			dayMaster,
			dayMasterElement,
			season,
			strongestTenGod,
			currentMajorPeriod,
			description:
				`${dayMaster}日主，五行属${dayMasterElement}，生于${season}，` +
				`十神以${strongestTenGod}为主${currentMajorPeriod ? `，现行${currentMajorPeriod}大运` : ""}。`,
		};
	}

	checkSpecialPatterns(result: BasicChartResult): {
		patterns: Array<{
			name: string;
			type: "favorable" | "unfavorable" | "neutral";
			description: string;
			strength: number;
		}>;
		hasSpecialPattern: boolean;
	} {
		const patterns = result.tenGodAnalysis.patterns.map((pattern) => ({
			name: pattern.name,
			type: pattern.type,
			description: pattern.description,
			strength: pattern.strength,
		}));

		patterns.push(...this.checkFourPillarsSpecialCombinations(result.fourPillars));

		return {
			patterns,
			hasSpecialPattern: patterns.length > 0,
		};
	}

	getPerformanceMetrics(): {
		description: string;
		recommendations: string[];
	} {
		return {
			description: "基础排盘模块性能良好，支持高并发计算。",
			recommendations: [
				"大批量计算时可考虑启用缓存",
				"不需要的模块可以通过选项关闭以提升性能",
				"复杂分析建议分步进行",
			],
		};
	}

	private async calculateTenGodAnalysis(
		fourPillars: BasicChartResult["fourPillars"],
		metrics: PerformanceMetrics,
	): Promise<BasicChartResult["tenGodAnalysis"]> {
		const start = performance.now();
		const result = await this.tenGodCalculator.calculateTenGods(fourPillars);
		metrics.tenGodsTime = performance.now() - start;
		return result;
	}

	private createDisabledTenGodAnalysis(
		dayMaster: BasicChartResult["fourPillars"]["dayMaster"],
	): BasicChartResult["tenGodAnalysis"] {
		return {
			dayMaster,
			relationships: [],
			summary: {
				strongest: "比肩",
				weakest: "比肩",
				visible: [],
				hidden: [],
				count: {
					比肩: 0,
					劫财: 0,
					食神: 0,
					伤官: 0,
					偏财: 0,
					正财: 0,
					七杀: 0,
					正官: 0,
					偏印: 0,
					正印: 0,
				},
				distribution: "十神计算未启用",
			},
			patterns: [],
		};
	}

	private async calculateNaYin(
		fourPillars: BasicChartResult["fourPillars"],
		metrics: PerformanceMetrics,
	): Promise<NaYinInfo> {
		const start = performance.now();
		const result = await this.naYinCalculator.calculateNaYin(fourPillars);
		metrics.naYinTime = performance.now() - start;
		return result;
	}

	private async calculateMajorPeriods(
		input: ChartCalculationInput,
		fourPillars: BasicChartResult["fourPillars"],
		options: ResolvedChartCalculationOptions,
		timeContext: ChartTimeContext,
		metrics: PerformanceMetrics,
	): Promise<MajorPeriodCalculation> {
		const start = performance.now();
		const result = await this.majorPeriodCalculator.calculateMajorPeriods(
			fourPillars,
			input,
			options.majorPeriodCount,
			timeContext,
		);
		metrics.majorPeriodsTime = performance.now() - start;
		return result;
	}

	private buildQiyunDetail(majorPeriods?: MajorPeriodCalculation) {
		if (!majorPeriods) {
			return undefined;
		}

		return {
			years: majorPeriods.startAge,
			months: majorPeriods.startMonth ?? 0,
			days: majorPeriods.startDay,
			hours: majorPeriods.startAgeDetail?.hours,
			minutes: majorPeriods.startAgeDetail?.minutes,
			endYear: majorPeriods.startDate?.year,
			endMonth: majorPeriods.startDate?.month,
		};
	}

	private checkFourPillarsSpecialCombinations(fourPillars: BasicChartResult["fourPillars"]): Array<{
		name: string;
		type: "favorable" | "unfavorable" | "neutral";
		description: string;
		strength: number;
	}> {
		const stems = [
			fourPillars.year.stem,
			fourPillars.month.stem,
			fourPillars.day.stem,
			fourPillars.hour.stem,
		];
		const allYang = stems.every((stem) => ["甲", "丙", "戊", "庚", "壬"].includes(stem));
		const allYin = stems.every((stem) => ["乙", "丁", "己", "辛", "癸"].includes(stem));

		if (allYang) {
			return [
				{
					name: "纯阳格",
					type: "neutral",
					description: "四柱天干全阳，性格阳刚，但需要阴柔调和。",
					strength: 70,
				},
			];
		}
		if (allYin) {
			return [
				{
					name: "纯阴格",
					type: "neutral",
					description: "四柱天干全阴，性格阴柔，但需要阳刚补充。",
					strength: 70,
				},
			];
		}
		return [];
	}
}
