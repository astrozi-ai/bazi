/**
 * chart 的关系查询出口。数据 authority 在 `../relations`，此处只做转出，
 * 不得再声明任何关系表。
 *
 * 相对上游 `chart/public-branch-relations.ts` 的差异：
 * - `getBranchAbsolute` / `isBranchAbsolute`（相绝）不再导出：两份来源互相矛盾，
 *   差异登记在 `../relations/contested.ts`，core 不取默认值。
 * - `checkHiddenHarmony` / `analyzeHiddenHarmonies` 改名为 `stemHiddenHarmony` /
 *   `analyzeStemHiddenHarmonies`，与新增的支对支暗合表区分。
 * - `getBranchHiddenHarmony` / `isBranchHiddenHarmony` 现在读支对支暗合表（寅丑／午亥／卯申／子戌）。
 */
export {
	analyzeBranchInteractions,
	analyzeStemHiddenHarmonies,
	findSpouseStarPositions,
	getBranchClash,
	getBranchDestruction,
	getBranchHarm,
	getBranchHarmony,
	getBranchHiddenHarmony,
	getBranchPiercing,
	getBranchPunishments,
	getBranchThreeCombination,
	getBranchThreeGathering,
	getHiddenStemNames,
	getKuPosition,
	getLuPosition,
	getStemCombination,
	getYangRenPosition,
	hasElementRoot,
	hasStemRoot,
	isBranchHiddenHarmony,
	isClash,
	isDestruction,
	isHarm,
	isHarmony,
	isKuPosition,
	isLuPosition,
	isPartialThreeCombination,
	isPiercing,
	isPunishment,
	isSixCombination,
	isStemCombination,
	isThreeCombination,
	isThreeGathering,
	isYangRenPosition,
	stemHiddenHarmony,
} from "../relations";
