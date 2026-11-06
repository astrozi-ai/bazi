// A page: one chart as the 7 × 13 排盘 sheet, the user's line above it.
import { Scroll, Text, View } from "nsh";
import { Button, NavPage } from "nsh/base";
import { useSelection, useSheet } from "../engine/hooks";
import type { Sheet } from "../engine/sheet";
import { birthLine, CONVENTION_LINE, GENDER_LABELS } from "../model/labels";
import { nav } from "../nav";
import { FortuneTable } from "../../../packages/bazi-ui/src/FortuneTable";
import { Header } from "../../../packages/ui/src/Header";
import { PaipanGrid } from "../../../packages/bazi-ui/src/PaipanGrid";
import type { BirthInput } from "../../../packages/bazi/nsh/iching-bazi";

const TITLE = "八字排盘";

export function ChartPage(props: { input: BirthInput }) {
  const sheet = useSheet(() => props.input);
  return (
    <NavPage title={TITLE} header={<Header title={TITLE} onBack={() => nav.pop()} />}>
      <View class="flex-1 bg-card">
        <If when={!sheet.error()} else={<Failure error={sheet.error()} />}>
          <If when={sheet()} else={<Loading />}>
            {(loaded) => <SheetView sheet={loaded()} />}
          </If>
        </If>
      </View>
    </NavPage>
  );
}

function Loading() {
  return (
    <View class="flex-1 items-center justify-center p-8">
      <Text class="text-sm text-muted-foreground">排盘中…</Text>
    </View>
  );
}

function Failure(props: { error: unknown }) {
  return (
    <View class="flex-1 items-center justify-center gap-2 p-8">
      <Text class="text-base text-destructive">排盘失败</Text>
      <Text testID="chart-error" class="text-center text-sm text-muted-foreground">
        {props.error instanceof Error ? props.error.message : String(props.error)}
      </Text>
    </View>
  );
}

function UserInfo(props: { sheet: Sheet }) {
  return (
    <View class="flex-row items-center bg-card px-4 py-2">
      <View class="flex-1 gap-0.5">
        <View class="flex-row items-center gap-2">
          <Text class="text-(length:--text-info) font-semibold text-foreground">命主</Text>
          <Text class="text-(length:--text-info) text-foreground">{GENDER_LABELS[props.sheet.input.gender]}</Text>
          <Text testID="four-pillars" class="text-(length:--text-info) text-foreground">{props.sheet.pillars}</Text>
        </View>
        <Text testID="birth-line" class="text-(length:--text-info) text-muted-foreground">{birthLine(props.sheet)}</Text>
      </View>
      <Button
        accessibilityLabel="重新输入"
        onPress={() => nav.pop()}
        class="h-9 w-9 items-center justify-center rounded-full bg-primary active:opacity-80"
      >
        <Text class="text-xl text-primary-foreground">+</Text>
      </Button>
    </View>
  );
}

function SheetView(props: { sheet: Sheet }) {
  const selection = useSelection(() => props.sheet);
  return (
    <View class="w-full max-w-xl flex-1 self-center">
      <UserInfo sheet={props.sheet} />
      <Scroll class="flex-1 bg-card" contentClass="gap-2 pb-[env(safe-area-inset-bottom)]">
        <PaipanGrid selection={selection.selection()} />
        <FortuneTable
          rows={selection.rows()}
          glyphs={props.sheet.view.glyphs}
          state={selection.fortune()}
          onPress={selection.press}
        />
        <View class="gap-0.5 px-3 py-2">
          <Text class="text-xs text-muted-foreground">{CONVENTION_LINE}</Text>
          <Text class="text-xs text-muted-foreground">神煞沿用 AstroZi 现行口径，尚未逐条对照原书审定。</Text>
        </View>
      </Scroll>
    </View>
  );
}
