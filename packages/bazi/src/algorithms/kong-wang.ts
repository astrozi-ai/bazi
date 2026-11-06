import { BRANCHES, STEMS } from "../chart/constants";
import type { BranchName, StemName } from "../core-types";
import type { TableSourceRef } from "../tables/source-ref";

/** 六甲旬空的通用规则由作者裁定。 */
export const sourceRef: TableSourceRef = {
  document: "author_guidance: AstroZi, 2026-11-06",
  locator: "作者裁定",
  note: "六甲旬空属于通用规则；八字一般同时用年空、日空，月柱、时柱不起空。",
};

function getSixtyCycleIndex(stem: string, branch: string): number {
  for (let index = 0; index < 60; index++) {
    if (STEMS[index % 10] === stem && BRANCHES[index % 12] === branch) {
      return index;
    }
  }
  return -1;
}

/** 查询指定干支所属旬的两支旬空；通用规则出处见 sourceRef。 */
export function getKongWang(dayStem: StemName, dayBranch: BranchName): readonly [BranchName, BranchName] {
  // 六甲旬对应的空亡地支
  const xunMap = {
    // 甲子旬：甲子、乙丑、丙寅、丁卯、戊辰、己巳、庚午、辛未、壬申、癸酉，空戌亥
    甲子旬: ["戌", "亥"],
    // 甲戌旬：甲戌、乙亥、丙子、丁丑、戊寅、己卯、庚辰、辛巳、壬午、癸未，空申酉
    甲戌旬: ["申", "酉"],
    // 甲申旬：甲申、乙酉、丙戌、丁亥、戊子、己丑、庚寅、辛卯、壬辰、癸巳，空午未
    甲申旬: ["午", "未"],
    // 甲午旬：甲午、乙未、丙申、丁酉、戊戌、己亥、庚子、辛丑、壬寅、癸卯，空辰巳
    甲午旬: ["辰", "巳"],
    // 甲辰旬：甲辰、乙巳、丙午、丁未、戊申、己酉、庚戌、辛亥、壬子、癸丑，空寅卯
    甲辰旬: ["寅", "卯"],
    // 甲寅旬：甲寅、乙卯、丙辰、丁巳、戊午、己未、庚申、辛酉、壬戌、癸亥，空子丑
    甲寅旬: ["子", "丑"],
  } as const;

  const cycleIndex = getSixtyCycleIndex(dayStem, dayBranch);
  if (cycleIndex === -1) throw new Error(`无效干支配对：${dayStem}${dayBranch} 不属于六十甲子`);
  const xunHeadIndex = Math.floor(cycleIndex / 10) * 10;
  const xunHeadMap: Record<number, keyof typeof xunMap> = {
    0: "甲子旬",
    10: "甲戌旬",
    20: "甲申旬",
    30: "甲午旬",
    40: "甲辰旬",
    50: "甲寅旬",
  };
  const xunHead = xunHeadMap[xunHeadIndex];
  if (xunHead === undefined) throw new Error(`无效干支配对：${dayStem}${dayBranch} 不属于六十甲子`);
  return xunMap[xunHead];
}
