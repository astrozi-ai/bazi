import type { SolarDay, SolarTime } from "tyme4ts";
import type { BaziAsOfContext } from "../time-context";
import type {
	BranchName,
	ElementName,
	StemName,
	TenGodSimplified,
	TenGodType,
} from "../core-types";
import type { FourPillars, HiddenStem, TenGodAnalysis } from "./pattern-source-types";

/**
 * 基础排盘模块 - 类型定义
 * 独立四柱、大运、十神、藏干计算的核心类型系统
 */

// ===== 基础数据类型 =====

// ===== Tyme4ts 库类型定义 =====
// 用于增强 tyme4ts 库的类型安全性

export interface HeavenlyStem {
	getName(): StemName;
}

export interface EarthlyBranch {
	getName(): BranchName;
}

export interface SixtyCycle {
	getHeavenStem(): HeavenlyStem;
	getEarthBranch(): EarthlyBranch;
}

export interface EightChar {
	getYear(): SixtyCycle;
	getMonth(): SixtyCycle;
	getDay(): SixtyCycle;
	getHour(): SixtyCycle;
}

// ===== 干支对类型 =====

// ===== 大运系统 =====

export interface MajorPeriod {
	period: number; // 运期（第几大运）
	startAge: number; // 起运年龄
	endAge: number; // 结束年龄
	stem: StemName; // 大运天干
	branch: BranchName; // 大运地支
	element: ElementName; // 大运五行
	naYin: string; // 大运纳音
	hiddenStems: HiddenStem[]; // 大运藏干
	tenGod: TenGodType; // 大运十神

	// 运程分析
	relationship: "favorable" | "unfavorable" | "neutral"; // 与日主关系
	strength: number; // 运势强度 (0-100)
	description: string; // 运程描述
}

// ===== 大运起法 =====

export interface MajorPeriodCalculation {
	direction: "forward" | "backward"; // 顺排逆排
	startAge: number; // 起运年龄（整数年份）
	startMonth?: number | undefined; // 起运月份
	startDay?: number | undefined; // 起运天数
	startAgeExact?: number | undefined; // 起运年龄（包含小数）
	startAgeDetail?: {
		years: number;
		months: number;
		days: number;
		hours: number;
		minutes: number;
	} | undefined;
	startDate?: {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
	} | undefined;
	totalPeriods: number; // 总运数
	periods: MajorPeriod[]; // 所有大运
	currentPeriod?: MajorPeriod | undefined; // 当前大运
	nextPeriod?: MajorPeriod | undefined; // 下一大运
}

export type {
	FourPillars,
	HiddenStem,
	StemBranchPair,
	TenGodAnalysis,
	TenGodPattern,
	TenGodRelationship,
	TenGodSummary,
} from "./pattern-source-types";

// ===== 纳音系统 =====

export interface NaYinInfo {
	year: string; // 年柱纳音
	month: string; // 月柱纳音
	day: string; // 日柱纳音
	hour: string; // 时柱纳音
	dayMasterNaYin: string; // 日主纳音（日柱）
	element: ElementName; // 日主纳音五行
	characteristics: string[]; // 纳音特性
	compatibility: NaYinCompatibility; // 纳音相配
}

export interface NaYinCompatibility {
	favorable: string[]; // 相生纳音
	unfavorable: string[]; // 相克纳音
	neutral: string[]; // 中性纳音
	analysis: string; // 相配分析
}

// ===== 排盘选项 =====

export interface ChartCalculationOptions {
	includeHiddenStems?: boolean | undefined; // 是否计算藏干
	includeTenGods?: boolean | undefined; // 是否计算十神
	includeMajorPeriods?: boolean | undefined; // 是否计算大运
	includeNaYin?: boolean | undefined; // 是否计算纳音
	majorPeriodCount?: number | undefined; // 大运数量 (默认8)
	precision?: "standard" | "high" | undefined; // 计算精度
	validateInput?: boolean | undefined; // 是否验证输入
	useTraditional?: boolean | undefined; // 是否使用传统算法
	enablePerformanceLogging?: boolean | undefined; // 是否输出性能日志
	asOfContext?: BaziAsOfContext | undefined; // 显式时间上下文，用于当前大运/流年投影
}

export interface ChartTimeContext {
	solarDay: SolarDay;
	solarTime: SolarTime;
	asOfContext?: BaziAsOfContext | undefined;
}

// ===== 排盘输入 =====

export interface ChartCalculationInput {
	year: number; // 公历年
	month: number; // 公历月
	day: number; // 公历日
	hour: number; // 小时 (0-23)
	minute?: number | undefined; // 分钟 (0-59)
	second?: number | undefined; // 秒钟 (0-59)
	gender: "male" | "female"; // 性别
	timezone?: string | undefined; // 时区
	location?: {
		// 出生地
		longitude: number;
		latitude: number;
		name?: string | undefined;
	} | undefined;
	options?: {
		// 计算选项
		majorPeriodCount?: number | undefined;
	} | undefined;
}

// ===== 排盘结果 =====

export interface BasicChartResult {
	// 输入信息
	input: ChartCalculationInput;

	// 核心排盘结果
	fourPillars: FourPillars;
	naYin?: NaYinInfo | undefined;
	tenGodAnalysis: TenGodAnalysis;
	majorPeriods?: MajorPeriodCalculation | undefined;

	// 起运详细信息（兼容旧版字段）
	qiyunDetail?: {
		years: number;
		months: number;
		days?: number | undefined;
		hours?: number | undefined;
		minutes?: number | undefined;
		endYear?: number | undefined;
		endMonth?: number | undefined;
	} | undefined;

	// 时间信息：排盘实际所用的公历时刻
	solarDate: {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
	};

	// 计算信息
	calculationTime: number; // 计算耗时（毫秒）
	algorithm: string; // 算法版本
	options: ChartCalculationOptions; // 使用的选项
}

// ===== 排盘分析器接口 =====

export interface IChartCalculator {
	calculateFourPillars(
		input: ChartCalculationInput,
		context?: ChartTimeContext,
	): Promise<FourPillars>;
}

export interface ITenGodCalculator {
	calculateTenGods(fourPillars: FourPillars): Promise<TenGodAnalysis>;
}

export interface IMajorPeriodCalculator {
	calculateMajorPeriods(
		fourPillars: FourPillars,
		input: ChartCalculationInput,
		count?: number,
		context?: ChartTimeContext,
	): Promise<MajorPeriodCalculation>;
}

export interface INaYinCalculator {
	calculateNaYin(fourPillars: FourPillars): Promise<NaYinInfo>;
}

export interface IHiddenStemCalculator {
	calculateHiddenStems(branch: BranchName): Promise<HiddenStem[]>;
}

// ===== 常量映射 =====

export interface ElementMapping {
	stems: Record<StemName, ElementName>;
	branches: Record<BranchName, ElementName>;
	naYin: Record<string, ElementName>;
}

export interface TenGodMapping {
	relationships: Record<string, TenGodType>; // "日干-目标干" -> 十神
	simplified: Record<TenGodType, TenGodSimplified>;
	characteristics: Record<
		TenGodType,
		{
			nature: "positive" | "negative" | "neutral";
			strength: number;
			description: string;
		}
	>;
}

// ===== 错误处理 =====

export class ChartCalculationError extends Error {
	constructor(
		message: string,
		public code: string,
		public context?: unknown,
	) {
		super(message);
		this.name = "ChartCalculationError";
	}
}

// ===== 验证结果 =====

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings?: string[] | undefined;
}

// ===== 性能指标 =====

export interface PerformanceMetrics {
	fourPillarsTime: number;
	tenGodsTime: number;
	majorPeriodsTime: number;
	naYinTime: number;
	totalTime: number;
	memoryUsage?: number | undefined;
}

// ===== 错误类型 =====

export type ChartErrorCode =
	| "INVALID_INPUT"
	| "INVALID_YEAR"
	| "INVALID_MONTH"
	| "INVALID_DAY"
	| "INVALID_HOUR"
	| "INVALID_MINUTE"
	| "INVALID_GENDER"
	| "FOUR_PILLARS_CALCULATION_ERROR"
	| "TEN_GOD_CALCULATION_ERROR"
	| "MAJOR_PERIOD_CALCULATION_ERROR"
	| "NAYIN_CALCULATION_ERROR"
	| "BASIC_CHART_CALCULATION_ERROR";
