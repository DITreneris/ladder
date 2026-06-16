/**
 * Viewport QA — checks horizontal overflow, play-area budget, and rung fit on Corporate Ladder screens.
 * Layout contract: docs/MINI_APP_GOLDEN_STANDARD.md (repo root docs/)
 * Run: npm run preview (in apps/mini-app) then npm run qa:viewport
 */
import { chromium } from "playwright";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4173";
const VIEWPORTS = [
  { width: 320, height: 568, label: "320x568" },
  { width: 320, height: 800, label: "320px" },
  { width: 360, height: 800, label: "360px" },
  { width: 390, height: 844, label: "390px" },
  { width: 430, height: 932, label: "430px" },
  { width: 768, height: 1024, label: "768px" },
];

// Bottom tap deck sits outside #gamePlayArea; rung-fit is the primary ladder guardrail.
const MIN_PLAY_AREA_RATIO = 0.5;
const MIN_TAP_BUTTON_HEIGHT = 112;

const SCREENS = [
  { id: "start", label: "Start", setup: null },
  {
    id: "game",
    label: "Game",
    setup: () => window.startGame(),
  },
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
  {
    id: "gameover",
    label: "Game Over",
    setup: () => window.switchTab("gameover"),
  },
];

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

async function playAreaRatio(page) {
  return page.evaluate(() => {
    const gameScreen = document.getElementById("gameScreen");
    const playArea = document.getElementById("gamePlayArea");
    if (!gameScreen || !playArea) return 0;
    return playArea.clientHeight / gameScreen.clientHeight;
  });
}

async function rungFit(page) {
  return page.evaluate(() => {
    const playArea = document.getElementById("gamePlayArea");
    if (!playArea) return { ok: false, reason: "missing-play-area" };
    const slots = playArea.querySelectorAll("[data-rung-slot]");
    if (!slots.length) return { ok: false, reason: "no-rung-slots" };
    const slotHeight = slots[0].clientHeight;
    const total = slotHeight * slots.length;
    const budget = playArea.clientHeight + 1;
    return {
      ok: total <= budget,
      slotHeight,
      slotCount: slots.length,
      total,
      budget: playArea.clientHeight,
    };
  });
}

async function tapBarVisible(page) {
  return page.evaluate((minHeight) => {
    const bar = document.getElementById("tapControlsBar");
    const btn = document.getElementById("btnTapLeft");
    return Boolean(bar && btn && bar.offsetHeight > 0 && btn.offsetHeight >= minHeight);
  }, MIN_TAP_BUTTON_HEIGHT);
}

async function homeBrandVisibleWithoutScroll(page) {
  return page.evaluate(() => {
    const startScreen = document.getElementById("startScreen");
    const brandLink = document.querySelector("#homeBrandFooter .brand-attribution-link");
    if (!startScreen || !brandLink) return { ok: false, reason: "missing-brand" };

    startScreen.scrollTop = 0;
    const containerRect = startScreen.getBoundingClientRect();
    const brandRect = brandLink.getBoundingClientRect();
    const text = brandLink.textContent ?? "";
    const inView =
      brandRect.top >= containerRect.top - 1 &&
      brandRect.bottom <= containerRect.bottom + 1 &&
      brandRect.left >= containerRect.left - 1 &&
      brandRect.right <= containerRect.right + 1;
    const hasLabel = text.includes("Prompt Anatomy");

    return { ok: inView && hasLabel, inView, hasLabel, text: text.slice(0, 80) };
  });
}

async function homeCtaReachable(page) {
  return page.evaluate(() => {
    const startScreen = document.getElementById("startScreen");
    if (!startScreen) return { ok: false, reason: "missing-start-screen" };

    const inTelegram = document.documentElement.classList.contains("cl-in-telegram");
    const inlineCta = startScreen.querySelector("button.cl-primary-btn");
    const inlineVisible =
      inlineCta && window.getComputedStyle(inlineCta).display !== "none";
    const scrollTarget =
      inlineVisible && inlineCta
        ? inlineCta
        : inTelegram
          ? document.getElementById("homeSecondaryNav")
          : startScreen.querySelector(".start-cta-bar button.cl-primary-btn") ??
            startScreen.querySelector(".start-cta-bar");
    if (!scrollTarget) return { ok: false, reason: "missing-cta" };

    startScreen.scrollTop = startScreen.scrollHeight;
    scrollTarget.scrollIntoView({ block: "nearest" });
    const rect = scrollTarget.getBoundingClientRect();
    const containerRect = startScreen.getBoundingClientRect();
    const inView = rect.top >= containerRect.top - 1 && rect.bottom <= containerRect.bottom + 1;

    return {
      ok: inView,
      scrollHeight: startScreen.scrollHeight,
      clientHeight: startScreen.clientHeight,
    };
  });
}

async function homeSecondaryNavVisibleWithoutScroll(page) {
  return page.evaluate(() => {
    const startScreen = document.getElementById("startScreen");
    const nav = document.getElementById("homeSecondaryNav");
    if (!startScreen || !nav) return { ok: false, reason: "missing-secondary-nav" };

    startScreen.scrollTop = 0;
    const containerRect = startScreen.getBoundingClientRect();
    const buttons = nav.querySelectorAll("button[data-action]");
    if (buttons.length < 2) return { ok: false, reason: "missing-nav-buttons" };

    const labels = [];
    let allInView = true;
    for (const btn of buttons) {
      const rect = btn.getBoundingClientRect();
      const inView =
        rect.top >= containerRect.top - 1 &&
        rect.bottom <= containerRect.bottom + 1 &&
        rect.left >= containerRect.left - 1 &&
        rect.right <= containerRect.right + 1;
      if (!inView) allInView = false;
      labels.push((btn.textContent ?? "").trim().slice(0, 40));
    }

    const hasLeaderboard = labels.some((t) => t.includes("Leaderboard"));
    const hasHowTo = labels.some((t) => t.includes("How to Survive"));

    return { ok: allInView && hasLeaderboard && hasHowTo, allInView, hasLeaderboard, hasHowTo, labels };
  });
}

async function homeMechanicCopyVisible(page) {
  return page.evaluate(() => {
    const startScreen = document.getElementById("startScreen");
    if (!startScreen) return { ok: false, reason: "missing-start-screen" };
    const text = startScreen.textContent ?? "";
    const ok =
      text.includes("Tap left or right") ||
      text.includes("Dodge meetings") ||
      text.includes("Survive the org chart");
    return { ok, text: text.slice(0, 120) };
  });
}

async function hudTapHintReferencesDeck(page) {
  return page.evaluate(() => {
    const hint = document.getElementById("hudTapHint");
    if (!hint) return { ok: false, reason: "missing-hint" };
    const text = hint.textContent ?? "";
    if (text.includes("TAP LEFT") || text.includes("TAP RIGHT")) {
      return { ok: true, text, mode: "hud-hint" };
    }
    const leftGlow = document.getElementById("btnTapLeft")?.classList.contains("safe-side-hint");
    const rightGlow = document.getElementById("btnTapRight")?.classList.contains("safe-side-hint");
    if (leftGlow || rightGlow) {
      return { ok: true, text, mode: "tutorial-glow" };
    }
    return { ok: false, text, reason: "no-hint-or-glow" };
  });
}

async function memoPlayAreaStability(page) {
  return page.evaluate(() => {
    const rail = document.getElementById("hrMemoRail");
    const strip = document.getElementById("hrMemoStrip");
    const textEl = document.getElementById("hrMemoText");
    const playArea = document.getElementById("gamePlayArea");
    const meter = document.getElementById("burnoutMeter");
    if (!rail || !strip || !textEl || !playArea || !meter) {
      return { ok: false, reason: "missing-elements" };
    }

    const heightBefore = playArea.clientHeight;
    const stripRect = strip.getBoundingClientRect();

    rail.classList.remove("hidden");
    strip.classList.add("hr-memo-strip--active");
    textEl.textContent = "Viewport QA memo — play area stability check.";

    const heightAfter = playArea.clientHeight;
    const heightDelta = Math.abs(heightAfter - heightBefore);
    const railRect = rail.getBoundingClientRect();
    const memoInsideStrip =
      railRect.top >= stripRect.top - 1 &&
      railRect.bottom <= stripRect.bottom + 1 &&
      railRect.left >= stripRect.left - 1 &&
      railRect.right <= stripRect.right + 1;

    const meterRect = meter.getBoundingClientRect();
    const energyVisibleDuringMemo =
      meterRect.bottom <= railRect.top + 1 || meterRect.top >= railRect.bottom - 1;

    return {
      ok: heightDelta <= 1 && memoInsideStrip && energyVisibleDuringMemo,
      heightBefore,
      heightAfter,
      heightDelta,
      memoInsideStrip,
      energyVisibleDuringMemo,
    };
  });
}

async function homeColumnAlignment(page) {
  return page.evaluate(() => {
    const badge = document.querySelector("#startScreen .card-light");
    const secondaryNav = document.getElementById("homeSecondaryNav");
    const contextSlot = document.getElementById("homeContextSlot");
    if (!badge || !secondaryNav || !contextSlot) return { ok: false, reason: "missing-home-blocks" };

    const boxes = [badge, secondaryNav, contextSlot].map((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, l: r.left };
    });
    const widths = boxes.map((b) => b.w);
    const lefts = boxes.map((b) => b.l);
    const widthDelta = Math.max(...widths) - Math.min(...widths);
    const leftDelta = Math.max(...lefts) - Math.min(...lefts);

    return {
      ok: widthDelta <= 2 && leftDelta <= 2,
      badgeWidth: widths[0],
      secondaryNavWidth: widths[1],
      contextSlotWidth: widths[2],
      widthDelta,
      leftDelta,
    };
  });
}

async function gameStackColumnAlignment(page) {
  return page.evaluate(() => {
    const column = document.getElementById("gameContentColumn");
    const hud = document.getElementById("gameHud");
    const playArea = document.getElementById("gamePlayArea");
    const tapBar = document.getElementById("tapControlsBar");
    const leftBtn = document.getElementById("btnTapLeft");
    if (!column || !hud || !playArea || !tapBar || !leftBtn) {
      return { ok: false, reason: "missing-game-stack" };
    }

    const measure = (el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, l: r.left };
    };

    const stack = [hud, playArea, tapBar].map(measure);
    const widths = stack.map((b) => b.w);
    const lefts = stack.map((b) => b.l);
    const widthDelta = Math.max(...widths) - Math.min(...widths);
    const leftDelta = Math.max(...lefts) - Math.min(...lefts);

    const col = measure(column);
    const tapBtn = measure(leftBtn);
    const columnWrapsTap =
      tapBtn.l >= col.l - 1 &&
      tapBtn.l + tapBtn.w <= col.l + col.w + 1;

    return {
      ok: widthDelta <= 2 && leftDelta <= 2 && columnWrapsTap,
      columnWidth: col.w,
      hudWidth: widths[0],
      playWidth: widths[1],
      tapWidth: widths[2],
      widthDelta,
      leftDelta,
      columnWrapsTap,
    };
  });
}

async function gameOverCardActionsGap(page, viewportWidth) {
  return page.evaluate((vpWidth) => {
    const MAX_CARD_ACTIONS_GAP = 24;

    function measureGap() {
      const screen = document.getElementById("gameOverScreen");
      const card = document.querySelector("#gameOverScreen .card-performance");
      const actions = document.querySelector("#gameOverScreen .game-over-actions");
      if (!screen || !card || !actions) return null;

      const cardRect = card.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();
      return {
        cardActionsGap: actionsRect.top - cardRect.bottom,
        actionsTailGap: screenRect.bottom - actionsRect.bottom,
      };
    }

    const sparse = measureGap();
    if (!sparse) return { ok: false, reason: "missing-game-over-elements" };

    const revive = document.getElementById("reviveAdBtn");
    const stamp = document.getElementById("hrStampPad");
    const chip = document.getElementById("syncStatusChip");
    const reviveWasHidden = revive?.classList.contains("hidden") ?? true;
    const stampWasHidden = stamp?.classList.contains("hidden") ?? true;
    const chipWasHidden = chip?.classList.contains("hidden") ?? true;

    revive?.classList.remove("hidden");
    stamp?.classList.remove("hidden");
    if (chip) {
      chip.classList.remove("hidden");
      chip.classList.add("sync-status-chip--syncing");
    }

    const busy = measureGap();

    if (reviveWasHidden) revive?.classList.add("hidden");
    if (stampWasHidden) stamp?.classList.add("hidden");
    if (chip) {
      if (chipWasHidden) chip.classList.add("hidden");
      chip.classList.remove("sync-status-chip--syncing");
    }

    const gapInRange = (gap) => gap <= MAX_CARD_ACTIONS_GAP && gap >= -1;
    const sparseGapOk = gapInRange(sparse.cardActionsGap);
    const busyGapOk = busy !== null && gapInRange(busy.cardActionsGap);
    const TAIL_MIN = 32;
    const tailOk =
      vpWidth !== 390 ||
      sparse.actionsTailGap < TAIL_MIN ||
      sparse.actionsTailGap > sparse.cardActionsGap;

    return {
      ok: sparseGapOk && busyGapOk && tailOk,
      sparseCardActionsGap: sparse.cardActionsGap,
      sparseActionsTailGap: sparse.actionsTailGap,
      busyCardActionsGap: busy?.cardActionsGap ?? null,
      tailOk,
    };
  }, viewportWidth);
}

async function gameOverLeaderboardFullWidth(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const hadTelegram = root.classList.contains("cl-in-telegram");
    const hadSecondaryShare = root.classList.contains("cl-tg-secondary-share");
    root.classList.add("cl-in-telegram", "cl-tg-secondary-share");

    const actions = document.querySelector("#gameOverScreen .game-over-actions");
    const lbBtn = document.querySelector(
      '#gameOverScreen .game-over-actions [data-action="open-leaderboard"]'
    );
    const shareBtn = document.getElementById("shareBtn");
    if (!actions || !lbBtn) {
      if (!hadTelegram) root.classList.remove("cl-in-telegram");
      if (!hadSecondaryShare) root.classList.remove("cl-tg-secondary-share");
      return { ok: false, reason: "missing-game-over-leaderboard" };
    }

    const shareHidden =
      shareBtn && window.getComputedStyle(shareBtn).display === "none";
    const ar = actions.getBoundingClientRect();
    const lr = lbBtn.getBoundingClientRect();
    const widthDelta = Math.abs(ar.width - lr.width);
    const leftDelta = Math.abs(ar.left - lr.left);
    const gridColumn = window.getComputedStyle(lbBtn).gridColumnStart;

    if (!hadTelegram) root.classList.remove("cl-in-telegram");
    if (!hadSecondaryShare) root.classList.remove("cl-tg-secondary-share");

    return {
      ok: shareHidden && widthDelta <= 2 && leftDelta <= 2,
      shareHidden,
      actionsWidth: ar.width,
      leaderboardWidth: lr.width,
      widthDelta,
      leftDelta,
      gridColumn,
    };
  });
}

async function gameOverColumnAlignment(page) {
  return page.evaluate(() => {
    const card = document.querySelector("#gameOverScreen .card-performance");
    if (!card) return { ok: false, reason: "missing-game-over" };

    const primaryBtn = document.querySelector(
      "#gameOverScreen .game-over-actions .btn-cl-primary[data-action='start-game']"
    );
    const primaryVisible =
      primaryBtn && window.getComputedStyle(primaryBtn).display !== "none";
    const alignTarget =
      primaryVisible && primaryBtn
        ? primaryBtn
        : document.querySelector("#gameOverScreen .game-over-actions");
    if (!alignTarget) return { ok: false, reason: "missing-game-over-actions" };

    const cr = card.getBoundingClientRect();
    const br = alignTarget.getBoundingClientRect();
    const widthDelta = Math.abs(cr.width - br.width);
    const leftDelta = Math.abs(cr.left - br.left);

    return {
      ok: widthDelta <= 2 && leftDelta <= 2,
      cardWidth: cr.width,
      btnWidth: br.width,
      widthDelta,
      leftDelta,
      usedActionsContainer: !primaryVisible,
    };
  });
}

async function gameHudClipCheck(page) {
  return page.evaluate(() => {
    const chip = document.getElementById("milestoneChip");
    const badge = document.getElementById("gameRankBadge");
    if (!chip || !badge) return { ok: false, reason: "missing-hud" };

    const chipOk = chip.scrollWidth <= chip.clientWidth + 1;
    const badgeOk = badge.scrollWidth <= badge.clientWidth + 1;
    return { ok: chipOk && badgeOk, chipOk, badgeOk };
  });
}

async function playerClimberClipCheck(page) {
  return page.evaluate(() => {
    const playArea = document.getElementById("gamePlayArea");
    const climber = document.getElementById("playerClimber");
    if (!playArea || !climber) return { ok: false, reason: "missing-player" };

    const playRect = playArea.getBoundingClientRect();
    const climberRect = climber.getBoundingClientRect();
    const ok =
      climberRect.left >= playRect.left - 1 &&
      climberRect.right <= playRect.right + 1;
    return { ok, left: climberRect.left, right: climberRect.right, playLeft: playRect.left, playRight: playRect.right };
  });
}

async function rejectedStampClipCheck(page) {
  return page.evaluate(() => {
    const card = document.querySelector("#gameOverScreen .card-performance");
    if (!card) return { ok: false, reason: "missing-card" };
    const stamp = card.querySelector(".rounded-full.font-black");
    if (!stamp) return { ok: false, reason: "missing-stamp" };

    const cardRect = card.getBoundingClientRect();
    const stampRect = stamp.getBoundingClientRect();
    const ok =
      stampRect.left >= cardRect.left - 1 &&
      stampRect.right <= cardRect.right + 1 &&
      stampRect.top >= cardRect.top - 1 &&
      stampRect.bottom <= cardRect.bottom + 1;
    return { ok };
  });
}

async function waitForApp(page) {
  await page.waitForSelector("#startScreen", { timeout: 15000 });
  await page.waitForFunction(() => typeof window.switchTab === "function", { timeout: 5000 });
  await page.waitForFunction(() => typeof window.startGame === "function", { timeout: 5000 });
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
      await page.evaluate(() => document.documentElement.classList.add("cl-in-telegram"));
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
        failures.push({
          viewport: vp.label,
          screen: screen.label,
          type: "horizontal-overflow",
          scrollWidth,
          clientWidth,
        });
      }

      if (screen.id === "start") {
        const homeCta = await homeCtaReachable(page);
        if (!homeCta.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "home-cta-not-reachable",
            ...homeCta,
          });
        }

        if (vp.width === 320 && vp.height === 568) {
          const homeBrand = await homeBrandVisibleWithoutScroll(page);
          if (!homeBrand.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "home-brand-not-visible",
              ...homeBrand,
            });
          }

          const homeNav = await homeSecondaryNavVisibleWithoutScroll(page);
          if (!homeNav.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "home-secondary-nav-not-visible",
              ...homeNav,
            });
          }
        }

        if (vp.width === 320 || vp.width === 390) {
          const homeAlign = await homeColumnAlignment(page);
          if (!homeAlign.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "home-column-mismatch",
              ...homeAlign,
            });
          }

          const homeCopy = await homeMechanicCopyVisible(page);
          if (!homeCopy.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "home-mechanic-copy",
              ...homeCopy,
            });
          }
        }
      }

      if (screen.id === "game") {
        const ratio = await playAreaRatio(page);
        if (ratio < MIN_PLAY_AREA_RATIO) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "play-area-ratio",
            ratio,
            min: MIN_PLAY_AREA_RATIO,
          });
        }

        const hint = await hudTapHintReferencesDeck(page);
        if (!hint.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "hud-tap-hint-copy",
            ...hint,
          });
        }

        if (vp.width === 320 && vp.height === 800) {
          const memoStable = await memoPlayAreaStability(page);
          if (!memoStable.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "memo-play-area-stability",
              ...memoStable,
            });
          }
        }

        const fit = await rungFit(page);
        if (!fit.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "rung-fit",
            ...fit,
          });
        }

        const tapBar = await tapBarVisible(page);
        if (!tapBar) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "tap-bar-missing",
          });
        }

        if (vp.width === 320 || vp.width === 390) {
          const column = await gameStackColumnAlignment(page);
          if (!column.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "game-stack-column-mismatch",
              ...column,
            });
          }

          const hudClip = await gameHudClipCheck(page);
          if (!hudClip.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "game-hud-text-clip",
              ...hudClip,
            });
          }

          const playerClip = await playerClimberClipCheck(page);
          if (!playerClip.ok) {
            failures.push({
              viewport: vp.label,
              screen: screen.label,
              type: "player-climber-clip",
              ...playerClip,
            });
          }
        }
      }

      if (screen.id === "gameover" && (vp.width === 320 || vp.width === 390)) {
        const goAlign = await gameOverColumnAlignment(page);
        if (!goAlign.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "game-over-column-mismatch",
            ...goAlign,
          });
        }

        const lbFullWidth = await gameOverLeaderboardFullWidth(page);
        if (!lbFullWidth.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "game-over-leaderboard-not-full-width",
            ...lbFullWidth,
          });
        }

        const cardActionsGap = await gameOverCardActionsGap(page, vp.width);
        if (!cardActionsGap.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "game-over-card-actions-gap",
            ...cardActionsGap,
          });
        }

        const stampClip = await rejectedStampClipCheck(page);
        if (!stampClip.ok) {
          failures.push({
            viewport: vp.label,
            screen: screen.label,
            type: "rejected-stamp-clip",
            ...stampClip,
          });
        }
      }
    }

    await context.close();
  }

  await browser.close();

  if (failures.length) {
    console.error("VIEWPORT QA FAILED:\n", JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log(
    "VIEWPORT QA PASSED: no horizontal overflow at 320–768px; home CTA reachable at 320x568; home Prompt Anatomy brand visible without scroll at 320x568; game play area >= 50%; memo visible does not reflow play area at 320x800; HUD hint references tap deck; tap deck visible (h-28); 7 rungs fit (Telegram mode); game HUD, play area, and tap deck share one content column at 320px and 390px; game-over card matches CTA width; REJECTED stamp, HUD text, and player sprite not clipped."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
