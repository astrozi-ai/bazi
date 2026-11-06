/**
 * 天干四冲表 (第四章二)。
 *
 * 甲庚、乙辛、丙壬、丁癸 四对相冲；**戊己无冲**。
 *
 * 这不是 `../relations/stem-relations.ts` 的五行相克方向表（10 条有向条目，含
 * 戊/己）：相克讲的是「谁克谁」，四冲讲的是「同性相战的四对」。两张表并存，
 * 互不替代，也没有冲突——它们主张的不是同一件事。
 */
import type { StemName } from "../core-types";
import { tableSourceRef, type TableSourceRef } from "./source-ref";

export const STEM_FOUR_CLASH_SOURCE: TableSourceRef = tableSourceRef(
  "第四章二",
  "天干四冲只有甲庚、乙辛、丙壬、丁癸四对；戊己土居中，不立冲。",
);

/** 四冲对，对称。戊、己不在表内，查询返回 null。 */
export const STEM_FOUR_CLASH_PAIRS: Readonly<Partial<Record<StemName, StemName>>> = {
  甲: "庚",
  庚: "甲",
  乙: "辛",
  辛: "乙",
  丙: "壬",
  壬: "丙",
  丁: "癸",
  癸: "丁",
};

/** 天干无冲的成员（居中之土）。 */
export const STEM_WITHOUT_CLASH: readonly StemName[] = ["戊", "己"];

/** 该天干的四冲对象；戊、己返回 null。 */
export function getStemFourClash(stem: StemName): StemName | null {
  return STEM_FOUR_CLASH_PAIRS[stem] ?? null;
}

/** 两个天干是否构成四冲。对称。 */
export function isStemFourClash(left: StemName, right: StemName): boolean {
  return STEM_FOUR_CLASH_PAIRS[left] === right;
}
