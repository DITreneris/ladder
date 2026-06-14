/**
 * Tutorial coffee pickup + meeting collision QA.
 * Run: npm run build && npm run preview then npm run qa:coffee
 */
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const IS_CI = Boolean(process.env.CI);
/** UI + engine throttle is 120ms each — gap avoids dropped taps on slow CI runners. */
const TAP_GAP_MS = IS_CI ? 650 : 450;
const WAIT_MS = IS_CI ? 45_000 : 25_000;

function qaUrl() {
  const url = new URL(BASE);
  url.searchParams.set("qa", "1");
  url.searchParams.set("dailyPreset", "standard");
  return url.toString();
}

async function gameDiag(page) {
  return page.evaluate(() => ({
    hint: document.getElementById("imminentHint")?.textContent ?? "",
    gameHidden: document.getElementById("gameScreen")?.classList.contains("hidden"),
    gameOverHidden: document.getElementById("gameOverScreen")?.classList.contains("hidden"),
    snap: window.clQa?.snapshot?.() ?? null,
    pickups: window.clQa?.getCoffeePickups?.() ?? null,
    hasStartGame: typeof window.startGame === "function",
    hasClQa: window.clQa != null,
  }));
}

async function waitForPreviewReady() {
  const deadline = Date.now() + (IS_CI ? 45_000 : 30_000);
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE);
      if (res.ok) {
        const html = await res.text();
        if (html.includes('type="module"') && html.includes("/assets/main-")) {
          if (IS_CI) {
            await new Promise((r) => setTimeout(r, 1500));
          }
          return;
        }
      }
    } catch {
      /* preview still starting */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Preview not ready at ${BASE}`);
}

async function waitForQaHarness(page) {
  try {
    await page.waitForFunction(() => typeof window.startGame === "function", null, {
      timeout: WAIT_MS,
    });
  } catch {
    const diag = await gameDiag(page);
    throw new Error(`QA harness missing startGame: ${JSON.stringify(diag)}`);
  }
  try {
    await page.waitForFunction(() => window.clQa != null, null, { timeout: WAIT_MS });
  } catch {
    const diag = await gameDiag(page);
    throw new Error(`QA harness missing clQa (?qa=1): ${JSON.stringify(diag)}`);
  }
}

async function waitForTapDeck(page) {
  await page.waitForSelector("#btnTapLeft", { state: "visible", timeout: WAIT_MS });
  await page.waitForSelector("#btnTapRight", { state: "visible", timeout: WAIT_MS });
}

async function tapLeft(page) {
  await page.locator("#btnTapLeft").click({ timeout: WAIT_MS });
  await page.waitForTimeout(TAP_GAP_MS);
}

async function tapRight(page) {
  await page.locator("#btnTapRight").click({ timeout: WAIT_MS });
  await page.waitForTimeout(TAP_GAP_MS);
}

async function snapshot(page) {
  return page.evaluate(() => window.clQa?.snapshot?.() ?? null);
}

async function waitForImminentCoffee(page) {
  try {
    await page.waitForFunction(
      () => {
        const hint = document.getElementById("imminentHint")?.textContent ?? "";
        if (/Coffee on/i.test(hint)) return true;
        const snap = window.clQa?.snapshot?.();
        return Boolean(snap?.rungs?.[1]?.coffee);
      },
      null,
      { timeout: WAIT_MS }
    );
  } catch {
    const diag = await gameDiag(page);
    throw new Error(`imminent coffee not visible after 2 climbs: ${JSON.stringify(diag)}`);
  }
}

async function climbToTutorialCoffee(page) {
  await page.evaluate(() => window.startGame());
  await page.waitForSelector("#gameScreen:not(.hidden)", { timeout: WAIT_MS });
  await waitForTapDeck(page);
  await page.waitForFunction(
    () => {
      const snap = window.clQa?.snapshot?.();
      const gameOverHidden = document.getElementById("gameOverScreen")?.classList.contains("hidden");
      return Boolean(snap) && snap.climbed === 0 && gameOverHidden;
    },
    null,
    { timeout: WAIT_MS }
  );
  await tapLeft(page);
  await tapLeft(page);
  await waitForImminentCoffee(page);
}

async function runCoffeePickup(page) {
  await climbToTutorialCoffee(page);

  const before = await snapshot(page);
  if (!before?.rungs?.[1]?.coffee) {
    throw new Error(`imminent rung has no coffee before pickup tap: ${JSON.stringify(before)}`);
  }

  await tapLeft(page);

  try {
    await page.waitForFunction(() => (window.clQa?.getCoffeePickups?.() ?? 0) >= 1, null, {
      timeout: WAIT_MS,
    });
  } catch {
    const diag = await gameDiag(page);
    throw new Error(`coffee pickup counter not incremented: ${JSON.stringify(diag)}`);
  }
  try {
    await page.waitForFunction(
      () => document.querySelectorAll(".next-rung .coffee-badge").length === 0,
      null,
      { timeout: WAIT_MS }
    );
  } catch {
    const diag = await gameDiag(page);
    throw new Error(`coffee badge still visible after pickup: ${JSON.stringify(diag)}`);
  }
}

async function runImminentSyncAfterCoffeePickup(page) {
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#startScreen", { timeout: WAIT_MS });
  await waitForQaHarness(page);
  await climbToTutorialCoffee(page);
  await tapLeft(page);

  try {
    await page.waitForFunction(() => (window.clQa?.getCoffeePickups?.() ?? 0) >= 1, null, {
      timeout: WAIT_MS,
    });
  } catch {
    const diag = await gameDiag(page);
    throw new Error(`coffee pickup before imminent sync check failed: ${JSON.stringify(diag)}`);
  }

  const syncOk = await page.evaluate(() => {
    window.clQa?.forceImminentRung?.({ obstacle: "left", type: "meeting" });
    window.clQa?.refreshRungs?.();
    const snap = window.clQa?.snapshot?.();
    const imminent = document.querySelector(".next-rung");
    const coffeeOnNext = imminent?.querySelector(".coffee-badge");
    const meetingOnNext = imminent?.querySelector(".left-slot .obstacle-badge:not(.coffee-badge)");
    const hint = document.getElementById("imminentHint")?.textContent ?? "";
    return (
      snap?.rungs?.[1]?.obstacle === "left" &&
      snap?.rungs?.[1]?.type === "meeting" &&
      !coffeeOnNext &&
      Boolean(meetingOnNext) &&
      /Meeting/i.test(hint)
    );
  });

  if (!syncOk) {
    const diag = await gameDiag(page);
    throw new Error(
      `imminent slot DOM out of sync after coffee pickup: ${JSON.stringify(diag)}`
    );
  }
}

async function runMeetingCollision(page) {
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#startScreen", { timeout: WAIT_MS });
  await waitForQaHarness(page);
  await page.evaluate(() => window.startGame());
  await page.waitForSelector("#gameScreen:not(.hidden)", { timeout: WAIT_MS });
  await waitForTapDeck(page);
  await tapLeft(page);
  await tapRight(page);
  await page.waitForSelector("#gameOverScreen:not(.hidden)", { timeout: WAIT_MS });
}

async function main() {
  await waitForPreviewReady();

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(qaUrl(), { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#startScreen", { timeout: WAIT_MS });
  await waitForQaHarness(page);

  try {
    await runCoffeePickup(page);
  } catch (err) {
    console.error("COFFEE QA FAILED:", err.message ?? err);
    console.error(`Preview URL: ${BASE} (set PREVIEW_URL if vite picked another port)`);
    await browser.close();
    process.exit(1);
  }

  try {
    await runImminentSyncAfterCoffeePickup(page);
  } catch (err) {
    console.error("IMMINENT SYNC QA FAILED:", err.message ?? err);
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
    "COFFEE + MEETING QA PASSED: +25 energy on tap 3; imminent slot sync after pickup; meeting collision on tap 2 RIGHT."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
