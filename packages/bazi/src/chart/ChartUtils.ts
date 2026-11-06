import { BasicChartCalculator } from "./BasicChartCalculator";
import { FourPillarsCalculator } from "./FourPillarsCalculator";
import { MajorPeriodCalculator } from "./MajorPeriodCalculator";
import { NaYinCalculator } from "./NaYinCalculator";
import { TenGodCalculator } from "./TenGodCalculator";
import type {
  BasicChartResult,
  ChartCalculationInput,
  FourPillars,
  MajorPeriodCalculation,
  NaYinInfo,
  TenGodAnalysis,
} from "./types";

export const ChartUtils = {
  createBasicCalculator(): BasicChartCalculator {
    return new BasicChartCalculator();
  },

  async calculateFourPillarsOnly(input: ChartCalculationInput): Promise<{
    fourPillars: FourPillars;
    calculationTime: number;
  }> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateFourPillarsOnly(input);
  },

  async calculateFullChart(input: ChartCalculationInput): Promise<BasicChartResult> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: true,
      includeNaYin: true,
      validateInput: true,
      majorPeriodCount: 8,
    });
  },

  async calculateQuickChart(input: ChartCalculationInput): Promise<BasicChartResult> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: false,
      includeNaYin: false,
      validateInput: true,
    });
  },

  async calculateStepByStep(input: ChartCalculationInput): Promise<{
    fourPillars: FourPillars;
    tenGodAnalysis: TenGodAnalysis;
    majorPeriods: MajorPeriodCalculation;
    naYin: NaYinInfo;
    calculationTime: number;
  }> {
    const startTime = performance.now();
    const fourPillarsCalc = new FourPillarsCalculator();
    const fourPillars = await fourPillarsCalc.calculateFourPillars(input);
    const tenGodCalc = new TenGodCalculator();
    const tenGodAnalysis = await tenGodCalc.calculateTenGods(fourPillars);
    const majorPeriodCalc = new MajorPeriodCalculator();
    const majorPeriods = await majorPeriodCalc.calculateMajorPeriods(fourPillars, input, 8);
    const naYinCalc = new NaYinCalculator();
    const naYin = await naYinCalc.calculateNaYin(fourPillars);

    return {
      fourPillars,
      tenGodAnalysis,
      majorPeriods,
      naYin,
      calculationTime: performance.now() - startTime,
    };
  },

  getChartSummary(result: BasicChartResult) {
    const calculator = new BasicChartCalculator();
    return calculator.getChartSummary(result);
  },

  checkSpecialPatterns(result: BasicChartResult) {
    const calculator = new BasicChartCalculator();
    return calculator.checkSpecialPatterns(result);
  },
} as const;
