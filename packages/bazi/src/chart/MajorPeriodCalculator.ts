/**
 * 大运计算器
 * 负责计算大运的起运、排运和运势分析
 */

import { ChildLimit, Gender } from "tyme4ts";
import { calculateFullAgeAt, resolveRuntimeCurrentBaziAsOfContext } from "../time-context";
import type { BranchName, ElementName, StemName, TenGodType } from "../core-types";
import { isSixCombination } from "../relations";
import { assertGregorianChartInput, buildChartTimeContext, toSolarDate } from "./chartTimeContext";
import {
	BRANCH_HIDDEN_STEMS,
	BRANCHES,
	NAYIN_TABLE,
	STEM_ELEMENTS,
	STEMS,
	TEN_GOD_RELATIONSHIPS,
} from "./constants";
import type {
	ChartCalculationInput,
	ChartTimeContext,
	FourPillars,
	HiddenStem,
	IMajorPeriodCalculator,
	MajorPeriod,
	MajorPeriodCalculation,
} from "./types";
import { ChartCalculationError } from "./types";

export class MajorPeriodCalculator implements IMajorPeriodCalculator {
	/**
	 * 计算大运
	 */
	async calculateMajorPeriods(
		fourPillars: FourPillars,
		input: ChartCalculationInput,
		count: number = 8,
		context?: ChartTimeContext,
	): Promise<MajorPeriodCalculation> {
		assertGregorianChartInput(input);
		try {
			const timeContext = context ?? buildChartTimeContext(input);
			const { solarTime } = timeContext;
			const childLimit = ChildLimit.fromSolarTime(
				solarTime,
				input.gender === "male" ? Gender.MAN : Gender.WOMAN,
			);

			const direction: "forward" | "backward" = childLimit.isForward() ? "forward" : "backward";

			const years = childLimit.getYearCount();
			const months = childLimit.getMonthCount();
			const days = childLimit.getDayCount();
			const hours = childLimit.getHourCount();
			const minutes = childLimit.getMinuteCount();
			const startAgeExact = this.computeExactAge(childLimit);

			const periods = this.calculateAllPeriods(fourPillars, direction, startAgeExact, count);

			const currentAge = this.calculateCurrentAge(toSolarDate(timeContext), context);
			const currentPeriod = this.findCurrentPeriod(periods, currentAge);
			const nextPeriod = this.findNextPeriod(periods, currentAge);

			const startTime = childLimit.getEndTime();

			return {
				direction,
				startAge: years,
				startMonth: months,
				startDay: days,
				startAgeExact: Number(startAgeExact.toFixed(4)),
				startAgeDetail: { years, months, days, hours, minutes },
				startDate: {
					year: startTime.getYear(),
					month: startTime.getMonth(),
					day: startTime.getDay(),
					hour: startTime.getHour(),
					minute: startTime.getMinute(),
				},
				totalPeriods: count,
				periods,
				currentPeriod,
				nextPeriod,
			};
		} catch (error) {
			throw new ChartCalculationError(
				`大运计算失败: ${error instanceof Error ? error.message : "未知错误"}`,
				"MAJOR_PERIOD_CALCULATION_ERROR",
				{ fourPillars, input, count },
			);
		}
	}

	/**
	 * 计算起运的精确年龄（含小数）
	 */
	private computeExactAge(childLimit: ChildLimit): number {
		try {
			const start = childLimit.getStartTime();
			const end = childLimit.getEndTime();
			const startUtc = Date.UTC(
				start.getYear(),
				start.getMonth() - 1,
				start.getDay(),
				start.getHour(),
				start.getMinute(),
				start.getSecond(),
			);
			const endUtc = Date.UTC(
				end.getYear(),
				end.getMonth() - 1,
				end.getDay(),
				end.getHour(),
				end.getMinute(),
				end.getSecond(),
			);
			const diffMs = endUtc - startUtc;
			const years = diffMs / (365.2422 * 24 * 60 * 60 * 1000);
			if (Number.isFinite(years)) {
				return Math.max(years, 0);
			}
		} catch {
		}

		const years = childLimit.getYearCount();
		const months = childLimit.getMonthCount();
		const days = childLimit.getDayCount();
		const hours = childLimit.getHourCount();
		const minutes = childLimit.getMinuteCount();

		return (
			years +
			months / 12 +
			days / 365.2422 +
			hours / (365.2422 * 24) +
			minutes / (365.2422 * 24 * 60)
		);
	}

	/**
	 * 计算当前年龄（整岁）
	 */
	private calculateCurrentAge(
		solarDate: { year: number; month: number; day: number },
		context?: ChartTimeContext,
	): number {
		const asOfContext = resolveRuntimeCurrentBaziAsOfContext(context?.asOfContext);
		return calculateFullAgeAt(solarDate, asOfContext);
	}

	private roundAge(value: number): number {
		return Number.isFinite(value) ? Math.round(value) : value;
	}

	/**
	 * 计算所有大运期
	 */
	private calculateAllPeriods(
		fourPillars: FourPillars,
		direction: "forward" | "backward",
		startAgeExact: number,
		count: number,
	): MajorPeriod[] {
		const periods: MajorPeriod[] = [];
		const monthStemIndex = STEMS.indexOf(fourPillars.month.stem);
		const monthBranchIndex = BRANCHES.indexOf(fourPillars.month.branch);

		for (let i = 0; i < count; i++) {
			const periodStartAge = startAgeExact + i * 10;
			const periodEndAge = periodStartAge + 9;
			const roundedStartAge = this.roundAge(periodStartAge);
			const roundedEndAge = this.roundAge(periodEndAge);

			// 计算大运干支
			let stemIndex: number;
			let branchIndex: number;

			if (direction === "forward") {
				stemIndex = this.wrapCycleIndex(monthStemIndex + i + 1, STEMS.length);
				branchIndex = this.wrapCycleIndex(monthBranchIndex + i + 1, BRANCHES.length);
			} else {
				stemIndex = this.wrapCycleIndex(monthStemIndex - i - 1, STEMS.length);
				branchIndex = this.wrapCycleIndex(monthBranchIndex - i - 1, BRANCHES.length);
			}

			const stem = STEMS[stemIndex] as StemName;
			const branch = BRANCHES[branchIndex] as BranchName;
			const stemBranchKey = `${stem}${branch}`;

			// 计算大运信息
			const period: MajorPeriod = {
				period: i + 1,
				startAge: roundedStartAge,
				endAge: roundedEndAge,
				stem,
				branch,
				element: STEM_ELEMENTS[stem],
				naYin: NAYIN_TABLE[stemBranchKey] || "未知",
				hiddenStems: this.getHiddenStems(branch),
				tenGod: this.calculateMajorPeriodTenGod(fourPillars.dayMaster, stem),
				relationship: this.analyzeMajorPeriodRelationship(fourPillars, stem, branch),
				strength: this.calculateMajorPeriodStrength(fourPillars, stem, branch),
				description: this.generateMajorPeriodDescription(stem, branch, i + 1),
			};

			periods.push(period);
		}

		return periods;
	}

	private wrapCycleIndex(index: number, length: number): number {
		return ((index % length) + length) % length;
	}

	/**
	 * 获取大运藏干
	 */
	private getHiddenStems(branch: BranchName): HiddenStem[] {
		const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
		return hiddenStems ? hiddenStems.map((stem) => ({ ...stem })) : [];
	}

	/**
	 * 计算大运十神
	 */
	private calculateMajorPeriodTenGod(dayMaster: StemName, majorPeriodStem: StemName): TenGodType {
		const relationshipKey = `${dayMaster}${majorPeriodStem}`;
		const tenGod = TEN_GOD_RELATIONSHIPS[relationshipKey];
		return tenGod ? tenGod : "比肩";
	}

	/**
	 * 分析大运与命局关系
	 */
	private analyzeMajorPeriodRelationship(
		fourPillars: FourPillars,
		stem: StemName,
		_branch: BranchName,
	): "favorable" | "unfavorable" | "neutral" {
		const dayMaster = fourPillars.dayMaster;
		const dayMasterElement = STEM_ELEMENTS[dayMaster];
		const majorPeriodElement = STEM_ELEMENTS[stem];

		// 简化判断：基于五行生克关系
		if (this.isElementFavorable(dayMasterElement, majorPeriodElement)) {
			return "favorable";
		} else if (this.isElementUnfavorable(dayMasterElement, majorPeriodElement)) {
			return "unfavorable";
		} else {
			return "neutral";
		}
	}

	/**
	 * 判断五行是否有利
	 */
	private isElementFavorable(dayMasterElement: ElementName, targetElement: ElementName): boolean {
		// 生日主或同类
		const generationMap: Record<ElementName, ElementName> = {
			木: "水",
			火: "木",
			土: "火",
			金: "土",
			水: "金",
		};

		return generationMap[dayMasterElement] === targetElement || dayMasterElement === targetElement;
	}

	/**
	 * 判断五行是否不利
	 */
	private isElementUnfavorable(dayMasterElement: ElementName, targetElement: ElementName): boolean {
		// 克日主
		const restrictionMap: Record<ElementName, ElementName> = {
			木: "金",
			火: "水",
			土: "木",
			金: "火",
			水: "土",
		};

		return restrictionMap[dayMasterElement] === targetElement;
	}

	/**
	 * 计算大运强度
	 */
	private calculateMajorPeriodStrength(
		fourPillars: FourPillars,
		stem: StemName,
		branch: BranchName,
	): number {
		let strength = 50; // 基础强度

		// 根据与日主关系调整
		const relationship = this.analyzeMajorPeriodRelationship(fourPillars, stem, branch);
		switch (relationship) {
			case "favorable":
				strength += 30;
				break;
			case "unfavorable":
				strength -= 20;
				break;
		}

		// 根据月令调整
		const monthElement = STEM_ELEMENTS[fourPillars.month.stem];
		const majorPeriodElement = STEM_ELEMENTS[stem];
		if (monthElement === majorPeriodElement) {
			strength += 15; // 与月令同气
		}

		// 根据季节调整
		const season = fourPillars.season;
		const seasonBonus = this.getSeasonalBonus(majorPeriodElement, season);
		strength += seasonBonus;

		return Math.max(10, Math.min(100, strength));
	}

	/**
	 * 获取季节加成
	 */
	private getSeasonalBonus(element: string, season: string): number {
		const seasonalBonuses: Record<string, Record<string, number>> = {
			木: { 春: 20, 夏: 10, 秋: -10, 冬: 5, 土月: -5 },
			火: { 春: 10, 夏: 20, 秋: -5, 冬: -10, 土月: 5 },
			土: { 春: -5, 夏: 5, 秋: 10, 冬: -5, 土月: 20 },
			金: { 春: -10, 夏: -5, 秋: 20, 冬: 10, 土月: 5 },
			水: { 春: 5, 夏: -10, 秋: 10, 冬: 20, 土月: -5 },
		};

		return seasonalBonuses[element]?.[season] || 0;
	}

	/**
	 * 生成大运描述
	 */
	private generateMajorPeriodDescription(
		stem: StemName,
		branch: BranchName,
		period: number,
	): string {
		const elementName = STEM_ELEMENTS[stem];
		const naYin = NAYIN_TABLE[`${stem}${branch}`] || "未知";

		return `第${period}步大运：${stem}${branch}，五行属${elementName}，纳音${naYin}。`;
	}

	/**
	 * 找到当前大运
	 * 🔧 修复：考虑浮点数精度问题，使用向上取整的endAge进行比较
	 *    例如：44岁应该匹配 34.98-43.98 的大运区间 (向上取整为 35-44)
	 */
	private findCurrentPeriod(periods: MajorPeriod[], currentAge: number): MajorPeriod | undefined {
		return periods.find(
			(period) =>
				currentAge >= Math.floor(period.startAge) && currentAge <= Math.ceil(period.endAge),
		);
	}

	/**
	 * 找到下一大运
	 */
	private findNextPeriod(periods: MajorPeriod[], currentAge: number): MajorPeriod | undefined {
		return periods.find((period) => period.startAge > currentAge);
	}

	/**
	 * 分析大运流年组合
	 */
	analyzeMajorPeriodYear(
		majorPeriod: MajorPeriod,
		yearStem: StemName,
		yearBranch: BranchName,
		dayMaster: StemName,
	): {
		combination: string;
		relationship: "favorable" | "unfavorable" | "neutral";
		strength: number;
		description: string;
		warnings: string[];
	} {
		const warnings: string[] = [];
		let strength = 50;

		// 检查天干合化
		const stemCombination = this.checkStemCombination(majorPeriod.stem, yearStem);
		if (stemCombination) {
			strength += 15;
			warnings.push(`大运天干${majorPeriod.stem}与流年天干${yearStem}${stemCombination}`);
		}

		// 检查地支关系
		const branchRelation = this.checkBranchRelation(majorPeriod.branch, yearBranch);
		if (branchRelation.type === "conflict") {
			strength -= 20;
			warnings.push(
				`大运地支${majorPeriod.branch}与流年地支${yearBranch}${branchRelation.description}`,
			);
		} else if (branchRelation.type === "combination") {
			strength += 10;
		}

		// 判断整体关系
		const dayMasterElement = STEM_ELEMENTS[dayMaster];
		const yearElement = STEM_ELEMENTS[yearStem];
		const relationship = this.isElementFavorable(dayMasterElement, yearElement)
			? "favorable"
			: this.isElementUnfavorable(dayMasterElement, yearElement)
				? "unfavorable"
				: "neutral";

		const combination = `${majorPeriod.stem}${majorPeriod.branch} + ${yearStem}${yearBranch}`;
		const description = `${majorPeriod.period}运遇${yearStem}${yearBranch}年，${relationship === "favorable" ? "有利发展" : relationship === "unfavorable" ? "需要谨慎" : "平稳过渡"}。`;

		return {
			combination,
			relationship,
			strength: Math.max(10, Math.min(100, strength)),
			description,
			warnings,
		};
	}

	/**
	 * 检查天干合化
	 */
	private checkStemCombination(stem1: string, stem2: string): string | null {
		const combinations: Record<string, string> = {
			甲己: "化土",
			乙庚: "化金",
			丙辛: "化水",
			丁壬: "化木",
			戊癸: "化火",
		};

		const key1 = `${stem1}${stem2}`;
		const key2 = `${stem2}${stem1}`;

		return combinations[key1] || combinations[key2] || null;
	}

	/**
	 * 检查地支关系
	 */
	private checkBranchRelation(
		branch1: string,
		branch2: string,
	): {
		type: "combination" | "conflict" | "neutral";
		description: string;
	} {
		// 地支六冲
		const conflicts: Record<string, string> = {
			子午: "相冲",
			丑未: "相冲",
			寅申: "相冲",
			卯酉: "相冲",
			辰戌: "相冲",
			巳亥: "相冲",
		};

		const key1 = `${branch1}${branch2}`;
		const key2 = `${branch2}${branch1}`;
		const combinationElement =
			BRANCHES.includes(branch1 as BranchName) && BRANCHES.includes(branch2 as BranchName)
				? isSixCombination(branch1 as BranchName, branch2 as BranchName)
				: null;

		if (conflicts[key1] || conflicts[key2]) {
			return { type: "conflict", description: "相冲" };
		}

		if (combinationElement) {
			return { type: "combination", description: `合${combinationElement}` };
		}

		return { type: "neutral", description: "无特殊关系" };
	}

	/**
	 * 获取大运转折点分析
	 */
	getMajorPeriodTransitions(periods: MajorPeriod[]): Array<{
		fromPeriod: MajorPeriod;
		toPeriod: MajorPeriod;
		transitionAge: number;
		significance: "major" | "moderate" | "minor";
		description: string;
	}> {
		const transitions = [];

		for (let i = 0; i < periods.length - 1; i++) {
			const current = periods[i];
			const next = periods[i + 1];
			if (!current || !next) continue;

			const elementChange = current.element !== next.element;
			const tenGodChange = current.tenGod !== next.tenGod;
			const relationshipChange = current.relationship !== next.relationship;

			let significance: "major" | "moderate" | "minor" = "minor";
			let description = "";

			if (elementChange && relationshipChange) {
				significance = "major";
				description = `从${current.element}转向${next.element}，运势性质从${current.relationship}转为${next.relationship}，是重要转折点。`;
			} else if (elementChange || tenGodChange) {
				significance = "moderate";
				description = `运势特质发生变化，需要调整应对策略。`;
			} else {
				description = `运势延续，保持稳定发展。`;
			}

			transitions.push({
				fromPeriod: current,
				toPeriod: next,
				transitionAge: next.startAge,
				significance,
				description,
			});
		}

		return transitions;
	}
}
