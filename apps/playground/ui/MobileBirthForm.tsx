// Phones and tablets: AstroZi's wheel picker — 年 / 月 / 日 / 时 / 分 wheels, 男 / 女, the 农历 switch.
import type { Accessor } from "nsh";
import { View } from "nsh";
import { type BirthForm, type Gender, monthKey, monthsFor, selectedMonth, YEAR_RANGE } from "../engine/form";
import { pad2 } from "../model/labels";
import { shichenOf } from "../vendor/iching-bazi";
import { ChoicePair, SwitchRow } from "./Fields";
import { Wheel, type WheelItem } from "./Wheel";

const GENDERS = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const;

const YEARS: WheelItem[] = Array.from({ length: YEAR_RANGE.to - YEAR_RANGE.from + 1 }, (_, i) => {
  const year = YEAR_RANGE.from + i;
  return { key: String(year), label: String(year) };
});
const HOURS: WheelItem[] = Array.from({ length: 24 }, (_, hour) => ({
  key: String(hour),
  label: `${pad2(hour)}${shichenOf(hour).slice(0, 1)}`,
}));
const MINUTES: WheelItem[] = Array.from({ length: 60 }, (_, minute) => ({ key: String(minute), label: pad2(minute) }));

export function MobileBirthForm(props: { form: Accessor<BirthForm>; patch: (changes: Partial<BirthForm>) => void }) {
  const months = (): WheelItem[] =>
    monthsFor(props.form()).map((month) => ({ key: monthKey(month.month, month.isLeap), label: month.label }));
  const days = (): WheelItem[] =>
    Array.from({ length: selectedMonth(props.form())?.days ?? 0 }, (_, i) => ({ key: String(i + 1), label: String(i + 1) }));
  const pickMonth = (key: string) => {
    const month = monthsFor(props.form()).find((item) => monthKey(item.month, item.isLeap) === key);
    if (month) props.patch({ month: month.month, isLeapMonth: month.isLeap });
  };
  return (
    <>
      <View testID="wheel-form" class="flex-row gap-1.5">
        <Wheel label="年" items={YEARS} value={String(props.form().year)} onChange={(key) => props.patch({ year: Number(key) })} />
        <Wheel label="月" items={months()} value={monthKey(props.form().month ?? 0, props.form().isLeapMonth)} onChange={pickMonth} />
        <Wheel label="日" items={days()} value={String(props.form().day)} onChange={(key) => props.patch({ day: Number(key) })} />
        <Wheel label="时" items={HOURS} value={String(props.form().hour)} onChange={(key) => props.patch({ hour: Number(key) })} />
        <Wheel label="分" items={MINUTES} value={String(props.form().minute)} onChange={(key) => props.patch({ minute: Number(key) })} />
      </View>
      <ChoicePair label="性别" options={GENDERS} value={props.form().gender} onChange={(gender: Gender) => props.patch({ gender })} />
      <SwitchRow label="农历" checked={props.form().lunar} onChange={(lunar) => props.patch({ lunar })} />
    </>
  );
}
