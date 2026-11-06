/**
 * 输入层：用户填的出生时刻 → 引擎收的公历时刻。
 *
 * 公历、农历（闰月必须显式）都只经 tyme4ts 换算一次；引擎从不见到农历数字。换算不了的
 * 输入（不存在的日期、该年没有的闰月）抛 `BirthInputError`，不猜、不就近取。
 */
import { LunarDay, SolarDay } from "tyme4ts";
import type { ChartCalculationInput } from "../chart/types";
import type { GenderType } from "../core-types";

export type BirthCalendar = "gregorian" | "chinese-lunar";

export interface BirthInput {
  calendar: BirthCalendar;
  year: number;
  month: number;
  day: number;
  /** 只在农历时有意义：这个月是闰月。公历输入必须为 false。 */
  isLeapMonth: boolean;
  hour: number;
  minute: number;
  gender: GenderType;
}

export class BirthInputError extends Error {
  constructor(
    readonly code: "INVALID_DATE" | "INVALID_TIME" | "LEAP_MONTH_ON_GREGORIAN",
    message: string,
  ) {
    super(message);
    this.name = "BirthInputError";
  }
}

function requireInteger(value: number, min: number, max: number, what: string): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new BirthInputError("INVALID_TIME", `${what} 必须是 ${min}-${max} 的整数，收到 ${value}`);
  }
}

function solarDayOf(input: BirthInput): SolarDay {
  try {
    if (input.calendar === "gregorian") return SolarDay.fromYmd(input.year, input.month, input.day);
    const month = input.isLeapMonth ? -input.month : input.month;
    return LunarDay.fromYmd(input.year, month, input.day).getSolarDay();
  } catch (cause) {
    const label = input.calendar === "gregorian" ? "公历" : `农历${input.isLeapMonth ? "闰" : ""}`;
    throw new BirthInputError(
      "INVALID_DATE",
      `${label} ${input.year} 年 ${input.month} 月 ${input.day} 日不存在（${(cause as Error).message}）`,
    );
  }
}

/** The Gregorian moment the chart engine takes, converted by tyme4ts. */
export function toChartInput(input: BirthInput): ChartCalculationInput {
  if (input.calendar === "gregorian" && input.isLeapMonth) {
    throw new BirthInputError("LEAP_MONTH_ON_GREGORIAN", "公历没有闰月");
  }
  requireInteger(input.hour, 0, 23, "时");
  requireInteger(input.minute, 0, 59, "分");
  const day = solarDayOf(input);
  return {
    year: day.getYear(),
    month: day.getMonth(),
    day: day.getDay(),
    hour: input.hour,
    minute: input.minute,
    second: 0,
    gender: input.gender,
  };
}

/** The same moment, read back as a lunar date (for the info line). */
export function lunarLabelOf(input: ChartCalculationInput): {
  year: number;
  month: number;
  isLeap: boolean;
  day: number;
  label: string;
} {
  const lunar = SolarDay.fromYmd(input.year, input.month, input.day).getLunarDay();
  const month = lunar.getLunarMonth();
  return {
    year: month.getLunarYear().getYear(),
    month: Math.abs(month.getMonth()),
    isLeap: month.isLeap(),
    day: lunar.getDay(),
    label: `${month.getName()}${lunar.getName()}`,
  };
}
