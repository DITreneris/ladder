/**
 * Capture marketing screenshots (home, gameplay, game over).
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173 &
 *        npm run capture:marketing
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../../docs/assets/marketing");
const previewUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";

const SHOTS = [
  { type: "home", file: "01-home.png", label: "Home hook + brand" },
  { type: "game", file: "02-gameplay-dodge.png", label: "Gameplay dodge + tap deck" },
  { type: "gameover", file: "03-game-over.png", label: "Game over satire" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const shot of SHOTS) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${previewUrl}/?capture=${shot.type}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__CL_CAPTURE_READY__ === true, { timeout: 15000 });

    if (shot.type === "home") {
      await page.evaluate(() => {
        const startScreen = document.getElementById("startScreen");
        if (startScreen) startScreen.scrollTop = 0;
      });
    }

    await page.locator(".cl-phone-shell").screenshot({
      path: path.join(outDir, shot.file),
    });
    await page.close();
    console.log(`Saved docs/assets/marketing/${shot.file} — ${shot.label}`);
  }
} finally {
  await browser.close();
}

console.log("\nMarketing capture complete. Review rubric in docs/assets/marketing/README.md");
