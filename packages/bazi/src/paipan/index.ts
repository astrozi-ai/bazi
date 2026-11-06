/**
 * The 7 × 13 排盘 sheet as data: the main table (流年 / 大运 / 年 / 月 / 日 / 时 × 主星 … 起运)
 * and the 大运 / 流年 / 流月 rows, for every selectable year. Renderers read it and never
 * call the chart engine.
 */
export { buildBaziPaipanView } from "./build-view";
export {
	BAZI_FORTUNE_INITIAL_STATE,
	type BaziFortuneCell,
	type BaziFortuneTableState,
	buildBaziFortuneRows,
	nextBaziFortuneState,
} from "./fortune-rows";
export { type BaziPaipanLiunianCell, selectBaziPaipanLiunianWindow } from "./liunian-window";
export { BAZI_PAIPAN_EMPTY_COLUMN, selectBaziPaipanDefaultYear, selectBaziPaipanYear } from "./select";
export * from "./types";
