import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

const repoRoot = path.resolve(__dirname, "../..");

function apiPreconnectPlugin(): Plugin {
  return {
    name: "api-preconnect",
    transformIndexHtml(html) {
      const apiUrl = process.env.VITE_API_URL?.trim();
      if (!apiUrl) return html;
      try {
        const origin = new URL(apiUrl).origin;
        const tags = `    <link rel="preconnect" href="${origin}" />\n    <link rel="dns-prefetch" href="${origin}" />\n`;
        return html.replace(
          "    <!-- API preconnect injected at build from VITE_API_URL -->\n",
          `    <!-- API preconnect injected at build from VITE_API_URL -->\n${tags}`
        );
      } catch {
        return html;
      }
    },
  };
}

export default defineConfig({
  envDir: repoRoot,
  plugins: [tailwindcss(), apiPreconnectPlugin()],
  esbuild: {
    supported: {
      destructuring: true,
    },
  },
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
