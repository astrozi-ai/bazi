import { describe, expect, it } from "bun:test";

import { checkBaziShenSha, getColumnShenSha, SHENSHA_SOURCE } from "./shensha";

function countColumnLabel(columns: string[][], columnIndex: number, label: string): number {
	return (columns[columnIndex] ?? []).filter((item) => item === label).length;
}

describe("Feature: column ShenSha placement", () => {
	it("Given SanQi is triggered by liunian stem When mapping columns Then it does not leak to the natal year column", () => {
		const columns = getColumnShenSha(
			["己", "子", "丙", "寅", "丁", "卯", "辛", "辰", "癸", "午", "乙", "未"],
			true,
			{ gender: "male" },
		);

		expect(countColumnLabel(columns, 0, "三奇贵人(地下三奇)")).toBe(0);
		expect(countColumnLabel(columns, 5, "三奇贵人(地下三奇)")).toBe(1);
	});

	it("Given natal and liunian share a SanQi label When mapping columns Then each column keeps unique labels", () => {
		const columns = getColumnShenSha(
			["乙", "子", "丙", "寅", "丁", "卯", "辛", "辰", "癸", "午", "乙", "未"],
			true,
			{ gender: "female" },
		);

		for (const column of columns) {
			expect(new Set(column).size).toBe(column.length);
		}
	});

	it("Given 庚辰 day with 申酉 luck and annual When mapping columns Then 空亡 lands on luck and annual columns", () => {
		const columns = getColumnShenSha(
			["戊", "寅", "戊", "午", "庚", "辰", "壬", "午", "甲", "申", "乙", "酉"],
			true,
			{ gender: "male" },
		);

		expect(columns[4]).toContain("空亡");
		expect(columns[5]).toContain("空亡");
	});

	it("Given male born in yin year When checking YuanChen Then direction follows year yin-yang instead of gender only", () => {
		const result = checkBaziShenSha(
			["乙", "子", "戊", "午", "庚", "辰", "壬", "午", "甲", "申", "丁", "亥"],
			true,
			{ gender: "male" },
		);

		expect(result.yuanChen.hasIt).toBe(true);
		expect(result.yuanChen.positions).toEqual(["亥"]);
	});

	it("Given fire-earth year nayin and only luck annual trigger branches When checking TianLuo Then positions stay scoped to trigger pillars", () => {
		const noNayinColumns = getColumnShenSha(
			["丙", "寅", "甲", "辰", "庚", "辰", "丁", "丑", "壬", "戌", "癸", "亥"],
			true,
			{ gender: "male" },
		);
		expect(noNayinColumns[4]).not.toContain("天罗");
		expect(noNayinColumns[5]).not.toContain("天罗");

		const result = checkBaziShenSha(
			["丙", "寅", "甲", "辰", "庚", "辰", "丁", "丑", "壬", "戌", "癸", "亥"],
			true,
			{ gender: "male", nayinByPillar: { year: "炉中火" } },
		);
		const columns = getColumnShenSha(
			["丙", "寅", "甲", "辰", "庚", "辰", "丁", "丑", "壬", "戌", "癸", "亥"],
			true,
			{ gender: "male", nayinByPillar: { year: "炉中火" } },
		);

		expect(result.tianLuoDiWang.hasIt).toBe(true);
		expect(result.tianLuoDiWang.positions).toEqual(["大运柱(天罗)", "流年柱(天罗)"]);
		expect(columns[0]).not.toContain("天罗");
		expect(columns[4]).toContain("天罗");
		expect(columns[5]).toContain("天罗");
	});

	it("Given ShiEDaBai day and annual When checking result Then positions expose the triggered pillars", () => {
		const result = checkBaziShenSha(
			["戊", "寅", "甲", "辰", "甲", "辰", "丁", "丑", "壬", "戌", "甲", "辰"],
			true,
			{ gender: "male" },
		);

		expect(result.shiEDaBai.hasIt).toBe(true);
		expect(result.shiEDaBai.positions).toEqual(["日柱", "流年柱"]);
	});
});

describe("Feature: 神煞 provenance and failure", () => {
	it("Given the 神煞 table When reading its source Then it is marked unresolved, not a default", () => {
		expect(SHENSHA_SOURCE.status).toBe("unresolved");
	});

	it("Given a malformed 八字 When mapping columns Then it fails instead of returning empty columns", () => {
		expect(() => getColumnShenSha(["甲"], true, { gender: "male" })).toThrow();
	});
});
