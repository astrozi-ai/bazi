/**
 * 事实表的原文出处 (TableSourceRef)。
 *
 * `tables/` 里的每一张表都必须导出一个 `sourceRef`，指向它的原文章节。没有出处的表
 * 不是事实表，是实现者的默认值。
 *
 * `document` 用来源文献的名字（作者口头裁定记 `author_guidance: AstroZi, <日期>`），
 * `locator` 用章节定位。
 */

export interface TableSourceRef {
  /** 来源文献。 */
  readonly document: string;
  /** 章节定位，例如 `第四章二`。 */
  readonly locator: string;
  /** 这张表在原文里主张什么。 */
  readonly note: string;
}

/** 本仓引用的来源文献名。 */
export const SOURCE_DOCUMENT = "《八字命稿精要》（做功/触盘八步法）" as const;

export function tableSourceRef(locator: string, note: string): TableSourceRef {
  return { document: SOURCE_DOCUMENT, locator, note };
}
