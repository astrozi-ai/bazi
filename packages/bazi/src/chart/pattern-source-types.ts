import type {
  BranchName,
  ElementName,
  StemName,
  TenGodSimplified,
  TenGodType,
} from "../core-types";

export interface StemBranchPair {
  stem: StemName;
  branch: BranchName;
  ganZhi: string;
  naYin?: string;
  element?: ElementName;
  branchElement?: ElementName;
  hiddenStems?: HiddenStem[];
  tenGod?: TenGodType;
  tenGodSimplified?: TenGodSimplified;
  pillarType?: "year" | "month" | "day" | "hour";
  pillarIndex?: number;
}

export interface HiddenStem {
  stem: StemName;
  element: ElementName;
  strength: number;
  weight: number;
  type: "primary" | "secondary" | "tertiary";
  tenGod?: TenGodType;
}

export interface FourPillars {
  year: StemBranchPair;
  month: StemBranchPair;
  day: StemBranchPair;
  hour: StemBranchPair;
  dayMaster: StemName;
  monthOrder: ElementName;
  season: "春" | "夏" | "秋" | "冬" | "土月";
  elementCount: Record<ElementName, number>;
  tenGodCount: Record<TenGodType, number>;
  hiddenStemCount: Record<ElementName, number>;
}

export interface TenGodAnalysis {
  dayMaster: StemName;
  relationships: TenGodRelationship[];
  summary: TenGodSummary;
  patterns: TenGodPattern[];
}

export interface TenGodRelationship {
  target: StemName | BranchName;
  targetType: "stem" | "branch" | "hiddenStem";
  pillar: "year" | "month" | "day" | "hour" | "majorPeriod";
  position?: "stem" | "branch" | "hidden";
  tenGod: TenGodType;
  tenGodSimplified: TenGodSimplified;
  element: ElementName;
  strength: number;
  isVisible: boolean;
}

export interface TenGodSummary {
  strongest: TenGodType;
  weakest: TenGodType;
  visible: TenGodType[];
  hidden: TenGodType[];
  count: Record<TenGodType, number>;
  distribution: string;
}

export interface TenGodPattern {
  name: string;
  type: "favorable" | "unfavorable" | "neutral";
  components: TenGodType[];
  description: string;
  strength: number;
}
