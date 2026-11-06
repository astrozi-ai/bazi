// A page: the birth moment in one card, in either calendar; 排盘 hands it to the engine.
import { Scroll, signal, Text, View } from "nsh";
import { Button, NavPage } from "nsh/base";
import { nav } from "../nav";
import { ChoicePair, NumberColumn, SwitchRow } from "../ui/Fields";
import { Header } from "../ui/Header";
import { type BirthInput, BirthInputError, toChartInput } from "../vendor/iching-bazi";

const TITLE = "八字排盘";

type Gender = BirthInput["gender"];

const GENDERS = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const;

/** What the form holds: numbers stay empty until typed. */
interface BirthForm {
  lunar: boolean;
  isLeapMonth: boolean;
  year: number | null;
  month: number | null;
  day: number | null;
  hour: number | null;
  minute: number | null;
  gender: Gender;
}

const EMPTY: BirthForm = { lunar: false, isLeapMonth: false, year: null, month: null, day: null, hour: null, minute: null, gender: "male" };

/** Made-up moments that belong to no one, to try the sheet with. */
const SAMPLES: { id: string; label: string; form: BirthForm }[] = [
  { id: "a", label: "示例甲", form: { lunar: false, isLeapMonth: false, year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: "male" } },
  { id: "b", label: "示例乙", form: { lunar: true, isLeapMonth: true, year: 2001, month: 4, day: 24, hour: 8, minute: 30, gender: "female" } },
];

/** The engine's input, once every number is there. */
function birthInputOf(form: BirthForm): BirthInput | null {
  const { year, month, day, hour, minute } = form;
  if (year === null || month === null || day === null || hour === null || minute === null) return null;
  const calendar = form.lunar ? "chinese-lunar" : "gregorian";
  return { calendar, year, month, day, hour, minute, isLeapMonth: form.lunar && form.isLeapMonth, gender: form.gender };
}

export function InputPage() {
  const form = signal<BirthForm>(EMPTY);
  const problem = signal<string | null>(null);
  const patch = (changes: Partial<BirthForm>) => {
    problem.set(null);
    form.update((current) => ({ ...current, ...changes }));
  };
  const submit = () => {
    const input = birthInputOf(form());
    if (!input) return;
    try {
      toChartInput(input);
    } catch (error) {
      if (!(error instanceof BirthInputError)) throw error;
      problem.set(error.message);
      return;
    }
    nav.push({ name: "chart", input });
  };

  return (
    <NavPage title={TITLE} header={<Header title={TITLE} />}>
      <Scroll class="flex-1 bg-background" contentClass="w-full max-w-xl gap-3 self-center pt-3 pb-[env(safe-area-inset-bottom)]">
        <View class="mx-4 gap-3 rounded-(--radius-card) bg-card p-4">
          <View class="flex-row items-center justify-between">
            <Text class="text-lg font-bold text-foreground">出生信息</Text>
            <View class="flex-row gap-2">
              <Each of={SAMPLES}>
                {(sample) => (
                  <Button
                    testID={`sample-${sample().id}`}
                    hitSlop={6}
                    onPress={() => {
                      problem.set(null);
                      form.set(sample().form);
                    }}
                    class="rounded-full border border-border px-3 py-1 active:bg-muted"
                  >
                    <Text class="text-xs text-muted-foreground">{sample().label}</Text>
                  </Button>
                )}
              </Each>
            </View>
          </View>

          <View class="flex-row gap-2">
            <NumberColumn label="年" testID="field-year" min={1901} max={2099} value={form().year} onChange={(year) => patch({ year })} />
            <NumberColumn label="月" testID="field-month" min={1} max={12} value={form().month} onChange={(month) => patch({ month })} />
            <NumberColumn label="日" testID="field-day" min={1} max={31} value={form().day} onChange={(day) => patch({ day })} />
            <NumberColumn label="时" testID="field-hour" min={0} max={23} value={form().hour} onChange={(hour) => patch({ hour })} />
            <NumberColumn label="分" testID="field-minute" min={0} max={59} value={form().minute} onChange={(minute) => patch({ minute })} />
          </View>

          <ChoicePair label="性别" options={GENDERS} value={form().gender} onChange={(gender: Gender) => patch({ gender })} />

          <View>
            <SwitchRow label="农历" checked={form().lunar} onChange={(lunar) => patch({ lunar, isLeapMonth: false })} />
            <If when={form().lunar}>
              <SwitchRow label="闰月" checked={form().isLeapMonth} onChange={(isLeapMonth) => patch({ isLeapMonth })} />
            </If>
          </View>

          <Button
            testID="submit"
            disabled={birthInputOf(form()) === null}
            onPress={submit}
            class="group mt-1 items-center rounded-(--radius-card) bg-primary py-3.5 active:opacity-80 disabled:bg-muted"
          >
            <Text class="text-base font-semibold text-primary-foreground group-disabled:text-muted-foreground">排盘</Text>
          </Button>
          <If when={problem()}>
            {(message) => (
              <Text testID="form-problem" class="text-sm text-destructive">
                {message()}
              </Text>
            )}
          </If>
        </View>
      </Scroll>
    </NavPage>
  );
}
