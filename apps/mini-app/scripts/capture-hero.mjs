/**
 * Capture home-screen hero image for README (delegates to marketing home shot).
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:hero
 */
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const marketingHome = path.resolve(__dirname, "../design/marketing/01-home.png");
const legacyOut = path.resolve(__dirname, "../design/gameplay.png");

await mkdir(path.dirname(legacyOut), { recursive: true });

await new Promise((resolve, reject) => {
  const child = spawn("node", ["scripts/capture-marketing.mjs"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    shell: true,
  });
  child.on("error", reject);
  child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`capture:marketing exited ${code}`))));
});

await copyFile(marketingHome, legacyOut);
console.log("Saved design/gameplay.png (copy of marketing/01-home.png)");
