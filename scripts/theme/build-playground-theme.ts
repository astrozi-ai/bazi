// Writes the playground's theme.json as the merge of the UI packages' themes.
import { PLAYGROUND_THEME, playgroundTheme, serialize } from "./merge";

await Bun.write(PLAYGROUND_THEME.out, serialize(playgroundTheme()));
console.log(`playground theme: ${PLAYGROUND_THEME.out}`);
