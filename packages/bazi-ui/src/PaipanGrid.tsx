// The main 排盘 table: 日期 / 流年 / 大运 / 年 / 月 / 日 / 时 across, ten rows down (the first ten of the 7 × 13 sheet).
import { Text, View } from "nsh";
import type { JSX } from "nsh";
import type { paipan } from "./engine";
import { ELEMENT_TEXT, ELEMENT_WASH, type FiveElement } from "./elements";

type Column = paipan.BaziPaipanPillarColumn;

const COLUMN_KEYS = ["liunian", "dayun", "year", "month", "day", "hour"] as const;
const HEADINGS = ["日期", "流年", "大运", "年柱", "月柱", "日柱", "时柱"];
/** The table prints at most four 神煞 per column. */
const SHENSHA_SHOWN = 4;

const CELL = "min-h-8 flex-1 items-center justify-center bg-grid-cell px-0.5 py-0.5";
const TEXT = "text-center text-(length:--text-grid) text-grid-cell-foreground";
const HEAD_TEXT = "text-center text-(length:--text-grid-head) font-semibold text-grid-header-foreground";

function RowHeading(props: { label: string; compact?: boolean }) {
  return (
    <View class={`${props.compact ? "min-h-6" : "min-h-8"} w-[10%] items-center justify-center bg-grid-row-header py-0.5`}>
      <Text class={HEAD_TEXT}>{props.label}</Text>
    </View>
  );
}

function Row(props: { label: string; columns: Column[]; cell: (column: Column, index: number) => JSX.Element }) {
  return (
    <View class="flex-row">
      <RowHeading label={props.label} />
      {/* Keyed by the column object: a new selection brings new columns, so each cell is drawn for its column. */}
      <Each of={props.columns}>{(column, index) => props.cell(column(), index())}</Each>
    </View>
  );
}

/** One line of text; a glyph cell takes its element's color and a faint wash of it. */
function TextCell(props: { text: string; element?: FiveElement | null; glyph?: boolean }) {
  const element = () => props.element ?? null;
  const box = () =>
    [CELL, props.glyph ? "min-h-11" : "", element() ? ELEMENT_WASH[element() as FiveElement] : ""].join(" ");
  const text = () =>
    [
      "text-center",
      props.glyph ? "text-(length:--text-glyph) font-bold leading-5" : "text-(length:--text-grid)",
      element() ? ELEMENT_TEXT[element() as FiveElement] : "text-grid-cell-foreground",
    ].join(" ");
  return (
    <View class={box()}>
      <Text class={text()}>{props.text}</Text>
    </View>
  );
}

function HiddenCell(props: { column: Column }) {
  return (
    <View class={`${CELL} min-h-12`}>
      <If when={props.column.hiddenStems.length > 0} else={<Text class={TEXT}>-</Text>}>
        <Each of={props.column.hiddenStems} key="index">
          {(hidden) => (
            <Text class={TEXT}>
              <Text class={hidden().element ? ELEMENT_TEXT[hidden().element as FiveElement] : ""}>{hidden().stem}</Text>
              <Text class="text-grid-secondary">{` ${hidden().tenGod}`}</Text>
            </Text>
          )}
        </Each>
      </If>
    </View>
  );
}

function ShenShaCell(props: { labels: string[] }) {
  return (
    <View class={`${CELL} justify-start`}>
      <Each of={props.labels.slice(0, SHENSHA_SHOWN)} key="index">
        {(label) => <Text class="text-center text-(length:--text-shensha) leading-4 text-grid-secondary">{label()}</Text>}
      </Each>
    </View>
  );
}

export function PaipanGrid(props: { selection: paipan.BaziPaipanSelection }) {
  const columns = () => COLUMN_KEYS.map((key) => props.selection.columns[key]);
  const text = (pick: (column: Column) => string) => (column: Column) => <TextCell text={pick(column)} />;
  return (
    <View testID="paipan-grid" class="w-full">
      <View class="flex-row">
        <RowHeading label={HEADINGS[0] ?? ""} />
        <Each of={HEADINGS.slice(1)} key="index">
          {(heading) => (
            <View class="min-h-8 flex-1 items-center justify-center bg-grid-header py-0.5">
              <Text class={HEAD_TEXT}>{heading()}</Text>
            </View>
          )}
        </Each>
      </View>
      <Row label="主星" columns={columns()} cell={text((column) => column.mainStar)} />
      <Row label="天干" columns={columns()} cell={(column) => <TextCell glyph text={column.stem} element={column.stemElement} />} />
      <Row label="地支" columns={columns()} cell={(column) => <TextCell glyph text={column.branch} element={column.branchElement} />} />
      <Row label="藏干" columns={columns()} cell={(column) => <HiddenCell column={column} />} />
      <Row label="星运" columns={columns()} cell={text((column) => column.lifeStage)} />
      <Row label="旺衰" columns={columns()} cell={text((column) => column.strength)} />
      <Row label="纳音" columns={columns()} cell={text((column) => column.naYin)} />
      <Row label="神煞" columns={columns()} cell={(_column, index) => <ShenShaCell labels={props.selection.shenSha[COLUMN_KEYS[index] ?? "year"]} />} />
      <View class="flex-row">
        <RowHeading compact label="起运" />
        <View class="min-h-6 flex-3 items-center justify-center bg-grid-cell">
          <Text testID="qiyun-age" class={TEXT}>{props.selection.qiyun.ageText}</Text>
        </View>
        <View class="min-h-6 flex-3 items-center justify-center bg-grid-cell">
          <Text testID="qiyun-change" class={TEXT}>{props.selection.qiyun.changeText}</Text>
        </View>
      </View>
    </View>
  );
}
