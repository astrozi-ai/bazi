/**
 * 地支四正 / 四马 / 四库分类表 (第五章一)。
 *
 *   四正（子午卯酉）—— 桃花位
 *   四马（寅申巳亥）—— 驿马位，亦称四生
 *   四库（辰戌丑未）—— 墓库位，亦称华盖
 *
 * 只给分类，不给象意：桃花/驿马/华盖的断语是 L5 的查表资源，不进这张表。
 */
import { BRANCHES } from "../chart/constants";
import type { BranchName } from "../core-types";
import { tableSourceRef, type TableSourceRef } from "./source-ref";

export const BRANCH_CLASS_SOURCE: TableSourceRef = tableSourceRef(
  "第五章一",
  "十二支分三组：四正子午卯酉、四马寅申巳亥、四库辰戌丑未。",
);

export const BRANCH_CLASSES = ["四正", "四马", "四库"] as const;
export type BranchClass = (typeof BRANCH_CLASSES)[number];

export const BRANCH_CLASS_MEMBERS: Readonly<Record<BranchClass, readonly BranchName[]>> = {
  四正: ["子", "午", "卯", "酉"],
  四马: ["寅", "申", "巳", "亥"],
  四库: ["辰", "戌", "丑", "未"],
};

export const BRANCH_CLASS_TABLE: Readonly<Record<BranchName, BranchClass>> = (() => {
  const out = {} as Record<BranchName, BranchClass>;
  for (const branch of BRANCHES as readonly BranchName[]) {
    const found = (BRANCH_CLASSES as readonly BranchClass[]).find((branchClass) =>
      BRANCH_CLASS_MEMBERS[branchClass].includes(branch),
    );
    if (found === undefined) throw new Error(`branch ${branch} has no class`);
    out[branch] = found;
  }
  return out;
})();

export function branchClassOf(branch: BranchName): BranchClass {
  return BRANCH_CLASS_TABLE[branch];
}

export function isBranchClass(branch: BranchName, branchClass: BranchClass): boolean {
  return BRANCH_CLASS_TABLE[branch] === branchClass;
}
