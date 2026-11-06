// Made-up moments that belong to no one, to try the sheet with.
import type { BirthForm } from "../../../packages/bazi-ui/src/birth-form";

export const SAMPLES: { id: string; label: string; form: BirthForm }[] = [
  { id: "a", label: "示例甲", form: { lunar: false, year: 2000, month: 1, isLeapMonth: false, day: 1, hour: 12, minute: 0, gender: "male" } },
  { id: "b", label: "示例乙", form: { lunar: true, year: 2001, month: 4, isLeapMonth: true, day: 24, hour: 8, minute: 30, gender: "female" } },
];
