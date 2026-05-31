/**
 * Capture home-screen hero image for README.
 * Usage: npm run build && npx vite preview --host 127.0.0.1 --port 4173 &
 *        node scripts/capture-hero.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../../docs/assets");
const url = process.env.HERO_URL ?? "http://127.0.0.1:4173/";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector("#startScreen");
await page.screenshot({
  path: path.join(outDir, "gameplay.png"),
  fullPage: false,
});
await browser.close();
console.log("Saved docs/assets/gameplay.png");
