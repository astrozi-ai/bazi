// The words and classes the playground shows for chart facts.
import type { Sheet } from "../engine/sheet";

export type FiveElement = "木" | "火" | "土" | "金" | "水";

export const GENDER_LABELS = { male: "乾造", female: "坤造" } as const;

/** Literal classes, so the build checks each token. */
export const ELEMENT_TEXT: Record<FiveElement, string> = {
  木: "text-wood",
  火: "text-fire",
  土: "text-earth",
  金: "text-metal",
  水: "text-water",
};

/** A cell that shows one element's glyph is washed in its color, faintly. */
export const ELEMENT_WASH: Record<FiveElement, string> = {
  木: "bg-wood/6",
  火: "bg-fire/6",
  土: "bg-earth/6",
  金: "bg-metal/6",
  水: "bg-water/6",
};

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** The info line under the name: the moment the engine used, then its lunar reading. */
export function birthLine(sheet: Sheet): string {
  const m = sheet.moment;
  if (m.minute === undefined) throw new Error("the engine's moment has no minute");
  return `公历 ${m.year}年${m.month}月${m.day}日 ${pad2(m.hour)}:${pad2(m.minute)}　农历 ${sheet.lunar.label}`;
}

/** The conventions every chart here is cast with. */
export const CONVENTION_LINE = "按出生地钟点排盘，未做真太阳时修正 · 子初换日 · 起运按节气间隔折算";
