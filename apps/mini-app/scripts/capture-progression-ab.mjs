/**
 * A/B corp-env / juice presets — compare before shipping style.css defaults.
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4173
 *        npm run capture:progression-ab
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AB_YEAR_SCENARIOS,
  PRESETS,
  buildPresetOverrideCss,
} from "./progression-presets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../design/progression-ab");
const previewUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";

async function injectPreset(page, presetId) {
  const preset = PRESETS[presetId];
  const css = buildPresetOverrideCss(preset);
  await page.evaluate((styleText) => {
    let el = document.getElementById("cl-preset-overrides");
    if (!el) {
      el = document.createElement("style");
      el.id = "cl-preset-overrides";
      document.head.appendChild(el);
    }
    el.textContent = styleText;
  }, css);
}

async function applyScenario(page, scenario) {
  await page.evaluate((s) => {
    document.getElementById("rankBadgeIcon").textContent = s.rankEmoji;
    document.getElementById("rankBadgeText").textContent = s.rank;
    document.getElementById("gameRankBadge").className = s.badgeClass;
    document.getElementById("playerActionEmoji").textContent = s.rankEmoji;
    document.getElementById("playerRankProp").textContent = s.propEmoji;
    document.getElementById("gameYearsLabel").textContent = s.years.toFixed(1);
    document.getElementById("milestoneChip").textContent = s.milestone;
    document.getElementById("floorLabel").textContent = s.floor;

    const ghost = document.getElementById("corpGhostBg");
    if (ghost && s.corpEnvClass) {
      ghost.className = `corp-ghost-bg ${s.corpEnvClass}`;
    }

    const playArea = document.getElementById("gamePlayArea");
    if (playArea && s.corpEnvClass) {
      playArea.className = `game-play-area ${s.corpEnvClass}`;
    }

    const imminent = document.querySelector(
      ".rung-row.imminent .obstacle-badge, .rung-row:first-of-type .obstacle-badge"
    );
    if (imminent) {
      imminent.innerHTML = `<span class="text-lg leading-none">${s.obstacle.emoji}</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">${s.obstacle.label}</span>`;
    }
  }, scenario);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

try {
  for (const presetId of Object.keys(PRESETS)) {
    for (const scenario of AB_YEAR_SCENARIOS) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.goto(`${previewUrl}/?capture=game`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.__CL_CAPTURE_READY__ === true, { timeout: 15000 });
      await injectPreset(page, presetId);
      await applyScenario(page, scenario);
      await page.waitForTimeout(350);

      const file = `${presetId}-${scenario.years}y.png`;
      await page.locator(".cl-phone-shell").screenshot({ path: path.join(outDir, file) });
      await page.close();
      console.log(`Saved design/progression-ab/${file} — preset ${presetId} @ ${scenario.years}y`);
    }

    // Mid-flash frame: open-office play area with floor-band-flash active
    const flashPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await flashPage.goto(`${previewUrl}/?capture=game`, { waitUntil: "networkidle" });
    await flashPage.waitForFunction(() => window.__CL_CAPTURE_READY__ === true, { timeout: 15000 });
    await injectPreset(flashPage, presetId);
    const openOffice = AB_YEAR_SCENARIOS.find((s) => s.years === 7);
    await applyScenario(flashPage, openOffice);
    await flashPage.evaluate(() => {
      const play = document.getElementById("gamePlayArea");
      if (play) {
        play.classList.remove("floor-band-flash");
        void play.offsetWidth;
        play.classList.add("floor-band-flash");
      }
    });
    await flashPage.waitForTimeout(80);
    const flashFile = `${presetId}-7y-flash-mid.png`;
    await flashPage.locator(".cl-phone-shell").screenshot({ path: path.join(outDir, flashFile) });
    await flashPage.close();
    console.log(`Saved design/progression-ab/${flashFile} — preset ${presetId} flash mid-frame`);
  }
} finally {
  await browser.close();
}

console.log("\nProgression A/B capture complete. Review design/progression-ab/ then pick A, B, or C.");
