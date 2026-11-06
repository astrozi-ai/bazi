/**
 * 旺相休囚死表 (第二章五)。
 *
 * 五态按月令五行推出，没有自由度：
 *
 *   旺 = 当令者（月令五行本身）
 *   相 = 令所生者
 *   休 = 生令者
 *   囚 = 克令者
 *   死 = 令所克者
 *
 * 这是位次，不是力量分数：它回答「谁当季」，不回答「谁比谁强」。力量比较属
 * 默认裁定表第 5 条，未裁定。
 */
import { ELEMENTS, MONTH_ORDER_ELEMENTS } from "../chart/constants";
import type { BranchName, ElementName } from "../core-types";
import { controlledBy, ELEMENT_CONTROLS, ELEMENT_GENERATES, generatedBy } from "./five-elements";
import { tableSourceRef, type TableSourceRef } from "./source-ref";

export const MONTH_STRENGTH_SOURCE: TableSourceRef = tableSourceRef(
  "第二章五",
  "按月令分旺相休囚死五态：当令者旺，令生者相，生令者休，克令者囚，令克者死。",
);

export const MONTH_STRENGTH_STATES = ["旺", "相", "休", "囚", "死"] as const;
export type MonthStrengthState = (typeof MONTH_STRENGTH_STATES)[number];

/** 月支的当令五行（辰戌丑未为土）。上游 `MONTH_ORDER_ELEMENTS` 是唯一来源。 */
export function monthElementOf(monthBranch: BranchName): ElementName {
  return MONTH_ORDER_ELEMENTS[monthBranch];
}

/** 给定当令五行，返回五行各自的旺相休囚死。 */
export function monthStrengthStates(
  monthElement: ElementName,
): Readonly<Record<ElementName, MonthStrengthState>> {
  const out = {} as Record<ElementName, MonthStrengthState>;
  for (const element of ELEMENTS as readonly ElementName[]) {
    if (element === monthElement) out[element] = "旺";
    else if (ELEMENT_GENERATES[monthElement] === element) out[element] = "相";
    else if (element === generatedBy(monthElement)) out[element] = "休";
    else if (element === controlledBy(monthElement)) out[element] = "囚";
    else if (ELEMENT_CONTROLS[monthElement] === element) out[element] = "死";
    else throw new Error(`${element} has no 旺相休囚死 position under 月令 ${monthElement}`);
  }
  return out;
}
