import type { ValidationResult } from "./types";
import type { ChartCalculationInput } from "./types";

export function validateChartCalculationInput(input: ChartCalculationInput): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!input.year || input.year < 1900 || input.year > 2100) {
    errors.push("年份必须在1900-2100之间");
  }
  if (!input.month || input.month < 1 || input.month > 12) {
    errors.push("月份必须在1-12之间");
  }
  if (!input.day || input.day < 1 || input.day > 31) {
    errors.push("日期必须在1-31之间");
  }
  if (input.hour < 0 || input.hour > 23) {
    errors.push("小时必须在0-23之间");
  }
  if (input.minute !== undefined && (input.minute < 0 || input.minute > 59)) {
    errors.push("分钟必须在0-59之间");
  }
  if (input.second !== undefined && (input.second < 0 || input.second > 59)) {
    errors.push("秒钟必须在0-59之间");
  }
  if (!["male", "female"].includes(input.gender)) {
    errors.push("性别必须是male或female");
  }
  if (input.month === 2 && input.day > 29) {
    errors.push("2月份日期不能超过29日");
  }
  if ([4, 6, 9, 11].includes(input.month) && input.day > 30) {
    errors.push("4、6、9、11月份日期不能超过30日");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
