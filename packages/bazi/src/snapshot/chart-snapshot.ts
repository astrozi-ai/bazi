/**
 * ChartSnapshot —— 可复算的排盘事实快照 (L0 输出面)。
 *
 * 设计前提：
 * 1. **计算约定必须显式。** 历法、时区、真太阳时策略、换日规则、起运法都是快照的
 *    一等字段，由调用方声明；本模块不从 `BasicChartResult` 反推、不填默认值。
 *    两个快照只有在 `calculationConventions` 相同时才可比。
 * 2. **每个干支出现位置有稳定 id。** `year.stem`、`day.branch`、
 *    `month.branch.hidden.0`、`dayun.3.stem`…… 求值层引用位置而不是引用字面值，
 *    同一个字在不同柱上不会被合并。
 * 3. **两种输入等价。** `inputKind: "birth"` 带出生时刻，`inputKind: "four-pillars"`
 *    直接给四柱、不需要也不允许出生日期。
 * 4. **不含流派判定。** 身强身弱、格局、用神、力量打分都不在这里；那是 school 节点
 *    (L4) 的事。这里只放"谁在哪个位置、藏了什么、十神是什么、根在哪"。
 */

import { z } from "zod";
import { BRANCH_ELEMENTS, BRANCH_HIDDEN_STEMS, STEM_ELEMENTS, TEN_GOD_RELATIONSHIPS } from "../chart/constants";
import type { BasicChartResult, FourPillars, StemBranchPair } from "../chart/types";
import type { BranchName, ElementName, StemName, TenGodType } from "../core-types";

export const CHART_SNAPSHOT_SCHEMA_VERSION = 1;

// ===== 基础枚举 =====

export const stemNameSchema = z.enum(["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]);
export const branchNameSchema = z.enum([
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
]);
export const elementNameSchema = z.enum(["木", "火", "土", "金", "水"]);
export const tenGodTypeSchema = z.enum([
  "比肩",
  "劫财",
  "食神",
  "伤官",
  "偏财",
  "正财",
  "七杀",
  "正官",
  "偏印",
  "正印",
]);
export const pillarKeySchema = z.enum(["year", "month", "day", "hour"]);
export const hiddenStemRoleSchema = z.enum(["primary", "secondary", "tertiary"]);

/**
 * occurrence id：`<slot>.<stem|branch>[.hidden.<n>]`
 * slot = year | month | day | hour | dayun.<期数,1 起> | annual
 */
export const occurrenceIdSchema = z
  .string()
  .regex(
    /^(?:year|month|day|hour|annual|dayun\.[1-9][0-9]*)\.(?:stem|branch)(?:\.hidden\.[0-9]+)?$/,
    "occurrenceId must look like 'day.branch' or 'month.branch.hidden.0'",
  );

// ===== 计算约定 =====

/** 输入日期用的是哪本历。 */
export const calendarSchema = z.enum(["gregorian", "chinese-lunar"]);

/**
 * 真太阳时策略：
 * - `none`：直接用民用钟点，不做经度或均时差修正（当前抽取实现的行为）
 * - `longitude-corrected`：只做经度时差修正
 * - `longitude-and-equation-of-time`：经度时差 + 均时差
 */
export const trueSolarTimePolicySchema = z.enum([
  "none",
  "longitude-corrected",
  "longitude-and-equation-of-time",
]);

/**
 * 换日规则：
 * - `zi-hour-23`：子初换日（23:00 起算次日）
 * - `midnight-00`：子正换日（00:00 起算次日）
 * - `late-zi-same-day`：晚子时不换日（23:00-24:00 仍作当日）
 */
export const dayBoundaryRuleSchema = z.enum(["zi-hour-23", "midnight-00", "late-zi-same-day"]);

/**
 * 起运法：
 * - `tyme4ts-child-limit`：tyme4ts `ChildLimit`（精确到时分的节气间隔折算）
 * - `three-days-one-year`：三天折一岁的整数近似
 * - `exact-solar-term-interval`：自算节气间隔，不走 tyme4ts
 */
export const qiyunMethodSchema = z.enum([
  "tyme4ts-child-limit",
  "three-days-one-year",
  "exact-solar-term-interval",
]);

export const calculationConventionsSchema = z
  .object({
    calendar: calendarSchema,
    /** IANA 时区名，例如 `Asia/Shanghai`。不接受 `UTC+8` 这类偏移写法。 */
    timezone: z
      .string()
      .regex(/^[A-Za-z]+(?:[_+-][A-Za-z0-9]+)*(?:\/[A-Za-z0-9]+(?:[_+-][A-Za-z0-9]+)*)+$/, {
        message: "timezone must be an IANA zone name such as 'Asia/Shanghai'",
      }),
    trueSolarTimePolicy: trueSolarTimePolicySchema,
    dayBoundaryRule: dayBoundaryRuleSchema,
    qiyunMethod: qiyunMethodSchema,
  })
  .strict();

export type CalculationConventions = z.infer<typeof calculationConventionsSchema>;

// ===== 柱 / 藏干 / 根 =====

export const hiddenStemOccurrenceSchema = z
  .object({
    occurrenceId: occurrenceIdSchema,
    stem: stemNameSchema,
    element: elementNameSchema,
    role: hiddenStemRoleSchema,
    tenGod: tenGodTypeSchema,
  })
  .strict();

export const stemOccurrenceSchema = z
  .object({
    occurrenceId: occurrenceIdSchema,
    stem: stemNameSchema,
    element: elementNameSchema,
    tenGod: tenGodTypeSchema,
  })
  .strict();

export const branchOccurrenceSchema = z
  .object({
    occurrenceId: occurrenceIdSchema,
    branch: branchNameSchema,
    element: elementNameSchema,
    hiddenStems: z.array(hiddenStemOccurrenceSchema),
  })
  .strict();

export const pillarSnapshotSchema = z
  .object({
    pillar: pillarKeySchema,
    stem: stemOccurrenceSchema,
    branch: branchOccurrenceSchema,
  })
  .strict();

/** 一个天干的通根：它在哪些藏干位置见到同五行。 */
export const rootSnapshotSchema = z
  .object({
    /** 被考察的天干位置，例如 `day.stem`。 */
    stemOccurrenceId: occurrenceIdSchema,
    stem: stemNameSchema,
    element: elementNameSchema,
    rootedIn: z.array(
      z
        .object({
          branchOccurrenceId: occurrenceIdSchema,
          hiddenStemOccurrenceId: occurrenceIdSchema,
          branch: branchNameSchema,
          hiddenStem: stemNameSchema,
          role: hiddenStemRoleSchema,
          /** 藏干与天干是同一个字（本气透干），而不只是同五行。 */
          sameStem: z.boolean(),
        })
        .strict(),
    ),
  })
  .strict();

// ===== 岁运输入 =====

export const dayunSnapshotSchema = z
  .object({
    /** 第几步大运，1 起。 */
    index: z.number().int().positive(),
    startAge: z.number(),
    endAge: z.number(),
    stem: stemOccurrenceSchema,
    branch: branchOccurrenceSchema,
  })
  .strict();

export const annualPillarSnapshotSchema = z
  .object({
    year: z.number().int(),
    stem: stemOccurrenceSchema,
    branch: branchOccurrenceSchema,
  })
  .strict();

export const luckInputSnapshotSchema = z
  .object({
    direction: z.enum(["forward", "backward"]),
    /** 起运虚岁（整数），与 `startAgeExact` 同源。 */
    startAge: z.number(),
    startAgeExact: z.number().nullable(),
    dayun: z.array(dayunSnapshotSchema),
    /** 流年只有调用方显式给出时才有；投影自 `BasicChartResult` 时恒为 null。 */
    annual: annualPillarSnapshotSchema.nullable(),
  })
  .strict();

// ===== 出生输入 =====

export const birthInputSnapshotSchema = z
  .object({
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    second: z.number().int().min(0).max(59),
    gender: z.enum(["male", "female"]),
  })
  .strict();

// ===== 快照 =====

export const chartSnapshotSchema = z
  .object({
    schemaVersion: z.literal(CHART_SNAPSHOT_SCHEMA_VERSION),
    calculationConventions: calculationConventionsSchema,
    inputKind: z.enum(["birth", "four-pillars"]),
    /** `inputKind: "four-pillars"` 时必须为 null：四柱输入不携带出生时刻。 */
    birthInput: birthInputSnapshotSchema.nullable(),
    dayMaster: stemNameSchema,
    pillars: z.array(pillarSnapshotSchema).length(4),
    roots: z.array(rootSnapshotSchema).length(4),
    luck: luckInputSnapshotSchema.nullable(),
  })
  .strict()
  .superRefine((snapshot, ctx) => {
    if (snapshot.inputKind === "four-pillars" && snapshot.birthInput !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthInput"],
        message: "a four-pillars snapshot must not carry a birth date",
      });
    }
    if (snapshot.inputKind === "birth" && snapshot.birthInput === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthInput"],
        message: "a birth snapshot must carry its birth input",
      });
    }
  });

export type ChartSnapshot = z.infer<typeof chartSnapshotSchema>;
export type PillarSnapshot = z.infer<typeof pillarSnapshotSchema>;
export type RootSnapshot = z.infer<typeof rootSnapshotSchema>;
export type LuckInputSnapshot = z.infer<typeof luckInputSnapshotSchema>;

// ===== 投影 =====

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
type PillarKey = (typeof PILLAR_KEYS)[number];

/** 十神只读 `chart/constants.ts` 的 `TEN_GOD_RELATIONSHIPS`，不另立一张表。 */
function tenGodOf(dayMaster: StemName, target: StemName): TenGodType {
  const tenGod = TEN_GOD_RELATIONSHIPS[`${dayMaster}${target}`];
  if (tenGod === undefined) {
    throw new Error(`TEN_GOD_RELATIONSHIPS has no entry for ${dayMaster}${target}`);
  }
  return tenGod;
}

function buildStemOccurrence(
  slot: string,
  stem: StemName,
  dayMaster: StemName,
): z.infer<typeof stemOccurrenceSchema> {
  return {
    occurrenceId: `${slot}.stem`,
    stem,
    element: STEM_ELEMENTS[stem],
    tenGod: tenGodOf(dayMaster, stem),
  };
}

function buildBranchOccurrence(
  slot: string,
  branch: BranchName,
  dayMaster: StemName,
): z.infer<typeof branchOccurrenceSchema> {
  const branchOccurrenceId = `${slot}.branch`;
  return {
    occurrenceId: branchOccurrenceId,
    branch,
    element: BRANCH_ELEMENTS[branch],
    hiddenStems: BRANCH_HIDDEN_STEMS[branch].map((hidden, index) => ({
      occurrenceId: `${branchOccurrenceId}.hidden.${index}`,
      stem: hidden.stem,
      element: hidden.element,
      role: hidden.type,
      tenGod: tenGodOf(dayMaster, hidden.stem),
    })),
  };
}

function buildPillars(fourPillars: FourPillars, dayMaster: StemName): PillarSnapshot[] {
  return PILLAR_KEYS.map((key) => {
    const pair: StemBranchPair = fourPillars[key];
    return {
      pillar: key satisfies PillarKey,
      stem: buildStemOccurrence(key, pair.stem, dayMaster),
      branch: buildBranchOccurrence(key, pair.branch, dayMaster),
    };
  });
}

/** 根气：天干在四柱地支藏干中见同五行的位置。同五行即为根，同字另标 `sameStem`。 */
function buildRoots(pillars: PillarSnapshot[]): RootSnapshot[] {
  return pillars.map((pillar) => {
    const element: ElementName = pillar.stem.element;
    const rootedIn = pillars.flatMap((candidate) =>
      candidate.branch.hiddenStems
        .filter((hidden) => hidden.element === element)
        .map((hidden) => ({
          branchOccurrenceId: candidate.branch.occurrenceId,
          hiddenStemOccurrenceId: hidden.occurrenceId,
          branch: candidate.branch.branch,
          hiddenStem: hidden.stem,
          role: hidden.role,
          sameStem: hidden.stem === pillar.stem.stem,
        })),
    );
    return {
      stemOccurrenceId: pillar.stem.occurrenceId,
      stem: pillar.stem.stem,
      element,
      rootedIn,
    };
  });
}

function buildLuck(result: BasicChartResult, dayMaster: StemName): LuckInputSnapshot | null {
  const majorPeriods = result.majorPeriods;
  if (!majorPeriods) return null;
  return {
    direction: majorPeriods.direction,
    startAge: majorPeriods.startAge,
    startAgeExact: majorPeriods.startAgeExact ?? null,
    dayun: majorPeriods.periods.map((period) => ({
      index: period.period,
      startAge: period.startAge,
      endAge: period.endAge,
      stem: buildStemOccurrence(`dayun.${period.period}`, period.stem, dayMaster),
      branch: buildBranchOccurrence(`dayun.${period.period}`, period.branch, dayMaster),
    })),
    annual: null,
  };
}

/**
 * 从 `BasicChartResult` 投影出生输入的快照。
 *
 * `conventions` 必须由调用方显式声明：本函数不会从 `result.options` 或 `result.input`
 * 推断历法/时区/真太阳时策略/换日规则/起运法。
 */
export function toChartSnapshot(
  result: BasicChartResult,
  conventions: CalculationConventions,
): ChartSnapshot {
  const dayMaster = result.fourPillars.dayMaster;
  const pillars = buildPillars(result.fourPillars, dayMaster);
  return chartSnapshotSchema.parse({
    schemaVersion: CHART_SNAPSHOT_SCHEMA_VERSION,
    calculationConventions: conventions,
    inputKind: "birth",
    birthInput: {
      year: result.input.year,
      month: result.input.month,
      day: result.input.day,
      hour: result.input.hour,
      minute: result.input.minute ?? 0,
      second: result.input.second ?? 0,
      gender: result.input.gender,
    },
    dayMaster,
    pillars,
    roots: buildRoots(pillars),
    luck: buildLuck(result, dayMaster),
  } satisfies ChartSnapshot);
}

/**
 * 从显式四柱投影快照，不需要出生日期。
 *
 * `BasicChartCalculator` 今天只接受 `year/month/day/hour` 的出生输入，没有
 * "只给四柱" 的入口；四柱输入因此直接从 `FourPillars` 构造，绕开排盘器。
 * 岁运不可从四柱推出（起运依赖出生时刻与节气距离），故 `luck` 恒为 null；
 * 需要岁运时由调用方在 `inputKind: "birth"` 一侧取。
 */
export function fourPillarsToChartSnapshot(
  fourPillars: FourPillars,
  conventions: CalculationConventions,
): ChartSnapshot {
  const dayMaster = fourPillars.dayMaster;
  const pillars = buildPillars(fourPillars, dayMaster);
  return chartSnapshotSchema.parse({
    schemaVersion: CHART_SNAPSHOT_SCHEMA_VERSION,
    calculationConventions: conventions,
    inputKind: "four-pillars",
    birthInput: null,
    dayMaster,
    pillars,
    roots: buildRoots(pillars),
    luck: null,
  } satisfies ChartSnapshot);
}
