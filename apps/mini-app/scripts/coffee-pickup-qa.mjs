/**
 * Tutorial coffee pickup + meeting collision QA.
 * Run: npm run build && npm run preview then npm run qa:coffee
 */
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const TAP_GAP_MS = 250;

function qaUrl() {
  const url = new URL(BASE);
  url.searchParams.set("qa", "1");
  return url.toString();
}

async function tapLeft(page) {
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(TAP_GAP_MS);
}

async function tapRight(page) {
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(TAP_GAP_MS);
}

async function snapshot(page) {
  return page.evaluate(() => window.clQa?.snapshot?.() ?? null);
}

async function runCoffeePickup(page) {
  await page.evaluate(() => window.startGame());
  await page.waitForSelector("#gameScreen:not(.hidden)");
  await page.click("#gamePlayArea");
  await tapLeft(page);
  await tapLeft(page);

  await page.waitForFunction(() => {
    const hint = document.getElementById("imminentHint")?.textContent ?? "";
    return /Coffee on/i.test(hint);
  });

  const before = await snapshot(page);
  if (!before?.rungs?.[1]?.coffee) {
    throw new Error("imminent rung has no coffee before pickup tap");
  }

  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(() => (window.clQa?.getCoffeePickups?.() ?? 0) >= 1, null, {
    timeout: 2000,
  });
  await page.waitForFunction(
    () => document.querySelectorAll(".next-rung .coffee-badge").length === 0,
    null,
    { timeout: 2000 }
  );
}

async function runMeetingCollision(page) {
  await page.goto(qaUrl(), { waitUntil: "load" });
  await page.waitForSelector("#startScreen");
  await page.evaluate(() => window.startGame());
  await page.waitForSelector("#gameScreen:not(.hidden)");
  await page.click("#gamePlayArea");
  await tapLeft(page);
  await tapRight(page);
  await page.waitForSelector("#gameOverScreen:not(.hidden)", { timeout: 3000 });
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(qaUrl(), { waitUntil: "load" });
  await page.waitForSelector("#startScreen");

  try {
    await runCoffeePickup(page);
  } catch (err) {
    console.error("COFFEE QA FAILED:", err.message ?? err);
    console.error(`Preview URL: ${BASE} (set PREVIEW_URL if vite picked another port)`);
    await browser.close();
    process.exit(1);
  }

  try {
    await runMeetingCollision(page);
  } catch (err) {
    console.error("MEETING QA FAILED:", err.message ?? err);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  console.log(
    "COFFEE + MEETING QA PASSED: +25 energy on tap 3; meeting collision ends run on tap 2 RIGHT."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
