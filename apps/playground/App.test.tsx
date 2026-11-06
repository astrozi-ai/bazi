// The playground's flows, with the steps a user takes; expected cells come from the package's golden.
import { expect, open, test } from "nsh/test";
import golden from "../../packages/bazi/src/paipan/__tests__/fixtures/synthetic/paipan.golden.json";
import { cachedSheets, loadSheet } from "./engine/sheet";

const PHONE = { platform: "ios" } as const;
const DESKTOP = { platform: "macos", width: 1100, height: 820 } as const;

function typedMoment(caseIndex: number) {
  const input = golden.cases[caseIndex]?.input;
  if (!input) throw new Error(`golden has no case ${caseIndex}`);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${input.year}-${pad(input.month)}-${pad(input.day)} ${pad(input.hour)}:${pad(input.minute)}`;
}

function goldenSelection(caseIndex: number, year: number) {
  const entry = golden.cases[caseIndex]?.selections.find((item) => item.year === year);
  if (!entry) throw new Error(`golden has no selection for case ${caseIndex}, year ${year}`);
  return entry.selection;
}

test("phone: wheels pick the moment and the engine charts it, cell for cell", async () => {
  const app = await open("./App.tsx", PHONE);
  await app.waitFor("id:wheel-form");
  await app.press("id:sample-a");
  await app.press("id:submit");
  await app.waitFor("id:paipan-grid");
  expect(app.texts()).toContain("己卯 丙子 戊午 戊午");
  await app.press("label:2008 乙亥");
  const expected = goldenSelection(0, 2008);
  await app.waitFor(`text:${expected.columns.liunian.naYin}`);
  expect(app.texts()).toContain(expected.qiyun.ageText);
  expect(app.texts()).toContain(expected.qiyun.changeText);
});

test("phone: the month wheel offers a leap month only in a year that has one", async () => {
  const app = await open("./App.tsx", PHONE);
  await app.press("id:sample-b");
  await app.waitFor("label:月 闰四月");
  await app.press("label:年 2002");
  await app.waitUntil(() => app.count("label:月 闰四月") === 0);
  await app.press("label:年 2001");
  await app.waitFor("label:月 闰四月");
  await app.press("label:月 闰四月");
  await app.press("id:submit");
  await app.waitFor("id:paipan-grid");
  expect(app.texts()).toContain("辛巳 甲午 己酉 戊辰");
  expect(app.texts().some((text) => text.includes("闰四月廿四"))).toBe(true);
});

test("desktop: a typed moment and Return chart it", async () => {
  const app = await open("./App.tsx", DESKTOP);
  await app.waitFor("id:field-moment");
  expect(app.count("id:wheel-form")).toBe(0);
  await app.type("id:field-moment", typedMoment(0));
  await app.submit("id:field-moment");
  await app.waitFor("id:paipan-grid");
  expect(app.texts()).toContain("己卯 丙子 戊午 戊午");
  await app.press("label:返回");
  await app.waitFor("id:field-moment");
  expect(app.shows("id:paipan-grid")).toBe(false);
});

test("desktop: a moment that is not a date is refused, not guessed", async () => {
  const app = await open("./App.tsx", DESKTOP);
  await app.type("id:field-moment", "明年春天");
  await app.submit("id:field-moment");
  await app.waitFor("id:form-problem");
  expect(app.shows("id:paipan-grid")).toBe(false);
});

test("desktop: 农历 offers its months as a list, the leap month included", async () => {
  const app = await open("./App.tsx", DESKTOP);
  await app.press("id:sample-b");
  await app.waitFor("id:field-lunar-month");
  expect(app.texts()).toContain("闰四月");
  await app.press("id:submit");
  await app.waitFor("id:paipan-grid");
  expect(app.texts()).toContain("辛巳 甲午 己酉 戊辰");
});

test("the 大运 row pages, and the 流月 row follows the selected year", async () => {
  const app = await open("./App.tsx");
  await app.press("id:sample-a");
  await app.press("id:submit");
  await app.waitFor("id:fortune-table");
  await app.press("label:2008 乙亥");
  await app.waitFor("label:流月 立春 甲寅");
  await app.press("label:大运下一页");
  await app.waitFor("label:2088 丁卯");
});

test("one moment is computed once, whichever calendar it was entered in", async () => {
  const before = cachedSheets();
  const reference = { year: 2026, month: 11 };
  const lunar = loadSheet(
    { calendar: "chinese-lunar", year: 2001, month: 4, day: 24, isLeapMonth: true, hour: 8, minute: 30, gender: "female" },
    reference,
  );
  const solar = loadSheet(
    { calendar: "gregorian", year: 2001, month: 6, day: 15, isLeapMonth: false, hour: 8, minute: 30, gender: "female" },
    reference,
  );
  expect(solar).toBe(lunar);
  expect(cachedSheets()).toBe(before + 1);
  expect((await solar).pillars).toBe("辛巳 甲午 己酉 戊辰");
});
