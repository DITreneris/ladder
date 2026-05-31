import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  envDir: repoRoot,
  plugins: [tailwindcss()],  server: {
    port: 5173,
    host: true,
  },
});
