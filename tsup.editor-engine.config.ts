import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["editor-engine/index.ts"],
  format: ["iife"],
  globalName: "EditorEngine",
  outDir: "public/vanilla-app",
  clean: false,
  sourcemap: true,
  target: "es2018",
})
