/**
 * 事实表逐张核对。
 *
 * 每张表检三件事：成员正确、出处存在、不越界（不给「多」的阈值、不给力量分）。
 */
import { describe, expect, test } from "bun:test";
import { sourceRef as kongWangSource } from "../algorithms/kong-wang";
import { BRANCHES, ELEMENTS, STEMS, YANG_BRANCHES, YANG_STEMS } from "../chart/constants";
import type { BranchName, ElementName, StemName } from "../core-types";
import { getKongWang } from "../index";
import * as tables from "./index";
import { CORE_FACT_TABLE_SOURCES } from "./index";

const ALL_STEMS = STEMS as readonly StemName[];
const ALL_BRANCHES = BRANCHES as readonly BranchName[];
const ALL_ELEMENTS = ELEMENTS as readonly ElementName[];

describe("旬空（author_guidance: AstroZi, 2026-11-06）", () => {
  test.each([
    ["甲子", "甲子 乙丑 丙寅 丁卯 戊辰 己巳 庚午 辛未 壬申 癸酉", ["戌", "亥"]],
    ["甲戌", "甲戌 乙亥 丙子 丁丑 戊寅 己卯 庚辰 辛巳 壬午 癸未", ["申", "酉"]],
    ["甲申", "甲申 乙酉 丙戌 丁亥 戊子 己丑 庚寅 辛卯 壬辰 癸巳", ["午", "未"]],
    ["甲午", "甲午 乙未 丙申 丁酉 戊戌 己亥 庚子 辛丑 壬寅 癸卯", ["辰", "巳"]],
    ["甲辰", "甲辰 乙巳 丙午 丁未 戊申 己酉 庚戌 辛亥 壬子 癸丑", ["寅", "卯"]],
    ["甲寅", "甲寅 乙卯 丙辰 丁巳 戊午 己未 庚申 辛酉 壬戌 癸亥", ["子", "丑"]],
  ] as const)("%s 旬的十个干支返回同一对旬空", (_head, members, expected) => {
    for (const pair of members.split(" ")) {
      expect(getKongWang(pair[0] as StemName, pair[1] as BranchName)).toEqual(expected);
    }
  });

  test("拒绝其余 60 个不属于六十甲子的干支配对", () => {
    for (const [stemIndex, stem] of ALL_STEMS.entries()) {
      for (const [branchIndex, branch] of ALL_BRANCHES.entries()) {
        if (stemIndex % 2 === branchIndex % 2) continue;
        expect(() => getKongWang(stem, branch)).toThrow("不属于六十甲子");
      }
    }
  });

  test("作者裁定的通用规则登记进事实表清单", () => {
    expect(kongWangSource.document).toBe("author_guidance: AstroZi, 2026-11-06");
    expect(kongWangSource.locator).toBe("作者裁定");
    expect(CORE_FACT_TABLE_SOURCES.kongWang).toBe(kongWangSource);
  });
});

describe("出处", () => {
  test("每张事实表都有原文章节", () => {
    const names = Object.keys(CORE_FACT_TABLE_SOURCES);
    expect(names.length).toBe(8);
    for (const [name, sourceRef] of Object.entries(CORE_FACT_TABLE_SOURCES)) {
      if (name === "branchHarmInjury") {
        expect(sourceRef.document).toBe("author_guidance: AstroZi, 2026-09-16 / 2026-09-17");
        expect(sourceRef.locator).toBe("作者裁定 38/40/46/57 条");
      } else if (name === "kongWang") {
        expect(sourceRef.document).toBe("author_guidance: AstroZi, 2026-11-06");
        expect(sourceRef.locator).toBe("作者裁定");
      } else {
      expect({ name, locator: sourceRef.locator.startsWith("第") }).toEqual({ name, locator: true });
      }
      expect(sourceRef.note.length).toBeGreaterThan(10);
    }
  });
});

describe("天干四冲（第四章二）", () => {
  test("四对，对称，戊己无冲", () => {
    expect(tables.isStemFourClash("甲", "庚")).toBe(true);
    expect(tables.isStemFourClash("庚", "甲")).toBe(true);
    expect(tables.isStemFourClash("乙", "辛")).toBe(true);
    expect(tables.isStemFourClash("丙", "壬")).toBe(true);
    expect(tables.isStemFourClash("丁", "癸")).toBe(true);
    expect(tables.getStemFourClash("戊")).toBeNull();
    expect(tables.getStemFourClash("己")).toBeNull();
    expect(tables.STEM_WITHOUT_CLASH).toEqual(["戊", "己"]);
  });

  test("只有四对：十干里恰好八个有冲，且互为唯一对象", () => {
    const withClash = ALL_STEMS.filter((stem) => tables.getStemFourClash(stem) !== null);
    expect(withClash).toEqual(["甲", "乙", "丙", "丁", "庚", "辛", "壬", "癸"]);
    for (const stem of withClash) {
      const partner = tables.getStemFourClash(stem)!;
      expect(tables.getStemFourClash(partner)).toBe(stem);
    }
  });

  test("四冲不是相克：甲戊相克但不相冲，甲庚相冲也相克", () => {
    expect(tables.isStemFourClash("甲", "戊")).toBe(false);
    expect(tables.isStemFourClash("甲", "乙")).toBe(false);
  });
});

describe("干支阴阳（第一章二）", () => {
  test("与上游四个数组逐字一致", () => {
    for (const stem of ALL_STEMS) {
      expect({ stem, yy: tables.stemYinYang(stem) }).toEqual({
        stem,
        yy: (YANG_STEMS as readonly StemName[]).includes(stem) ? "阳" : "阴",
      });
    }
    for (const branch of ALL_BRANCHES) {
      expect({ branch, yy: tables.branchYinYang(branch) }).toEqual({
        branch,
        yy: (YANG_BRANCHES as readonly BranchName[]).includes(branch) ? "阳" : "阴",
      });
    }
  });

  test("阴阳各半", () => {
    expect(ALL_STEMS.filter((stem) => tables.stemYinYang(stem) === "阳")).toHaveLength(5);
    expect(ALL_BRANCHES.filter((branch) => tables.branchYinYang(branch) === "阳")).toHaveLength(6);
  });
});

describe("五行生克与反生反克（第二章二、六）", () => {
  test("生克成环，方向唯一", () => {
    expect(tables.ELEMENT_GENERATES).toMatchObject({ 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" });
    expect(tables.ELEMENT_CONTROLS).toMatchObject({ 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" });
    for (const element of ALL_ELEMENTS) {
      expect(tables.generates(tables.generatedBy(element), element)).toBe(true);
      expect(tables.controls(tables.controlledBy(element), element)).toBe(true);
    }
  });

  test("反生反克十条：反生反克两族各五条，逐字与原文一致", () => {
    // 原文 反生：木生火，木多火焰塞；火生土，火多土焦；土生金，土多金埋；
    //                 金生水，金多水浊；水生木，水多木漂。
    // 原文 反克：木克土，土多木折；土克水，水多土流动；水克火，火多水干；
    //                 火克金，金多火熄；金克木，木多金缺。
    expect(tables.REVERSE_CYCLE_LABELS).toEqual([
      "木多火焰塞",
      "火多土焦",
      "土多金埋",
      "金多水浊",
      "水多木漂",
      "土多木折",
      "水多土流动",
      "火多水干",
      "金多火熄",
      "木多金缺",
    ]);
    expect(tables.REVERSE_CYCLE_ENTRIES.map((entry) => entry.label)).toEqual([
      ...tables.REVERSE_CYCLE_LABELS,
    ]);
    expect(tables.REVERSE_CYCLE_ENTRIES).toHaveLength(10);
    for (const kind of ["over_generation", "reverse_control"] as const) {
      expect(tables.REVERSE_CYCLE_ENTRIES.filter((entry) => entry.kind === kind)).toHaveLength(5);
    }
    for (const entry of tables.REVERSE_CYCLE_ENTRIES) {
      if (entry.kind === "reverse_control") {
        // 克者被被克者反伤：subject 克 excess
        expect(tables.controls(entry.subject, entry.excess)).toBe(true);
      } else {
        // 生我者过多：excess 生 subject
        expect(tables.generates(entry.excess, entry.subject)).toBe(true);
      }
      // 名目逐字取自原文，字数不齐（「水多土流动」五字），只断言以过量者开头
      expect(entry.label.startsWith(entry.excess)).toBe(true);
    }
  });

  test("原文没有的「子多母衰／泄多」一族不得出现在表内", () => {
    const labels = tables.REVERSE_CYCLE_ENTRIES.map((entry) => entry.label);
    for (const absent of ["水多金沉", "木多水缩", "火多木焚", "土多火晦", "金多土虚"]) {
      expect(labels).not.toContain(absent);
    }
    // 被改写过的几条也不得回流
    for (const reworded of ["木坚金缺", "火多水热", "木多火炽", "土重金埋", "土重木折", "水多土流"]) {
      expect(labels).not.toContain(reworded);
    }
  });

  test("原文点名的两条在表内", () => {
    const labels = tables.REVERSE_CYCLE_ENTRIES.map((entry) => entry.label);
    expect(labels).toContain("土多金埋");
    expect(labels).toContain("水多木漂");
    expect(tables.reverseCycleFor("金").map((entry) => entry.label).sort()).toEqual(
      ["土多金埋", "木多金缺"].sort(),
    );
  });

  test("表上没有任何阈值或分数字段", () => {
    for (const entry of tables.REVERSE_CYCLE_ENTRIES) {
      expect(Object.keys(entry).sort()).toEqual(["excess", "kind", "label", "subject"]);
    }
  });
});

describe("旺相休囚死（第二章五）", () => {
  test("木月：木旺 火相 水休 金囚 土死", () => {
    expect(tables.monthStrengthStates("木")).toEqual({ 木: "旺", 火: "相", 水: "休", 金: "囚", 土: "死" });
  });

  test("每个月令都恰好给出五个不同的态", () => {
    for (const element of ALL_ELEMENTS) {
      const states = tables.monthStrengthStates(element);
      expect(Object.values(states).sort()).toEqual([...tables.MONTH_STRENGTH_STATES].sort());
    }
  });

  test("月支 → 当令五行：四库月为土", () => {
    expect(tables.monthElementOf("寅")).toBe("木");
    expect(tables.monthElementOf("巳")).toBe("火");
    for (const vault of ["辰", "戌", "丑", "未"] as const) {
      expect(tables.monthElementOf(vault)).toBe("土");
    }
  });
});

describe("四正 / 四马 / 四库（第五章一）", () => {
  test("三组覆盖十二支且互不重叠", () => {
    const members = Object.values(tables.BRANCH_CLASS_MEMBERS).flat();
    expect(members).toHaveLength(12);
    expect(new Set(members).size).toBe(12);
    expect(tables.branchClassOf("子")).toBe("四正");
    expect(tables.branchClassOf("寅")).toBe("四马");
    expect(tables.branchClassOf("辰")).toBe("四库");
    expect(tables.isBranchClass("未", "四库")).toBe(true);
    expect(tables.isBranchClass("未", "四正")).toBe(false);
  });

  test("四库成员与 core 库表的库位一致（木未 火戌 金丑 水辰）", async () => {
    const { getKuPosition } = await import("../relations/index");
    for (const element of ["木", "火", "金", "水"] as const) {
      const ku = getKuPosition(element)!;
      expect({ element, cls: tables.branchClassOf(ku) }).toEqual({ element, cls: "四库" });
    }
  });
});
