/**
 * 基础排盘模块 - 常量数据
 * 天干地支、五行、十神、藏干等基础数据表
 */

import type {
  BranchName,
  ElementName,
  StemName,
  TenGodSimplified,
  TenGodType,
} from "../core-types";
import type { HiddenStem } from "./types";

// ===== 天干地支基础数据 =====

export const STEMS: StemName[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES: BranchName[] = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];
export const ELEMENTS: ElementName[] = ["木", "火", "土", "金", "水"];

// ===== 五行对应关系 =====

export const STEM_ELEMENTS: Record<StemName, ElementName> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const BRANCH_ELEMENTS: Record<BranchName, ElementName> = {
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  辰: "土",
  未: "土",
  戌: "土",
  丑: "土",
  申: "金",
  酉: "金",
  子: "水",
  亥: "水",
};

// ===== 地支藏干表 =====

export const BRANCH_HIDDEN_STEMS: Record<BranchName, HiddenStem[]> = {
  子: [{ stem: "癸", element: "水", strength: 100, weight: 1.0, type: "primary" }],
  丑: [
    { stem: "己", element: "土", strength: 100, weight: 1.0, type: "primary" },
    { stem: "癸", element: "水", strength: 30, weight: 0.3, type: "tertiary" },
    { stem: "辛", element: "金", strength: 50, weight: 0.5, type: "secondary" },
  ],
  寅: [
    { stem: "甲", element: "木", strength: 100, weight: 1.0, type: "primary" },
    { stem: "丙", element: "火", strength: 50, weight: 0.5, type: "secondary" },
    { stem: "戊", element: "土", strength: 30, weight: 0.3, type: "tertiary" },
  ],
  卯: [{ stem: "乙", element: "木", strength: 100, weight: 1.0, type: "primary" }],
  辰: [
    { stem: "戊", element: "土", strength: 100, weight: 1.0, type: "primary" },
    { stem: "乙", element: "木", strength: 30, weight: 0.3, type: "tertiary" },
    { stem: "癸", element: "水", strength: 50, weight: 0.5, type: "secondary" },
  ],
  巳: [
    { stem: "丙", element: "火", strength: 100, weight: 1.0, type: "primary" },
    { stem: "戊", element: "土", strength: 50, weight: 0.5, type: "secondary" },
    { stem: "庚", element: "金", strength: 30, weight: 0.3, type: "tertiary" },
  ],
  午: [
    { stem: "丁", element: "火", strength: 100, weight: 1.0, type: "primary" },
    { stem: "己", element: "土", strength: 30, weight: 0.3, type: "tertiary" },
  ],
  未: [
    { stem: "己", element: "土", strength: 100, weight: 1.0, type: "primary" },
    { stem: "丁", element: "火", strength: 30, weight: 0.3, type: "tertiary" },
    { stem: "乙", element: "木", strength: 50, weight: 0.5, type: "secondary" },
  ],
  申: [
    { stem: "庚", element: "金", strength: 100, weight: 1.0, type: "primary" },
    { stem: "壬", element: "水", strength: 50, weight: 0.5, type: "secondary" },
    { stem: "戊", element: "土", strength: 30, weight: 0.3, type: "tertiary" },
  ],
  酉: [{ stem: "辛", element: "金", strength: 100, weight: 1.0, type: "primary" }],
  戌: [
    { stem: "戊", element: "土", strength: 100, weight: 1.0, type: "primary" },
    { stem: "辛", element: "金", strength: 30, weight: 0.3, type: "tertiary" },
    { stem: "丁", element: "火", strength: 50, weight: 0.5, type: "secondary" },
  ],
  亥: [
    { stem: "壬", element: "水", strength: 100, weight: 1.0, type: "primary" },
    { stem: "甲", element: "木", strength: 30, weight: 0.3, type: "tertiary" },
  ],
};

// ===== 十神关系表 =====

export const TEN_GOD_RELATIONSHIPS: Record<string, TenGodType> = {
  // 甲日主
  甲甲: "比肩",
  甲乙: "劫财",
  甲丙: "食神",
  甲丁: "伤官",
  甲戊: "偏财",
  甲己: "正财",
  甲庚: "七杀",
  甲辛: "正官",
  甲壬: "偏印",
  甲癸: "正印",
  // 乙日主
  乙乙: "比肩",
  乙甲: "劫财",
  乙丁: "食神",
  乙丙: "伤官",
  乙己: "偏财",
  乙戊: "正财",
  乙辛: "七杀",
  乙庚: "正官",
  乙癸: "偏印",
  乙壬: "正印",
  // 丙日主
  丙丙: "比肩",
  丙丁: "劫财",
  丙戊: "食神",
  丙己: "伤官",
  丙庚: "偏财",
  丙辛: "正财",
  丙壬: "七杀",
  丙癸: "正官",
  丙甲: "偏印",
  丙乙: "正印",
  // 丁日主
  丁丁: "比肩",
  丁丙: "劫财",
  丁己: "食神",
  丁戊: "伤官",
  丁辛: "偏财",
  丁庚: "正财",
  丁癸: "七杀",
  丁壬: "正官",
  丁乙: "偏印",
  丁甲: "正印",
  // 戊日主
  戊戊: "比肩",
  戊己: "劫财",
  戊庚: "食神",
  戊辛: "伤官",
  戊壬: "偏财",
  戊癸: "正财",
  戊甲: "七杀",
  戊乙: "正官",
  戊丙: "偏印",
  戊丁: "正印",
  // 己日主
  己己: "比肩",
  己戊: "劫财",
  己辛: "食神",
  己庚: "伤官",
  己癸: "偏财",
  己壬: "正财",
  己乙: "七杀",
  己甲: "正官",
  己丁: "偏印",
  己丙: "正印",
  // 庚日主
  庚庚: "比肩",
  庚辛: "劫财",
  庚壬: "食神",
  庚癸: "伤官",
  庚甲: "偏财",
  庚乙: "正财",
  庚丙: "七杀",
  庚丁: "正官",
  庚戊: "偏印",
  庚己: "正印",
  // 辛日主
  辛辛: "比肩",
  辛庚: "劫财",
  辛癸: "食神",
  辛壬: "伤官",
  辛乙: "偏财",
  辛甲: "正财",
  辛丁: "七杀",
  辛丙: "正官",
  辛己: "偏印",
  辛戊: "正印",
  // 壬日主
  壬壬: "比肩",
  壬癸: "劫财",
  壬甲: "食神",
  壬乙: "伤官",
  壬丙: "偏财",
  壬丁: "正财",
  壬戊: "七杀",
  壬己: "正官",
  壬庚: "偏印",
  壬辛: "正印",
  // 癸日主
  癸癸: "比肩",
  癸壬: "劫财",
  癸乙: "食神",
  癸甲: "伤官",
  癸丁: "偏财",
  癸丙: "正财",
  癸己: "七杀",
  癸戊: "正官",
  癸辛: "偏印",
  癸庚: "正印",
};

// ===== 十神简化表 =====

export const TEN_GOD_SIMPLIFIED: Record<TenGodType, TenGodSimplified> = {
  比肩: "比",
  劫财: "劫",
  食神: "食",
  伤官: "伤",
  偏财: "才",
  正财: "财",
  七杀: "杀",
  正官: "官",
  偏印: "枭",
  正印: "印",
};

// ===== 十神特性表 =====

type TenGodCharacteristic = {
  nature: "positive" | "negative" | "neutral";
  strength: number;
  description: string;
};

export const TEN_GOD_CHARACTERISTICS: Record<TenGodType, TenGodCharacteristic> = {
  比肩: { nature: "neutral", strength: 70, description: "自我意识强，独立自主，竞争意识" },
  劫财: { nature: "negative", strength: 60, description: "争夺心强，冲动易怒，破财象征" },
  食神: { nature: "positive", strength: 80, description: "才华横溢，享受生活，子女宫" },
  伤官: { nature: "neutral", strength: 75, description: "聪明才智，反叛精神，艺术天赋" },
  偏财: { nature: "positive", strength: 85, description: "善于经营，偏门财源，风流多情" },
  正财: { nature: "positive", strength: 90, description: "正当收入，稳定财源，妻子象征" },
  七杀: { nature: "negative", strength: 65, description: "权威象征，压力挑战，小人是非" },
  正官: { nature: "positive", strength: 95, description: "正当权力，社会地位，丈夫象征" },
  偏印: { nature: "negative", strength: 55, description: "偏门学问，孤独象征，继母代表" },
  正印: { nature: "positive", strength: 88, description: "学问智慧，长辈关爱，母亲象征" },
};

// ===== 纳音五行表 =====

export const NAYIN_TABLE: Record<string, string> = {
  // 甲子乙丑海中金
  甲子: "海中金",
  乙丑: "海中金",
  // 丙寅丁卯炉中火
  丙寅: "炉中火",
  丁卯: "炉中火",
  // 戊辰己巳大林木
  戊辰: "大林木",
  己巳: "大林木",
  // 庚午辛未路旁土
  庚午: "路旁土",
  辛未: "路旁土",
  // 壬申癸酉剑锋金
  壬申: "剑锋金",
  癸酉: "剑锋金",
  // 甲戌乙亥山头火
  甲戌: "山头火",
  乙亥: "山头火",
  // 丙子丁丑涧下水
  丙子: "涧下水",
  丁丑: "涧下水",
  // 戊寅己卯城头土
  戊寅: "城头土",
  己卯: "城头土",
  // 庚辰辛巳白腊金
  庚辰: "白蜡金",
  辛巳: "白蜡金",
  // 壬午癸未杨柳木
  壬午: "杨柳木",
  癸未: "杨柳木",
  // 甲申乙酉泉中水
  甲申: "泉中水",
  乙酉: "泉中水",
  // 丙戌丁亥屋上土
  丙戌: "屋上土",
  丁亥: "屋上土",
  // 戊子己丑霹雳火
  戊子: "霹雳火",
  己丑: "霹雳火",
  // 庚寅辛卯松柏木
  庚寅: "松柏木",
  辛卯: "松柏木",
  // 壬辰癸巳长流水
  壬辰: "长流水",
  癸巳: "长流水",
  // 甲午乙未砂中金
  甲午: "砂中金",
  乙未: "砂中金",
  // 丙申丁酉山下火
  丙申: "山下火",
  丁酉: "山下火",
  // 戊戌己亥平地木
  戊戌: "平地木",
  己亥: "平地木",
  // 庚子辛丑壁上土
  庚子: "壁上土",
  辛丑: "壁上土",
  // 壬寅癸卯金箔金
  壬寅: "金箔金",
  癸卯: "金箔金",
  // 甲辰乙巳覆灯火
  甲辰: "覆灯火",
  乙巳: "覆灯火",
  // 丙午丁未天河水
  丙午: "天河水",
  丁未: "天河水",
  // 戊申己酉大驿土
  戊申: "大驿土",
  己酉: "大驿土",
  // 庚戌辛亥钗钏金
  庚戌: "钗钏金",
  辛亥: "钗钏金",
  // 壬子癸丑桑柘木
  壬子: "桑柘木",
  癸丑: "桑柘木",
  // 甲寅乙卯大溪水
  甲寅: "大溪水",
  乙卯: "大溪水",
  // 丙辰丁巳沙中土
  丙辰: "沙中土",
  丁巳: "沙中土",
  // 戊午己未天上火
  戊午: "天上火",
  己未: "天上火",
  // 庚申辛酉石榴木
  庚申: "石榴木",
  辛酉: "石榴木",
  // 壬戌癸亥大海水
  壬戌: "大海水",
  癸亥: "大海水",
};

// ===== 纳音五行属性表 =====

export const NAYIN_ELEMENTS: Record<string, ElementName> = {
  海中金: "金",
  炉中火: "火",
  大林木: "木",
  路旁土: "土",
  剑锋金: "金",
  山头火: "火",
  涧下水: "水",
  城头土: "土",
  白蜡金: "金",
  杨柳木: "木",
  泉中水: "水",
  屋上土: "土",
  霹雳火: "火",
  松柏木: "木",
  长流水: "水",
  砂中金: "金",
  山下火: "火",
  平地木: "木",
  壁上土: "土",
  金箔金: "金",
  覆灯火: "火",
  天河水: "水",
  大驿土: "土",
  钗钏金: "金",
  桑柘木: "木",
  大溪水: "水",
  沙中土: "土",
  天上火: "火",
  石榴木: "木",
  大海水: "水",
};

// ===== 季节对应表 =====

export const SEASON_MAP: Record<BranchName, "春" | "夏" | "秋" | "冬" | "土月"> = {
  寅: "春",
  卯: "春",
  巳: "夏",
  午: "夏",
  申: "秋",
  酉: "秋",
  亥: "冬",
  子: "冬",
  辰: "土月",
  未: "土月",
  戌: "土月",
  丑: "土月",
};

// ===== 月令五行表 =====

export const MONTH_ORDER_ELEMENTS: Record<BranchName, ElementName> = {
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  申: "金",
  酉: "金",
  亥: "水",
  子: "水",
  辰: "土",
  未: "土",
  戌: "土",
  丑: "土",
};

// ===== 大运起法规则 =====

export const MAJOR_PERIOD_RULES = {
  // 阳年男命、阴年女命顺排
  forward: {
    male: ["阳年"], // 甲、丙、戊、庚、壬
    female: ["阴年"], // 乙、丁、己、辛、癸
  },
  // 阴年男命、阳年女命逆排
  backward: {
    male: ["阴年"], // 乙、丁、己、辛、癸
    female: ["阳年"], // 甲、丙、戊、庚、壬
  },
};

// ===== 阳干阴干表 =====

export const YANG_STEMS: StemName[] = ["甲", "丙", "戊", "庚", "壬"];
export const YIN_STEMS: StemName[] = ["乙", "丁", "己", "辛", "癸"];

// ===== 十神数组 =====

export const TEN_GODS: TenGodType[] = [
  "比肩",
  "劫财",
  "食神",
  "伤官",
  "偏财",
  "正财",
  "七杀",
  "正官",
  "偏印",
  "正印",
];

// ===== 十神五行属性 =====

export const TEN_GOD_ELEMENTS: Record<TenGodType, ElementName> = {
  比肩: "木", // 与日主同五行
  劫财: "木", // 与日主同五行
  食神: "火", // 日主所生
  伤官: "火", // 日主所生
  偏财: "土", // 日主所克
  正财: "土", // 日主所克
  七杀: "金", // 克日主
  正官: "金", // 克日主
  偏印: "水", // 生日主
  正印: "水", // 生日主
};

export const YANG_BRANCHES: BranchName[] = ["子", "寅", "辰", "午", "申", "戌"];
export const YIN_BRANCHES: BranchName[] = ["丑", "卯", "巳", "未", "酉", "亥"];

// ===== 五行相生相克表 =====

export const ELEMENT_GENERATION = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

export const ELEMENT_RESTRICTION = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

// ===== 算法版本 =====

export const CHART_ALGORITHM_VERSION = "1.0.0-modular";

// ===== 默认选项 =====

export const DEFAULT_CHART_OPTIONS = {
  includeHiddenStems: true,
  includeTenGods: true,
  includeMajorPeriods: true,
  includeNaYin: true,
  majorPeriodCount: 12, // ✅ 修复：默认计算12步大运（120年完整周期）
  precision: "standard" as const,
  validateInput: true,
  useTraditional: false,
  enablePerformanceLogging: false,
};

// ===== 精度设置 =====

export const PRECISION_SETTINGS = {
  standard: {
    ageDecimalPlaces: 0,
    strengthDecimalPlaces: 1,
  },
  high: {
    ageDecimalPlaces: 1,
    strengthDecimalPlaces: 2,
  },
};

// ===== 缓存设置 =====

export const CACHE_SETTINGS = {
  maxEntries: 100,
  ttlMinutes: 30,
  cleanupIntervalMinutes: 5,
};
