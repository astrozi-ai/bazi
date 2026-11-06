/**
 * ============================================================
 * 争议关系成员 (Contested Relation Members)
 * ============================================================
 * @module relations/contested
 *
 * 这里只登记**来源之间互相矛盾**的关系成员，逐条记来源出处。
 *
 * 本模块刻意 **不导出任何默认取值**：没有默认表、没有"多数实现"兜底、没有
 * 合并函数。争议成员一旦有了默认值，就会以事实的身份进入求值层；裁定属于
 * school 节点（L4），不属于 core（L0/L1）。
 *
 * 出处记的是主张该数据的既有实现（AstroZi 排盘引擎里的哪一张表）。
 */

import type { BranchName, ElementName } from "../core-types";

/** 一条来源变体：它主张什么，出处在哪。 */
export interface ContestedVariant<T> {
  /** 变体标识，仅用于人读与测试引用。 */
  readonly id: string;
  /** 出处：主张这份数据的既有实现及其表名。 */
  readonly provenance: string;
  /** 该来源主张的数据。 */
  readonly claim: T;
  /** 一句话说明这条来源在主张什么。 */
  readonly note: string;
}

/** 一个争议项：同一关系概念上的多个互斥来源。 */
export interface ContestedRelation<T> {
  /** 关系名（中文，与文献用词一致）。 */
  readonly relation: string;
  /** 争议点一句话。 */
  readonly question: string;
  /** 互斥的来源变体，至少两条。 */
  readonly variants: ReadonlyArray<ContestedVariant<T>>;
}

/**
 * 相绝：4 组对称支对 vs 12 条有向条目。
 *
 * 两者不是同一张表的两种写法：对称表读作"寅酉互绝"，有向表读作"子绝于巳"，
 * 且有向表包含对称表没有的 戌→卯、丑→午、辰→酉、未→子 等条目。
 */
export const BRANCH_ABSOLUTE_CONTEST: ContestedRelation<
  Readonly<Partial<Record<BranchName, readonly BranchName[]>>>
> = {
  relation: "相绝",
  question: "相绝是 4 组对称支对，还是 12 条有向条目？",
  variants: [
    {
      id: "symmetric-4-pairs",
      provenance: "AstroZi 排盘引擎：地支关系表（相绝）",
      note: "寅酉、卯申、巳子、午亥四组，双向对称，共 8 个条目覆盖 8 支。",
      claim: {
        寅: ["酉"],
        酉: ["寅"],
        卯: ["申"],
        申: ["卯"],
        巳: ["子"],
        子: ["巳"],
        午: ["亥"],
        亥: ["午"],
      },
    },
    {
      id: "directed-12-entries",
      provenance: "AstroZi 排盘引擎：补充地支关系表（相绝）",
      note: "12 支各一条有向条目；其中 子→巳、卯→申、午→亥、酉→寅 与对称表重合，其余 8 条只此一家。",
      claim: {
        子: ["巳"],
        卯: ["申"],
        午: ["亥"],
        酉: ["寅"],
        戌: ["卯"],
        丑: ["午"],
        辰: ["酉"],
        未: ["子"],
        亥: ["卯"],
        寅: ["午"],
        巳: ["酉"],
        申: ["子"],
      },
    },
  ],
};

/**
 * 土库：辰 vs 戌。
 *
 * 其余四行（木未、火戌、金丑、水辰）两处来源一致，已进入
 * `./branch-relations.ts` 的 `KU_TABLE`；只有土库两处冲突，故土在默认表中缺位。
 */
export const EARTH_STORAGE_CONTEST: ContestedRelation<Readonly<Record<"土", BranchName>>> = {
  relation: "土库",
  question: "土的墓库在辰还是在戌？",
  variants: [
    {
      id: "earth-storage-chen",
      provenance: "AstroZi 排盘引擎：地支关系表（KU_TABLE）",
      note: "`KU_TABLE` 写作水土同库于辰。",
      claim: { 土: "辰" },
    },
    {
      id: "earth-storage-xu",
      provenance: "AstroZi 评分模块：ELEMENT_TOMBS",
      note: "`ELEMENT_TOMBS` 写作土库在戌（与火库同支）。",
      claim: { 土: "戌" },
    },
  ],
};

/** 本模块登记的全部争议项。只读清单，不是可查询的关系表。 */
export const CONTESTED_RELATIONS = [BRANCH_ABSOLUTE_CONTEST, EARTH_STORAGE_CONTEST] as const;

/** 默认表中刻意缺位的五行库位（因争议而缺，不是因遗漏）。 */
export const CONTESTED_STORAGE_ELEMENTS: readonly ElementName[] = ["土"];
