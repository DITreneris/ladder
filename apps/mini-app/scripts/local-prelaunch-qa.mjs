/**
 * Local pre-launch QA — P0/P1 DOM + navigation checks on vite preview.
 * Usage: npm run build && npm run preview (4173) && npm run qa:prelaunch
 */
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const failures = [];

  const check = (name, ok, detail = "") => {
    if (!ok) failures.push({ name, detail });
    console.log(ok ? `PASS ${name}` : `FAIL ${name}${detail ? `: ${detail}` : ""}`);
  };

  await page.goto(`${BASE}/?debug=1`, { waitUntil: "networkidle" });
  await page.waitForSelector("#startScreen", { timeout: 15000 });

  // P0-1: data-action shell buttons (no inline onclick)
  const actionCount = await page.locator("[data-action]").count();
  const onclickCount = await page.evaluate(() =>
    document.querySelectorAll("[onclick]").length
  );
  check("P0-1 data-action listeners wired", actionCount >= 10 && onclickCount === 0, `actions=${actionCount} onclick=${onclickCount}`);

  await page.click('[data-action="open-leaderboard"]');
  await page.waitForSelector("#leaderboardScreen:not(.hidden)", { timeout: 5000 });
  check("P0-1 Leaderboard navigation", true);

  await page.click('[data-action="go-home"]');
  await page.waitForSelector("#startScreen:not(.hidden)", { timeout: 5000 });

  await page.click('[data-action="open-howtoplay"]');
  await page.waitForSelector("#howToPlayScreen:not(.hidden)", { timeout: 5000 });
  check("P0-1 How to Survive navigation", true);

  await page.click('[data-action="go-home"]');

  // P0-3: sync chip markup
  const syncChip = await page.locator("#syncStatusChip").count();
  check("P0-3 sync chip present", syncChip === 1);

  // P1-9/10: home layout
  const tickerVisible = await page.locator("#homeNewsTicker").isVisible();
  const shiftSecondary = await page.locator("#homeContextSecondary #dailyShiftBlock").count();
  const previewGone = await page.locator("#homeGameplayPreview").count();
  const secondaryNav = await page.locator("#homeSecondaryNav").isVisible();
  check("P1-9 news ticker row 1", tickerVisible);
  check("P1-9 shift on row 2", shiftSecondary === 1);
  check("P1-10 mechanics preview removed", previewGone === 0);
  check("P1-10 secondary nav below badge", secondaryNav);

  // P1-11: progressive ghost backdrop + play-area band mirror
  const corpEnv = await page.evaluate(() => {
    const ghost = document.getElementById("corpGhostBg");
    const play = document.getElementById("gamePlayArea");
    const band = "corp-env-intern-pit";
    return {
      ghost: ghost?.className ?? "",
      play: play?.className ?? "",
      ghostOk: ghost?.classList.contains("corp-ghost-bg") && ghost?.classList.contains(band),
      playOk: play?.classList.contains("game-play-area") && play?.classList.contains(band),
    };
  });
  check(
    "P1-11 corp ghost backdrop",
    corpEnv.ghostOk,
    corpEnv.ghost
  );
  check(
    "P1-11 play-area band class mirror",
    corpEnv.playOk,
    corpEnv.play
  );

  // P1-17: HR stamp pad markup
  const stampPad = await page.locator("#hrStampPad").count();
  check("P1-17 HR stamp pad present", stampPad === 1);

  // P0-8: game-over sync chip on screen
  await page.evaluate(() => {
    window.__CL_QA_GAME_OVER__ = true;
  });
  // Navigate to game-over via debug if available — check template elements exist
  const goSync = await page.locator("#gameOverScreen #syncStatusChip").count();
  check("P0-3 game-over sync chip in shell", goSync === 1);

  await browser.close();

  if (failures.length > 0) {
    console.error("\nLOCAL PRELAUNCH QA FAILED:");
    for (const f of failures) console.error(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nLOCAL PRELAUNCH QA PASSED (DOM + navigation slice).");
  console.log("Operator still required: P0 revive ad, P0 submit 200, P0 429/503 retry, P1 ghost band transitions in play.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
