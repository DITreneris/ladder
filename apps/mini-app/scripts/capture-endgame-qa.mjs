/**
 * One-off QA screenshots for Board Member / Angel Investor endgame UI.
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173
 *        node scripts/capture-endgame-qa.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../design/endgame-qa");
const previewUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";

const SCENARIOS = [
  {
    file: "01-board-member-55y.png",
    label: "Board Member @ 55y — HUD + Quorum obstacle",
    years: 55,
    rank: "Board Member",
    rankEmoji: "🏛️",
    propEmoji: "🪑",
    badgeClass: "badge-rank-board mt-0.5",
    milestone: "Angel round in 20.0y",
    floor: "Floor 14 — Boardroom",
    floorBand: "board",
    obstacle: { emoji: "🏛️", label: "Quorum" },
  },
  {
    file: "02-angel-investor-92y.png",
    label: "Angel Investor @ 92.3y — HUD + Runway obstacle",
    years: 92.3,
    rank: "Angel Investor",
    rankEmoji: "👼",
    propEmoji: "💸",
    badgeClass: "badge-rank-angel mt-0.5",
    milestone: "Term sheet signed",
    floor: "Floor 23 — Investor Lounge",
    floorBand: "angel",
    obstacle: { emoji: "🛫", label: "Runway" },
  },
];

async function applyGameplayScenario(page, scenario) {
  await page.evaluate((s) => {
    document.getElementById("rankBadgeIcon").textContent = s.rankEmoji;
    document.getElementById("rankBadgeText").textContent = s.rank;
    document.getElementById("gameRankBadge").className = s.badgeClass;
    document.getElementById("playerActionEmoji").textContent = s.rankEmoji;
    document.getElementById("playerRankProp").textContent = s.propEmoji;
    document.getElementById("gameYearsLabel").textContent = s.years.toFixed(1);
    document.getElementById("milestoneChip").textContent = s.milestone;
    document.getElementById("floorLabel").textContent = s.floor;

    const viewport = document.querySelector(".cl-viewport");
    if (viewport) {
      viewport.classList.remove("office-grid-boardroom", "office-grid-investor-lounge");
      if (s.floorBand === "angel") viewport.classList.add("office-grid-investor-lounge");
      else if (s.floorBand === "board") viewport.classList.add("office-grid-boardroom");
    }

    const imminent = document.querySelector(".rung-row.imminent .obstacle-badge, .rung-row:first-of-type .obstacle-badge");
    if (imminent) {
      imminent.innerHTML = `<span class="text-lg leading-none">${s.obstacle.emoji}</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">${s.obstacle.label}</span>`;
    }
  }, scenario);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const scenario of SCENARIOS) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(`${previewUrl}/?capture=game`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__CL_CAPTURE_READY__ === true, { timeout: 15000 });
    await applyGameplayScenario(page, scenario);
    await page.waitForTimeout(300);
    await page.locator(".cl-phone-shell").screenshot({ path: path.join(outDir, scenario.file) });
    await page.close();
    console.log(`Saved design/endgame-qa/${scenario.file} — ${scenario.label}`);
  }

  const goPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await goPage.goto(`${previewUrl}/?capture=gameover`, { waitUntil: "networkidle" });
  await goPage.waitForFunction(() => window.__CL_CAPTURE_READY__ === true, { timeout: 15000 });
  await goPage.evaluate(() => {
    document.getElementById("statYears").textContent = "92.3 Years";
    document.getElementById("statRank").innerHTML = "<span>👼</span> Angel Investor";
    document.getElementById("terminationCauseIcon").textContent = "🛫";
    document.getElementById("terminationCauseLabel").textContent = "Runway";
    document.getElementById("terminationReason").textContent = "Runway expired before the pivot landed.";
    document.getElementById("terminationFlavor").textContent =
      "HR notes your term sheet was still in legal review.";
    document.getElementById("careerHighLine").textContent = "Career high: Angel Investor (92.3y)";
  });
  await goPage.waitForTimeout(300);
  const goFile = "03-angel-gameover-92y.png";
  await goPage.locator(".cl-phone-shell").screenshot({ path: path.join(outDir, goFile) });
  await goPage.close();
  console.log(`Saved design/endgame-qa/${goFile} — Angel Investor game over @ 92.3y`);
} finally {
  await browser.close();
}

console.log("\nEndgame QA capture complete.");
