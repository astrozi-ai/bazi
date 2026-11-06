/** Named injury carriers only. Qualification/strength belong to school, not this table. */
import type {BranchName,StemName} from "../core-types";
import type {TableSourceRef} from "./source-ref";

export const BRANCH_HARM_INJURY_SOURCE: TableSourceRef = {
  document:"author_guidance: AstroZi, 2026-09-16 / 2026-09-17",
  locator:"作者裁定 38/40/46/57 条",
  note:"子未穿，是子的本气癸水受伤。丑午穿，午本气丁火受伤。申亥穿，是亥中长生甲木受伤。卯辰穿，是辰中本气土受伤。酉戌穿，是酉中本气辛金受伤。寅巳穿是寅中本气甲木受伤。\n亥穿申，就是甲木克戊土。寅穿巳也是甲木克戊土\n是互伤，但须看谁的力量大，则另一方受伤重。通常是以本气对应的十神来应事。",
};
export interface BranchHarmInjury {
  readonly source:BranchName;
  readonly target:BranchName;
  readonly injuredStem:StemName;
  readonly mechanism:string|null;
}
export const BRANCH_HARM_INJURIES: readonly BranchHarmInjury[] = [
  {source:"未",target:"子",injuredStem:"癸",mechanism:"燥土制水"},
  {source:"丑",target:"午",injuredStem:"丁",mechanism:"湿土晦火"},
  {source:"戌",target:"酉",injuredStem:"辛",mechanism:"燥土脆金"},
  {source:"卯",target:"辰",injuredStem:"戊",mechanism:"旺木制土"},
  {source:"巳",target:"寅",injuredStem:"甲",mechanism:null},
  {source:"寅",target:"巳",injuredStem:"戊",mechanism:"甲木克戊土"},
  {source:"申",target:"亥",injuredStem:"甲",mechanism:null},
  {source:"亥",target:"申",injuredStem:"戊",mechanism:"甲木克戊土"},
];
export function getBranchHarmInjuries(left:BranchName,right:BranchName): readonly BranchHarmInjury[] {
  return BRANCH_HARM_INJURIES.filter(row=>(row.source===left && row.target===right) || (row.source===right && row.target===left));
}
