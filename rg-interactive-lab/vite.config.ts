import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/RelatividadeGeral/dashboards/capitulo-4/",
  build: { outDir: "dist", emptyOutDir: true },
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"] },
});
