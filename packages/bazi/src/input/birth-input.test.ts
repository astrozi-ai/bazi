import { describe, expect, it } from "bun:test";
import { BirthInputError, lunarLabelOf, toChartInput, type BirthInput } from "./birth-input";

const NOON: Omit<BirthInput, "calendar" | "year" | "month" | "day" | "isLeapMonth"> = {
  hour: 12,
  minute: 0,
  gender: "female",
};

describe("Given a birth moment When it enters the chart engine", () => {
  it("Then a Gregorian date passes through unchanged", () => {
    const input = toChartInput({ ...NOON, calendar: "gregorian", year: 2001, month: 6, day: 15, isLeapMonth: false });
    expect(input).toEqual({ year: 2001, month: 6, day: 15, hour: 12, minute: 0, second: 0, gender: "female" });
  });

  it("Then a lunar leap-month date is converted by tyme4ts", () => {
    const input = toChartInput({ ...NOON, calendar: "chinese-lunar", year: 2001, month: 4, day: 24, isLeapMonth: true });
    expect([input.year, input.month, input.day]).toEqual([2001, 6, 15]);
    expect(lunarLabelOf(input)).toMatchObject({ year: 2001, month: 4, isLeap: true, day: 24, label: "闰四月廿四" });
  });

  it("Then the same lunar day without the leap flag is a different day", () => {
    const input = toChartInput({ ...NOON, calendar: "chinese-lunar", year: 2001, month: 4, day: 24, isLeapMonth: false });
    expect([input.year, input.month, input.day]).not.toEqual([2001, 6, 15]);
  });

  it("Then a leap month the year does not have is refused", () => {
    expect(() =>
      toChartInput({ ...NOON, calendar: "chinese-lunar", year: 2002, month: 4, day: 1, isLeapMonth: true }),
    ).toThrow(BirthInputError);
  });

  it("Then a Gregorian date that does not exist is refused", () => {
    expect(() =>
      toChartInput({ ...NOON, calendar: "gregorian", year: 2023, month: 2, day: 29, isLeapMonth: false }),
    ).toThrow(BirthInputError);
  });

  it("Then a leap flag on a Gregorian date is refused", () => {
    expect(() =>
      toChartInput({ ...NOON, calendar: "gregorian", year: 2001, month: 4, day: 1, isLeapMonth: true }),
    ).toThrow("公历没有闰月");
  });

  it("Then an hour outside 0-23 is refused", () => {
    expect(() =>
      toChartInput({ ...NOON, hour: 24, calendar: "gregorian", year: 2001, month: 4, day: 1, isLeapMonth: false }),
    ).toThrow(BirthInputError);
  });
});
