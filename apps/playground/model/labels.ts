// The words the playground shows around the sheet.
import { pad2 } from "../../../packages/bazi-ui/src/elements";
import type { Sheet } from "../engine/sheet";

export const GENDER_LABELS = { male: "乾造", female: "坤造" } as const;

/** The info line under the name: the moment the engine used, then its lunar reading. */
export function birthLine(sheet: Sheet): string {
  const m = sheet.moment;
  if (m.minute === undefined) throw new Error("the engine's moment has no minute");
  return `公历 ${m.year}年${m.month}月${m.day}日 ${pad2(m.hour)}:${pad2(m.minute)}　农历 ${sheet.lunar.label}`;
}

/** The conventions every chart here is cast with. */
export const CONVENTION_LINE = "按出生地钟点排盘，未做真太阳时修正 · 子初换日 · 起运按节气间隔折算";
