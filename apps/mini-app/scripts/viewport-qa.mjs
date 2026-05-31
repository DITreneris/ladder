/**
 * Viewport QA — checks horizontal overflow on Corporate Ladder shell screens.
 * Run: npm run preview (in apps/mini-app) then npm run qa:viewport
 */
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const VIEWPORTS = [
  { width: 320, height: 800, label: "320px" },
  { width: 360, height: 800, label: "360px" },
  { width: 390, height: 844, label: "390px" },
  { width: 430, height: 932, label: "430px" },
  { width: 768, height: 1024, label: "768px" },
];

const SCREENS = [
  { id: "start", label: "Start", setup: null },
  {
    id: "leaderboard",
    label: "Leaderboard",
    setup: () => window.switchTab("leaderboard"),
  },
  {
    id: "howtoplay",
    label: "How to Play",
    setup: () => window.switchTab("howtoplay"),
  },
];

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

async function waitForApp(page) {
  await page.waitForSelector("#startScreen", { timeout: 15000 });
  await page.waitForFunction(() => typeof window.switchTab === "function", { timeout: 5000 });
}

async function main() {
  const browser = await chromium.launch();
  const failures = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    try {
      await page.goto(BASE, { waitUntil: "load", timeout: 30000 });
      await waitForApp(page);
    } catch (err) {
      console.error(`Failed to load ${BASE}. Start preview first: npx vite preview --host 127.0.0.1 --port 4173`);
      console.error(err);
      await browser.close();
      process.exit(1);
    }

    for (const screen of SCREENS) {
      if (screen.setup) {
        await page.evaluate(screen.setup);
        await page.waitForTimeout(300);
      } else {
        await page.evaluate(() => window.goHome());
        await page.waitForTimeout(200);
      }

      const overflow = await hasHorizontalOverflow(page);
      if (overflow) {
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        failures.push({ viewport: vp.label, screen: screen.label, scrollWidth, clientWidth });
      }
    }

    await context.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("VIEWPORT QA FAILED:\n", JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log("VIEWPORT QA PASSED: no horizontal overflow at 320–768px on start, leaderboard, how-to-play.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
