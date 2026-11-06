// Desktops and the web in the desktop idiom: typed fields (Tab between them, Up / Down to step, Return
// to chart), a field that takes a whole moment, and in 农历 a month list with its leap month.
import type { Accessor } from "nsh";
import { signal, Text, View } from "nsh";
import { Input, Select } from "nsh/base";
import { type BirthForm, type Gender, monthKey, monthsFor, parseMoment, selectedMonth, YEAR_RANGE } from "../engine/form";
import { shichenOf } from "../vendor/iching-bazi";
import { ChoicePair, NumberColumn, SwitchRow } from "./Fields";

const GENDERS = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const;

function MonthSelect(props: { form: Accessor<BirthForm>; patch: (changes: Partial<BirthForm>) => void }) {
  const items = () => monthsFor(props.form()).map((month) => ({ value: monthKey(month.month, month.isLeap), title: month.label }));
  const title = () => selectedMonth(props.form())?.label ?? "选择";
  const pick = (key: string | null) => {
    const month = monthsFor(props.form()).find((item) => monthKey(item.month, item.isLeap) === key);
    if (month) props.patch({ month: month.month, isLeapMonth: month.isLeap });
  };
  return (
    <View class="flex-1 gap-1.5">
      <Text class="text-center text-(length:--text-info) font-medium text-card-foreground">月</Text>
      <Select
        accessibilityLabel="农历月"
        items={items()}
        value={monthKey(props.form().month ?? 0, props.form().isLeapMonth)}
        onChange={({ value }) => pick(value)}
        trigger={
          <View testID="field-lunar-month" class="h-10 flex-row items-center justify-center gap-1 rounded-(--radius) border border-input bg-background">
            <Text class="text-base font-bold text-foreground">{title()}</Text>
            <Text class="text-xs text-muted-foreground">▾</Text>
          </View>
        }
        popupClass="rounded-(--radius) border border-border bg-popover p-1 shadow-lg"
        itemClass="min-h-8 justify-center rounded-(--radius) px-3 text-popover-foreground focus:bg-accent selected:font-semibold"
      />
    </View>
  );
}

export function DesktopBirthForm(props: {
  form: Accessor<BirthForm>;
  patch: (changes: Partial<BirthForm>) => void;
  submit: () => void;
  refuse: (message: string) => void;
}) {
  const typed = signal("");
  const takeMoment = () => {
    const moment = parseMoment(typed());
    if (!moment) {
      props.refuse("请按 YYYY-MM-DD HH:mm 的格式输入公历时间");
      return;
    }
    props.patch({ ...moment, lunar: false, isLeapMonth: false });
    typed.set("");
    props.submit();
  };
  const hourHint = () => {
    const hour = props.form().hour;
    return hour === null ? "" : shichenOf(hour);
  };
  return (
    <>
      <Input
        testID="field-moment"
        accessibilityLabel="公历时间"
        value={typed()}
        onChange={({ value }) => typed.set(value)}
        onSubmit={takeMoment}
        placeholder="直接输入公历时间（YYYY-MM-DD HH:mm），回车排盘"
        class="h-10 rounded-(--radius) border border-input bg-background px-3 text-sm text-foreground focus:border-ring"
      />
      <View class="flex-row gap-2">
        <NumberColumn label="年" testID="field-year" min={YEAR_RANGE.from} max={YEAR_RANGE.to} value={props.form().year} onChange={(year) => props.patch({ year })} onSubmit={props.submit} />
        <If
          when={props.form().lunar}
          else={<NumberColumn label="月" testID="field-month" min={1} max={12} value={props.form().month} onChange={(month) => props.patch({ month })} onSubmit={props.submit} />}
        >
          <MonthSelect form={props.form} patch={props.patch} />
        </If>
        <NumberColumn label="日" testID="field-day" min={1} max={selectedMonth(props.form())?.days ?? 31} value={props.form().day} onChange={(day) => props.patch({ day })} onSubmit={props.submit} />
        <NumberColumn label="时" testID="field-hour" min={0} max={23} value={props.form().hour} onChange={(hour) => props.patch({ hour })} onSubmit={props.submit} hint={hourHint()} />
        <NumberColumn label="分" testID="field-minute" min={0} max={59} value={props.form().minute} onChange={(minute) => props.patch({ minute })} onSubmit={props.submit} />
      </View>
      <View class="flex-row items-end gap-6">
        <View class="flex-1">
          <ChoicePair label="性别" options={GENDERS} value={props.form().gender} onChange={(gender: Gender) => props.patch({ gender })} />
        </View>
        <View class="w-40">
          <SwitchRow label="农历" checked={props.form().lunar} onChange={(lunar) => props.patch({ lunar })} />
        </View>
      </View>
    </>
  );
}
