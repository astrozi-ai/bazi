/**
 * 五行生克与反生反克表 (第二章二、六)。
 *
 * 正向的生与克（木生火…、木克土…）上游 `chart/constants.ts` 已有
 * `ELEMENT_GENERATION` / `ELEMENT_RESTRICTION`；本表把它们收成带类型的查询表，
 * 成员逐字相同。
 *
 * 反生反克是第二章六的两族过量关系，上游没有对应表：
 *
 *   over_generation  反生（生得太过，反而成克）：生我者过多，反伤被生者。土多金埋。
 *   reverse_control  反克（克得太过，反而被反制）：被克者过多，反伤克者。木多金缺。
 *
 * 原文只有这两族、恰好十条；「子多母衰／泄多」一族不在
 * 第二章六，不得补。
 *
 * **本表只给关系与名目，不给「多」的阈值。** 「多／重」是力量比较，属默认裁定表
 * 第 5 条，未裁定；任何消费者都不得从这张表推出一条已成立的反生反克判定。
 */
import { ELEMENT_GENERATION, ELEMENT_RESTRICTION, ELEMENTS } from "../chart/constants";
import type { ElementName } from "../core-types";
import { tableSourceRef, type TableSourceRef } from "./source-ref";

export const FIVE_ELEMENT_CYCLE_SOURCE: TableSourceRef = tableSourceRef(
  "第二章二",
  "五行相生：木生火、火生土、土生金、金生水、水生木；相克：木克土、土克水、水克火、火克金、金克木。",
);

export const FIVE_ELEMENT_REVERSE_SOURCE: TableSourceRef = tableSourceRef(
  "第二章六",
  "反生反克两族，十条：反生（木多火焰塞一类）与反克（土多木折一类）。只记关系与名目，不记「多」的标尺。",
);

/** 我生者：`ELEMENT_GENERATES[木] === 火`。 */
export const ELEMENT_GENERATES: Readonly<Record<ElementName, ElementName>> =
  ELEMENT_GENERATION as Readonly<Record<ElementName, ElementName>>;

/** 我克者：`ELEMENT_CONTROLS[木] === 土`。 */
export const ELEMENT_CONTROLS: Readonly<Record<ElementName, ElementName>> =
  ELEMENT_RESTRICTION as Readonly<Record<ElementName, ElementName>>;

/** 生我者（母）。 */
export function generatedBy(element: ElementName): ElementName {
  const parent = (ELEMENTS as readonly ElementName[]).find(
    (candidate) => ELEMENT_GENERATES[candidate] === element,
  );
  if (parent === undefined) throw new Error(`no element generates ${element}`);
  return parent;
}

/** 克我者。 */
export function controlledBy(element: ElementName): ElementName {
  const controller = (ELEMENTS as readonly ElementName[]).find(
    (candidate) => ELEMENT_CONTROLS[candidate] === element,
  );
  if (controller === undefined) throw new Error(`no element controls ${element}`);
  return controller;
}

export function generates(from: ElementName, to: ElementName): boolean {
  return ELEMENT_GENERATES[from] === to;
}

export function controls(from: ElementName, to: ElementName): boolean {
  return ELEMENT_CONTROLS[from] === to;
}

export type ReverseCycleKind = "reverse_control" | "over_generation";

export interface ReverseCycleEntry {
  readonly kind: ReverseCycleKind;
  /** 受损的五行。 */
  readonly subject: ElementName;
  /** 过量的一方。 */
  readonly excess: ElementName;
  /** 原文名目。只作人读标签，任何判定都不得解析它。 */
  readonly label: string;
}

/**
 * 反生反克十条。逐字抄自原文：
 *
 *   原文 反生：生得太过，反而成克。木生火，木多火焰塞；火生土，火多土焦；
 *              土生金，土多金埋；金生水，金多水浊；水生木，水多木漂。
 *   原文 反克：克得太过，反而被反制。木克土，土多木折；土克水，水多土流动；
 *              水克火，火多水干；火克金，金多火熄；金克木，木多金缺。
 *
 * 每条都由 `ELEMENT_GENERATES` / `ELEMENT_CONTROLS` 的一条正向边翻出来，成员没有
 * 自由度；只有 `label` 是原文名目，逐字不改（含「水多土流动」的「动」）。
 */
export const REVERSE_CYCLE_LABELS = [
  // 原文 反生，按原文顺序
  "木多火焰塞",
  "火多土焦",
  "土多金埋",
  "金多水浊",
  "水多木漂",
  // 原文 反克，按原文顺序
  "土多木折",
  "水多土流动",
  "火多水干",
  "金多火熄",
  "木多金缺",
] as const;

export const REVERSE_CYCLE_ENTRIES: readonly ReverseCycleEntry[] = [
  // 反生：生我者过多，反伤被生者（excess 生 subject）
  { kind: "over_generation", subject: "火", excess: "木", label: "木多火焰塞" },
  { kind: "over_generation", subject: "土", excess: "火", label: "火多土焦" },
  { kind: "over_generation", subject: "金", excess: "土", label: "土多金埋" },
  { kind: "over_generation", subject: "水", excess: "金", label: "金多水浊" },
  { kind: "over_generation", subject: "木", excess: "水", label: "水多木漂" },
  // 反克：被克者过多，反伤克者（subject 克 excess）
  { kind: "reverse_control", subject: "木", excess: "土", label: "土多木折" },
  { kind: "reverse_control", subject: "土", excess: "水", label: "水多土流动" },
  { kind: "reverse_control", subject: "水", excess: "火", label: "火多水干" },
  { kind: "reverse_control", subject: "火", excess: "金", label: "金多火熄" },
  { kind: "reverse_control", subject: "金", excess: "木", label: "木多金缺" },
];

/** 以 `subject` 为受损方的全部反生反克条目。 */
export function reverseCycleFor(subject: ElementName): readonly ReverseCycleEntry[] {
  return REVERSE_CYCLE_ENTRIES.filter((entry) => entry.subject === subject);
}
