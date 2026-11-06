import { expect, test } from "bun:test";
import { BAZI_CORE_PACKAGE } from "./index";

test("the core shell loads and declares its package identity", () => {
  expect(BAZI_CORE_PACKAGE).toBe("@iching/bazi");
});
