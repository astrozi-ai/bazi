/**
 * Core naming primitives of the chart layer: the seven aliases the chart code uses.
 */

/** 天干. */
export type StemName = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";

/** 地支. */
export type BranchName =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

/** 五行. */
export type ElementName = "木" | "火" | "土" | "金" | "水";

/** 阴阳. */
export type YinYangType = "阴" | "阳";

/** 性别. */
export type GenderType = "male" | "female";

/** 十神. */
export type TenGodType =
  | "比肩"
  | "劫财"
  | "食神"
  | "伤官"
  | "偏财"
  | "正财"
  | "七杀"
  | "正官"
  | "偏印"
  | "正印";

/** 十神简称. */
export type TenGodSimplified = "比" | "劫" | "食" | "伤" | "才" | "财" | "杀" | "官" | "枭" | "印";
