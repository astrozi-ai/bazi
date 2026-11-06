/**
 * ============================================================
 * 十二长生状态查询模块 (Twelve Longevity States)
 * ============================================================
 * @module chart/longevityStates
 * @description 提供天干在各地支的十二长生状态查询，含绝地检测
 * @created 2025-12-03
 * @ai-context LONGEVITY_STATES_UTILITY
 *
 * 十二长生循环:
 * 长生 → 沐浴 → 冠带 → 临官 → 帝旺 → 衰 → 病 → 死 → 墓 → 绝 → 胎 → 养
 *
 * 阳干顺行，阴干逆行:
 * - 阳干 (甲丙戊庚壬): 从长生位顺时针
 * - 阴干 (乙丁己辛癸): 从长生位逆时针
 */

import type { BranchName, StemName } from "../core-types";

// ============================================================
// 🔄 十二长生状态类型定义
// ============================================================

/**
 * 十二长生状态
 * @description 按顺序排列的十二长生状态
 */
export type LongevityState =
  | "长生" // 0: Birth - 初生
  | "沐浴" // 1: Bathing - 幼年
  | "冠带" // 2: Crown - 成年
  | "临官" // 3: Official - 入仕
  | "帝旺" // 4: Emperor - 鼎盛
  | "衰" // 5: Decline - 衰退
  | "病" // 6: Illness - 病弱
  | "死" // 7: Death - 死亡
  | "墓" // 8: Tomb - 入墓
  | "绝" // 9: Extinction - 绝地
  | "胎" // 10: Embryo - 受胎
  | "养"; // 11: Nurture - 孕养

/**
 * 十二长生状态数组 (按顺序)
 */
const LONGEVITY_SEQUENCE: LongevityState[] = [
  "长生",
  "沐浴",
  "冠带",
  "临官",
  "帝旺",
  "衰",
  "病",
  "死",
  "墓",
  "绝",
  "胎",
  "养",
];

/**
 * 地支顺序 (用于计算)
 */
const BRANCH_SEQUENCE: BranchName[] = [
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
];

// ============================================================
// 📊 天干长生起点表
// ============================================================

/**
 * 阳干长生位
 * 甲长生在亥，丙戊长生在寅，庚长生在巳，壬长生在申
 */
const YANG_STEM_LONGEVITY_START: Record<string, BranchName> = {
  甲: "亥", // 木长生在亥
  丙: "寅", // 火长生在寅
  戊: "寅", // 阳土从火，长生在寅
  庚: "巳", // 金长生在巳
  壬: "申", // 水长生在申
};

/**
 * 阴干长生位
 * 乙长生在午，丁己长生在酉，辛长生在子，癸长生在卯
 */
const YIN_STEM_LONGEVITY_START: Record<string, BranchName> = {
  乙: "午", // 木长生在午
  丁: "酉", // 火长生在酉
  己: "酉", // 阴土从火，长生在酉
  辛: "子", // 金长生在子
  癸: "卯", // 水长生在卯
};

/**
 * 天干阴阳属性
 */
const STEM_POLARITY: Record<StemName, "yang" | "yin"> = {
  甲: "yang",
  乙: "yin",
  丙: "yang",
  丁: "yin",
  戊: "yang",
  己: "yin",
  庚: "yang",
  辛: "yin",
  壬: "yang",
  癸: "yin",
};

// ============================================================
// 🔍 核心查询函数
// ============================================================

/**
 * 获取天干在指定地支的十二长生状态
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 十二长生状态
 *
 * @example
 * getLongevityState('甲', '亥') // → '长生' (甲木长生在亥)
 * getLongevityState('甲', '申') // → '绝'   (甲木绝在申)
 * getLongevityState('丙', '寅') // → '长生' (丙火长生在寅)
 * getLongevityState('丙', '亥') // → '绝'   (丙火绝在亥)
 */
export function getLongevityState(stem: StemName, branch: BranchName): LongevityState {
  const polarity = STEM_POLARITY[stem];
  const isYang = polarity === "yang";

  // 获取长生起点
  const startBranch = isYang ? YANG_STEM_LONGEVITY_START[stem]! : YIN_STEM_LONGEVITY_START[stem]!;

  // 计算起点索引
  const startIndex = BRANCH_SEQUENCE.indexOf(startBranch);
  const currentIndex = BRANCH_SEQUENCE.indexOf(branch);

  // 计算偏移量
  let offset: number;
  if (isYang) {
    // 阳干顺行
    offset = (currentIndex - startIndex + 12) % 12;
  } else {
    // 阴干逆行
    offset = (startIndex - currentIndex + 12) % 12;
  }

  return LONGEVITY_SEQUENCE[offset]!;
}

/**
 * 检测天干在指定地支是否处于绝地
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 是否处于绝地
 *
 * @description 绝地是十二长生中最弱的状态，表示五行力量几乎为零
 *
 * @example
 * isDeathState('甲', '申') // → true  (甲木绝在申)
 * isDeathState('丙', '亥') // → true  (丙火绝在亥)
 * isDeathState('甲', '亥') // → false (甲木长生在亥)
 */
export function isDeathState(stem: StemName, branch: BranchName): boolean {
  return getLongevityState(stem, branch) === "绝";
}

/**
 * 检测天干在指定地支是否处于墓地
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 是否处于墓地
 *
 * @description 墓地表示五行入库，需结合墓库四大原则判断
 *
 * @example
 * isTombState('甲', '未') // → true  (甲木墓在未)
 * isTombState('丙', '戌') // → true  (丙火墓在戌)
 */
export function isTombState(stem: StemName, branch: BranchName): boolean {
  return getLongevityState(stem, branch) === "墓";
}

/**
 * 检测天干在指定地支是否处于长生位
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 是否处于长生位
 *
 * @description 长生位是十二长生的起点，表示五行初生
 *
 * @example
 * isLongevityBirth('甲', '亥') // → true  (甲木长生在亥)
 * isLongevityBirth('丙', '寅') // → true  (丙火长生在寅)
 */
export function isLongevityBirth(stem: StemName, branch: BranchName): boolean {
  return getLongevityState(stem, branch) === "长生";
}

/**
 * 检测天干在指定地支是否处于帝旺位
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 是否处于帝旺位
 *
 * @description 帝旺位是十二长生中最旺的状态
 *
 * @example
 * isEmperorState('甲', '卯') // → true  (甲木帝旺在卯)
 * isEmperorState('丙', '午') // → true  (丙火帝旺在午)
 */
export function isEmperorState(stem: StemName, branch: BranchName): boolean {
  return getLongevityState(stem, branch) === "帝旺";
}

// ============================================================
// 📈 状态强度评估
// ============================================================

/**
 * 长生状态强度等级
 * @description 用于评估五行在某地支的力量强度
 */
export type LongevityStrength = "very_strong" | "strong" | "moderate" | "weak" | "very_weak";

/**
 * 状态到强度的映射
 */
const STATE_STRENGTH_MAP: Record<LongevityState, LongevityStrength> = {
  长生: "strong",
  沐浴: "moderate",
  冠带: "strong",
  临官: "very_strong",
  帝旺: "very_strong",
  衰: "moderate",
  病: "weak",
  死: "very_weak",
  墓: "weak", // 墓库需特殊判断
  绝: "very_weak",
  胎: "weak",
  养: "moderate",
};

/**
 * 获取天干在指定地支的力量强度
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 力量强度等级
 *
 * @example
 * getLongevityStrength('甲', '卯') // → 'very_strong' (帝旺)
 * getLongevityStrength('甲', '申') // → 'very_weak'   (绝)
 */
export function getLongevityStrength(stem: StemName, branch: BranchName): LongevityStrength {
  const state = getLongevityState(stem, branch);
  return STATE_STRENGTH_MAP[state];
}

/**
 * 检测天干在指定地支是否有力 (临官/帝旺/长生/冠带)
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 是否有力
 */
export function hasStrength(stem: StemName, branch: BranchName): boolean {
  const strength = getLongevityStrength(stem, branch);
  return strength === "very_strong" || strength === "strong";
}

/**
 * 检测天干在指定地支是否无力 (死/绝/胎/病)
 *
 * @param stem 天干
 * @param branch 地支
 * @returns 是否无力
 */
export function isWeak(stem: StemName, branch: BranchName): boolean {
  const strength = getLongevityStrength(stem, branch);
  return strength === "very_weak" || strength === "weak";
}

// ============================================================
// 🗺️ 批量查询工具
// ============================================================

/**
 * 获取天干在所有地支的十二长生状态表
 *
 * @param stem 天干
 * @returns 地支到长生状态的映射
 *
 * @example
 * getAllLongevityStates('甲')
 * // → { '子': '沐浴', '丑': '冠带', '寅': '临官', ... }
 */
export function getAllLongevityStates(stem: StemName): Record<BranchName, LongevityState> {
  const result = {} as Record<BranchName, LongevityState>;
  for (const branch of BRANCH_SEQUENCE) {
    result[branch] = getLongevityState(stem, branch);
  }
  return result;
}

/**
 * 获取天干的特定长生状态所在地支
 *
 * @param stem 天干
 * @param state 目标长生状态
 * @returns 该状态对应的地支
 *
 * @example
 * getBranchForState('甲', '长生') // → '亥'
 * getBranchForState('甲', '绝')   // → '申'
 * getBranchForState('丙', '帝旺') // → '午'
 */
export function getBranchForState(stem: StemName, state: LongevityState): BranchName {
  const polarity = STEM_POLARITY[stem];
  const isYang = polarity === "yang";

  // 获取长生起点
  const startBranch = isYang ? YANG_STEM_LONGEVITY_START[stem]! : YIN_STEM_LONGEVITY_START[stem]!;

  const startIndex = BRANCH_SEQUENCE.indexOf(startBranch);
  const stateOffset = LONGEVITY_SEQUENCE.indexOf(state);

  let targetIndex: number;
  if (isYang) {
    // 阳干顺行
    targetIndex = (startIndex + stateOffset) % 12;
  } else {
    // 阴干逆行
    targetIndex = (startIndex - stateOffset + 12) % 12;
  }

  return BRANCH_SEQUENCE[targetIndex]!;
}

// ============================================================
// 📋 长生位置常量表 (预计算，优化性能)
// ============================================================

/**
 * 天干绝地位置表
 * @description 预计算的天干绝地位置，用于快速查询
 */
export const STEM_DEATH_POSITIONS: Record<StemName, BranchName> = {
  甲: "申", // 甲木绝在申
  乙: "亥", // 乙木绝在亥
  丙: "亥", // 丙火绝在亥
  丁: "寅", // 丁火绝在寅
  戊: "亥", // 戊土绝在亥 (从火)
  己: "寅", // 己土绝在寅 (从火)
  庚: "寅", // 庚金绝在寅
  辛: "巳", // 辛金绝在巳
  壬: "巳", // 壬水绝在巳
  癸: "申", // 癸水绝在申
};

/**
 * 天干墓库位置表
 * @description 预计算的天干墓库位置，用于快速查询
 */
export const STEM_TOMB_POSITIONS: Record<StemName, BranchName> = {
  甲: "未", // 甲木墓在未
  乙: "戌", // 乙木墓在戌
  丙: "戌", // 丙火墓在戌
  丁: "丑", // 丁火墓在丑
  戊: "戌", // 戊土墓在戌 (从火)
  己: "丑", // 己土墓在丑 (从火)
  庚: "丑", // 庚金墓在丑
  辛: "辰", // 辛金墓在辰
  壬: "辰", // 壬水墓在辰
  癸: "未", // 癸水墓在未
};

/**
 * 天干长生位置表
 * @description 预计算的天干长生位置，用于快速查询
 */
export const STEM_LONGEVITY_POSITIONS: Record<StemName, BranchName> = {
  甲: "亥", // 甲木长生在亥
  乙: "午", // 乙木长生在午
  丙: "寅", // 丙火长生在寅
  丁: "酉", // 丁火长生在酉
  戊: "寅", // 戊土长生在寅 (从火)
  己: "酉", // 己土长生在酉 (从火)
  庚: "巳", // 庚金长生在巳
  辛: "子", // 辛金长生在子
  壬: "申", // 壬水长生在申
  癸: "卯", // 癸水长生在卯
};

/**
 * 天干帝旺位置表
 * @description 预计算的天干帝旺位置，用于快速查询
 */
export const STEM_EMPEROR_POSITIONS: Record<StemName, BranchName> = {
  甲: "卯", // 甲木帝旺在卯
  乙: "寅", // 乙木帝旺在寅
  丙: "午", // 丙火帝旺在午
  丁: "巳", // 丁火帝旺在巳
  戊: "午", // 戊土帝旺在午 (从火)
  己: "巳", // 己土帝旺在巳 (从火)
  庚: "酉", // 庚金帝旺在酉
  辛: "申", // 辛金帝旺在申
  壬: "子", // 壬水帝旺在子
  癸: "亥", // 癸水帝旺在亥
};
