/**
 * `@iching/bazi` 事实表层 —— 关系表之外的原文事实表。
 *
 * 收在这里的每一张表都满足两件事：它是**事实**（不是策略），它导出 `sourceRef`
 * 指向原文章节。来源之间互相矛盾的成员不进这里，走 `../relations/contested.ts`。
 *
 * 判定（哪一族反生反克成立、谁比谁强、开库与否）都不在这里：那是 school 的事。
 */
export { SOURCE_DOCUMENT, tableSourceRef } from "./source-ref";
export type { TableSourceRef } from "./source-ref";

export {
  STEM_FOUR_CLASH_PAIRS,
  STEM_FOUR_CLASH_SOURCE,
  STEM_WITHOUT_CLASH,
  getStemFourClash,
  isStemFourClash,
} from "./stem-clash";

export {
  BRANCH_YIN_YANG,
  STEM_YIN_YANG,
  YIN_YANG_SOURCE,
  branchYinYang,
  stemYinYang,
} from "./yin-yang";

export {
  ELEMENT_CONTROLS,
  ELEMENT_GENERATES,
  FIVE_ELEMENT_CYCLE_SOURCE,
  FIVE_ELEMENT_REVERSE_SOURCE,
  REVERSE_CYCLE_ENTRIES,
  REVERSE_CYCLE_LABELS,
  controlledBy,
  controls,
  generatedBy,
  generates,
  reverseCycleFor,
} from "./five-elements";
export type { ReverseCycleEntry, ReverseCycleKind } from "./five-elements";

export {
  MONTH_STRENGTH_SOURCE,
  MONTH_STRENGTH_STATES,
  monthElementOf,
  monthStrengthStates,
} from "./month-strength";
export type { MonthStrengthState } from "./month-strength";

export {
  BRANCH_CLASSES,
  BRANCH_CLASS_MEMBERS,
  BRANCH_CLASS_SOURCE,
  BRANCH_CLASS_TABLE,
  branchClassOf,
  isBranchClass,
} from "./branch-class";
export type { BranchClass } from "./branch-class";

import { sourceRef as KONG_WANG_SOURCE } from "../algorithms/kong-wang";
import { BRANCH_HARM_INJURY_SOURCE } from "./branch-harm-injury";
import { BRANCH_CLASS_SOURCE } from "./branch-class";
import { FIVE_ELEMENT_CYCLE_SOURCE, FIVE_ELEMENT_REVERSE_SOURCE } from "./five-elements";
import { MONTH_STRENGTH_SOURCE } from "./month-strength";
import type { TableSourceRef } from "./source-ref";
import { STEM_FOUR_CLASH_SOURCE } from "./stem-clash";
import { YIN_YANG_SOURCE } from "./yin-yang";

/**
 * 本层全部事实表的出处清单。`tables.test.ts` 按这张清单逐条核对出处。
 */
export const CORE_FACT_TABLE_SOURCES: Readonly<Record<string, TableSourceRef>> = {
  stemFourClash: STEM_FOUR_CLASH_SOURCE,
  yinYang: YIN_YANG_SOURCE,
  fiveElementCycle: FIVE_ELEMENT_CYCLE_SOURCE,
  fiveElementReverse: FIVE_ELEMENT_REVERSE_SOURCE,
  monthStrength: MONTH_STRENGTH_SOURCE,
  branchClass: BRANCH_CLASS_SOURCE,
  branchHarmInjury: BRANCH_HARM_INJURY_SOURCE,
  kongWang: KONG_WANG_SOURCE,
};

export { BRANCH_HARM_INJURIES, BRANCH_HARM_INJURY_SOURCE, getBranchHarmInjuries } from "./branch-harm-injury";
export type { BranchHarmInjury } from "./branch-harm-injury";
