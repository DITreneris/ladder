import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig({
  envDir: repoRoot,
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        ogPreview: path.resolve(__dirname, "og-preview.html"),
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
