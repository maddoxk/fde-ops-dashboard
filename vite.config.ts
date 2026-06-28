import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served at https://maddoxk.github.io/fde-ops-dashboard/
export default defineConfig({
  base: "/fde-ops-dashboard/",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
} as any);
