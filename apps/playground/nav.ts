// The navigation stack's state, created once; pages import it to navigate.
import { createNavStack } from "nsh/base";
import type { BirthInput } from "./vendor/iching-bazi";

export type Route = { name: "input" } | { name: "chart"; input: BirthInput };

export const nav = createNavStack<Route>([{ name: "input" }]);
