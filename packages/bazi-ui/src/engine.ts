// The kit's one way to the engine: @iching/bazi as NSH loads it, a relative bundle (`bun run engine:nsh`).
// NSH resolves relative imports only, so an app that copies the kit points this file at its own bundle.
export * from "../../bazi/nsh/iching-bazi";
