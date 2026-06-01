/**
 * Layout audit — verifies game column width alignment at key viewports.
 * After first tap, play-area width must stay stable (C-01 regression guard).
 * Run: npm run preview then npm run qa:layout
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const VIEWPORTS = [
  { width: 320, height: 800, label: "320px" },
  { width: 390, height: 844, label: "390px" },
];

const MAX_WIDTH_DELTA = 2;

async function measureGameColumn(page) {
  return page.evaluate(() => {
    const column = document.getElementById("gameContentColumn");
    const hud = document.getElementById("gameHud");
    const play = document.getElementById("gamePlayArea");
    const tap = document.getElementById("tapControlsBar");
    const home = document.querySelector("#startScreen .cl-shell-gutter");
    const rect = (el) => (el ? el.getBoundingClientRect().width : 0);
    const playClient = play ? play.clientWidth : 0;
    return {
      hasGameColumn: Boolean(column),
      game: {
        column: rect(column),
        hud: rect(hud),
        play: rect(play),
        playClient,
        tap: rect(tap),
      },
      homeGutter: rect(home),
    };
  });
}

async function main() {
  const browser = await chromium.launch();
  const report = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: "load" });
    await page.waitForSelector("#startScreen");

    const home = await measureGameColumn(page);
    report.push({ viewport: vp.label, screen: "home", ...home });

    await page.evaluate(() => window.startGame());
    await page.waitForSelector("#gameScreen:not(.hidden)");
    const gameBeforeTap = await measureGameColumn(page);
    report.push({ viewport: vp.label, screen: "game-before-tap", ...gameBeforeTap });

    await page.click("#btnTapLeft");
    await page.waitForTimeout(200);
    const gameAfterTap = await measureGameColumn(page);
    report.push({ viewport: vp.label, screen: "game-after-tap", ...gameAfterTap });

    await context.close();
  }

  await browser.close();

  const failures = [];
  for (const row of report) {
    if (row.screen !== "game-before-tap" && row.screen !== "game-after-tap") continue;
    const { hud, play, tap } = row.game;
    const widths = [hud, play, tap].filter((w) => w > 0);
    const max = Math.max(...widths);
    const min = Math.min(...widths);
    if (!row.hasGameColumn) {
      failures.push({ ...row, reason: "missing-gameContentColumn" });
    } else if (widths.length < 3) {
      failures.push({ ...row, reason: "missing-game-sections", widths: row.game });
    } else if (max - min > MAX_WIDTH_DELTA) {
      failures.push({ ...row, reason: "width-mismatch", delta: max - min, widths: row.game });
    }
  }

  for (const vp of VIEWPORTS) {
    const before = report.find((r) => r.viewport === vp.label && r.screen === "game-before-tap");
    const after = report.find((r) => r.viewport === vp.label && r.screen === "game-after-tap");
    if (!before || !after) continue;
    const delta = Math.abs(after.game.playClient - before.game.playClient);
    if (delta > MAX_WIDTH_DELTA) {
      failures.push({
        viewport: vp.label,
        screen: "post-tap-shrink",
        reason: "play-area-width-shrink-after-tap",
        before: before.game.playClient,
        after: after.game.playClient,
        delta,
      });
    }
  }

  writeFileSync("layout-audit-report.json", JSON.stringify({ report, failures }, null, 2));

  if (failures.length) {
    console.error("LAYOUT AUDIT FAILED:\n", JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log(
    "LAYOUT AUDIT PASSED: #gameContentColumn present; HUD/play/tap aligned; play-area width stable after first tap at 320/390."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
