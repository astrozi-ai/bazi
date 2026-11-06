/**
 * @iching/bazi — chart facts (L0) and relation tables (L1) for BaZi.
 *
 * Owns the 排盘事实层, the single relation authority, and the ChartSnapshot
 * projection. It holds no school rulings: strength scoring, patterns and
 * useful gods belong to the packages that build on it.
 */
export const BAZI_CORE_PACKAGE = "@iching/bazi" as const;

export type {
  BranchName,
  ElementName,
  GenderType,
  StemName,
  TenGodSimplified,
  TenGodType,
  YinYangType,
} from "./core-types";

export * from "./chart";
export * as relations from "./relations";
export * as tables from "./tables";
export { getKongWang } from "./algorithms/kong-wang";
export * from "./snapshot/chart-snapshot";
export {
  buildRuntimeCurrentAsOfContext,
  calculateFullAgeAt,
  calculateNominalAgeInYear,
  deterministicAsOfContextForBirthYear,
  normalizeBaziAsOfContext,
  resolveBaziAsOfContext,
  resolveRuntimeCurrentBaziAsOfContext,
} from "./time-context";
export type { BaziAsOfContext, BaziAsOfSource } from "./time-context";

export * as shensha from "./shensha/shensha";
export * as paipan from "./paipan/index";
