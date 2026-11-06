// The playground's flows, with the steps a user takes; expected cells come from the package's golden.
import { expect, open, test } from "nsh/test";
import golden from "../../packages/bazi/src/paipan/__tests__/fixtures/synthetic/paipan.golden.json";
import { cachedSheets, loadSheet } from "./engine/sheet";

function goldenSelection(caseIndex: number, year: number) {
  const entry = golden.cases[caseIndex]?.selections.find((item) => item.year === year);
  if (!entry) throw new Error(`golden has no selection for case ${caseIndex}, year ${year}`);
  return entry.selection;
}

test("an empty form cannot be charted", async () => {
  const app = await open("./App.tsx");
  expect(app.enabled("id:submit")).toBe(false);
});

test("a Gregorian moment is charted by the engine, cell for cell", async () => {
  const app = await open("./App.tsx");
  await app.press("id:sample-a");
  await app.press("id:submit");
  await app.waitFor("id:paipan-grid");
  expect(app.texts()).toContain("己卯 丙子 戊午 戊午");
  await app.press("label:2008 乙亥");
  const expected = goldenSelection(0, 2008);
  await app.waitFor(`text:${expected.columns.liunian.naYin}`);
  expect(app.texts()).toContain(expected.qiyun.ageText);
  expect(app.texts()).toContain(expected.qiyun.changeText);
  expect(app.texts()).toContain(expected.columns.dayun.lifeStage);
});

test("a lunar leap-month moment goes through tyme4ts", async () => {
  const app = await open("./App.tsx");
  await app.press("id:sample-b");
  await app.waitFor("label:闰月");
  await app.press("id:submit");
  await app.waitFor("id:paipan-grid");
  expect(app.texts()).toContain("辛巳 甲午 己酉 戊辰");
  expect(app.texts().some((text) => text.includes("闰四月廿四"))).toBe(true);
});

test("a leap month the year does not have is refused before charting", async () => {
  const app = await open("./App.tsx");
  await app.press("id:sample-b");
  await app.clear("id:field-year");
  await app.type("id:field-year", "2002");
  await app.press("id:submit");
  await app.waitFor("id:form-problem");
  expect(app.shows("id:paipan-grid")).toBe(false);
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
