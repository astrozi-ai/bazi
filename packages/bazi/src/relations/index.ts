/**
 * `@iching/bazi` 关系层 (L1) —— 本仓关系数据的唯一入口。
 *
 * 规则：chart 计算、engine 求值、school 节点都只能从这里读六合/六冲/六穿/六破/
 * 三刑/三合/三会/禄/刃/库/暗合/天干五合与相克。任何模块都不得自带第二份关系表。
 *
 * 争议成员（相绝、土库）不在这里，也没有默认值；见 `./contested.ts`。
 */

export {
  analyzeBranchInteractions,
  analyzeStemHiddenHarmonies,
  findSpouseStarPositions,
  getBranchClash,
  getBranchDestruction,
  getBranchHarm,
  getBranchHarmony,
  getBranchHiddenHarmony,
  getBranchPiercing,
  getBranchPunishments,
  getBranchThreeCombination,
  getBranchThreeGathering,
  getHiddenStemNames,
  getKuPosition,
  getLuPosition,
  getYangRenPosition,
  getYinRenPosition,
  hasElementRoot,
  hasStemRoot,
  isBranchHiddenHarmony,
  isClash,
  isDestruction,
  isHarm,
  isHarmony,
  isKuPosition,
  isLuPosition,
  isPartialThreeCombination,
  isPiercing,
  isPunishment,
  isSixCombination,
  isThreeCombination,
  isThreeGathering,
  isYangRenPosition,
  isYinRenPosition,
  stemHiddenHarmony,
} from "./branch-relations";
export type {
  BranchInteractionResult,
  HiddenStemRole,
  SpouseStarPosition,
  SpouseStarVisibility,
  StemHiddenHarmonyResult,
} from "./branch-relations";

export {
  analyzeStemRelation,
  getStemClashDescription,
  getStemClashTargets,
  getStemCombination,
  isStemClash,
  isStemCombination,
  STEM_COMBINATION_PAIRS,
} from "./stem-relations";

export {
  BRANCH_ABSOLUTE_CONTEST,
  CONTESTED_RELATIONS,
  CONTESTED_STORAGE_ELEMENTS,
  EARTH_STORAGE_CONTEST,
} from "./contested";
export type { ContestedRelation, ContestedVariant } from "./contested";
