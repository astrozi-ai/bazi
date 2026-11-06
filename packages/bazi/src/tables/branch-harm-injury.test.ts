import {describe,expect,test} from "bun:test";
import {getBranchHarmInjuries,BRANCH_HARM_INJURY_SOURCE} from "./branch-harm-injury";
import type {BranchName} from "../core-types";

// 38/40/46/57, frozen before implementation. Selection never ranks strength.
describe("directional harm injury table",()=>{
  const cases: [BranchName,BranchName,string[]][] = [
    ["子","未",["未>子:癸"]],["丑","午",["丑>午:丁"]],
    ["酉","戌",["戌>酉:辛"]],["卯","辰",["卯>辰:戊"]],
    ["寅","巳",["巳>寅:甲","寅>巳:戊"]],
    ["申","亥",["申>亥:甲","亥>申:戊"]],
  ];
  for(const [left,right,wanted] of cases) test(`${left}${right} exact injured stems and order invariance`,()=>{
    const project=(a:BranchName,b:BranchName)=>getBranchHarmInjuries(a,b).map(row=>`${row.source}>${row.target}:${row.injuredStem}`).sort();
    expect(project(left,right)).toEqual([...wanted].sort());
    expect(project(right,left)).toEqual([...wanted].sort());
  });
  test("no generic hidden control and durable author source",()=>{
    expect(getBranchHarmInjuries("戌","戌")).toEqual([]);
    expect(getBranchHarmInjuries("子","丑")).toEqual([]);
    expect(BRANCH_HARM_INJURY_SOURCE.locator).toContain("38/40/46/57");
    expect(BRANCH_HARM_INJURY_SOURCE.document).toContain("author_guidance: AstroZi");
  });
});

// Author40 fixed-direction mechanisms; 46 names reverse mutual mechanisms.
test("mechanisms keep unnamed forward mutual actions unresolved",()=>{
  for(const [left,right,mechanism] of [["未","子","燥土制水"],["丑","午","湿土晦火"],["戌","酉","燥土脆金"],["卯","辰","旺木制土"]] as const) {
    expect(getBranchHarmInjuries(left,right)[0]!.mechanism).toBe(mechanism);
  }
  expect(getBranchHarmInjuries("亥","申").find(row=>row.source==="亥")!.mechanism).toBe("甲木克戊土");
  expect(getBranchHarmInjuries("寅","巳").find(row=>row.source==="寅")!.mechanism).toBe("甲木克戊土");
  expect(getBranchHarmInjuries("申","亥").find(row=>row.source==="申")!.mechanism).toBeNull();
});
