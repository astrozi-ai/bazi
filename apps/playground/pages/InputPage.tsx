// A page: the birth moment in one card. Phones get wheels, desktops typed fields; both edit one form.
import { platform, Scroll, signal, Text, View } from "nsh";
import { Button, NavPage } from "nsh/base";
import { type BirthForm, birthInputOf, normalizeForm, SAMPLES, START_FORM } from "../engine/form";
import { nav } from "../nav";
import { DesktopBirthForm } from "../ui/DesktopBirthForm";
import { Header } from "../ui/Header";
import { MobileBirthForm } from "../ui/MobileBirthForm";
import { BirthInputError, toChartInput } from "../vendor/iching-bazi";

const TITLE = "八字排盘";

export function InputPage() {
  const form = signal<BirthForm>(START_FORM);
  const problem = signal<string | null>(null);
  const patch = (changes: Partial<BirthForm>) => {
    problem.set(null);
    form.update((current) => normalizeForm({ ...current, ...changes }));
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

          <If when={platform.desktop} else={<MobileBirthForm form={form} patch={patch} />}>
            <DesktopBirthForm form={form} patch={patch} submit={submit} refuse={(message) => problem.set(message)} />
          </If>

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
