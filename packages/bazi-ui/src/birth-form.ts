// The birth form both layouts edit: one model, one set of rules; only the way it is entered differs.
import { type BirthInput, type CalendarMonth, monthsOf } from "./engine";

export type Gender = BirthInput["gender"];

/** What the form holds. A number is `null` while a typed field is empty. */
export interface BirthForm {
  lunar: boolean;
  year: number | null;
  month: number | null;
  /** The month is the leap month of `month` (农历 only). */
  isLeapMonth: boolean;
  day: number | null;
  hour: number | null;
  minute: number | null;
  gender: Gender;
}

export const YEAR_RANGE = { from: 1901, to: 2099 } as const;

/** Where a new form starts: a moment to scroll from, not anyone's birth. */
export const START_FORM: BirthForm = {
  lunar: false,
  year: 1990,
  month: 1,
  isLeapMonth: false,
  day: 1,
  hour: 12,
  minute: 0,
  gender: "male",
};

/** The months the form offers for its year and calendar (from tyme4ts), or none until a year is set. */
export function monthsFor(form: BirthForm): CalendarMonth[] {
  if (form.year === null || form.year < YEAR_RANGE.from || form.year > YEAR_RANGE.to) return [];
  return monthsOf(form.lunar ? "chinese-lunar" : "gregorian", form.year);
}

/** A month's key in a list: `4` or `4L` for 闰四月. */
export function monthKey(month: number, isLeap: boolean): string {
  return `${month}${isLeap ? "L" : ""}`;
}

export function selectedMonth(form: BirthForm): CalendarMonth | undefined {
  return monthsFor(form).find((item) => item.month === form.month && item.isLeap === form.isLeapMonth);
}

/**
 * Keeps the form inside its calendar after a change, visibly: a leap month the year does not have
 * becomes the plain month, and a day past the month's end becomes its last day, as the wheels show.
 */
export function normalizeForm(form: BirthForm): BirthForm {
  const months = monthsFor(form);
  if (months.length === 0 || form.month === null) return form;
  const hasLeap = months.some((item) => item.month === form.month && item.isLeap);
  const isLeapMonth = form.lunar && form.isLeapMonth && hasLeap;
  const month = months.find((item) => item.month === form.month && item.isLeap === isLeapMonth);
  const day = month && form.day !== null ? Math.min(form.day, month.days) : form.day;
  return { ...form, isLeapMonth, day };
}

/** The engine's input, once every number is there. */
export function birthInputOf(form: BirthForm): BirthInput | null {
  const { year, month, day, hour, minute } = form;
  if (year === null || month === null || day === null || hour === null || minute === null) return null;
  return {
    calendar: form.lunar ? "chinese-lunar" : "gregorian",
    year,
    month,
    day,
    hour,
    minute,
    isLeapMonth: form.lunar && form.isLeapMonth,
    gender: form.gender,
  };
}

/**
 * Reads a typed moment, "YYYY-MM-DD HH:mm" (or with `/`, `.` or a `T`), as a 公历 form; anything
 * else is `null`, never guessed.
 */
export function parseMoment(text: string): Pick<BirthForm, "year" | "month" | "day" | "hour" | "minute"> | null {
  const match = /^\s*(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})[ T](\d{1,2}):(\d{2})\s*$/.exec(text);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number) as [number, number, number, number, number];
  return { year, month, day, hour, minute };
}
