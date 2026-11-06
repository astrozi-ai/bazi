// input → tyme4ts → chart engine → 排盘 view, cached by the normalised input.
import {
  type BirthInput,
  ChartUtils,
  lunarLabelOf,
  paipan,
  toChartInput,
} from "../../../packages/bazi/nsh/iching-bazi";

type ChartCalculationInput = ReturnType<typeof toChartInput>;

/** One computed chart: the Gregorian moment the engine used, its lunar reading and the 7 × 13 view. */
export interface Sheet {
  input: BirthInput;
  moment: ChartCalculationInput;
  lunar: ReturnType<typeof lunarLabelOf>;
  pillars: string;
  view: paipan.BaziPaipanView;
}

/** "Today" for the default selected year and the active 流月 cell. */
export interface Reference {
  year: number;
  month: number;
}

const CACHE_SIZE = 16;
const cache = new Map<string, Promise<Sheet>>();

/** The engine's own moment is the key: a lunar and a Gregorian entry of the same day share a sheet. */
function keyOf(moment: ChartCalculationInput, reference: Reference): string {
  const { year, month, day, hour, minute, gender } = moment;
  return [year, month, day, hour, minute, gender, reference.year, reference.month].join("|");
}

async function compute(input: BirthInput, moment: ChartCalculationInput, reference: Reference): Promise<Sheet> {
  const chart = await ChartUtils.calculateFullChart(moment);
  const { year, month, day, hour } = chart.fourPillars;
  return {
    input,
    moment,
    lunar: lunarLabelOf(moment),
    pillars: [year, month, day, hour].map((pillar) => `${pillar.stem}${pillar.branch}`).join(" "),
    view: paipan.buildBaziPaipanView(chart, { referenceYear: reference.year, referenceMonth: reference.month }),
  };
}

/**
 * The sheet for a birth input. A moment already computed comes from the cache; an input that
 * cannot be converted throws `BirthInputError` before anything is computed or cached.
 */
export function loadSheet(input: BirthInput, reference: Reference): Promise<Sheet> {
  const moment = toChartInput(input);
  const key = keyOf(moment, reference);
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = compute(input, moment, reference);
  cache.set(key, pending);
  pending.catch(() => cache.delete(key));
  if (cache.size > CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  return pending;
}

/** How many charts the cache holds (for tests). */
export function cachedSheets(): number {
  return cache.size;
}
