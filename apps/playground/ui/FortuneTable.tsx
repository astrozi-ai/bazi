// 大运 / 流年 / 流月: the last three rows of the 7 × 13 sheet; every cell comes from the 排盘 view.
import { Text, View } from "nsh";
import type { JSX } from "nsh";
import { Button } from "nsh/base";
import type { paipan } from "../vendor/iching-bazi";
import { ELEMENT_TEXT, type FiveElement } from "../model/labels";

type Cell = paipan.BaziFortuneCell;
type Glyphs = paipan.BaziPaipanGlyphs;
type State = paipan.BaziFortuneTableState;

const ROW_LABELS = [
  ["大", "运"],
  ["流", "年"],
  ["流", "月"],
] as const;

const PAGER_GLYPH: Record<string, string> = { more: ">", more_liyue: ">", back: "<", back_liyue: "<" };

/** Element and ten god of a 干支 glyph, read from the view; a glyph it lacks is a broken view. */
function glyphOf(glyphs: Glyphs, kind: keyof Glyphs, glyph: string) {
  const found = glyphs[kind][glyph];
  if (!found) throw new Error(`排盘 view has no glyph entry for ${glyph}`);
  return { color: ELEMENT_TEXT[found.element as FiveElement], tenGod: found.tenGod };
}

/** An expanded 大运 / 流年 stays highlighted, as on AstroZi's sheet; 小运 never expands. */
function isExpanded(state: State, rowIndex: number, cell: Cell): boolean {
  if (rowIndex === 0 && cell.type === "dayun") return cell.age === state.expandedDayunAge;
  return cell.type === "liunian" && cell.year === state.expandedLiunianYear;
}

const LABEL = "text-center text-(length:--text-fortune-label) font-semibold leading-2.5 text-fortune-label-foreground";
const DATA = "flex-1 items-center justify-center border border-l-0 border-fortune-border px-px py-0.5";

function meta(active: boolean, size: "meta" | "age"): string {
  const base = size === "meta" ? "text-(length:--text-fortune-meta)" : "text-(length:--text-fortune-age)";
  return `text-center ${base} ${active ? "font-bold text-fortune-active-foreground" : "text-fortune-muted"}`;
}

function GanZhiLines(props: { glyphs: Glyphs; gan: string; zhi: string; active: boolean; small?: boolean }) {
  const stem = () => glyphOf(props.glyphs, "stems", props.gan);
  const branch = () => glyphOf(props.glyphs, "branches", props.zhi);
  const size = () => (props.small ? "text-(length:--text-fortune-small)" : "text-(length:--text-fortune)");
  const weight = () => (props.active ? "font-bold" : "font-semibold");
  const god = "text-(length:--text-fortune-god) font-medium text-fortune-body";
  return (
    <>
      <Text class={`line-clamp-1 mt-px text-center ${size()} ${weight()} ${stem().color}`}>
        {props.gan}
        <Text class={god}>{stem().tenGod}</Text>
      </Text>
      <Text class={`line-clamp-1 mt-px text-center ${size()} ${weight()} ${branch().color}`}>
        {props.zhi}
        <Text class={god}>{branch().tenGod}</Text>
      </Text>
    </>
  );
}

function CellContent(props: { cell: Cell; glyphs: Glyphs; highlighted: boolean }): JSX.Element {
  const cell = props.cell;
  const on = props.highlighted;
  switch (cell.type) {
    case "xiaoyun":
      return (
        <>
          <Text class={`text-center text-(length:--text-fortune) font-semibold ${on ? "text-fortune-active-foreground" : "text-fortune-body"}`}>
            {cell.label}
          </Text>
          <Text class={meta(on, "meta")}>小运</Text>
        </>
      );
    case "dayun":
    case "liunian":
      return (
        <>
          <Text class={"line-clamp-1 " + meta(on, "meta")}>{String(cell.year)}</Text>
          <If when={cell.type === "dayun"}>
            <Text class={"line-clamp-1 " + meta(on, "age")}>{`${cell.age}岁`}</Text>
          </If>
          <GanZhiLines glyphs={props.glyphs} gan={cell.gan} zhi={cell.zhi} active={on} />
        </>
      );
    case "liyue_detail":
    case "liyue_simple":
      return (
        <>
          <Text class={`line-clamp-1 text-center text-(length:--text-fortune-meta) font-semibold ${on ? "text-fortune-active-foreground" : "text-fortune-body"}`}>
            {cell.solarTerm}
          </Text>
          <Text class={"line-clamp-1 " + meta(on, "age")}>{cell.dateStr}</Text>
          <GanZhiLines glyphs={props.glyphs} gan={cell.gan} zhi={cell.zhi} active={on} small />
        </>
      );
    case "more":
    case "more_liyue":
    case "back":
    case "back_liyue":
      return <Text class="text-lg font-extrabold text-fortune-more-foreground">{PAGER_GLYPH[cell.type]}</Text>;
    case "empty":
      return <View />;
  }
}

function labelOf(cell: Cell): string {
  switch (cell.type) {
    case "dayun":
    case "liunian":
      return `${cell.year} ${cell.gan}${cell.zhi}`;
    case "liyue_detail":
    case "liyue_simple":
      return `${cell.solarTerm} ${cell.gan}${cell.zhi}`;
    case "xiaoyun":
      return `小运 ${cell.label}`;
    case "more":
      return "大运下一页";
    case "more_liyue":
      return "流月下一页";
    case "back":
      return "大运上一页";
    case "back_liyue":
      return "流月上一页";
    case "empty":
      return "";
  }
}

function CellView(props: { cell: Cell; rowIndex: number; glyphs: Glyphs; state: State; onPress: (rowIndex: number, cell: Cell) => void }) {
  const cell = () => props.cell;
  const active = () => "isActive" in cell() && (cell() as { isActive: boolean }).isActive;
  const highlighted = () => active() || isExpanded(props.state, props.rowIndex, cell());
  const pager = () => cell().type in PAGER_GLYPH;
  const box = () =>
    [DATA, pager() ? "border-fortune-more bg-fortune-more" : highlighted() ? "bg-fortune-active" : "bg-fortune-cell"].join(" ");
  return (
    <If when={cell().type !== "empty"} else={<View class={`${DATA} bg-fortune-cell`} />}>
      <Button
        accessibilityLabel={`${props.rowIndex === 2 && !pager() ? "流月 " : ""}${labelOf(cell())}`}
        selected={highlighted()}
        onPress={() => props.onPress(props.rowIndex, cell())}
        class={`${box()} active:opacity-80`}
      >
        <CellContent cell={cell()} glyphs={props.glyphs} highlighted={highlighted()} />
      </Button>
    </If>
  );
}

export function FortuneTable(props: {
  rows: Cell[][];
  glyphs: Glyphs;
  state: State;
  onPress: (rowIndex: number, cell: Cell) => void;
}) {
  return (
    <View testID="fortune-table" class="w-full">
      <Each of={props.rows} key="index">
        {(row, rowIndex) => (
          <View class="h-12.5 w-full flex-row">
            <View class="w-[8%] shrink-0 items-center justify-center border border-fortune-border bg-fortune-label">
              <Text class={LABEL}>{ROW_LABELS[rowIndex()]?.[0] ?? ""}</Text>
              <Text class={LABEL}>{ROW_LABELS[rowIndex()]?.[1] ?? ""}</Text>
            </View>
            <Each of={row()} key="index">
              {(cell) => (
                <CellView cell={cell()} rowIndex={rowIndex()} glyphs={props.glyphs} state={props.state} onPress={props.onPress} />
              )}
            </Each>
          </View>
        )}
      </Each>
    </View>
  );
}
