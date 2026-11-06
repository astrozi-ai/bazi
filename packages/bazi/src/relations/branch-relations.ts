/**
 * ============================================================
 * 地支关系表 (Branch Relations) — 本仓唯一关系 authority
 * ============================================================
 * @module relations/branch-relations
 * @description 六合(+化神)、六冲、六穿(害)、六破、三刑/自刑、三合/半合、三会、
 *              禄、刃、库、支对支暗合，以及天干×藏干暗合。任何 school 或 engine
 *              节点都必须从这里读关系，不得自带副本。
 *
 * 源自 AstroZi 排盘引擎的关系表，按作者裁定重写。
 */

import type { BranchName } from "../core-types";

// ============================================================
// 🔧 地支关系常量定义 (内部使用)
// ============================================================

/**
 * ⚡ 地支六冲关系
 * 子午冲,丑未冲,寅申冲,卯酉冲,辰戌冲,巳亥冲
 */
const CLASH_PAIRS: Record<BranchName, BranchName> = {
	子: "午",
	午: "子",
	丑: "未",
	未: "丑",
	寅: "申",
	申: "寅",
	卯: "酉",
	酉: "卯",
	辰: "戌",
	戌: "辰",
	巳: "亥",
	亥: "巳",
};

/**
 * 🤲 地支六合关系
 * 子丑合,寅亥合,卯戌合,辰酉合,巳申合,午未合
 */
const HARMONY_PAIRS: Record<BranchName, BranchName> = {
	子: "丑",
	丑: "子",
	寅: "亥",
	亥: "寅",
	卯: "戌",
	戌: "卯",
	辰: "酉",
	酉: "辰",
	巳: "申",
	申: "巳",
	午: "未",
	未: "午",
};

/**
 * 🌟 地支六合化神表
 * 子丑合化土, 寅亥合化木, 卯戌合化火, 辰酉合化金, 巳申合化水, 午未合化土
 *
 * 书源：《八字命稿精要》做局总论「午未合土：午生未土火势愈旺；合成燥土」（亦见
 * 「午未合——日月之光，合土生火」）。
 * （作者授权修正 2026-09-17：午未 火→土。原表误作「午未合化火」，与书例六合同一
 * 段的其余五组全部逐条吻合，唯此一组相抵。作者补注（2026-09-17）：午未有一说是
 * 合火，也有可能是与子丑的湿土对应为燥土——合火为竞争异说，燥土读法与书例
 * 「合成燥土」相合，本表按燥土（土）登记；异说未废，待作者终裁。）
 */
const SIX_COMBINATION_ELEMENTS: Record<string, string> = {
	子丑: "土",
	丑子: "土",
	寅亥: "木",
	亥寅: "木",
	卯戌: "火",
	戌卯: "火",
	辰酉: "金",
	酉辰: "金",
	巳申: "水",
	申巳: "水",
	午未: "土",
	未午: "土",
};

/**
 * 🔥 地支相刑关系
 * 子卯刑(无礼之刑),寅巳申刑(恩将仇报之刑),丑戌未刑(倚势之刑),辰午酉亥自刑
 */
const PUNISHMENT_GROUPS: Record<BranchName, BranchName[]> = {
	子: ["卯"],
	卯: ["子"],
	寅: ["巳", "申"],
	巳: ["寅", "申"],
	申: ["寅", "巳"],
	丑: ["戌", "未"],
	戌: ["丑", "未"],
	未: ["丑", "戌"],
	辰: ["辰"], // 自刑
	午: ["午"], // 自刑
	酉: ["酉"], // 自刑
	亥: ["亥"], // 自刑
};

/**
 * ⚡ 地支相穿(害)关系
 * 子未穿,丑午穿,寅巳穿,卯辰穿,申亥穿,酉戌穿
 */
const HARM_PAIRS: Record<BranchName, BranchName> = {
	子: "未",
	未: "子",
	丑: "午",
	午: "丑",
	寅: "巳",
	巳: "寅",
	卯: "辰",
	辰: "卯",
	申: "亥",
	亥: "申",
	酉: "戌",
	戌: "酉",
};

// ============================================================
// 📡 公开查询接口 (Public Query API)
// ============================================================

/**
 * 查询地支的冲关系
 * @param branch 地支
 * @returns 冲的目标地支,如果不存在则返回 null
 * @example
 * getBranchClash('子') // → '午'
 * getBranchClash('辰') // → '戌'
 */
export function getBranchClash(branch: BranchName): BranchName | null {
	return CLASH_PAIRS[branch] ?? null;
}

/**
 * 查询地支的合关系(六合)
 * @param branch 地支
 * @returns 合的目标地支,如果不存在则返回 null
 * @example
 * getBranchHarmony('子') // → '丑'
 * getBranchHarmony('辰') // → '酉'
 */
export function getBranchHarmony(branch: BranchName): BranchName | null {
	return HARMONY_PAIRS[branch] ?? null;
}

/**
 * 查询地支的刑关系
 * @param branch 地支
 * @returns 刑的目标地支数组(可能有多个),如果不存在则返回空数组
 * @example
 * getBranchPunishments('子') // → ['卯']
 * getBranchPunishments('寅') // → ['巳', '申']
 * getBranchPunishments('辰') // → ['辰'] (自刑)
 */
export function getBranchPunishments(branch: BranchName): BranchName[] {
	return PUNISHMENT_GROUPS[branch] ?? [];
}

/**
 * 查询地支的穿(害)关系
 * @param branch 地支
 * @returns 穿的目标地支,如果不存在则返回 null
 * @example
 * getBranchHarm('子') // → '未'
 * getBranchHarm('申') // → '亥'
 */
export function getBranchHarm(branch: BranchName): BranchName | null {
	return HARM_PAIRS[branch] ?? null;
}

/**
 * 查询地支的穿关系
 * @param branch 地支
 * @returns 穿的目标地支,如果不存在则返回 null
 * @example
 * getBranchPiercing('子') // → '未'
 * getBranchPiercing('申') // → '亥'
 */
export function getBranchPiercing(branch: BranchName): BranchName | null {
	return getBranchHarm(branch);
}

/**
 * 检查两个地支是否相冲
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否相冲
 * @example
 * isClash('子', '午') // → true
 * isClash('子', '丑') // → false
 */
export function isClash(branch1: BranchName, branch2: BranchName): boolean {
	return CLASH_PAIRS[branch1] === branch2;
}

/**
 * 检查两个地支是否相合(六合)
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否相合
 * @example
 * isHarmony('子', '丑') // → true
 * isHarmony('子', '午') // → false
 */
export function isHarmony(branch1: BranchName, branch2: BranchName): boolean {
	return HARMONY_PAIRS[branch1] === branch2;
}

/**
 * 检查两个地支是否构成六合,并返回化神元素
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 如果构成六合返回化神元素(如'土','金','水'等),否则返回null
 * @example
 * isSixCombination('子', '丑') // → '土'
 * isSixCombination('辰', '酉') // → '金'
 * isSixCombination('子', '午') // → null
 */
export function isSixCombination(branch1: BranchName, branch2: BranchName): string | null {
	const key = `${branch1}${branch2}`;
	return SIX_COMBINATION_ELEMENTS[key] ?? null;
}

/**
 * 检查两个地支是否相刑
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否相刑
 * @example
 * isPunishment('子', '卯') // → true
 * isPunishment('寅', '巳') // → true
 * isPunishment('辰', '辰') // → true (自刑)
 */
export function isPunishment(branch1: BranchName, branch2: BranchName): boolean {
	const punishments = PUNISHMENT_GROUPS[branch1] ?? [];
	return punishments.includes(branch2);
}

/**
 * 检查两个地支是否相穿(相害)
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否相穿
 * @example
 * isHarm('子', '未') // → true
 * isHarm('申', '亥') // → true
 */
export function isHarm(branch1: BranchName, branch2: BranchName): boolean {
	return HARM_PAIRS[branch1] === branch2;
}

/**
 * 检查两个地支是否相穿
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否相穿
 * @example
 * isPiercing('子', '未') // → true
 * isPiercing('申', '亥') // → true
 */
export function isPiercing(branch1: BranchName, branch2: BranchName): boolean {
	return isHarm(branch1, branch2);
}

// ============================================================
// 🌟 地支三合关系 (Three Combinations)
// ============================================================

/**
 * 地支三合局
 * - 申子辰合水局
 * - 亥卯未合木局
 * - 寅午戌合火局
 * - 巳酉丑合金局
 */
const THREE_COMBINATIONS: Record<string, { element: string; members: BranchName[] }> = {
	water: { element: "水", members: ["申", "子", "辰"] },
	wood: { element: "木", members: ["亥", "卯", "未"] },
	fire: { element: "火", members: ["寅", "午", "戌"] },
	metal: { element: "金", members: ["巳", "酉", "丑"] },
};

/**
 * 获取地支所属的三合局
 * @param branch 地支
 * @returns 三合局信息(元素和成员),如果不属于任何三合局返回null
 * @example
 * getBranchThreeCombination('子') // → { element: '水', members: ['申', '子', '辰'] }
 * getBranchThreeCombination('寅') // → { element: '火', members: ['寅', '午', '戌'] }
 */
export function getBranchThreeCombination(
	branch: BranchName,
): { element: string; members: BranchName[] } | null {
	for (const combo of Object.values(THREE_COMBINATIONS)) {
		if (combo.members.includes(branch)) {
			return combo;
		}
	}
	return null;
}

/**
 * 检查三个地支是否构成三合局
 * @param branch1 地支1
 * @param branch2 地支2
 * @param branch3 地支3
 * @returns 如果构成三合局返回元素名,否则返回null
 * @example
 * isThreeCombination('申', '子', '辰') // → '水'
 * isThreeCombination('亥', '卯', '未') // → '木'
 * isThreeCombination('子', '午', '卯') // → null
 */
export function isThreeCombination(
	branch1: BranchName,
	branch2: BranchName,
	branch3: BranchName,
): string | null {
	const branches = [branch1, branch2, branch3].sort();
	for (const combo of Object.values(THREE_COMBINATIONS)) {
		const sorted = [...combo.members].sort();
		if (branches.join("") === sorted.join("")) {
			return combo.element;
		}
	}
	return null;
}

/**
 * 检查两个地支是否属于同一三合局(可能形成半合)
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 如果属于同一三合局返回{element, missing},否则返回null
 * @example
 * isPartialThreeCombination('申', '子') // → { element: '水', missing: '辰' }
 * isPartialThreeCombination('亥', '未') // → { element: '木', missing: '卯' }
 */
export function isPartialThreeCombination(
	branch1: BranchName,
	branch2: BranchName,
): { element: string; missing: BranchName } | null {
	for (const combo of Object.values(THREE_COMBINATIONS)) {
		const hasB1 = combo.members.includes(branch1);
		const hasB2 = combo.members.includes(branch2);
		if (hasB1 && hasB2 && branch1 !== branch2) {
			const missing = combo.members.find((m) => m !== branch1 && m !== branch2);
			if (!missing) {
				continue;
			}
			return { element: combo.element, missing };
		}
	}
	return null;
}

// ============================================================
// 💥 地支相破关系 (Destruction)
// ============================================================

/**
 * 地支相破关系
 * 子酉破,午卯破,巳申破,寅亥破,辰丑破,戌未破
 */
const DESTRUCTION_PAIRS: Record<BranchName, BranchName> = {
	子: "酉",
	酉: "子",
	午: "卯",
	卯: "午",
	巳: "申",
	申: "巳",
	寅: "亥",
	亥: "寅",
	辰: "丑",
	丑: "辰",
	戌: "未",
	未: "戌",
};

/**
 * 获取地支的相破对象
 * @param branch 地支
 * @returns 相破的地支
 * @example
 * getBranchDestruction('子') // → '酉'
 * getBranchDestruction('午') // → '卯'
 */
export function getBranchDestruction(branch: BranchName): BranchName {
	return DESTRUCTION_PAIRS[branch];
}

/**
 * 检查两个地支是否相破
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否相破
 * @example
 * isDestruction('子', '酉') // → true
 * isDestruction('午', '卯') // → true
 * isDestruction('子', '午') // → false
 */
export function isDestruction(branch1: BranchName, branch2: BranchName): boolean {
	return DESTRUCTION_PAIRS[branch1] === branch2;
}

// ============================================================
// 🌟 地支三会关系 (Three Gathering)
// ============================================================

/**
 * 地支三会局
 * - 寅卯辰会东方木
 * - 巳午未会南方火
 * - 申酉戌会西方金
 * - 亥子丑会北方水
 */
const THREE_GATHERING: Record<
	string,
	{ element: string; direction: string; members: BranchName[] }
> = {
	east_wood: { element: "木", direction: "东", members: ["寅", "卯", "辰"] },
	south_fire: { element: "火", direction: "南", members: ["巳", "午", "未"] },
	west_metal: { element: "金", direction: "西", members: ["申", "酉", "戌"] },
	north_water: { element: "水", direction: "北", members: ["亥", "子", "丑"] },
};

/**
 * 获取地支所属的三会局
 * @param branch 地支
 * @returns 三会局信息(元素、方位和成员),如果不属于任何三会局返回null
 * @example
 * getBranchThreeGathering('寅') // → { element: '木', direction: '东', members: ['寅', '卯', '辰'] }
 */
export function getBranchThreeGathering(
	branch: BranchName,
): { element: string; direction: string; members: BranchName[] } | null {
	for (const gathering of Object.values(THREE_GATHERING)) {
		if (gathering.members.includes(branch)) {
			return gathering;
		}
	}
	return null;
}

/**
 * 检查三个地支是否构成三会局
 * @param branch1 地支1
 * @param branch2 地支2
 * @param branch3 地支3
 * @returns 如果构成三会局返回{ element, direction },否则返回null
 * @example
 * isThreeGathering('寅', '卯', '辰') // → { element: '木', direction: '东' }
 * isThreeGathering('子', '午', '卯') // → null
 */
export function isThreeGathering(
	branch1: BranchName,
	branch2: BranchName,
	branch3: BranchName,
): { element: string; direction: string } | null {
	const branches = [branch1, branch2, branch3].sort();
	for (const gathering of Object.values(THREE_GATHERING)) {
		const sorted = [...gathering.members].sort();
		if (branches.join("") === sorted.join("")) {
			return { element: gathering.element, direction: gathering.direction };
		}
	}
	return null;
}

// ============================================================
// 📍 禄表 (Lu - Prosperity Position)
// 天干临官之位
// ============================================================

import type { ElementName, StemName } from "../core-types";

/**
 * 天干禄表 - 天干临官之位
 * 甲禄在寅、乙禄在卯、丙戊禄在巳、丁己禄在午、
 * 庚禄在申、辛禄在酉、壬禄在亥、癸禄在子
 */
const LU_TABLE: Record<StemName, BranchName> = {
	甲: "寅",
	乙: "卯",
	丙: "巳",
	丁: "午",
	戊: "巳",
	己: "午",
	庚: "申",
	辛: "酉",
	壬: "亥",
	癸: "子",
};

/**
 * 获取天干的禄位
 * @param stem 天干
 * @returns 禄所在的地支
 * @example
 * getLuPosition('甲') // → '寅'
 * getLuPosition('丙') // → '巳'
 */
export function getLuPosition(stem: StemName): BranchName {
	return LU_TABLE[stem];
}

/**
 * 检查天干是否在某地支有禄
 * @param stem 天干
 * @param branch 地支
 * @returns 是否有禄
 * @example
 * isLuPosition('甲', '寅') // → true
 * isLuPosition('甲', '卯') // → false
 */
export function isLuPosition(stem: StemName, branch: BranchName): boolean {
	return LU_TABLE[stem] === branch;
}

// ============================================================
// 🗡 羊刃表 (Yang Ren - Blade Position)
// 阳干帝旺之位；上游 chart/ 无此表，按《命稿精要》第十三章四新增
// ============================================================

/**
 * 天干羊刃表 - 阳干帝旺之位
 * 甲刃在卯、丙刃在午、戊刃在午、庚刃在酉、壬刃在子
 * 阴干不立刃，查询返回 null。
 */
const YANG_REN_TABLE: Partial<Record<StemName, BranchName>> = {
	甲: "卯",
	丙: "午",
	戊: "午",
	庚: "酉",
	壬: "子",
};

/**
 * 获取天干的羊刃位
 * @param stem 天干
 * @returns 羊刃所在的地支；阴干无刃，返回 null
 * @example
 * getYangRenPosition('甲') // → '卯'
 * getYangRenPosition('乙') // → null
 */
export function getYangRenPosition(stem: StemName): BranchName | null {
	return YANG_REN_TABLE[stem] ?? null;
}

/**
 * 检查天干是否在某地支见刃
 * @param stem 天干
 * @param branch 地支
 * @returns 是否见刃
 * @example
 * isYangRenPosition('丙', '午') // → true
 * isYangRenPosition('乙', '寅') // → false
 */
export function isYangRenPosition(stem: StemName, branch: BranchName): boolean {
	return YANG_REN_TABLE[stem] === branch;
}

// ============================================================
// 🗡 阴刃表 (Yin Ren - Yin Blade Position)
// 阴干帝旺逆行之位；author_guidance: AstroZi, 2026-09-18「阴干是帝旺逆行，没毛病」。
// 乙刃在寅、丁刃在巳、己刃在巳、辛刃在申、癸刃在亥（与禄前一位同位）。
// 论长生与库仍按阳干走（阴阳同生同死），不随本表逆行——同日 author_guidance。
// ============================================================

/**
 * 天干阴刃表 - 阴干帝旺逆行之位
 * 乙刃在寅、丁刃在巳、己刃在巳、辛刃在申、癸刃在亥
 * 阳干无阴刃，查询返回 null（阳干刃见 YANG_REN_TABLE）。
 */
const YIN_REN_TABLE: Partial<Record<StemName, BranchName>> = {
	乙: "寅",
	丁: "巳",
	己: "巳",
	辛: "申",
	癸: "亥",
};

/**
 * 获取天干的阴刃位
 * @param stem 天干
 * @returns 阴刃所在的地支；阳干无阴刃，返回 null
 * @example
 * getYinRenPosition('乙') // → '寅'
 * getYinRenPosition('甲') // → null
 */
export function getYinRenPosition(stem: StemName): BranchName | null {
	return YIN_REN_TABLE[stem] ?? null;
}

/**
 * 检查天干是否在某地支见阴刃
 * @param stem 天干
 * @param branch 地支
 * @returns 是否见阴刃
 * @example
 * isYinRenPosition('辛', '申') // → true
 * isYinRenPosition('庚', '酉') // → false（庚是阳刃在酉，非阴刃）
 */
export function isYinRenPosition(stem: StemName, branch: BranchName): boolean {
	return YIN_REN_TABLE[stem] === branch;
}

// ============================================================
// 📦 库表 (Ku - Storage Position)
// 五行入墓之位
// ============================================================

/**
 * 五行库位表 - 五行入墓之位
 * 木库在未、火库在戌、金库在丑、水库在辰
 *
 * 土库在本表中缺位：来源之间不一致（辰 / 戌），差异登记在 `./contested.ts`
 * 的 `EARTH_STORAGE_CONTEST`，此处不取默认值。查询土库返回 `null`。
 */
const KU_TABLE: Partial<Record<ElementName, BranchName>> = {
	木: "未",
	火: "戌",
	金: "丑",
	水: "辰",
};

/**
 * 获取五行的库位
 * @param element 五行
 * @returns 库所在的地支；土无公认库位，返回 null
 * @example
 * getKuPosition('木') // → '未'
 * getKuPosition('土') // → null
 */
export function getKuPosition(element: ElementName): BranchName | null {
	return KU_TABLE[element] ?? null;
}

/**
 * 检查五行是否入库于某地支
 * @param element 五行
 * @param branch 地支
 * @returns 是否入库
 * @example
 * isKuPosition('木', '未') // → true
 * isKuPosition('火', '未') // → false
 * isKuPosition('土', '辰') // → false（土库有争议，默认表不收）
 */
export function isKuPosition(element: ElementName, branch: BranchName): boolean {
	return KU_TABLE[element] === branch;
}

// ============================================================
// 🔬 综合地支作用分析 (Comprehensive Branch Interaction Analysis)
// ============================================================

import { BRANCH_HIDDEN_STEMS, STEM_ELEMENTS } from "../chart/constants";

/**
 * 地支综合作用分析结果
 */
export interface BranchInteractionResult {
	targetBranch: BranchName;
	interactions: {
		clashWith: BranchName | null;
		sixHarmonyWith: { branch: BranchName; resultElement: string } | null;
		threeHarmony: string | null;
		threeGathering: { element: string; direction: string } | null;
		halfHarmonyWith: Array<{ branch: BranchName; element: string; missing: BranchName }>;
		punishmentWith: BranchName[];
		harmWith: BranchName | null;
		destructionWith: BranchName | null;
	};
	stability: "stable" | "moved" | "conflicted";
	summary: string;
}

/**
 * 分析目标地支与其他地支的所有作用关系
 * @param targetBranch 目标地支（如配偶宫日支）
 * @param otherBranches 其他地支数组（如年月时支）
 * @returns 综合作用分析结果
 * @example
 * analyzeBranchInteractions('午', ['子', '卯', '申'])
 * // → { targetBranch: '午', interactions: { clashWith: '子', ... }, stability: 'conflicted', summary: '与子相冲' }
 */
export function analyzeBranchInteractions(
	targetBranch: BranchName,
	otherBranches: BranchName[],
): BranchInteractionResult {
	let clashWith: BranchName | null = null;
	let sixHarmonyWith: { branch: BranchName; resultElement: string } | null = null;
	let harmWith: BranchName | null = null;
	let destructionWith: BranchName | null = null;
	const punishmentWith: BranchName[] = [];
	const halfHarmonyWith: Array<{ branch: BranchName; element: string; missing: BranchName }> = [];

	for (const other of otherBranches) {
		if (other === targetBranch) continue;

		// Check clash
		if (isClash(targetBranch, other)) {
			clashWith = other;
		}

		// Check six harmony
		const harmonyResult = isSixCombination(targetBranch, other);
		if (harmonyResult) {
			sixHarmonyWith = { branch: other, resultElement: harmonyResult };
		}

		// Check half harmony (partial three combination)
		const halfResult = isPartialThreeCombination(targetBranch, other);
		if (halfResult) {
			halfHarmonyWith.push({
				branch: other,
				element: halfResult.element,
				missing: halfResult.missing,
			});
		}

		// Check punishment
		if (isPunishment(targetBranch, other)) {
			punishmentWith.push(other);
		}

		// Check harm
		if (isHarm(targetBranch, other)) {
			harmWith = other;
		}

		// Check destruction
		if (isDestruction(targetBranch, other)) {
			destructionWith = other;
		}
	}

	// Check three harmony and three gathering with all branches
	const allBranches = [targetBranch, ...otherBranches];
	let threeHarmony: string | null = null;
	let threeGathering: { element: string; direction: string } | null = null;

	// Check all possible three-branch combinations for three harmony
	if (allBranches.length >= 3) {
		for (let i = 0; i < allBranches.length - 2; i++) {
			for (let j = i + 1; j < allBranches.length - 1; j++) {
				for (let k = j + 1; k < allBranches.length; k++) {
					const first = allBranches[i];
					const second = allBranches[j];
					const third = allBranches[k];
					if (!first || !second || !third) {
						continue;
					}
					const thResult = isThreeCombination(first, second, third);
					if (thResult) {
						threeHarmony = thResult;
					}
					const tgResult = isThreeGathering(first, second, third);
					if (tgResult) {
						threeGathering = tgResult;
					}
				}
			}
		}
	}

	// Determine stability
	let stability: "stable" | "moved" | "conflicted" = "stable";
	if (clashWith || punishmentWith.length > 0) {
		stability = "conflicted";
	} else if (sixHarmonyWith || threeHarmony || threeGathering) {
		stability = "moved"; // Harmonies can indicate "being drawn away"
	}

	// Generate summary
	const summaryParts: string[] = [];
	if (clashWith) summaryParts.push(`与${clashWith}相冲`);
	if (sixHarmonyWith)
		summaryParts.push(`与${sixHarmonyWith.branch}六合化${sixHarmonyWith.resultElement}`);
	if (threeHarmony) summaryParts.push(`成三合${threeHarmony}局`);
	if (threeGathering)
		summaryParts.push(`成三会${threeGathering.direction}方${threeGathering.element}`);
	if (punishmentWith.length > 0) summaryParts.push(`与${punishmentWith.join("、")}相刑`);
	if (harmWith) summaryParts.push(`与${harmWith}相害`);
	if (destructionWith) summaryParts.push(`与${destructionWith}相破`);

	const summary = summaryParts.length > 0 ? summaryParts.join("；") : "无特殊作用";

	return {
		targetBranch,
		interactions: {
			clashWith,
			sixHarmonyWith,
			threeHarmony,
			threeGathering,
			halfHarmonyWith,
			punishmentWith,
			harmWith,
			destructionWith,
		},
		stability,
		summary,
	};
}

/**
 * 检查天干是否在某地支有根（通根）
 * 通过检查地支藏干中是否有相同五行的天干
 * @param stem 天干
 * @param branch 地支
 * @returns 是否有根
 * @example
 * hasStemRoot('甲', '寅') // → true (寅藏甲)
 * hasStemRoot('甲', '午') // → false
 */
export function hasStemRoot(stem: StemName, branch: BranchName): boolean {
	const stemElement = STEM_ELEMENTS[stem];
	const hiddenStems = BRANCH_HIDDEN_STEMS[branch];

	for (const hs of hiddenStems) {
		if (hs.element === stemElement) {
			return true;
		}
	}
	return false;
}

/**
 * 检查某五行是否在地支中有根
 * @param element 五行
 * @param branch 地支
 * @returns 是否有根
 * @example
 * hasElementRoot('木', '寅') // → true
 * hasElementRoot('金', '寅') // → false
 */
export function hasElementRoot(element: ElementName, branch: BranchName): boolean {
	const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
	for (const hs of hiddenStems) {
		if (hs.element === element) {
			return true;
		}
	}
	return false;
}

/**
 * 获取地支的所有藏干天干名
 * @param branch 地支
 * @returns 藏干天干数组
 * @example
 * getHiddenStemNames('寅') // → ['甲', '丙', '戊']
 * getHiddenStemNames('子') // → ['癸']
 */
export function getHiddenStemNames(branch: BranchName): StemName[] {
	const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
	return hiddenStems.map((hs) => hs.stem as StemName);
}

// ============================================================
// 🔗 暗合关系 (Hidden Harmony / Secret Combination)
// ============================================================

import { STEM_COMBINATION_PAIRS } from "./stem-relations";

/**
 * 地支暗合表（支对支）
 * 寅丑暗合、午亥暗合、卯申暗合、子戌暗合
 *
 * 原则（author_guidance: AstroZi, 2026-09-20）：支对支暗合只认两支**本气**天干相合，
 * 中气／余气藏干不参与。逐对核本气：寅(甲)丑(己)＝甲己合、午(丁)亥(壬)＝丁壬合、
 * 卯(乙)申(庚)＝乙庚合、子(癸)戌(戊)＝戊癸合。
 *
 * 被该裁定覆盖的书文：暗合表「寅丑、午亥、卯申、子巳」里的子巳一项（子本气癸、巳本气丙，
 * 不相合；书中另一处用的是「子中癸水合巳中戊土」，戊是巳的中气藏干），以及「四绝均含暗合
 * （如子巳暗合、寅酉暗合）」。书文保留为历史，落码以作者口径为准。
 * 子戌在书的暗合表里漏列，书中却有六处用它立论。
 *
 * 这张表**手写**，不从「本气＋五合」推导：按同一原则本气也相合的还有 寅未(甲己)、
 * 子辰(戊癸)、巳酉(丙辛)，作者没有点名，一对都不收。
 *
 * 与 `stemHiddenHarmony`（天干 × 地支本气藏干）是两个概念，故分表分函数。
 */
const BRANCH_HIDDEN_HARMONY_PAIRS: Partial<Record<BranchName, BranchName>> = {
	寅: "丑",
	丑: "寅",
	午: "亥",
	亥: "午",
	卯: "申",
	申: "卯",
	子: "戌",
	戌: "子",
};

/**
 * 查询地支的暗合对象（支对支）
 * @param branch 地支
 * @returns 暗合的地支,如果不存在则返回 null
 * @example
 * getBranchHiddenHarmony('寅') // → '丑'
 * getBranchHiddenHarmony('辰') // → null
 */
export function getBranchHiddenHarmony(branch: BranchName): BranchName | null {
	return BRANCH_HIDDEN_HARMONY_PAIRS[branch] ?? null;
}

/**
 * 检查两个地支是否暗合（支对支）
 * @param branch1 地支1
 * @param branch2 地支2
 * @returns 是否暗合
 * @example
 * isBranchHiddenHarmony('子', '巳') // → true
 */
export function isBranchHiddenHarmony(branch1: BranchName, branch2: BranchName): boolean {
	return BRANCH_HIDDEN_HARMONY_PAIRS[branch1] === branch2;
}

/**
 * 天干与地支藏干的暗合分析结果
 */
export interface StemHiddenHarmonyResult {
	hasHiddenHarmony: boolean;
	harmonies: Array<{
		stem: StemName; // 天干
		hiddenStem: StemName; // 藏干
		branch: BranchName; // 藏干所在地支
		result: ElementName; // 化神
	}>;
}

/**
 * 检查天干与地支本气是否暗合
 * 暗合：天干与地支本气藏干形成五合关系
 * 例如：日干甲与丑支本气己，则甲己暗合
 *
 * 与支对支暗合表（`getBranchHiddenHarmony`）是不同概念，命名上分开。
 *
 * @param stem 天干（如日干）
 * @param branch 地支
 * @returns 暗合结果
 * @example
 * stemHiddenHarmony('甲', '丑') // → { hasHiddenHarmony: true, harmonies: [{ stem: '甲', hiddenStem: '己', branch: '丑', result: '土' }] }
 * stemHiddenHarmony('甲', '子') // → { hasHiddenHarmony: false, harmonies: [] }
 */
export function stemHiddenHarmony(stem: StemName, branch: BranchName): StemHiddenHarmonyResult {
	const harmonies: StemHiddenHarmonyResult["harmonies"] = [];
	const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
	const comboPair = STEM_COMBINATION_PAIRS[stem];

	for (const hs of hiddenStems.filter((hiddenStem) => hiddenStem.type === "primary")) {
		if (hs.stem === comboPair.partner) {
			harmonies.push({
				stem,
				hiddenStem: hs.stem as StemName,
				branch,
				result: comboPair.result,
			});
		}
	}

	return { hasHiddenHarmony: harmonies.length > 0, harmonies };
}

/**
 * 分析天干与多个地支的所有暗合关系
 * @param stem 天干
 * @param branches 地支数组
 * @returns 所有暗合结果
 * @example
 * analyzeStemHiddenHarmonies('甲', ['子', '丑', '午', '未'])
 * // → { hasHiddenHarmony: true, harmonies: [{ stem: '甲', hiddenStem: '己', branch: '丑', result: '土' }, { stem: '甲', hiddenStem: '己', branch: '未', result: '土' }] }
 */
export function analyzeStemHiddenHarmonies(
	stem: StemName,
	branches: BranchName[],
): StemHiddenHarmonyResult {
	const allHarmonies: StemHiddenHarmonyResult["harmonies"] = [];

	for (const branch of branches) {
		const result = stemHiddenHarmony(stem, branch);
		allHarmonies.push(...result.harmonies);
	}

	return { hasHiddenHarmony: allHarmonies.length > 0, harmonies: allHarmonies };
}

// ============================================================
// 🔍 配偶星搜索 (Spouse Star Search)
// 在八字所有位置（天干+地支藏干）搜索配偶星
// ============================================================

/**
 * 配偶星显隐类型
 * - 'visible': 显星 - 天干透出或地支本气（力量强）
 * - 'hidden': 隐星 - 地支中气或余气（力量弱）
 */
export type SpouseStarVisibility = "visible" | "hidden";

/**
 * 藏干位置类型
 * - 'primary': 本气（第一藏干，力量最强）
 * - 'secondary': 中气（第二藏干）
 * - 'tertiary': 余气（第三藏干，力量最弱）
 */
export type HiddenStemRole = "primary" | "secondary" | "tertiary";

/**
 * 配偶星位置信息
 */
export interface SpouseStarPosition {
	position: string; // 位置名称: 年干、月干、时干、年支藏、月支藏、日支藏、时支藏
	pillar: "year" | "month" | "day" | "hour";
	isHiddenStem: boolean; // 是否为地支藏干
	stem: StemName; // 天干（直接或藏干）
	element: ElementName; // 天干五行
	visibility: SpouseStarVisibility; // 显隐类型: visible=显星, hidden=隐星
	hiddenStemRole?: HiddenStemRole; // 藏干位置: primary=本气, secondary=中气, tertiary=余气
}

/**
 * 在四柱所有位置搜索特定五行的配偶星
 * 配偶星可出现在：年干、月干、时干、年支藏、月支藏、日支藏、时支藏（共7位，除日干外）
 *
 * 显隐分类规则：
 * - 显星 (visible): 天干透出 + 地支本气（第一藏干）
 * - 隐星 (hidden): 地支中气（第二藏干）+ 余气（第三藏干）
 *
 * @param fourPillars 四柱八字
 * @param targetElement 配偶星五行（男命为我克者，女命为克我者）
 * @returns 配偶星出现的所有位置
 */
export function findSpouseStarPositions(
	fourPillars: {
		year: { stem: string; branch: string };
		month: { stem: string; branch: string };
		day: { stem: string; branch: string };
		hour: { stem: string; branch: string };
	},
	targetElement: ElementName,
): SpouseStarPosition[] {
	const positions: SpouseStarPosition[] = [];

	// 1. Check stems (天干) - except day stem
	// 天干透出均为"显星"
	const stemPositions: Array<{ pillar: "year" | "month" | "hour"; name: string; stem: string }> = [
		{ pillar: "year", name: "年干", stem: fourPillars.year.stem },
		{ pillar: "month", name: "月干", stem: fourPillars.month.stem },
		{ pillar: "hour", name: "时干", stem: fourPillars.hour.stem },
	];

	for (const pos of stemPositions) {
		const stemElement = STEM_ELEMENTS[pos.stem as StemName];
		if (stemElement === targetElement) {
			positions.push({
				position: pos.name,
				pillar: pos.pillar,
				isHiddenStem: false,
				stem: pos.stem as StemName,
				element: stemElement,
				visibility: "visible", // 天干透出为显星
			});
		}
	}

	// 2. Check hidden stems in branches (地支藏干) - all four branches
	// 本气为"显星"，中气和余气为"隐星"
	const branchPositions: Array<{
		pillar: "year" | "month" | "day" | "hour";
		name: string;
		branch: string;
	}> = [
		{ pillar: "year", name: "年支藏", branch: fourPillars.year.branch },
		{ pillar: "month", name: "月支藏", branch: fourPillars.month.branch },
		{ pillar: "day", name: "日支藏", branch: fourPillars.day.branch },
		{ pillar: "hour", name: "时支藏", branch: fourPillars.hour.branch },
	];

	for (const pos of branchPositions) {
		const hiddenStems = BRANCH_HIDDEN_STEMS[pos.branch as BranchName];
		for (let i = 0; i < hiddenStems.length; i++) {
			const hs = hiddenStems[i];
			if (!hs) continue;
			if (hs.element === targetElement) {
				// 根据藏干位置确定角色和显隐类型
				const hiddenStemRole: HiddenStemRole =
					i === 0 ? "primary" : i === 1 ? "secondary" : "tertiary";
				const visibility: SpouseStarVisibility = i === 0 ? "visible" : "hidden";

				positions.push({
					position: pos.name,
					pillar: pos.pillar,
					isHiddenStem: true,
					stem: hs.stem as StemName,
					element: hs.element as ElementName,
					visibility, // 本气为显，中气余气为隐
					hiddenStemRole, // 标记是本气、中气还是余气
				});
			}
		}
	}

	return positions;
}
