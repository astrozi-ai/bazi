// The hooks the pages read: the chart as a resource, the selected year's sheet as lookups.
import { type Accessor, resource, signal } from "nsh";
import { paipan, type BirthInput } from "../../../packages/bazi/nsh/iching-bazi";
import { loadSheet, type Reference, type Sheet } from "./sheet";

export function today(): Reference {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** The chart for `input`, computed once per moment (see `loadSheet`); `undefined` while it loads. */
export function useSheet(input: Accessor<BirthInput | null>) {
  return resource(input, (birth) => loadSheet(birth, today()));
}

/** The selected year (starting on today, clamped into the chart's span) and the fortune table's paging. */
export function useSelection(sheet: Accessor<Sheet>) {
  const year = signal(paipan.selectBaziPaipanDefaultYear(sheet().view));
  const fortune = signal<paipan.BaziFortuneTableState>(paipan.BAZI_FORTUNE_INITIAL_STATE);
  const selection = () => paipan.selectBaziPaipanYear(sheet().view, year());
  const rows = () => paipan.buildBaziFortuneRows(sheet().view, year(), fortune());
  /** A press in the fortune table: 大运 / 流年 select their year, 小运 the birth year; pages and expansions follow. */
  const press = (rowIndex: number, cell: paipan.BaziFortuneCell) => {
    fortune.set(paipan.nextBaziFortuneState(fortune(), rowIndex, cell));
    if (cell.type === "dayun" || cell.type === "liunian") year.set(cell.year);
    else if (cell.type === "xiaoyun") year.set(sheet().view.birthYear);
  };
  return { year, fortune, selection, rows, press };
}
