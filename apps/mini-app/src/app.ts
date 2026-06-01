import {
  CEO_TRAP_ANNOUNCEMENT,
  DEATH_EMOJI,
  DEATH_LABELS,
  MAX_VISIBLE_RUNGS,
  MIN_TAP_INTERVAL_MS,
  REAPPLY_STORAGE_KEY,
  RETRY_TIPS,
  floorLabel,
  formatTickerText,
  milestoneLabel,
  pickTickerHeadline,
  rankEmoji,
  rankFromYears,
  rankPropEmoji,
  reappliesFlavor,
  type TickerHeadline,
} from "./game/constants";
import { type DailyModifier, resolveDailyModifier } from "./game/daily-modifier";
import { GameEngine } from "./game/engine";
import {
  buildOgCaptureRungs,
  OG_CAPTURE_DAILY_MODIFIER,
  OG_CAPTURE_ENERGY,
  OG_CAPTURE_PLAYER_SIDE,
  OG_CAPTURE_RANK,
  OG_CAPTURE_SCORE,
  OG_CAPTURE_YEARS,
} from "./game/og-capture";
import type { GameOverResult, ObstacleType, PlayerSide, Rank, Rung } from "./game/types";
import { fetchLeaderboard, fetchProfile, submitRun, type ApiFailureReason, type LeaderboardEntry, type LeaderboardResult, type SubmitRunResult } from "./lib/api";
import { debugLog, describeNextRung, mountDebugStrip, shouldShowImminentHint } from "./lib/debug";
import { getPromptAnatomyShareLine, openPromptAnatomy } from "./lib/branding";
import { hideHrMemo, showHrMemo, showHrMemoCombined } from "./lib/hr-memo";
import {
  applyReorgSlide,
  flashBurnoutStress,
  spawnFloatingParticles,
  triggerClimbPop,
  triggerCoffeePickup,
  triggerDeathEmoji,
  triggerDeathFlash,
  triggerDeathCauseHold,
  triggerMeterFlash,
  triggerRankPop,
  triggerReorgTelegraph,
  triggerRungAdvance,
  triggerShake,
} from "./lib/effects";
import {
  disableVerticalSwipe,
  enableVerticalSwipe,
  getBotUsername,
  getDisplayName,
  getInitData,
  hapticImpact,
  hapticNotification,
  hideTelegramBack,
  initTelegram,
  isTelegram,
  showTelegramBack,
} from "./lib/telegram";
import { audio } from "./game/audio";

type Screen = "home" | "game" | "gameover" | "leaderboard" | "howtoplay";
type LeaderboardPeriod = "daily" | "weekly";

let username = "CorporateSlave";
let highScore = 0;
let bestRank = "Intern";
let lastGameResult: GameOverResult | null = null;
let leaderboardPeriod: LeaderboardPeriod = "daily";
let engine: GameEngine;
let prevRungsSnapshot: Rung[] = [];
let playerInPanic = false;
let earlyTapsRemaining = 0;
let playerEmojiFlashTimer: ReturnType<typeof setTimeout> | null = null;
let activeDailyModifier: DailyModifier = resolveDailyModifier();
let shiftToastShown = false;
let activeTickerHeadline: TickerHeadline = pickTickerHeadline();
let lastHeartbeatAt = 0;
let ceoTrapShown = false;
let emojiFlashLock = false;
let playerAtCorridor = true;

type PlayerLayout = PlayerSide | "center";

const GRID_TINT_CLASSES = ["office-grid-reorg-week"] as const;

const $ = (id: string) => document.getElementById(id)!;

function isOgCaptureMode(): boolean {
  return new URLSearchParams(window.location.search).get("og") === "1";
}

function flashPlayerEmoji(emoji: string, ms: number): void {
  if (playerEmojiFlashTimer) clearTimeout(playerEmojiFlashTimer);
  emojiFlashLock = true;
  $("playerActionEmoji").textContent = emoji;
  playerEmojiFlashTimer = setTimeout(() => {
    playerEmojiFlashTimer = null;
    emojiFlashLock = false;
    if (playerInPanic) {
      $("playerActionEmoji").textContent = "😰";
    } else if (engine?.isActive()) {
      $("playerActionEmoji").textContent = rankEmoji(engine.getCurrentRank());
    }
  }, ms);
}

function findImminentCoffeeBadge(side: PlayerSide): HTMLElement | null {
  const imminent = $("rungsContainer").querySelector(".next-rung");
  if (!imminent) return null;
  const slot = imminent.querySelector(side === "left" ? ".left-slot" : ".right-slot");
  return slot?.querySelector(".coffee-badge") as HTMLElement | null;
}

function updateRankProp(rank: Rank): void {
  $("playerRankProp").textContent = rankPropEmoji(rank);
}

function updateFloorLabel(years: number): void {
  $("floorLabel").textContent = floorLabel(years);
}

function updateReorgHudStrip(rank: Rank): void {
  const show = rank !== "Intern" || activeDailyModifier.allowEarlyReorg;
  $("reorgHudStrip").classList.toggle("hidden", !show);
}

function mountTickerHeadline(): void {
  activeTickerHeadline = pickTickerHeadline();
  const formatted = formatTickerText(activeTickerHeadline);
  $("newsTickerText").textContent = `${formatted}     ${formatted}`;
  engine?.setActiveTicker(activeTickerHeadline);
}

function getReapplyCount(): number {
  try {
    return parseInt(localStorage.getItem(REAPPLY_STORAGE_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementReapplyCount(): number {
  const next = getReapplyCount() + 1;
  try {
    localStorage.setItem(REAPPLY_STORAGE_KEY, String(next));
  } catch {
    /* ignore */
  }
  return next;
}

function updateImminentRungHint(): void {
  const hint = $("imminentHint");
  if (!engine?.isActive()) {
    hint.classList.add("hidden");
    return;
  }
  const next = engine.getRungs()[1];
  if (!shouldShowImminentHint(engine.getRungsClimbed())) {
    hint.classList.add("hidden");
    return;
  }
  hint.textContent = describeNextRung(next);
  hint.classList.remove("hidden");
}

function updateMilestoneChip(years: number): void {
  const chip = $("milestoneChip");
  chip.textContent = milestoneLabel(years);
  chip.title = milestoneLabel(years);
}

function showToast(msg: string, opts?: { surface?: "shell" | "game" }): void {
  const toast = $("toastNotification");
  const inGame = !$("gameScreen").classList.contains("hidden");
  toast.classList.toggle("toast-above-tap-deck", inGame && opts?.surface !== "shell");
  $("toastText").textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

function submitFailureMessage(reason: ApiFailureReason): string {
  const bot = getBotUsername();
  if (reason === "auth") {
    return `HR couldn't verify your badge. Reopen from @${bot}.`;
  }
  if (reason === "rate_limit") {
    return "Score filing cooldown. Retry from game over in a few seconds.";
  }
  return "Score not filed with HR. Check connection.";
}

function showAuthDegradedBanner(): void {
  const bot = getBotUsername();
  $("authDegradedText").textContent = `Session expired or offline. Reopen from @${bot} to sync scores.`;
  $("authDegradedBanner").classList.remove("hidden");
}

function hideAuthDegradedBanner(): void {
  $("authDegradedBanner").classList.add("hidden");
}

function dismissAuthBanner(): void {
  hideAuthDegradedBanner();
}

function syncTelegramBackButton(tab: Screen): void {
  if (!isTelegram()) return;
  if (tab === "home") {
    hideTelegramBack();
    return;
  }
  showTelegramBack(() => {
    if (tab === "game" && engine?.isActive()) {
      engine.stop();
      enableVerticalSwipe();
    }
    goHome();
  });
}

function switchTab(tab: Screen): void {
  ["startScreen", "gameScreen", "gameOverScreen", "leaderboardScreen", "howToPlayScreen"].forEach((id) => {
    $(id).classList.add("hidden");
    $(id).classList.remove("flex");
  });

  const map: Record<Screen, string> = {
    home: "startScreen",
    game: "gameScreen",
    gameover: "gameOverScreen",
    leaderboard: "leaderboardScreen",
    howtoplay: "howToPlayScreen",
  };
  const el = $(map[tab]);
  el.classList.remove("hidden");
  el.classList.add("flex");
  syncTelegramBackButton(tab);
  audio.nav();
  if (tab === "game") {
    requestAnimationFrame(() => layoutRungs());
  }
}

const RANK_BADGE: Record<Rank, string> = {
  Intern: "badge-rank-intern mt-0.5",
  Manager: "badge-rank-manager mt-0.5",
  CEO: "badge-rank-ceo mt-0.5",
};

function updateRankUI(rank: Rank, updatePlayer = true): void {
  const emoji = rankEmoji(rank);
  $("rankBadgeIcon").textContent = emoji;
  $("rankBadgeText").textContent = rank;
  if (updatePlayer && !playerInPanic && !emojiFlashLock) {
    $("playerActionEmoji").textContent = emoji;
  }
  $("avatarIcon").textContent = emoji;
  $("userTitleLabel").textContent = `Rank achieved: ${rank}`;
  $("gameRankBadge").className = RANK_BADGE[rank];
  updateRankProp(rank);
  updateReorgHudStrip(rank);
}

function setPlayerPanic(on: boolean): void {
  playerInPanic = on;
  $("playerClimber").classList.toggle("player-panic", on);
  if (emojiFlashLock) return;
  if (on) {
    $("playerActionEmoji").textContent = "😰";
  } else {
    $("playerActionEmoji").textContent = rankEmoji(engine.getCurrentRank());
  }
}

function refreshDailyShiftUI(): void {
  activeDailyModifier = resolveDailyModifier();
  $("dailyShiftLabel").textContent = activeDailyModifier.label;
  $("dailyShiftDescription").textContent = activeDailyModifier.description;
  const pill = $("dailyShiftPill");
  if (pill) {
    pill.title = activeDailyModifier.description;
    pill.classList.toggle("ticker-shift-emphasis", activeDailyModifier.id !== "standard");
  }

  const viewport = document.querySelector(".cl-viewport");
  if (viewport) {
    for (const cls of GRID_TINT_CLASSES) {
      viewport.classList.remove(cls);
    }
    if (activeDailyModifier.gridTintClass) {
      viewport.classList.add(activeDailyModifier.gridTintClass);
    }
  }

  const block = $("dailyShiftBlock");
  block.classList.remove("shift-badge-enter");
  void block.offsetWidth;
  block.classList.add("shift-badge-enter");
  mountTickerHeadline();
}

function createObstacleBadge(type: ObstacleType, rungId: number, isImminent = false): HTMLElement {
  const badge = document.createElement("div");
  badge.className =
    "obstacle-badge w-12 h-10 rounded-lg flex flex-col items-center justify-center border shadow-sm text-center transform scale-95 select-none obstacle-pulse";
  if (type === "meeting") {
    badge.className += " bg-red-100 border-red-300 text-red-700";
    if (activeDailyModifier.id === "meeting_monday" && rungId % 2 === 0) {
      badge.innerHTML = `<span class="text-lg leading-none">📧</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Reply-All</span>`;
    } else if (activeDailyModifier.id === "meeting_monday") {
      badge.innerHTML = `<span class="text-lg leading-none">🧍</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Standup</span>`;
    } else {
      badge.innerHTML = `<span class="text-lg leading-none">📅</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Meeting</span>`;
    }
  } else if (type === "reorg") {
    badge.className += " bg-amber-100 border-amber-300 text-amber-800";
    if (isImminent) {
      badge.innerHTML = `<span class="text-lg leading-none">🧊</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Frozen</span>`;
    } else {
      badge.innerHTML = `<span class="text-lg leading-none">🔄</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Reorg</span>`;
    }
  } else if (type === "badge_gate") {
    badge.className += " bg-slate-100 border-slate-400 text-slate-800";
    badge.innerHTML = `<span class="text-lg leading-none">🪪</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Gate</span>`;
  } else if (type === "foliage") {
    badge.className += " bg-emerald-100 border-emerald-500 text-emerald-900";
    badge.innerHTML = `<span class="text-lg leading-none">🪴</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Plant</span>`;
  } else {
    badge.className += " bg-red-100 border-red-400 text-red-900";
    badge.innerHTML = `<span class="text-lg leading-none">⏰</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">Deadline</span>`;
  }
  return badge;
}

function createCoffeeBadge(): HTMLElement {
  const badge = document.createElement("div");
  badge.className =
    "coffee-badge obstacle-badge w-12 h-10 rounded-lg flex flex-col items-center justify-center border shadow-sm text-center transform scale-95 select-none coffee-bounce bg-emerald-100 border-emerald-400 text-emerald-800";
  badge.innerHTML = `<span class="text-lg leading-none">☕</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">+25%</span>`;
  return badge;
}

function slotContentKey(rung: Rung, side: "left" | "right"): string {
  if (side === "left") {
    if (rung.obstacle === "left") return `obs-${rung.type}`;
    if (rung.coffee === "left") return `coffee-${rung.id}`;
    return "empty";
  }
  if (rung.obstacle === "right") return `obs-${rung.type}`;
  if (rung.coffee === "right") return `coffee-${rung.id}`;
  return "empty";
}

function fillSlot(slotEl: HTMLElement, rung: Rung, side: "left" | "right", isImminent = false): void {
  const key = slotContentKey(rung, side);
  if (slotEl.dataset.contentKey === key && slotEl.dataset.imminent === String(isImminent)) return;
  slotEl.dataset.contentKey = key;
  slotEl.dataset.imminent = String(isImminent);
  slotEl.innerHTML = "";
  if (side === "left") {
    if (rung.obstacle === "left") slotEl.appendChild(createObstacleBadge(rung.type!, rung.id, isImminent));
    else if (rung.coffee === "left") slotEl.appendChild(createCoffeeBadge());
  } else {
    if (rung.obstacle === "right") slotEl.appendChild(createObstacleBadge(rung.type!, rung.id, isImminent));
    else if (rung.coffee === "right") slotEl.appendChild(createCoffeeBadge());
  }
}

const RUNG_HEIGHT_MAX = 52;
const RUNG_HEIGHT_MIN = 32;

function layoutTrackMetrics(): void {
  const playArea = $("gamePlayArea");
  const slot = playArea.querySelector(".left-slot") as HTMLElement | null;
  if (!slot) return;
  const width = Math.round(slot.getBoundingClientRect().width);
  if (width <= 0) return;
  playArea.style.setProperty("--slot-width", `${width}px`);
  playArea.style.setProperty("--reorg-slide-distance", `${width}px`);
}

function layoutPlayerPosition(side: PlayerLayout): void {
  const playArea = $("gamePlayArea");
  const climber = $("playerClimber");
  const playRect = playArea.getBoundingClientRect();
  const climberW = climber.offsetWidth;
  let anchor: HTMLElement | null = null;

  if (side === "center") {
    anchor =
      (playArea.querySelector(".next-rung .rung-center") as HTMLElement | null) ??
      (playArea.querySelector("[data-rung-slot='1'] .rung-center") as HTMLElement | null) ??
      ($("ladderTrack") as HTMLElement);
  } else {
    anchor = playArea.querySelector(
      side === "left" ? ".left-slot" : ".right-slot"
    ) as HTMLElement | null;
  }

  if (!anchor) return;

  const anchorRect = anchor.getBoundingClientRect();
  const rawLeft =
    anchorRect.left + anchorRect.width / 2 - playRect.left - playArea.clientLeft - climberW / 2;
  const maxLeft = Math.max(0, playArea.clientWidth - climberW);
  const left = Math.max(0, Math.min(maxLeft, rawLeft));
  climber.style.left = `${Math.round(left)}px`;
}

function layoutRungs(): void {
  const playArea = $("gamePlayArea");
  const h = playArea.clientHeight;
  if (h <= 0) return;
  const perRung = Math.floor(h / MAX_VISIBLE_RUNGS);
  const rungHeight = Math.min(RUNG_HEIGHT_MAX, Math.max(RUNG_HEIGHT_MIN, perRung));
  playArea.querySelectorAll("[data-rung-slot]").forEach((el) => {
    (el as HTMLElement).style.height = `${rungHeight}px`;
  });
  layoutTrackMetrics();
}

function ensureRungSlot(container: HTMLElement, index: number): HTMLElement {
  let rungEl = container.querySelector(`[data-rung-slot="${index}"]`) as HTMLElement | null;
  if (rungEl) return rungEl;

  rungEl = document.createElement("div");
  rungEl.dataset.rungSlot = String(index);
  rungEl.className =
    "relative w-full flex justify-between items-center transition-all duration-75 select-none pointer-events-none";

  const connector = document.createElement("div");
  connector.className = "ladder-rung-connector";
  rungEl.appendChild(connector);

  const leftSlot = document.createElement("div");
  leftSlot.className =
    "left-slot flex-1 min-w-0 max-w-[5.5rem] h-12 flex items-center justify-center relative z-10";
  rungEl.appendChild(leftSlot);

  const center = document.createElement("div");
  center.className =
    "rung-center shrink-0 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center z-10";
  rungEl.appendChild(center);

  const rightSlot = document.createElement("div");
  rightSlot.className =
    "right-slot flex-1 min-w-0 max-w-[5.5rem] h-12 flex items-center justify-center relative z-10";
  rungEl.appendChild(rightSlot);

  container.appendChild(rungEl);
  return rungEl;
}

function diffReorgSwaps(prev: Rung[], next: Rung[]): { rungId: number; toSide: PlayerSide }[] {
  const swaps: { rungId: number; toSide: PlayerSide }[] = [];
  for (const nextRung of next) {
    const prevRung = prev.find((r) => r.id === nextRung.id);
    if (!prevRung || nextRung.type !== "reorg" || !nextRung.obstacle) continue;
    if (prevRung.obstacle !== nextRung.obstacle) {
      swaps.push({ rungId: nextRung.id, toSide: nextRung.obstacle });
    }
  }
  return swaps;
}

function didAdvanceRungs(prev: Rung[], next: Rung[]): boolean {
  return prev.length > 0 && next.length > 0 && prev.length === next.length && prev[1]?.id === next[0]?.id;
}

function renderRungsInner(): void {
  const container = $("rungsContainer");
  const rungs = engine.getRungs();
  const reorgSwaps = diffReorgSwaps(prevRungsSnapshot, rungs);
  const advanced = didAdvanceRungs(prevRungsSnapshot, rungs);

  for (let i = 0; i < MAX_VISIBLE_RUNGS; i++) {
    const rungEl = ensureRungSlot(container, i);
    const rung = rungs[i];
    if (!rung) {
      rungEl.style.visibility = "hidden";
      rungEl.classList.remove("next-rung");
      continue;
    }
    rungEl.style.visibility = "visible";
    rungEl.dataset.rungId = String(rung.id);
    rungEl.classList.toggle("next-rung", i === 1);

    const leftSlot = rungEl.querySelector(".left-slot") as HTMLElement;
    const rightSlot = rungEl.querySelector(".right-slot") as HTMLElement;
    const isImminent = i === 1;
    fillSlot(leftSlot, rung, "left", isImminent);
    fillSlot(rightSlot, rung, "right", isImminent);

    leftSlot.classList.remove("safe-side-hint", "next-obstacle-warn", "next-coffee-hint");
    rightSlot.classList.remove("safe-side-hint", "next-obstacle-warn", "next-coffee-hint");

    if (earlyTapsRemaining > 0 && i === 1) {
      leftSlot.classList.toggle("safe-side-hint", rung.obstacle !== "left");
      rightSlot.classList.toggle("safe-side-hint", rung.obstacle !== "right");
    }

    if (i === 1 && rung.obstacle) {
      const blockedSlot = rung.obstacle === "left" ? leftSlot : rightSlot;
      const badge = blockedSlot.querySelector(".obstacle-badge") as HTMLElement | null;
      badge?.classList.add("next-obstacle-warn");
    }

    if (i === 1) {
      if (rung.coffee === "left") leftSlot.classList.add("next-coffee-hint");
      else if (rung.coffee === "right") rightSlot.classList.add("next-coffee-hint");
    }

    const centerEl = rungEl.querySelector(".rung-center") as HTMLElement;
    const corridorClear = !rung.obstacle && !rung.coffee;
    centerEl.classList.toggle("rung-center--corridor", corridorClear);
    centerEl.classList.toggle("rung-center--corridor-imminent", i === 1 && corridorClear);

    const swap = reorgSwaps.find((s) => s.rungId === rung.id);
    if (swap && i !== 1) {
      const slotSelector = swap.toSide === "left" ? ".left-slot" : ".right-slot";
      const badge = rungEl.querySelector(`${slotSelector} .obstacle-badge`) as HTMLElement | null;
      if (badge) {
        triggerReorgTelegraph(badge, swap.toSide, () => applyReorgSlide(badge, swap.toSide));
      }
    }
  }

  while (container.children.length > MAX_VISIBLE_RUNGS) {
    container.removeChild(container.lastChild!);
  }

  if (advanced) triggerRungAdvance(container);
  prevRungsSnapshot = rungs.map((r) => ({ ...r }));
  layoutRungs();
  if (engine.isActive()) {
    layoutPlayerPosition(playerAtCorridor ? "center" : engine.getPlayerSide());
  }
  updateImminentRungHint();
  maybeShowCeoTrapMemo();
}

function maybeShowCeoTrapMemo(): void {
  if (ceoTrapShown || engine.getCurrentRank() !== "CEO") return;
  const next = engine.getRungs()[1];
  if (next?.type === "burnout") {
    ceoTrapShown = true;
    showHrMemo(CEO_TRAP_ANNOUNCEMENT, { variant: "promo", durationMs: 2500 });
  }
}

function renderRungsWithReorgFeedback(): void {
  const rungs = engine.getRungs();
  const hadReorg = diffReorgSwaps(prevRungsSnapshot, rungs).length > 0;
  renderRungsInner();
  if (hadReorg && Math.random() < 0.3) {
    hapticImpact("light");
  }
}

function updatePlayerPosition(side: PlayerSide): void {
  playerAtCorridor = false;
  $("playerClimber").classList.remove("player-at-corridor");
  layoutPlayerPosition(side);
  triggerClimbPop($("playerClimber"));
  hapticImpact("light");
}

function renderLeaderboardSkeleton(list: HTMLElement): void {
  list.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const row = document.createElement("div");
    row.className = "lb-skeleton-row flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white";
    row.innerHTML = `
      <div class="flex items-center space-x-3 flex-1">
        <div class="w-6 h-3 bg-slate-200 rounded"></div>
        <div class="w-8 h-8 bg-slate-200 rounded-full"></div>
        <div class="flex-1 space-y-1.5">
          <div class="h-3 bg-slate-200 rounded w-24"></div>
          <div class="h-2 bg-slate-100 rounded w-16"></div>
        </div>
      </div>
      <div class="h-4 bg-slate-200 rounded w-10"></div>`;
    list.appendChild(row);
  }
}

async function renderLeaderboard(): Promise<void> {
  const list = $("leaderboardList");
  renderLeaderboardSkeleton(list);

  const result = await fetchLeaderboard(leaderboardPeriod, getInitData());
  list.innerHTML = "";

  if (!result.ok) {
    list.innerHTML =
      '<p class="text-xs text-red-600 text-center py-4 font-semibold">Leaderboard offline. HR will refresh when connection returns.</p>';
    return;
  }

  const entries = result.entries;

  if (entries.length === 0) {
    list.innerHTML =
      '<p class="text-xs text-slate-500 text-center py-4 italic">No terminations recorded yet. HR is optimistic.</p>';
    return;
  }

  entries.forEach((player: LeaderboardEntry, index: number) => {
    const item = document.createElement("div");
    item.className = `lb-row flex items-center justify-between p-3 rounded-xl border transition duration-150 ${
      player.is_current_user ? "lb-row-self" : "bg-white border-slate-200"
    }`;
    item.style.setProperty("--i", String(index));
    const medal = player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : player.rank === 3 ? "🥉" : `#${player.rank}`;
    const emoji = rankEmoji(player.final_rank as Rank);
    item.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="w-6 text-xs font-bold text-slate-400 text-center">${medal}</span>
        <span class="text-base">${emoji}</span>
        <div>
          <p class="text-xs font-extrabold ${player.is_current_user ? "text-indigo-900" : "text-slate-800"}">${player.username}</p>
          <p class="text-nano text-slate-400 font-semibold uppercase">${player.final_rank}</p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs font-black text-slate-900">${player.years_survived.toFixed(1)}</span>
        <span class="text-nano font-bold text-slate-400 block">Years</span>
      </div>`;
    list.appendChild(item);
  });
}

function setLeaderboardPeriod(period: LeaderboardPeriod): void {
  leaderboardPeriod = period;
  document.querySelectorAll("[data-lb-tab]").forEach((btn) => {
    const el = btn as HTMLElement;
    if (el.dataset.lbTab === period) {
      el.className = "lb-tab-active";
    } else {
      el.className = "lb-tab-inactive";
    }
  });
  renderLeaderboard();
}

let tapHintTimer: ReturnType<typeof setTimeout> | null = null;
let tapDeckHintTimer: ReturnType<typeof setTimeout> | null = null;

function showTapDeckHint(): void {
  $("tapControlsBar").classList.add("tap-deck-hint");
  if (tapDeckHintTimer) clearTimeout(tapDeckHintTimer);
  tapDeckHintTimer = setTimeout(() => hideTapDeckHint(), 3000);
}

function hideTapDeckHint(): void {
  if (tapDeckHintTimer) clearTimeout(tapDeckHintTimer);
  tapDeckHintTimer = null;
  $("tapControlsBar").classList.remove("tap-deck-hint");
}

function showHudTapHint(): void {
  $("hudTapHint").classList.remove("hidden");
  if (tapHintTimer) clearTimeout(tapHintTimer);
  tapHintTimer = setTimeout(() => $("hudTapHint").classList.add("hidden"), 3000);
}

function hideHudTapHint(): void {
  if (tapHintTimer) clearTimeout(tapHintTimer);
  tapHintTimer = null;
  $("hudTapHint").classList.add("hidden");
}

function hideImminentHint(): void {
  $("imminentHint").classList.add("hidden");
}

function startGame(): void {
  hideHrMemo();
  hideHudTapHint();
  hideImminentHint();
  hideTapDeckHint();
  $("burnoutMeter").className =
    "h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-75";
  $("burnoutMeter").style.width = "100%";
  showHudTapHint();
  showTapDeckHint();
  flashBurnoutStress(false);
  playerInPanic = false;
  playerAtCorridor = true;
  $("playerClimber").classList.remove("player-panic");
  $("playerClimber").classList.add("player-at-corridor");
  $("playerActionEmoji").classList.add("idle-bob");
  prevRungsSnapshot = [];
  lastPointerTapAt = 0;
  earlyTapsRemaining = 5;
  shiftToastShown = false;
  ceoTrapShown = false;
  activeDailyModifier = engine.getDailyModifier();
  engine.setActiveTicker(activeTickerHeadline);
  disableVerticalSwipe();
  engine.start();
  updateRankUI("Intern");
  updateMilestoneChip(0);
  updateFloorLabel(0);
  updateReorgHudStrip("Intern");
  switchTab("game");
  requestAnimationFrame(() => {
    layoutRungs();
    layoutPlayerPosition("center");
  });
}

function goHome(): void {
  engine.stop();
  hideHrMemo();
  hideHudTapHint();
  hideTapDeckHint();
  flashBurnoutStress(false);
  playerInPanic = false;
  enableVerticalSwipe();
  refreshDailyShiftUI();
  switchTab("home");
}

function applyLeaderboardGap(result: GameOverResult, lbResult: LeaderboardResult): void {
  const gapEl = $("leaderboardGapLine");
  if (!lbResult.ok) {
    gapEl.textContent = "";
    gapEl.classList.add("hidden");
    return;
  }
  const top = lbResult.entries[0];
  if (top && top.years_survived > result.yearsSurvived) {
    const gap = top.years_survived - result.yearsSurvived;
    gapEl.textContent = `#1 is ${gap.toFixed(1)}y ahead`;
    gapEl.classList.remove("hidden");
  } else if (top?.is_current_user) {
    gapEl.textContent = "You're #1 on today's board.";
    gapEl.classList.remove("hidden");
  } else {
    gapEl.textContent = "";
    gapEl.classList.add("hidden");
  }
}

function refreshCareerHighOnGameOver(): void {
  if (highScore > 0 && bestRank) {
    $("careerHighLine").textContent = `Career high: ${bestRank} (${highScore.toFixed(1)}y)`;
  }
}

function showSubmitResultToast(submitResult: SubmitRunResult | null): void {
  if (!submitResult) return;
  if (!$("gameOverScreen").classList.contains("hidden")) {
    if (submitResult.ok) {
      showToast("Score submitted to the boardroom!", { surface: "shell" });
    } else {
      showToast(submitFailureMessage(submitResult.reason), { surface: "shell" });
    }
  }
}

async function runPostGameOverIo(
  result: GameOverResult,
  initData: string
): Promise<{ submitResult: SubmitRunResult | null; lbResult: LeaderboardResult }> {
  const lbPromise = fetchLeaderboard("daily", initData || undefined);
  let submitResult: SubmitRunResult | null = null;

  if (initData) {
    submitResult = await submitRun(initData, {
      yearsSurvived: result.yearsSurvived,
      finalRank: result.finalRank,
      terminationCause: result.terminationCause,
      rungsClimbed: result.rungsClimbed,
    });
    if (submitResult.ok) {
      if (result.yearsSurvived > highScore) {
        highScore = result.yearsSurvived;
        bestRank = result.finalRank;
        $("highScoreBadge").textContent = `${highScore.toFixed(1)} Years`;
      }
      const profileResult = await fetchProfile(initData);
      if (profileResult.ok) {
        highScore = profileResult.profile.best_score;
        bestRank = profileResult.profile.best_rank || result.finalRank;
        $("highScoreBadge").textContent = `${highScore.toFixed(1)} Years`;
        refreshCareerHighOnGameOver();
      }
    }
  }

  const lbResult = await lbPromise;
  return { submitResult, lbResult };
}

function seedGameOverForQa(): void {
  lastGameResult = {
    yearsSurvived: 4.5,
    finalRank: "Intern",
    deathType: "meeting",
    terminationCause: "Meeting collision",
    terminationDetail: "Attended one meeting too many.",
    terminationFlavor: "Your calendar owned you.",
    rungsClimbed: 18,
  };
  $("statYears").textContent = "4.5 Years";
  $("statRank").innerHTML = `<span>${rankEmoji("Intern")}</span> Intern`;
  $("terminationCauseIcon").textContent = DEATH_EMOJI.meeting;
  $("terminationCauseLabel").textContent = DEATH_LABELS.meeting;
  $("terminationReason").textContent = `"${lastGameResult.terminationDetail}"`;
  $("retryTip").textContent = RETRY_TIPS.meeting;
  $("terminationFlavor").textContent = `"${lastGameResult.terminationFlavor}"`;
  $("reviewId").textContent = "REF-89412";
  $("statBestDelta").textContent = "";
  $("careerHighLine").textContent = "";
  $("leaderboardGapLine").textContent = "";
  $("leaderboardGapLine").classList.add("hidden");
  $("reapplyFlavorLine").textContent = reappliesFlavor(1);
}

async function onGameOver(result: GameOverResult): Promise<void> {
  debugLog("gameover", "collision/death", { deathType: result.deathType });
  hideHrMemo();
  hideHudTapHint();
  hideImminentHint();
  lastGameResult = result;
  $("playerActionEmoji").classList.remove("idle-bob");

  const previousBest = highScore;

  if (result.yearsSurvived > highScore) {
    highScore = result.yearsSurvived;
    bestRank = result.finalRank;
    $("highScoreBadge").textContent = `${highScore.toFixed(1)} Years`;
    if (!isTelegram()) {
      localStorage.setItem("corp_ladder_highscore", String(highScore));
    }
  }

  $("statYears").textContent = `${result.yearsSurvived.toFixed(1)} Years`;
  $("statRank").innerHTML = `<span>${rankEmoji(result.finalRank)}</span> ${result.finalRank}`;
  $("terminationCauseIcon").textContent = DEATH_EMOJI[result.deathType];
  $("terminationCauseLabel").textContent = DEATH_LABELS[result.deathType];
  $("terminationReason").textContent = `"${result.terminationDetail}"`;
  $("retryTip").textContent = RETRY_TIPS[result.deathType];
  $("terminationFlavor").textContent = `"${result.terminationFlavor}"`;
  $("reviewId").textContent = `REF-${Math.floor(10000 + Math.random() * 90000)}`;

  const reapplyCount = incrementReapplyCount();
  $("reapplyFlavorLine").textContent = reappliesFlavor(reapplyCount);

  if (highScore > 0 && bestRank) {
    $("careerHighLine").textContent = `Career high: ${bestRank} (${highScore.toFixed(1)}y)`;
  } else {
    $("careerHighLine").textContent = "";
  }

  if (result.yearsSurvived > previousBest) {
    const delta = previousBest > 0 ? result.yearsSurvived - previousBest : result.yearsSurvived;
    $("statBestDelta").textContent =
      previousBest > 0 ? `+${delta.toFixed(1)} Years (new record!)` : "New personal best!";
    $("statBestDelta").className = "text-nano font-bold text-emerald-600 mt-0.5";
  } else if (previousBest > 0) {
    $("statBestDelta").textContent = `${(previousBest - result.yearsSurvived).toFixed(1)} short of your best`;
    $("statBestDelta").className = "text-nano font-bold text-slate-500 mt-0.5";
  } else {
    $("statBestDelta").textContent = "";
  }

  const initData = getInitData();
  $("leaderboardGapLine").textContent = "";
  $("leaderboardGapLine").classList.add("hidden");

  const postGameIo = runPostGameOverIo(result, initData);

  flashBurnoutStress(false);
  setPlayerPanic(false);
  hapticNotification("error");
  triggerDeathFlash();

  triggerDeathEmoji(result.deathType, () => {
    triggerShake($("gameScreen"), () => {
      enableVerticalSwipe();
      switchTab("gameover");
      triggerDeathCauseHold($("terminationCauseRow"));
      void postGameIo.then(({ submitResult, lbResult }) => {
        applyLeaderboardGap(result, lbResult);
        showSubmitResultToast(submitResult);
      });
    });
  });
}

function buildShareText(): string {
  const years = lastGameResult?.yearsSurvived.toFixed(1) ?? "0.0";
  const rank = lastGameResult?.finalRank ?? "Intern";
  const botUser = import.meta.env.VITE_BOT_USERNAME ?? "CorporateLadderBot";
  const detail = lastGameResult?.terminationDetail ?? "";
  const flavor = lastGameResult?.terminationFlavor ?? "";

  const shiftLabel = lastGameResult
    ? engine.getDailyModifier().label
    : activeDailyModifier.label;

  return (
    `CORPORATE PERFORMANCE REVIEW\n` +
    `Employee: ${username}\n` +
    `${years} Years | Final Rank: ${rank}\n` +
    `Shift: ${shiftLabel}\n` +
    `Cause: ${detail}\n` +
    `"${flavor}"\n` +
    `Play Corporate Ladder on Telegram @${botUser}\n` +
    getPromptAnatomyShareLine()
  );
}

function copyShareText(): void {
  const text = buildShareText();
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast("Review copied! Paste into Telegram to share."),
      () => showToast("Could not copy — try again.")
    );
  } else {
    showToast("Could not copy — try again.");
  }
}

function toggleMute(): void {
  audio.setMuted(!audio.isMuted());
  const icon = $("soundIcon");
  const inGame = engine?.isActive();
  if (audio.isMuted()) {
    icon.className = "fa-solid fa-volume-xmark text-red-400";
    if (inGame) {
      showHrMemo("Synthesizer muted.", { variant: "info", durationMs: 1500 });
    } else {
      showToast("Synthesizer Muted");
    }
  } else {
    icon.className = "fa-solid fa-volume-high";
    if (inGame) {
      showHrMemo("Synthesizer live.", { variant: "info", durationMs: 1500 });
    } else {
      showToast("Synthesizer Unmuted");
    }
    audio.init();
    audio.unmuteTest();
  }
}

let lastPointerTapAt = 0;

function bindTapButton(el: HTMLElement, side: PlayerSide): void {
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastPointerTapAt < MIN_TAP_INTERVAL_MS) {
      debugLog("tap", "ui throttle", { side, ms: now - lastPointerTapAt });
      showToast("Too fast — one tap per beat", { surface: "game" });
      hapticImpact("rigid");
      triggerClimbPop(el);
      return;
    }
    lastPointerTapAt = now;
    engine.handleTap(side);
    if (earlyTapsRemaining > 0) {
      earlyTapsRemaining--;
      if (earlyTapsRemaining === 0) hideTapDeckHint();
    }
  });
}

function mountOgCaptureMode(): void {
  document.documentElement.dataset.ogCapture = "1";
  activeDailyModifier = OG_CAPTURE_DAILY_MODIFIER;

  const viewport = document.querySelector(".cl-viewport");
  if (viewport) {
    for (const cls of GRID_TINT_CLASSES) {
      viewport.classList.remove(cls);
    }
    if (activeDailyModifier.gridTintClass) {
      viewport.classList.add(activeDailyModifier.gridTintClass);
    }
  }

  $("soundToggleBtn").classList.add("hidden");
  $("tapControlsBar").classList.add("hidden");
  hideHudTapHint();
  hideTapDeckHint();
  hideHrMemo();

  prevRungsSnapshot = [];
  earlyTapsRemaining = 0;
  playerInPanic = false;
  playerAtCorridor = false;
  $("playerActionEmoji").classList.remove("idle-bob");

  engine.applyOgCaptureSnapshot(
    buildOgCaptureRungs(),
    OG_CAPTURE_SCORE,
    OG_CAPTURE_ENERGY,
    OG_CAPTURE_PLAYER_SIDE,
    OG_CAPTURE_RANK
  );

  updateRankUI(OG_CAPTURE_RANK);
  updateMilestoneChip(OG_CAPTURE_YEARS);
  updateFloorLabel(OG_CAPTURE_YEARS);
  updateReorgHudStrip(OG_CAPTURE_RANK);
  $("burnoutMeter").style.width = `${OG_CAPTURE_ENERGY}%`;
  $("burnoutPercentLabel").textContent = `${OG_CAPTURE_ENERGY}%`;
  $("gameYearsLabel").textContent = OG_CAPTURE_YEARS.toFixed(1);

  switchTab("game");

  requestAnimationFrame(() => {
    layoutRungs();
    layoutPlayerPosition("center");
    requestAnimationFrame(() => {
      (window as unknown as Record<string, unknown>).__CL_OG_READY__ = true;
    });
  });
}

export function mountApp(): void {
  initTelegram();
  mountDebugStrip();
  username = getDisplayName();
  $("botHandleLabel").textContent = `@${getBotUsername()}`;

  const usernameInput = $("usernameInput") as HTMLInputElement;
  if (isTelegram()) {
    usernameInput.readOnly = true;
    usernameInput.classList.add("cursor-default", "username-readonly");
    usernameInput.title = "Name from your Telegram profile";
  } else {
    const saved = localStorage.getItem("corp_ladder_username");
    if (saved) username = saved;
  }

  engine = new GameEngine(
    {
      onScoreUpdate: (years, energy) => {
        $("gameYearsLabel").textContent = years.toFixed(1);
        if (earlyTapsRemaining > 0 && engine.getRungsClimbed() > 0) {
          triggerClimbPop($("gameYearsLabel"));
        }
        updateMilestoneChip(years);
        updateFloorLabel(years);
        updateReorgHudStrip(engine.getCurrentRank());
        $("burnoutMeter").style.width = `${energy}%`;
        $("burnoutPercentLabel").textContent = `${Math.round(energy)}%`;
        if (energy < 25) {
          $("burnoutMeter").className = "h-full bg-red-600 rounded-full transition-all duration-75 obstacle-pulse";
          flashBurnoutStress(true);
          if (!playerInPanic) setPlayerPanic(true);
        } else {
          $("burnoutMeter").className =
            "h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-75";
          flashBurnoutStress(false);
          if (playerInPanic) setPlayerPanic(false);
        }
        if (energy < 15 && engine.isActive()) {
          const now = Date.now();
          if (now - lastHeartbeatAt > 900) {
            lastHeartbeatAt = now;
            audio.heartbeat();
          }
        }
      },
      onRankChange: (rank, message) => {
        updateRankUI(rank, false);
        flashPlayerEmoji("😎", 400);
        triggerRankPop($("playerActionEmoji"));
        if (rank === "Manager") {
          showHrMemoCombined([message, "Reorgs now swap sides. Time your climbs."], {
            variant: "promo",
            durationMs: 3500,
          });
        } else if (rank === "CEO") {
          showHrMemo(message, { variant: "promo", durationMs: 2500 });
          showHrMemo("Deadlines joined the org chart. Good luck.", { variant: "alert", durationMs: 2500 });
        } else {
          showHrMemo(message, { variant: "promo", durationMs: 2000 });
        }
        hapticNotification("success");
        const promoEmoji = rank === "Manager" ? "📋" : rank === "CEO" ? "👑" : "🎉";
        spawnFloatingParticles($("playerClimber"), promoEmoji, 4);
      },
      onGameOver,
      onCoffee: (side, rungId) => {
        debugLog("coffee", "callback", { side, rungId });
        const badge = findImminentCoffeeBadge(side);
        if (badge) triggerCoffeePickup(badge);
        flashPlayerEmoji("🤤", 550);
        showHrMemo("+25% Energy Recovery! ☕", { variant: "info" });
        triggerMeterFlash($("burnoutMeter"));
        spawnFloatingParticles($("playerClimber"), "☕", 5);
        hapticImpact("medium");
      },
      onToast: (msg) => showHrMemo(msg, { variant: "info" }),
    },
    renderRungsWithReorgFeedback,
    updatePlayerPosition,
    () => {
      hideHudTapHint();
      showHrMemoCombined(
        [
          "You are in the corridor. Each tap picks LEFT or RIGHT on the next rung.",
          "Avoid hazards on the occupied side. Coffee on your side restores energy.",
        ],
        { variant: "info", durationMs: 4000 }
      );
      if (!shiftToastShown && activeDailyModifier.id !== "standard") {
        shiftToastShown = true;
        showHrMemo("Shift rules active", { variant: "alert" });
      }
    },
    isOgCaptureMode() ? OG_CAPTURE_DAILY_MODIFIER : undefined
  );

  ($("usernameInput") as HTMLInputElement).value = username;
  $("usernameInput").addEventListener("change", (e) => {
    if (isTelegram()) return;
    username = (e.target as HTMLInputElement).value.trim() || "CorporateSlave";
    localStorage.setItem("corp_ladder_username", username);
    showToast(`Profile Updated: ${username}`);
  });

  bindTapButton($("btnTapLeft"), "left");
  bindTapButton($("btnTapRight"), "right");

  const playArea = $("gamePlayArea");
  new ResizeObserver(() => {
    layoutRungs();
    if (engine.isActive()) {
      layoutPlayerPosition(playerAtCorridor ? "center" : engine.getPlayerSide());
    }
  }).observe(playArea);

  window.addEventListener("keydown", (e) => {
    if (!engine.isActive()) return;
    if (e.repeat) return;
    if (e.key === "ArrowLeft") engine.handleTap("left");
    if (e.key === "ArrowRight") engine.handleTap("right");
  });

  document.querySelectorAll("[data-lb-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setLeaderboardPeriod(btn.getAttribute("data-lb-tab") as LeaderboardPeriod));
  });

  (window as unknown as Record<string, unknown>).goHome = goHome;
  (window as unknown as Record<string, unknown>).startGame = startGame;
  (window as unknown as Record<string, unknown>).switchTab = (tab: string) => {
    if (tab === "leaderboard") {
      switchTab("leaderboard");
      renderLeaderboard();
    } else if (tab === "howtoplay") {
      switchTab("howtoplay");
    } else if (tab === "gameover") {
      seedGameOverForQa();
      switchTab("gameover");
    }
  };
  (window as unknown as Record<string, unknown>).copyShareText = copyShareText;
  (window as unknown as Record<string, unknown>).openPromptAnatomy = openPromptAnatomy;
  (window as unknown as Record<string, unknown>).toggleMute = toggleMute;
  (window as unknown as Record<string, unknown>).dismissAuthBanner = dismissAuthBanner;

  updateRankUI("Intern");
  if (isOgCaptureMode()) {
    mountOgCaptureMode();
    return;
  }

  refreshDailyShiftUI();
  syncTelegramBackButton("home");

  const initData = getInitData();
  if (initData) {
    fetchProfile(initData).then((result) => {
      if (result.ok) {
        hideAuthDegradedBanner();
        const profile = result.profile;
        highScore = profile.best_score;
        bestRank = profile.best_rank || "Intern";
        $("highScoreBadge").textContent = `${highScore.toFixed(1)} Years`;
        if (profile.first_name || profile.username) {
          username = profile.username ?? profile.first_name ?? username;
          ($("usernameInput") as HTMLInputElement).value = username;
        }
      } else {
        showAuthDegradedBanner();
      }
    });
  } else {
    const saved = localStorage.getItem("corp_ladder_highscore");
    if (saved) {
      highScore = parseFloat(saved);
      bestRank = rankFromYears(Math.floor(highScore));
      $("highScoreBadge").textContent = `${highScore.toFixed(1)} Years`;
    }
  }
}
