// How the sheet colors a glyph by its 五行: literal classes, so the build checks each token against the theme.

export type FiveElement = "木" | "火" | "土" | "金" | "水";

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
