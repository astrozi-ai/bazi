/**
 * 干支阴阳表 (第一章二)。
 *
 * 天干：甲丙戊庚壬为阳，乙丁己辛癸为阴。
 * 地支：子寅辰午申戌为阳，丑卯巳未酉亥为阴。
 *
 * 上游 `chart/constants.ts` 已有同一划分的四个数组（`YANG_STEMS`/`YIN_STEMS`/
 * `YANG_BRANCHES`/`YIN_BRANCHES`）；本表把它们收敛成两张逐字查询表，成员完全
 * 一致，不是第二份主张。
 */
import { BRANCHES, STEMS, YANG_BRANCHES, YANG_STEMS } from "../chart/constants";
import type { BranchName, StemName, YinYangType } from "../core-types";
import { tableSourceRef, type TableSourceRef } from "./source-ref";

export const YIN_YANG_SOURCE: TableSourceRef = tableSourceRef(
  "第一章二",
  "干支各分阴阳：天干甲丙戊庚壬为阳，地支子寅辰午申戌为阳，其余为阴。",
);

function buildYinYang<T extends string>(all: readonly T[], yang: readonly T[]): Record<T, YinYangType> {
  const out = {} as Record<T, YinYangType>;
  for (const item of all) out[item] = yang.includes(item) ? "阳" : "阴";
  return out;
}

export const STEM_YIN_YANG: Readonly<Record<StemName, YinYangType>> = buildYinYang(
  STEMS as readonly StemName[],
  YANG_STEMS as readonly StemName[],
);

export const BRANCH_YIN_YANG: Readonly<Record<BranchName, YinYangType>> = buildYinYang(
  BRANCHES as readonly BranchName[],
  YANG_BRANCHES as readonly BranchName[],
);

export function stemYinYang(stem: StemName): YinYangType {
  return STEM_YIN_YANG[stem];
}

export function branchYinYang(branch: BranchName): YinYangType {
  return BRANCH_YIN_YANG[branch];
}
