/**
 * 八字神煞计算函数
 * 用于检查八字中的各种神煞
 *
 * 源自 AstroZi 排盘引擎（生产在用的神煞表）。各条神煞的查法尚未逐条对照原书审定，
 * 出处登记为 `unresolved`（见 `SHENSHA_SOURCE`）：它是 AstroZi 的现行口径，不是
 * 已审定的默认值。
 */
import type { TableSourceRef } from "../tables/source-ref";

/** 神煞查法的出处：现行口径，未审定。 */
export const SHENSHA_SOURCE: TableSourceRef & { readonly status: "unresolved" } = {
  document: "AstroZi 排盘引擎神煞表",
  locator: "未逐条审定",
  note: "红鸾、天喜、咸池、天乙、太极、文昌、驿马、华盖、羊刃、空亡等查法沿用 AstroZi 现行口径；各派查法不一，审定后逐条补原书出处。",
  status: "unresolved",
};

// 地支顺序
const _EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const YANG_STEMS = new Set(["甲", "丙", "戊", "庚", "壬"]);
const SHENSHA_PILLAR_LABELS = {
	year: "年柱",
	month: "月柱",
	day: "日柱",
	hour: "时柱",
	luck: "大运柱",
	annual: "流年柱",
} as const;

/**
 * 根据年支计算红鸾位置
 * 年支：子丑寅卯辰巳午未申酉戌亥
 * 红鸾：卯寅丑子亥戌酉申未午巳辰
 */
export function getHongLuan(yearBranch: string): string {
	const hongluanMap: { [key: string]: string } = {
		子: "卯",
		丑: "寅",
		寅: "丑",
		卯: "子",
		辰: "亥",
		巳: "戌",
		午: "酉",
		未: "申",
		申: "未",
		酉: "午",
		戌: "巳",
		亥: "辰",
	};

	return hongluanMap[yearBranch] || "";
}

/**
 * 根据年支计算天喜位置
 * 年支：子丑寅卯辰巳午未申酉戌亥
 * 天喜：酉申未午巳辰卯寅丑子亥戌
 */
export function getTianXi(yearBranch: string): string {
	const tianxiMap: { [key: string]: string } = {
		子: "酉",
		丑: "申",
		寅: "未",
		卯: "午",
		辰: "巳",
		巳: "辰",
		午: "卯",
		未: "寅",
		申: "丑",
		酉: "子",
		戌: "亥",
		亥: "戌",
	};

	return tianxiMap[yearBranch] || "";
}

/**
 * 沐浴计算
 * 甲日干见亥，乙日干见子，丙日干见寅，丁日干见卯，戊日干见寅，己日干见卯，庚日干见巳，辛日干见午，壬日干见申，癸日干见酉
 */
function getMuYu(dayStem: string): string[] {
	const muyuMap: { [key: string]: string[] } = {
		甲: ["亥"],
		乙: ["子"],
		丙: ["寅"],
		丁: ["卯"],
		戊: ["寅"],
		己: ["卯"],
		庚: ["巳"],
		辛: ["午"],
		壬: ["申"],
		癸: ["酉"],
	};

	return muyuMap[dayStem] || [];
}

/**
 * 咸池计算（桃花煞）- 查年法
 * 按年支查法：申子辰年见酉，亥卯未年见子，寅午戌年见卯，巳酉丑年见午
 */
export function getXianChi(yearBranch: string): string {
	const xianchiMap: { [key: string]: string } = {
		// 申子辰年（水局），桃花在酉
		申: "酉",
		子: "酉",
		辰: "酉",
		// 亥卯未年（木局），桃花在子
		亥: "子",
		卯: "子",
		未: "子",
		// 寅午戌年（火局），桃花在卯
		寅: "卯",
		午: "卯",
		戌: "卯",
		// 巳酉丑年（金局），桃花在午
		巳: "午",
		酉: "午",
		丑: "午",
	};

	return xianchiMap[yearBranch] || "";
}

/**
 * 红艳计算（日干对照法）
 * 甲见午、乙见申、丙见寅、丁见未、戊见辰、己见辰、庚见戌、辛见酉、壬见子、癸见申
 */
export function getHongYan(dayStem: string): string[] {
	const hongyanMap: { [key: string]: string[] } = {
		甲: ["午"],
		乙: ["申"],
		丙: ["寅"],
		丁: ["未"],
		戊: ["辰"],
		己: ["辰"],
		庚: ["戌"],
		辛: ["酉"],
		壬: ["子"],
		癸: ["申"],
	};

	return hongyanMap[dayStem] || [];
}

/**
 * 天乙贵人计算
 * 按日干或年干查四柱地支
 * 使用生产环境的正确映射
 */
function getTianYiGuiRen(stem: string): string[] {
	const tianyiMap: { [key: string]: string[] } = {
		甲: ["丑", "未"],
		乙: ["子", "申"],
		丙: ["亥", "酉"],
		丁: ["亥", "酉"],
		戊: ["丑", "未"],
		己: ["子", "申"],
		庚: ["丑", "未"],
		辛: ["寅", "午"],
		壬: ["卯", "巳"],
		癸: ["卯", "巳"],
	};

	return tianyiMap[stem] || [];
}

/**
 * 天德贵人计算 - 根据年干查月干是否有对应的天德贵人
 * 年干决定天德贵人，月干中出现对应天干就是天德
 */
function getTianDeGuiRen(yearStem: string, monthStem: string): boolean {
	const tiandeMap: { [key: string]: string[] } = {
		// 甲己起首干丙，天德贵人是丙
		甲: ["丙"],
		己: ["丙"],
		// 乙庚起首干丁，天德贵人是丁
		乙: ["丁"],
		庚: ["丁"],
		// 丙辛起首干戊，天德贵人是戊
		丙: ["戊"],
		辛: ["戊"],
		// 丁壬起首干己，天德贵人是己
		丁: ["己"],
		壬: ["己"],
		// 戊癸起首干甲，天德贵人是甲
		戊: ["甲"],
		癸: ["甲"],
	};

	const requiredStems = tiandeMap[yearStem] || [];
	return requiredStems.includes(monthStem);
}

const STEM_POSITION_NAMES = ["年干", "月干", "日干", "时干", "大运干", "流年干"] as const;

function getStemPositions(stems: string[], requiredStem: string): string[] {
	if (!requiredStem) return [];
	const positions: string[] = [];
	stems.forEach((stem, index) => {
		const position = STEM_POSITION_NAMES[index];
		if (stem === requiredStem && position) {
			positions.push(position);
		}
	});
	return positions;
}

/**
 * 月德贵人计算 - 根据月支三合局确定月德天干，检查四柱天干任意位置
 * 歌诀：寅午戌月见丙，申子辰月见壬，亥卯未月见甲，巳酉丑月见庚
 */
function getYueDeGuiRen(
	monthBranch: string,
	stems: string[],
): { hasIt: boolean; positions: string[]; requiredStem: string } {
	// 月支三合局对应的月德天干
	const yuedeMap: { [key: string]: string } = {
		// 寅午戌（火局） → 月德天干是丙
		寅: "丙",
		午: "丙",
		戌: "丙",
		// 申子辰（水局） → 月德天干是壬
		申: "壬",
		子: "壬",
		辰: "壬",
		// 亥卯未（木局） → 月德天干是甲
		亥: "甲",
		卯: "甲",
		未: "甲",
		// 巳酉丑（金局） → 月德天干是庚
		巳: "庚",
		酉: "庚",
		丑: "庚",
	};

	const requiredStem = yuedeMap[monthBranch] || "";

	if (!requiredStem) {
		return { hasIt: false, positions: [], requiredStem: "" };
	}

	const positions = getStemPositions(stems, requiredStem);

	return {
		hasIt: positions.length > 0,
		positions,
		requiredStem,
	};
}

/**
 * 天德合计算 - 天德合是与天德贵人相合的天干
 * 天德合可以出现在年月日时干任何位置
 */
function getTianDeHe(yearStem: string, stems: string[]): string[] {
	// 先确定天德贵人是什么
	const tiandeMap: { [key: string]: string } = {
		// 甲己年，天德贵人是丙
		甲: "丙",
		己: "丙",
		// 乙庚年，天德贵人是丁
		乙: "丁",
		庚: "丁",
		// 丙辛年，天德贵人是戊
		丙: "戊",
		辛: "戊",
		// 丁壬年，天德贵人是己
		丁: "己",
		壬: "己",
		// 戊癸年，天德贵人是甲
		戊: "甲",
		癸: "甲",
	};

	// 天干相合规律：甲己合、乙庚合、丙辛合、丁壬合、戊癸合
	const heMap: { [key: string]: string } = {
		甲: "己",
		己: "甲",
		乙: "庚",
		庚: "乙",
		丙: "辛",
		辛: "丙",
		丁: "壬",
		壬: "丁",
		戊: "癸",
		癸: "戊",
	};

	const tiandeStem = tiandeMap[yearStem];
	if (!tiandeStem) {
		return [];
	}

	// 天德合是与天德贵人相合的天干
	const tiandeHeStem = heMap[tiandeStem];
	if (!tiandeHeStem) {
		return [];
	}

	return getStemPositions(stems, tiandeHeStem);
}

/**
 * 太极贵人计算
 * 甲乙见子午，丙丁见卯酉，戊己见辰戌，庚辛见丑未，壬癸见寅申
 * 【准确算法】按日干查四柱地支，大运流年同样适用
 */
function getTaiJiGuiRen(stem: string): string[] {
	const taijiMap: { [key: string]: string[] } = {
		甲: ["子", "午"],
		乙: ["子", "午"],
		丙: ["卯", "酉"],
		丁: ["卯", "酉"],
		戊: ["辰", "戌"],
		己: ["辰", "戌"],
		庚: ["丑", "未"],
		辛: ["丑", "未"],
		壬: ["寅", "申"],
		癸: ["寅", "申"],
	};

	return taijiMap[stem] || [];
}

/**
 * 三奇贵人计算
 * 天上三奇甲戊庚，地下三奇乙丙丁，人中三奇壬癸辛
 * 【准确算法】需要在天干中同时出现所有三个字才算，包括大运流年
 */
function getSanQiGuiRen(stems: string[]): { hasIt: boolean; type: string; positions: string[] } {
	const tianShang = ["甲", "戊", "庚"]; // 天上三奇
	const diXia = ["乙", "丙", "丁"]; // 地下三奇
	const renZhong = ["壬", "癸", "辛"]; // 人中三奇

	const positions: string[] = [];
	const columnNames = ["年干", "月干", "日干", "时干", "大运干", "流年干"];
	let type = "";

	// 检查天上三奇
	if (tianShang.every((stem) => stems.includes(stem))) {
		type = "天上三奇";
		tianShang.forEach((targetStem) => {
			stems.forEach((stem, index) => {
				if (stem === targetStem && index < columnNames.length) {
					positions.push(`${columnNames[index]}(${targetStem})`);
				}
			});
		});
	}
	// 检查地下三奇
	else if (diXia.every((stem) => stems.includes(stem))) {
		type = "地下三奇";
		diXia.forEach((targetStem) => {
			stems.forEach((stem, index) => {
				if (stem === targetStem && index < columnNames.length) {
					positions.push(`${columnNames[index]}(${targetStem})`);
				}
			});
		});
	}
	// 检查人中三奇
	else if (renZhong.every((stem) => stems.includes(stem))) {
		type = "人中三奇";
		renZhong.forEach((targetStem) => {
			stems.forEach((stem, index) => {
				if (stem === targetStem && index < columnNames.length) {
					positions.push(`${columnNames[index]}(${targetStem})`);
				}
			});
		});
	}

	return {
		hasIt: type !== "",
		type,
		positions,
	};
}

/**
 * 文昌贵人计算
 * 【准确算法】甲见巳、乙见午、丙见申、丁见酉、戊见申、己见酉、庚见亥、辛见子、壬见寅、癸见卯
 * 按日干查四柱地支，大运流年同样适用
 */
function getWenChangGuiRen(dayStem: string): string[] {
	const wenchangMap: { [key: string]: string[] } = {
		甲: ["巳"],
		乙: ["午"],
		丙: ["申"],
		丁: ["酉"],
		戊: ["申"],
		己: ["酉"],
		庚: ["亥"],
		辛: ["子"],
		壬: ["寅"],
		癸: ["卯"],
	};

	return wenchangMap[dayStem] || [];
}

/**
 * 国印贵人计算
 * 【准确算法】甲见戌、乙见亥、丙见丑、丁见寅、戊见丑、己见寅、庚见辰、辛见巳、壬见未、癸见申
 * 按年干或日干查四柱地支，大运流年同样适用
 */
function getGuoYinGuiRen(stem: string): string[] {
	const guoyinMap: { [key: string]: string[] } = {
		甲: ["戌"],
		乙: ["亥"],
		丙: ["丑"],
		丁: ["寅"],
		戊: ["丑"],
		己: ["寅"],
		庚: ["辰"],
		辛: ["巳"],
		壬: ["未"],
		癸: ["申"],
	};

	return guoyinMap[stem] || [];
}

/**
 * 将星计算
 * 【准确算法】申子辰见子、亥卯未见卯、寅午戌见午、巳酉丑见酉
 * 三合局的中神即为将星，按年支查，大运流年地支同样适用
 */
function getJiangXing(yearBranch: string): string {
	const jiangxingMap: { [key: string]: string } = {
		申: "子",
		子: "子",
		辰: "子", // 申子辰水局见子
		亥: "卯",
		卯: "卯",
		未: "卯", // 亥卯未木局见卯
		寅: "午",
		午: "午",
		戌: "午", // 寅午戌火局见午
		巳: "酉",
		酉: "酉",
		丑: "酉", // 巳酉丑金局见酉
	};

	return jiangxingMap[yearBranch] || "";
}

/**
 * 华盖计算
 * 【准确算法】申子辰见辰、亥卯未见未、寅午戌见戌、巳酉丑见丑
 * 三合局的库神即为华盖，按年支查，大运流年地支同样适用
 */
function getHuaGai(yearBranch: string): string {
	const huagaiMap: { [key: string]: string } = {
		申: "辰",
		子: "辰",
		辰: "辰", // 申子辰水局库在辰
		亥: "未",
		卯: "未",
		未: "未", // 亥卯未木局库在未
		寅: "戌",
		午: "戌",
		戌: "戌", // 寅午戌火局库在戌
		巳: "丑",
		酉: "丑",
		丑: "丑", // 巳酉丑金局库在丑
	};

	return huagaiMap[yearBranch] || "";
}

/**
 * 金舆计算
 * 【准确算法】甲龙乙蛇丙戊羊，丁己猴歌庚犬方，辛猪壬牛癸逢虎，凡人遇此福满堂
 * 甲见辰、乙见巳、丙见未、丁见申、戊见未、己见申、庚见戌、辛见亥、壬见丑、癸见寅
 * 按日干查四柱地支，大运流年同样适用
 */
function getJinYu(stem: string): string[] {
	const jinyuMap: { [key: string]: string[] } = {
		甲: ["辰"],
		乙: ["巳"],
		丙: ["未"],
		丁: ["申"],
		戊: ["未"],
		己: ["申"],
		庚: ["戌"],
		辛: ["亥"],
		壬: ["丑"],
		癸: ["寅"],
	};

	return jinyuMap[stem] || [];
}

/**
 * 驿马计算
 * 【准确算法】申子辰马在寅、亥卯未马在巳、寅午戌马在申、巳酉丑马在亥
 * 按年支三合局查，大运流年地支同样适用
 */
function getYiMa(yearBranch: string): string {
	const yimaMap: { [key: string]: string } = {
		申: "寅",
		子: "寅",
		辰: "寅", // 申子辰水局驿马在寅
		亥: "巳",
		卯: "巳",
		未: "巳", // 亥卯未木局驿马在巳
		寅: "申",
		午: "申",
		戌: "申", // 寅午戌火局驿马在申
		巳: "亥",
		酉: "亥",
		丑: "亥", // 巳酉丑金局驿马在亥
	};

	return yimaMap[yearBranch] || "";
}

/**
 * 禄神计算（食禄）
 * 【准确算法】甲禄在寅、乙禄在卯、丙戊禄在巳、丁己禄在午、庚禄在申、辛禄在酉、壬禄在亥、癸禄在子
 * 按天干查对应地支，大运流年同样适用
 */
function getLuShen(stem: string): string[] {
	const lushenMap: { [key: string]: string[] } = {
		甲: ["寅"],
		乙: ["卯"],
		丙: ["巳"],
		丁: ["午"],
		戊: ["巳"],
		己: ["午"],
		庚: ["申"],
		辛: ["酉"],
		壬: ["亥"],
		癸: ["子"],
	};

	return lushenMap[stem] || [];
}

/**
 * 羊刃计算
 * 【准确算法】甲刃在卯、乙刃在寅、丙戊刃在午、丁己刃在巳、庚刃在酉、辛刃在申、壬刃在子、癸刃在亥
 * 按日干查地支，大运流年同样适用，是极凶之煞
 */
function getYangRen(dayStem: string): string[] {
	const yangrenMap: { [key: string]: string[] } = {
		甲: ["卯"],
		乙: ["寅"],
		丙: ["午"],
		丁: ["巳"],
		戊: ["午"],
		己: ["巳"],
		庚: ["酉"],
		辛: ["申"],
		壬: ["子"],
		癸: ["亥"],
	};

	return yangrenMap[dayStem] || [];
}

function getSixtyCycleIndex(stem: string, branch: string): number {
	for (let index = 0; index < 60; index++) {
		if (HEAVENLY_STEMS[index % 10] === stem && _EARTHLY_BRANCHES[index % 12] === branch) {
			return index;
		}
	}
	return -1;
}

/**
 * 空亡计算
 * 【准确算法】甲子旬空戌亥、甲戌旬空申酉、甲申旬空午未、甲午旬空辰巳、甲辰旬空寅卯、甲寅旬空子丑
 * 按日柱干支查空亡的地支，大运流年地支同样适用
 */
function getKongWang(dayStem: string, dayBranch: string): string[] {
	// 六甲旬对应的空亡地支
	const xunMap: { [key: string]: string[] } = {
		// 甲子旬：甲子、乙丑、丙寅、丁卯、戊辰、己巳、庚午、辛未、壬申、癸酉，空戌亥
		甲子旬: ["戌", "亥"],
		// 甲戌旬：甲戌、乙亥、丙子、丁丑、戊寅、己卯、庚辰、辛巳、壬午、癸未，空申酉
		甲戌旬: ["申", "酉"],
		// 甲申旬：甲申、乙酉、丙戌、丁亥、戊子、己丑、庚寅、辛卯、壬辰、癸巳，空午未
		甲申旬: ["午", "未"],
		// 甲午旬：甲午、乙未、丙申、丁酉、戊戌、己亥、庚子、辛丑、壬寅、癸卯，空辰巳
		甲午旬: ["辰", "巳"],
		// 甲辰旬：甲辰、乙巳、丙午、丁未、戊申、己酉、庚戌、辛亥、壬子、癸丑，空寅卯
		甲辰旬: ["寅", "卯"],
		// 甲寅旬：甲寅、乙卯、丙辰、丁巳、戊午、己未、庚申、辛酉、壬戌、癸亥，空子丑
		甲寅旬: ["子", "丑"],
	};

	const cycleIndex = getSixtyCycleIndex(dayStem, dayBranch);
	if (cycleIndex === -1) return [];
	const xunHeadIndex = Math.floor(cycleIndex / 10) * 10;
	const xunHeadMap: Record<number, keyof typeof xunMap> = {
		0: "甲子旬",
		10: "甲戌旬",
		20: "甲申旬",
		30: "甲午旬",
		40: "甲辰旬",
		50: "甲寅旬",
	};
	const xunHead = xunHeadMap[xunHeadIndex];
	return xunHead ? xunMap[xunHead] || [] : [];
}

/**
 * 亡神计算
 * 【准确算法】申子辰亡在巳、亥卯未亡在申、寅午戌亡在亥、巳酉丑亡在寅
 * 按年支三合局查，大运流年同样适用
 */
function getWangShen(yearBranch: string): string {
	const wangshenMap: { [key: string]: string } = {
		申: "巳",
		子: "巳",
		辰: "巳", // 申子辰水局亡神在巳
		亥: "申",
		卯: "申",
		未: "申", // 亥卯未木局亡神在申
		寅: "亥",
		午: "亥",
		戌: "亥", // 寅午戌火局亡神在亥
		巳: "寅",
		酉: "寅",
		丑: "寅", // 巳酉丑金局亡神在寅
	};

	return wangshenMap[yearBranch] || "";
}

/**
 * 劫煞计算
 * 【准确算法】申子辰劫在巳、亥卯未劫在申、寅午戌劫在亥、巳酉丑劫在寅
 * 与亡神计算相同，按年支三合局查，大运流年同样适用
 */
function getJieSha(yearBranch: string): string {
	// 劫煞与亡神计算相同
	return getWangShen(yearBranch);
}

/**
 * 灾煞计算
 * 【准确算法】申子辰灾在午、亥卯未灾在酉、寅午戌灾在子、巳酉丑灾在卯
 * 按年支三合局查，大运流年同样适用
 */
function getZaiSha(yearBranch: string): string {
	const zaishaMap: { [key: string]: string } = {
		申: "午",
		子: "午",
		辰: "午", // 申子辰水局灾煞在午
		亥: "酉",
		卯: "酉",
		未: "酉", // 亥卯未木局灾煞在酉
		寅: "子",
		午: "子",
		戌: "子", // 寅午戌火局灾煞在子
		巳: "卯",
		酉: "卯",
		丑: "卯", // 巳酉丑金局灾煞在卯
	};

	return zaishaMap[yearBranch] || "";
}

/**
 * 孤辰寡宿计算
 * 【准确算法】亥子丑人见寅为孤辰见戌为寡宿、寅卯辰人见巳为孤辰见丑为寡宿
 * 按年支查，大运流年同样适用，主孤独少合
 */
function getGuChenGuaSu(yearBranch: string): { guChen: string; guaSu: string } {
	const guChenGuaSuMap: { [key: string]: { guChen: string; guaSu: string } } = {
		亥: { guChen: "寅", guaSu: "戌" },
		子: { guChen: "寅", guaSu: "戌" },
		丑: { guChen: "寅", guaSu: "戌" },
		寅: { guChen: "巳", guaSu: "丑" },
		卯: { guChen: "巳", guaSu: "丑" },
		辰: { guChen: "巳", guaSu: "丑" },
		巳: { guChen: "申", guaSu: "辰" },
		午: { guChen: "申", guaSu: "辰" },
		未: { guChen: "申", guaSu: "辰" },
		申: { guChen: "亥", guaSu: "未" },
		酉: { guChen: "亥", guaSu: "未" },
		戌: { guChen: "亥", guaSu: "未" },
	};

	return guChenGuaSuMap[yearBranch] || { guChen: "", guaSu: "" };
}

/**
 * 元辰计算
 * 【准确算法】阳男阴女顺推，阴男阳女逆推
 * 男命：子年生人见丑、丑年生人见寅...（顺推）
 * 女命：子年生人见亥、亥年生人见戌...（逆推）
 * 大运流年同样适用，主暗昧不明、小人是非
 */
function isYuanChenForward(yearStem: string, gender: "male" | "female"): boolean {
	const isYangYear = YANG_STEMS.has(yearStem);
	return (gender === "male" && isYangYear) || (gender === "female" && !isYangYear);
}

function getYuanChen(yearStem: string, yearBranch: string, gender: "male" | "female"): string {
	const branchIndex = _EARTHLY_BRANCHES.indexOf(yearBranch);

	if (branchIndex === -1) return "";

	let yuanChenIndex: number;
	if (isYuanChenForward(yearStem, gender)) {
		yuanChenIndex = (branchIndex + 1) % 12;
	} else {
		yuanChenIndex = (branchIndex - 1 + 12) % 12;
	}

	return _EARTHLY_BRANCHES[yuanChenIndex] ?? "";
}

/**
 * 天罗地网计算
 * 【准确算法】戌亥为天罗（火土命人忌），辰巳为地网（水金命人忌）
 * 需要结合命主五行和地支判断，大运流年同样适用
 */
function getTianLuoWang(
	triggerBranch: string,
	nayin: string,
): { tianLuo: boolean; diWang: boolean } {
	// 简化处理：按年支纳音五行判断
	const isFireEarth = nayin.includes("火") || nayin.includes("土");
	const isWaterMetal = nayin.includes("水") || nayin.includes("金");

	const tianLuoBranches = ["戌", "亥"]; // 天罗
	const diWangBranches = ["辰", "巳"]; // 地网

	return {
		tianLuo: isFireEarth && tianLuoBranches.includes(triggerBranch),
		diWang: isWaterMetal && diWangBranches.includes(triggerBranch),
	};
}

/**
 * 白虎煞计算
 * 【准确算法】申见酉、酉见戌、戌见亥、亥见子、子见丑、丑见寅、寅见卯、卯见辰、辰见巳、巳见午、午见未、未见申
 * 年支查下一位地支，大运流年同样适用，主血光之灾
 */
function getBaiHu(yearBranch: string): string {
	const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
	const branchIndex = branches.indexOf(yearBranch);

	if (branchIndex === -1) return "";

	const baiHuIndex = (branchIndex + 1) % 12;
	return branches[baiHuIndex] ?? "";
}

/**
 * 十恶大败计算
 * 【准确算法】甲辰、乙巳、丙申、丁亥、戊戌、己丑、庚辰、辛巳、壬申、癸亥（十日）
 * 检查日柱干支组合是否为十恶大败日，大运流年干支同样适用
 */
function getShiEDaBai(stem: string, branch: string): boolean {
	const shiEDaBaiList = [
		"甲辰",
		"乙巳",
		"丙申",
		"丁亥",
		"戊戌",
		"己丑",
		"庚辰",
		"辛巳",
		"壬申",
		"癸亥",
	];

	const ganZhi = stem + branch;
	return shiEDaBaiList.includes(ganZhi);
}

/**
 * 魁罡计算
 * 【准确算法】庚辰、壬辰、戊戌、庚戌四日
 * 检查日柱干支是否为魁罡，大运流年不看，主性格刚烈、有领导能力但易孤独
 */
function getKuiGang(dayStem: string, dayBranch: string): { hasIt: boolean; type: string } {
	const kuiGangMap: { [key: string]: string } = {
		庚辰: "绝妻罡",
		壬辰: "绝妻罡",
		戊戌: "绝夫罡",
		庚戌: "绝夫罡",
	};

	const dayGanZhi = dayStem + dayBranch;
	const kuiGangType = kuiGangMap[dayGanZhi];

	return {
		hasIt: !!kuiGangType,
		type: kuiGangType || "",
	};
}

/**
 * 学堂词馆计算
 * 【准确算法】长生学堂+冠带词馆
 * 学堂：甲见亥、乙见午、丙见寅、丁见酉、戊见寅、己见酉、庚见巳、辛见子、壬见申、癸见卯
 * 词馆：甲见庚、乙见辛、丙见壬、丁见癸、戊见甲、己见乙、庚见丙、辛见丁、壬见戊、癸见己
 */
function getXueTangCiGuan(stem: string): { xueTang: string[]; ciGuan: string[] } {
	const xueTangMap: { [key: string]: string[] } = {
		甲: ["亥"],
		乙: ["午"],
		丙: ["寅"],
		丁: ["酉"],
		戊: ["寅"],
		己: ["酉"],
		庚: ["巳"],
		辛: ["子"],
		壬: ["申"],
		癸: ["卯"],
	};

	const ciGuanMap: { [key: string]: string[] } = {
		甲: ["庚"],
		乙: ["辛"],
		丙: ["壬"],
		丁: ["癸"],
		戊: ["甲"],
		己: ["乙"],
		庚: ["丙"],
		辛: ["丁"],
		壬: ["戊"],
		癸: ["己"],
	};

	return {
		xueTang: xueTangMap[stem] || [],
		ciGuan: ciGuanMap[stem] || [],
	};
}

/**
 * 月德合计算
 * 【准确算法】与月德贵人天干相合的天干
 * 月德合是月德贵人的合化之神，增强福德力量
 */
function getYueDeHe(
	monthBranch: string,
	stems: string[],
): { hasIt: boolean; positions: string[]; requiredStem: string } {
	// 先确定月德贵人天干
	const yuedeMap: { [key: string]: string } = {
		寅: "丙",
		午: "丙",
		戌: "丙", // 火局月德是丙
		申: "壬",
		子: "壬",
		辰: "壬", // 水局月德是壬
		亥: "甲",
		卯: "甲",
		未: "甲", // 木局月德是甲
		巳: "庚",
		酉: "庚",
		丑: "庚", // 金局月德是庚
	};

	// 天干相合：甲己合、乙庚合、丙辛合、丁壬合、戊癸合
	const heMap: { [key: string]: string } = {
		甲: "己",
		己: "甲",
		乙: "庚",
		庚: "乙",
		丙: "辛",
		辛: "丙",
		丁: "壬",
		壬: "丁",
		戊: "癸",
		癸: "戊",
	};

	const yuedeStem = yuedeMap[monthBranch];
	if (!yuedeStem) {
		return { hasIt: false, positions: [], requiredStem: "" };
	}

	const yuedeHeStem = heMap[yuedeStem];
	if (!yuedeHeStem) {
		return { hasIt: false, positions: [], requiredStem: "" };
	}

	const positions = getStemPositions(stems, yuedeHeStem);

	return {
		hasIt: positions.length > 0,
		positions,
		requiredStem: yuedeHeStem,
	};
}

export interface BaziShenShaResult {
	// 桃花星
	hongLuan: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	tianXi: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	muYu: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	xianChi: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	hongYan: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 贵人星（原有）
	tianYiGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	tianDeGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	tianDeHe: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	yueDeGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
		requiredStem: string;
	};

	// 贵人星（新增）
	taiJiGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	sanQiGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
		type: string;
	};
	wenChangGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	guoYinGuiRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	yueDeHe: {
		hasIt: boolean;
		positions: string[];
		description: string;
		requiredStem: string;
	};

	// 权势星
	jiangXing: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	huaGai: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	jinYu: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	xueTang: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	ciGuan: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 出行变动星
	yiMa: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 财禄星
	luShen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 凶煞（刃煞类）
	yangRen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 凶煞（空亡劫害类）
	kongWang: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	wangShen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	jieSha: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	zaiSha: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 凶煞（孤独类）
	guChen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	guaSu: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	yuanChen: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};

	// 凶煞（特殊类）
	tianLuoDiWang: {
		hasIt: boolean;
		positions: string[];
		description: string;
		tianLuo: boolean;
		diWang: boolean;
		tianLuoPositions: string[];
		diWangPositions: string[];
	};
	baiHu: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	shiEDaBai: {
		hasIt: boolean;
		positions: string[];
		description: string;
	};
	kuiGang: {
		hasIt: boolean;
		positions: string[];
		description: string;
		type: string;
	};
}

type NayinPillarKey = "year" | "month" | "day" | "hour" | "luck" | "annual";
type NayinByPillar = Partial<Record<NayinPillarKey, string>>;
type BirthInfo = { gender?: "male" | "female"; nayin?: string; nayinByPillar?: NayinByPillar };
type BaziCoreTuple = [string, string, string, string, string, string, string, string];

interface BaziShenShaContext {
	yearStem: string;
	yearBranch: string;
	monthStem: string;
	monthBranch: string;
	dayStem: string;
	dayBranch: string;
	hourStem: string;
	hourBranch: string;
	luckStem: string;
	luckBranch: string;
	yearStem2: string;
	yearBranch2: string;
	hasAccurateTime: boolean;
	hasLuckCycle: boolean;
	hasAnnual: boolean;
	stems: string[];
	branches: string[];
	extendedStems: string[];
	extendedBranches: string[];
}

function appendCycleValues(
	base: string[],
	luckValue: string,
	annualValue: string,
	hasLuckCycle: boolean,
	hasAnnual: boolean,
): string[] {
	const values = [...base];
	if (hasLuckCycle) values.push(luckValue);
	if (hasAnnual) values.push(annualValue);
	return values;
}

function createBaziShenShaContext(bazi: string[], hasAccurateTime: boolean): BaziShenShaContext {
	if (bazi.length < 8) {
		throw new Error("八字数据不完整，至少需要8个字符");
	}
	const [yearStem, yearBranch, monthStem, monthBranch, dayStem, dayBranch, hourStem, hourBranch] =
		bazi as BaziCoreTuple;
	const hasLuckCycle = bazi.length >= 10;
	const hasAnnual = bazi.length >= 12;
	const luckStem = bazi[8] ?? "";
	const luckBranch = bazi[9] ?? "";
	const yearStem2 = bazi[10] ?? "";
	const yearBranch2 = bazi[11] ?? "";
	const stems = hasAccurateTime
		? [yearStem, monthStem, dayStem, hourStem]
		: [yearStem, monthStem, dayStem];
	const branches = hasAccurateTime
		? [yearBranch, monthBranch, dayBranch, hourBranch]
		: [yearBranch, monthBranch, dayBranch];
	return {
		yearStem,
		yearBranch,
		monthStem,
		monthBranch,
		dayStem,
		dayBranch,
		hourStem,
		hourBranch,
		luckStem,
		luckBranch,
		yearStem2,
		yearBranch2,
		hasAccurateTime,
		hasLuckCycle,
		hasAnnual,
		stems,
		branches,
		extendedStems: appendCycleValues(stems, luckStem, yearStem2, hasLuckCycle, hasAnnual),
		extendedBranches: appendCycleValues(branches, luckBranch, yearBranch2, hasLuckCycle, hasAnnual),
	};
}

function presentTargets(targets: string[]): string[] {
	return targets.filter((target) => target.length > 0);
}

function matchingValues(values: string[], targets: string[]): string[] {
	const targetSet = new Set(presentTargets(targets));
	return values.filter((value) => targetSet.has(value));
}

function shenShaEntry(values: string[], targets: string[], description: string) {
	const positions = matchingValues(values, targets);
	return {
		hasIt: positions.length > 0,
		positions,
		description,
	};
}

function branchEntry(context: BaziShenShaContext, targets: string[], description: string) {
	return shenShaEntry(context.extendedBranches, targets, description);
}

function singleBranchEntry(context: BaziShenShaContext, target: string, description: string) {
	const hasIt = target !== "" && context.extendedBranches.includes(target);
	return {
		hasIt,
		positions: positionsWhen(hasIt, target),
		description,
	};
}

function stemEntry(context: BaziShenShaContext, targets: string[], description: string) {
	return shenShaEntry(context.extendedStems, targets, description);
}

function positionsWhen(hasIt: boolean, position: string): string[] {
	return hasIt ? [position] : [];
}

function collectBranchDisplayRefs(
	context: BaziShenShaContext,
): Array<{ label: string; branch: string }> {
	return [
		{ label: SHENSHA_PILLAR_LABELS.year, branch: context.yearBranch },
		{ label: SHENSHA_PILLAR_LABELS.month, branch: context.monthBranch },
		{ label: SHENSHA_PILLAR_LABELS.day, branch: context.dayBranch },
		...(context.hasAccurateTime
			? [{ label: SHENSHA_PILLAR_LABELS.hour, branch: context.hourBranch }]
			: []),
		...(context.hasLuckCycle
			? [{ label: SHENSHA_PILLAR_LABELS.luck, branch: context.luckBranch }]
			: []),
		...(context.hasAnnual
			? [{ label: SHENSHA_PILLAR_LABELS.annual, branch: context.yearBranch2 }]
			: []),
	].filter((ref) => Boolean(ref.branch));
}

function collectShiEDaBaiDisplayRefs(
	context: BaziShenShaContext,
): Array<{ label: string; stem: string; branch: string }> {
	return [
		{ label: SHENSHA_PILLAR_LABELS.day, stem: context.dayStem, branch: context.dayBranch },
		...(context.hasLuckCycle
			? [{ label: SHENSHA_PILLAR_LABELS.luck, stem: context.luckStem, branch: context.luckBranch }]
			: []),
		...(context.hasAnnual
			? [
					{
						label: SHENSHA_PILLAR_LABELS.annual,
						stem: context.yearStem2,
						branch: context.yearBranch2,
					},
				]
			: []),
	].filter((ref) => Boolean(ref.stem && ref.branch));
}

function getTianDeStatus(context: BaziShenShaContext): {
	hasIt: boolean;
	positions: string[];
} {
	const positions: string[] = [];
	if (getTianDeGuiRen(context.yearStem, context.monthStem)) {
		positions.push("月干");
	}
	if (context.luckStem && getTianDeGuiRen(context.yearStem, context.luckStem)) {
		positions.push("大运天干");
	}
	return {
		hasIt: positions.length > 0,
		positions,
	};
}

function getYearNayin(birthInfo?: BirthInfo): string {
	return birthInfo?.nayinByPillar?.year ?? birthInfo?.nayin ?? "";
}

function getTianLuoDiWangStatus(context: BaziShenShaContext, birthInfo?: BirthInfo) {
	const yearNayin = getYearNayin(birthInfo);
	if (!yearNayin) {
		return {
			tianLuo: false,
			diWang: false,
			positions: [],
			tianLuoPositions: [],
			diWangPositions: [],
		};
	}
	const tianLuoPositions: string[] = [];
	const diWangPositions: string[] = [];
	collectBranchDisplayRefs(context).forEach((ref) => {
		const status = getTianLuoWang(ref.branch, yearNayin);
		if (status.tianLuo) tianLuoPositions.push(`${ref.label}(天罗)`);
		if (status.diWang) diWangPositions.push(`${ref.label}(地网)`);
	});
	return {
		tianLuo: tianLuoPositions.length > 0,
		diWang: diWangPositions.length > 0,
		positions: [...tianLuoPositions, ...diWangPositions],
		tianLuoPositions,
		diWangPositions,
	};
}

function getTianLuoDiWangDescription(status: { tianLuo: boolean; diWang: boolean }): string {
	if (status.tianLuo) return "天罗主困顿不通，火土命人最忌";
	if (status.diWang) return "地网主阻滞不利，水金命人最忌";
	return "";
}

function getYuanChenTarget(context: BaziShenShaContext, birthInfo?: BirthInfo): string {
	if (!birthInfo?.gender) return "";
	return getYuanChen(context.yearStem, context.yearBranch, birthInfo.gender);
}

function getShiEDaBaiPositions(context: BaziShenShaContext): string[] {
	return collectShiEDaBaiDisplayRefs(context)
		.filter((ref) => getShiEDaBai(ref.stem, ref.branch))
		.map((ref) => ref.label);
}

function buildBaziShenShaResult(
	context: BaziShenShaContext,
	birthInfo?: BirthInfo,
): BaziShenShaResult {
	const sanQiResult = getSanQiGuiRen(context.extendedStems);
	const xueTangCiGuanResult = getXueTangCiGuan(context.dayStem);
	const guChenGuaSuResult = getGuChenGuaSu(context.yearBranch);
	const tianDeStatus = getTianDeStatus(context);
	const tianDeHePositions = getTianDeHe(context.yearStem, context.extendedStems);
	const yueDeResult = getYueDeGuiRen(context.monthBranch, context.extendedStems);
	const yueDeHeResult = getYueDeHe(context.monthBranch, context.extendedStems);
	const tianLuoDiWangResult = getTianLuoDiWangStatus(context, birthInfo);
	const kuiGangResult = getKuiGang(context.dayStem, context.dayBranch);
	const shiEDaBaiPositions = getShiEDaBaiPositions(context);
	return {
		hongLuan: branchEntry(context, [getHongLuan(context.yearBranch)], "红鸾主婚姻喜庆，感情运佳"),
		tianXi: branchEntry(context, [getTianXi(context.yearBranch)], "天喜主喜庆事件，人缘良好"),
		muYu: branchEntry(context, getMuYu(context.dayStem), "沐浴主聪明俊美，但易有桃花纠纷"),
		xianChi: singleBranchEntry(context, getXianChi(context.yearBranch), "咸池主桃花运旺，异性缘佳"),
		hongYan: branchEntry(context, getHongYan(context.dayStem), "红艳主异性缘强，容易有感情纠葛"),
		tianYiGuiRen: branchEntry(
			context,
			getTianYiGuiRen(context.dayStem),
			"天乙贵人主逢凶化吉，有贵人相助",
		),
		tianDeGuiRen: {
			...tianDeStatus,
			description: "天德贵人主德行高尚，福德深厚，逢凶化吉",
		},
		tianDeHe: {
			hasIt: tianDeHePositions.length > 0,
			positions: tianDeHePositions,
			description: "天德合主与天德贵人相得益彰，增强福德力量",
		},
		yueDeGuiRen: {
			hasIt: yueDeResult.hasIt,
			positions: yueDeResult.positions,
			description: "月德贵人主福德深厚，月德所临之地皆为吉祥之所",
			requiredStem: yueDeResult.requiredStem,
		},
		taiJiGuiRen: branchEntry(
			context,
			getTaiJiGuiRen(context.dayStem),
			"太极贵人主聪明好学，善于钻研玄学，逢凶化吉",
		),
		sanQiGuiRen: {
			hasIt: sanQiResult.hasIt,
			positions: sanQiResult.positions,
			description: `${sanQiResult.type}主智慧超群，文武双全，能化险为夷`,
			type: sanQiResult.type,
		},
		wenChangGuiRen: branchEntry(
			context,
			getWenChangGuiRen(context.dayStem),
			"文昌贵人主聪明好学，文思敏捷，利于考试读书",
		),
		guoYinGuiRen: branchEntry(
			context,
			getGuoYinGuiRen(context.dayStem),
			"国印贵人主官运亨通，有权威地位，能得上级提拔",
		),
		yueDeHe: {
			hasIt: yueDeHeResult.hasIt,
			positions: yueDeHeResult.positions,
			description: "月德合主与月德贵人相合，福德力量倍增",
			requiredStem: yueDeHeResult.requiredStem,
		},
		jiangXing: singleBranchEntry(
			context,
			getJiangXing(context.yearBranch),
			"将星主有领导才能，能统率众人，适合军警政界",
		),
		huaGai: singleBranchEntry(
			context,
			getHuaGai(context.yearBranch),
			"华盖主聪明孤高，善于艺术宗教，但易孤独",
		),
		jinYu: branchEntry(context, getJinYu(context.dayStem), "金舆主富贵荣华，乘坐华车，生活优渥"),
		xueTang: branchEntry(
			context,
			xueTangCiGuanResult.xueTang,
			"学堂主好学深造，学业有成，智慧过人",
		),
		ciGuan: stemEntry(
			context,
			xueTangCiGuanResult.ciGuan,
			"词馆主文笔优美，才华横溢，适合文学创作",
		),
		yiMa: singleBranchEntry(
			context,
			getYiMa(context.yearBranch),
			"驿马主奔波走动，变化较多，利于外出发展",
		),
		luShen: branchEntry(
			context,
			getLuShen(context.dayStem),
			"禄神主衣食不愁，财源稳定，有一定社会地位",
		),
		yangRen: branchEntry(
			context,
			getYangRen(context.dayStem),
			"羊刃主性格刚烈，易有血光之灾，但也主勇敢果断",
		),
		kongWang: branchEntry(
			context,
			getKongWang(context.dayStem, context.dayBranch),
			"空亡主虚空不实，易有挫折，但也主超脱世俗",
		),
		wangShen: singleBranchEntry(
			context,
			getWangShen(context.yearBranch),
			"亡神主破败消耗，易有意外损失，需谨慎防范",
		),
		jieSha: singleBranchEntry(
			context,
			getJieSha(context.yearBranch),
			"劫煞主破财损物，易遇盗贼，需注意财物安全",
		),
		zaiSha: singleBranchEntry(
			context,
			getZaiSha(context.yearBranch),
			"灾煞主疾病灾祸，身体健康需多加注意",
		),
		guChen: singleBranchEntry(
			context,
			guChenGuaSuResult.guChen,
			"孤辰主孤独少合，男命不利婚姻，性格内向",
		),
		guaSu: singleBranchEntry(
			context,
			guChenGuaSuResult.guaSu,
			"寡宿主孤独少合，女命不利婚姻，易守寡",
		),
		yuanChen: singleBranchEntry(
			context,
			getYuanChenTarget(context, birthInfo),
			"元辰主暗昧不明，易有小人是非，运势不稳",
		),
		tianLuoDiWang: {
			hasIt: tianLuoDiWangResult.tianLuo || tianLuoDiWangResult.diWang,
			positions: tianLuoDiWangResult.positions,
			description: getTianLuoDiWangDescription(tianLuoDiWangResult),
			tianLuo: tianLuoDiWangResult.tianLuo,
			diWang: tianLuoDiWangResult.diWang,
			tianLuoPositions: tianLuoDiWangResult.tianLuoPositions,
			diWangPositions: tianLuoDiWangResult.diWangPositions,
		},
		baiHu: singleBranchEntry(
			context,
			getBaiHu(context.yearBranch),
			"白虎煞主血光之灾，易有外伤手术，需谨慎防范",
		),
		shiEDaBai: {
			hasIt: shiEDaBaiPositions.length > 0,
			positions: shiEDaBaiPositions,
			description: "十恶大败主运势极凶，诸事不利，但过后必有转机",
		},
		kuiGang: {
			hasIt: kuiGangResult.hasIt,
			positions: positionsWhen(kuiGangResult.hasIt, "日柱"),
			description: `魁罡主性格刚烈果断，有领导能力但易孤独，${kuiGangResult.type}`,
			type: kuiGangResult.type,
		},
	};
}

/**
 * 主函数：检查八字中的神煞（包含大运流年触发）
 * @param bazi 八字数组 [年干, 年支, 月干, 月支, 日干, 日支, 时干, 时支, ...大运天干, 大运地支, 流年天干, 流年地支]
 * @param hasAccurateTime 是否有准确时辰，false时排除时柱避免虚拟午时干扰
 * @param birthInfo 出生信息，包含性别和纳音等信息
 */
export function checkBaziShenSha(
	bazi: string[],
	hasAccurateTime: boolean = true,
	birthInfo?: BirthInfo,
): BaziShenShaResult {
	return buildBaziShenShaResult(createBaziShenShaContext(bazi, hasAccurateTime), birthInfo);
}

/**
 * 获取桃花星总结
 */
export function getPeachBlossomSummary(result: BaziShenShaResult): {
	count: number;
	types: string[];
	description: string;
} {
	const peachStars = [];
	let count = 0;

	if (result.hongLuan.hasIt) {
		peachStars.push("红鸾");
		count += result.hongLuan.positions.length;
	}
	if (result.tianXi.hasIt) {
		peachStars.push("天喜");
		count += result.tianXi.positions.length;
	}
	if (result.muYu.hasIt) {
		peachStars.push("沐浴");
		count += result.muYu.positions.length;
	}
	if (result.xianChi.hasIt) {
		peachStars.push("咸池");
		count += result.xianChi.positions.length;
	}
	if (result.hongYan.hasIt) {
		peachStars.push("红艳");
		count += result.hongYan.positions.length;
	}

	let description = "";
	if (count === 0) {
		description = "八字中桃花星较少，人际关系平稳，适合技术性或专业性较强的岗位";
	} else if (count <= 2) {
		description = "桃花运适中，具备良好的客户沟通能力，适合综合性岗位";
	} else if (count <= 4) {
		description = "桃花运旺盛，人缘极佳，非常适合销售、客服、商务拓展等前线岗位";
	} else {
		description = "桃花运极强，魅力十足，适合高端销售或公关岗位，需注意保持专业形象";
	}

	return {
		count,
		types: peachStars,
		description,
	};
}

/**
 * 获取贵人星总结
 */
export function getNoblemanSummary(result: BaziShenShaResult): {
	count: number;
	types: string[];
	description: string;
} {
	const nobleStars = [];
	let count = 0;

	if (result.tianYiGuiRen.hasIt) {
		nobleStars.push("天乙贵人");
		count += result.tianYiGuiRen.positions.length;
	}
	if (result.tianDeGuiRen.hasIt) {
		nobleStars.push("天德贵人");
		count += result.tianDeGuiRen.positions.length;
	}
	if (result.tianDeHe.hasIt) {
		nobleStars.push("天德合");
		count += result.tianDeHe.positions.length;
	}
	if (result.yueDeGuiRen.hasIt) {
		nobleStars.push("月德贵人");
		count += result.yueDeGuiRen.positions.length;
	}

	let description = "";
	if (count === 0) {
		description = "贵人运一般，需要更多自身努力";
	} else if (count <= 2) {
		description = "有贵人扶助，关键时刻能得到帮助";
	} else {
		description = "贵人运极佳，一生多得贵人相助";
	}

	return {
		count,
		types: nobleStars,
		description,
	};
}

type SimpleShenShaRule = {
	key: keyof BaziShenShaResult;
	label: string | ((result: BaziShenShaResult) => string);
};

const SIMPLE_SHENSHA_RULES = [
	{ key: "hongLuan", label: "红鸾" },
	{ key: "tianXi", label: "天喜" },
	{ key: "muYu", label: "沐浴" },
	{ key: "xianChi", label: "咸池" },
	{ key: "hongYan", label: "红艳" },
	{ key: "tianYiGuiRen", label: "天乙贵人" },
	{ key: "tianDeGuiRen", label: "天德贵人" },
	{ key: "tianDeHe", label: "天德合" },
	{ key: "yueDeGuiRen", label: "月德贵人" },
	{ key: "taiJiGuiRen", label: "太极贵人" },
	{ key: "sanQiGuiRen", label: (result) => `三奇贵人(${result.sanQiGuiRen.type})` },
	{ key: "wenChangGuiRen", label: "文昌贵人" },
	{ key: "guoYinGuiRen", label: "国印贵人" },
	{ key: "yueDeHe", label: "月德合" },
	{ key: "jiangXing", label: "将星" },
	{ key: "huaGai", label: "华盖" },
	{ key: "jinYu", label: "金舆" },
	{ key: "xueTang", label: "学堂" },
	{ key: "ciGuan", label: "词馆" },
	{ key: "yiMa", label: "驿马" },
	{ key: "luShen", label: "禄神" },
	{ key: "yangRen", label: "羊刃" },
	{ key: "kongWang", label: "空亡" },
	{ key: "wangShen", label: "亡神" },
	{ key: "jieSha", label: "劫煞" },
	{ key: "zaiSha", label: "灾煞" },
	{ key: "guChen", label: "孤辰" },
	{ key: "guaSu", label: "寡宿" },
	{ key: "yuanChen", label: "元辰" },
	{ key: "baiHu", label: "白虎煞" },
	{ key: "shiEDaBai", label: "十恶大败" },
	{ key: "kuiGang", label: (result) => `魁罡(${result.kuiGang.type})` },
] satisfies SimpleShenShaRule[];

function getSimpleRuleLabel(rule: SimpleShenShaRule, result: BaziShenShaResult): string {
	return typeof rule.label === "function" ? rule.label(result) : rule.label;
}

function getTianLuoDiWangSimpleLabels(result: BaziShenShaResult): string[] {
	if (!result.tianLuoDiWang.hasIt) return [];
	const labels: string[] = [];
	if (result.tianLuoDiWang.tianLuo) labels.push("天罗");
	if (result.tianLuoDiWang.diWang) labels.push("地网");
	return labels;
}

/**
 * 简化版神煞计算，用于显示在表格中
 * 返回主要的神煞名称数组，用于表格显示（包含所有新增神煞）
 */
export function getSimplifiedShenSha(
	bazi: string[],
	hasAccurateTime: boolean = true,
	birthInfo?: BirthInfo,
): string[] {
	const result = checkBaziShenSha(bazi, hasAccurateTime, birthInfo);
	const ruleLabels = SIMPLE_SHENSHA_RULES.filter((rule) => result[rule.key].hasIt).map((rule) =>
		getSimpleRuleLabel(rule, result),
	);
	return [...ruleLabels, ...getTianLuoDiWangSimpleLabels(result)];
}

type ShenShaColumnKey = "year" | "month" | "day" | "hour" | "luck" | "annual";
type ShenShaColumns = Record<ShenShaColumnKey, string[]>;

type ColumnRef = {
	key: ShenShaColumnKey;
	value: string;
};

type TargetShenShaRule = {
	name: string;
	hasIt: boolean;
	targets: string[];
};

const SHENSHA_POSITION_COLUMN_PREFIXES: Array<readonly [string, ShenShaColumnKey]> = [
	["流年", "annual"],
	["大运", "luck"],
	["年", "year"],
	["月", "month"],
	["日", "day"],
	["时", "hour"],
];

function getShenShaColumnKey(position: string): ShenShaColumnKey | null {
	return (
		SHENSHA_POSITION_COLUMN_PREFIXES.find(([prefix]) => position.startsWith(prefix))?.[1] ?? null
	);
}

function uniqueShenShaColumn(column: string[]): string[] {
	return Array.from(new Set(column));
}

function assignPositionShenShaToColumn(
	columns: ShenShaColumns,
	shenShaName: string,
	position: string,
): void {
	const columnKey = getShenShaColumnKey(position);
	if (!columnKey) return;
	columns[columnKey].push(shenShaName);
}

function createShenShaColumns(): ShenShaColumns {
	return { year: [], month: [], day: [], hour: [], luck: [], annual: [] };
}

function columnRef(key: ShenShaColumnKey, value: string, enabled = true): ColumnRef[] {
	return enabled && value ? [{ key, value }] : [];
}

function buildBranchColumnRefs(context: BaziShenShaContext): ColumnRef[] {
	return [
		...columnRef("year", context.yearBranch),
		...columnRef("month", context.monthBranch),
		...columnRef("day", context.dayBranch),
		...columnRef("hour", context.hourBranch, context.hasAccurateTime),
		...columnRef("luck", context.luckBranch, context.hasLuckCycle),
		...columnRef("annual", context.yearBranch2, context.hasAnnual),
	];
}

function buildStemColumnRefs(context: BaziShenShaContext): ColumnRef[] {
	return [
		...columnRef("year", context.yearStem),
		...columnRef("month", context.monthStem),
		...columnRef("day", context.dayStem),
		...columnRef("hour", context.hourStem, context.hasAccurateTime),
		...columnRef("luck", context.luckStem, context.hasLuckCycle),
		...columnRef("annual", context.yearStem2, context.hasAnnual),
	];
}

function assignTargetsToColumnRefs(
	columns: ShenShaColumns,
	refs: ColumnRef[],
	shenShaName: string,
	targets: string[],
	enabled = true,
): void {
	if (!enabled) return;
	const targetSet = new Set(presentTargets(targets));
	if (targetSet.size === 0) return;
	refs.forEach((ref) => {
		if (targetSet.has(ref.value)) columns[ref.key].push(shenShaName);
	});
}

function buildTargetShenShaRules(
	context: BaziShenShaContext,
	result: BaziShenShaResult,
): TargetShenShaRule[] {
	const guChenGuaSuResult = getGuChenGuaSu(context.yearBranch);
	const xueTangCiGuanResult = getXueTangCiGuan(context.dayStem);
	return [
		{ name: "红鸾", hasIt: result.hongLuan.hasIt, targets: [getHongLuan(context.yearBranch)] },
		{ name: "天喜", hasIt: result.tianXi.hasIt, targets: [getTianXi(context.yearBranch)] },
		{ name: "沐浴", hasIt: result.muYu.hasIt, targets: getMuYu(context.dayStem) },
		{ name: "咸池", hasIt: result.xianChi.hasIt, targets: [getXianChi(context.yearBranch)] },
		{ name: "红艳", hasIt: result.hongYan.hasIt, targets: getHongYan(context.dayStem) },
		{
			name: "天乙贵人",
			hasIt: result.tianYiGuiRen.hasIt,
			targets: getTianYiGuiRen(context.dayStem),
		},
		{ name: "太极贵人", hasIt: result.taiJiGuiRen.hasIt, targets: getTaiJiGuiRen(context.dayStem) },
		{
			name: "文昌贵人",
			hasIt: result.wenChangGuiRen.hasIt,
			targets: getWenChangGuiRen(context.dayStem),
		},
		{
			name: "国印贵人",
			hasIt: result.guoYinGuiRen.hasIt,
			targets: getGuoYinGuiRen(context.dayStem),
		},
		{ name: "将星", hasIt: result.jiangXing.hasIt, targets: [getJiangXing(context.yearBranch)] },
		{ name: "华盖", hasIt: result.huaGai.hasIt, targets: [getHuaGai(context.yearBranch)] },
		{ name: "金舆", hasIt: result.jinYu.hasIt, targets: getJinYu(context.dayStem) },
		{ name: "学堂", hasIt: result.xueTang.hasIt, targets: xueTangCiGuanResult.xueTang },
		{ name: "驿马", hasIt: result.yiMa.hasIt, targets: [getYiMa(context.yearBranch)] },
		{ name: "禄神", hasIt: result.luShen.hasIt, targets: getLuShen(context.dayStem) },
		{ name: "羊刃", hasIt: result.yangRen.hasIt, targets: getYangRen(context.dayStem) },
		{
			name: "空亡",
			hasIt: result.kongWang.hasIt,
			targets: getKongWang(context.dayStem, context.dayBranch),
		},
		{ name: "亡神", hasIt: result.wangShen.hasIt, targets: [getWangShen(context.yearBranch)] },
		{ name: "劫煞", hasIt: result.jieSha.hasIt, targets: [getJieSha(context.yearBranch)] },
		{ name: "灾煞", hasIt: result.zaiSha.hasIt, targets: [getZaiSha(context.yearBranch)] },
		{ name: "孤辰", hasIt: result.guChen.hasIt, targets: [guChenGuaSuResult.guChen] },
		{ name: "寡宿", hasIt: result.guaSu.hasIt, targets: [guChenGuaSuResult.guaSu] },
		{ name: "白虎煞", hasIt: result.baiHu.hasIt, targets: [getBaiHu(context.yearBranch)] },
	];
}

function applyTargetShenShaRules(
	columns: ShenShaColumns,
	refs: ColumnRef[],
	rules: TargetShenShaRule[],
): void {
	rules.forEach((rule) => {
		assignTargetsToColumnRefs(columns, refs, rule.name, rule.targets, rule.hasIt);
	});
}

function applyPositionResult(
	columns: ShenShaColumns,
	entry: { hasIt: boolean; positions: string[] },
	label: string,
): void {
	if (!entry.hasIt) return;
	entry.positions.filter(Boolean).forEach((position) => {
		assignPositionShenShaToColumn(columns, label, position);
	});
}

function applyPositionShenShaRules(columns: ShenShaColumns, result: BaziShenShaResult): void {
	applyPositionResult(columns, result.tianDeGuiRen, "天德贵人");
	applyPositionResult(columns, result.tianDeHe, "天德合");
	applyPositionResult(columns, result.yueDeGuiRen, "月德贵人");
	applyPositionResult(columns, result.yueDeHe, "月德合");
	applyPositionResult(columns, result.sanQiGuiRen, `三奇贵人(${result.sanQiGuiRen.type})`);
}

function applyShiEDaBaiColumns(columns: ShenShaColumns, result: BaziShenShaResult): void {
	applyPositionResult(columns, result.shiEDaBai, "十恶大败");
}

function applyKuiGangColumn(columns: ShenShaColumns, result: BaziShenShaResult): void {
	if (result.kuiGang.hasIt) columns.day.push(`魁罡(${result.kuiGang.type})`);
}

function applyTianLuoDiWangColumns(columns: ShenShaColumns, result: BaziShenShaResult): void {
	result.tianLuoDiWang.tianLuoPositions.forEach((position) => {
		assignPositionShenShaToColumn(columns, "天罗", position);
	});
	result.tianLuoDiWang.diWangPositions.forEach((position) => {
		assignPositionShenShaToColumn(columns, "地网", position);
	});
}

function applySpecialColumnRules(
	columns: ShenShaColumns,
	context: BaziShenShaContext,
	result: BaziShenShaResult,
	birthInfo: BirthInfo | undefined,
	branchRefs: ColumnRef[],
	stemRefs: ColumnRef[],
): void {
	assignTargetsToColumnRefs(
		columns,
		stemRefs,
		"词馆",
		getXueTangCiGuan(context.dayStem).ciGuan,
		result.ciGuan.hasIt,
	);
	applyKuiGangColumn(columns, result);
	applyShiEDaBaiColumns(columns, result);
	assignTargetsToColumnRefs(
		columns,
		branchRefs,
		"元辰",
		[getYuanChenTarget(context, birthInfo)],
		result.yuanChen.hasIt,
	);
	applyTianLuoDiWangColumns(columns, result);
}

function buildColumnOutput(columns: ShenShaColumns, context: BaziShenShaContext): string[][] {
	const output = (["year", "month", "day", "hour"] as const).map((key) =>
		uniqueShenShaColumn(columns[key]),
	);
	if (context.hasLuckCycle) output.push(uniqueShenShaColumn(columns.luck));
	if (context.hasAnnual) output.push(uniqueShenShaColumn(columns.annual));
	return output;
}

/**
 * 获取每个柱位的神煞（包含大运流年）
 * 返回一个数组，包含年、月、日、时、大运、流年各柱的神煞
 * 使用生产环境的准确算法，支持所有新增神煞
 */
export function getColumnShenSha(
	bazi: string[],
	hasAccurateTime: boolean = true,
	birthInfo?: BirthInfo,
): string[][] {
	const context = createBaziShenShaContext(bazi, hasAccurateTime);
	const result = buildBaziShenShaResult(context, birthInfo);
	const columns = createShenShaColumns();
	const branchRefs = buildBranchColumnRefs(context);
	const stemRefs = buildStemColumnRefs(context);
	applyTargetShenShaRules(columns, branchRefs, buildTargetShenShaRules(context, result));
	applyPositionShenShaRules(columns, result);
	applySpecialColumnRules(columns, context, result, birthInfo, branchRefs, stemRefs);
	return buildColumnOutput(columns, context);
}
