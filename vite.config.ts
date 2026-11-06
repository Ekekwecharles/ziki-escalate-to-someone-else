import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// `npm run build` -> normal build for Vercel.
// `npm run build:single` -> one self-contained HTML file (used for previews).
export default defineConfig(({ mode }) => ({
  plugins: mode === "single" ? [react(), tailwindcss(), viteSingleFile()] : [react(), tailwindcss()],
  build: { outDir: mode === "single" ? "dist-single" : "dist" },
}));
