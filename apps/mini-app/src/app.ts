import {
  ANGEL_FAKE_PROMO,
  ANGEL_TRAP_ANNOUNCEMENT,
  ANGEL_YEARS,
  BOARD_FAKE_PROMO,
  BOARD_TRAP_ANNOUNCEMENT,
  BOARD_YEARS,
  CEO_TRAP_ANNOUNCEMENT,
  DEATH_EMOJI,
  DEATH_LABELS,
  INTERN_FAKE_PROMO,
  LAST_RUN_STORAGE_KEY,
  MAX_VISIBLE_RUNGS,
  MIN_TAP_INTERVAL_MS,
  REAPPLY_STORAGE_KEY,
  TUTORIAL_DONE_STORAGE_KEY,
  INTERN_TUTORIAL_RUNGS,
  TRIAGE_PROMPT,
  CORP_ENV_BAND_CLASSES,
  corpEnvBandForYears,
  type CorpEnvBand,
  floorLabel,
  formatTickerMarqueeLoopText,
  formatTickerMarqueeText,
  MEETING_MONDAY_OPENING_MEMO,
  milestoneLabel,
  obstacleBadgeDisplay,
  pickTickerHeadlineSet,
  rankEmoji,
  tickerMarqueeDurationFromCopyWidth,
  rankFromYears,
  rankPropEmoji,
  type TickerHeadline,
} from "./game/constants";
import { type DailyModifier, getDailyModifierById, resolveDailyModifier } from "./game/daily-modifier";
import { GameEngine } from "./game/engine";
import type { GameOverResult, ObstacleType, PlayerSide, Rank, Rung } from "./game/types";
import { fetchLeaderboard, fetchLeaderboardWithMeHighlight, fetchLeaderboardMe, fetchProfile, getSessionToken, prepareShare, submitRun, type ApiFailureReason, type LeaderboardEntry, type LeaderboardMeResponse, type LeaderboardResult, type SubmitRunResult } from "./lib/api";
import { cycleAvatarEmoji, getStoredAvatarEmoji, type AvatarEmoji } from "./lib/avatar";
import { nextHighScoreAfterSubmit } from "./lib/score-trust";
import { getCaptureFlags } from "./lib/capture-mode";
import { trackEvent } from "./lib/analytics";
import {
  debugLog,
  describeNextRung,
  getSafeTapSide,
  isDebugMode,
  mountDebugStrip,
  shouldShowImminentHint,
} from "./lib/debug";
import { openPromptAnatomy } from "./lib/branding";
import { buildShareMessageText } from "./lib/share-copy";
import {
  formatStatBestDelta,
  formatTerminationDisplayDetail,
  loadRankHintsSeen,
  markRankHintSeen,
  pickGameOverPunchline,
  pickLeaderboardGapContextLine,
  pickSyncGameOverContextLine,
  type GameOverContextLine,
} from "./lib/game-over-copy";
import { icon } from "./lib/icons";
import { hideHrMemo, showHrMemo } from "./lib/hr-memo";
import {
  applyReorgSlide,
  flashBurnoutStress,
  respectsReducedMotion,
  spawnFloatingParticles,
  triggerClimbPop,
  triggerCoffeePickup,
  triggerDeathEmoji,
  triggerDeathFlash,
  triggerDeathCauseHold,
  triggerFloorBandFlash,
  triggerMeterFlash,
  triggerNearMissWince,
  triggerRankBadgePulse,
  triggerRankPop,
  triggerReorgTelegraph,
  triggerRungAdvance,
  triggerShake,
} from "./lib/effects";
import {
  disableVerticalSwipe,
  enableVerticalSwipe,
  canNativeShare,
  getBotUsername,
  getDisplayName,
  getInitData,
  getStartParam,
  hapticImpact,
  hapticNotification,
  hideTelegramBack,
  hideHomeMainButton,
  initTelegram,
  isTelegram,
  sharePreparedMessage,
  showHomeMainButton,
  showTelegramBack,
} from "./lib/telegram";
import { audio } from "./game/audio";
import { isReviveFeatureEnabled, showRewardedAd } from "./lib/adsgram";
import {
  buildReviveCopy,
  leaderboardGapToFirst,
  REVIVE_TOAST_COMPLETE,
  shouldOfferRevive,
  type ReviveContext,
} from "./lib/revive";
import { shouldFlushPendingSubmitOnLeave } from "./lib/pending-submit";
import { bindSyncStatusRetry, resetSyncStatus, setSyncRetryHandler, setSyncStatus } from "./lib/sync-status";
import { mountHrStamp, notifySyncEnded, notifySyncRetrying, notifySyncStarted, resetHrStamp } from "./lib/hr-stamp";
import { shouldClearPendingOnRevive } from "./lib/submit-orchestrator";

type Screen = "home" | "game" | "gameover" | "leaderboard" | "howtoplay";
type LeaderboardPeriod = "daily" | "weekly";

const FAKE_PROMO_MESSAGES = new Set(
  [...INTERN_FAKE_PROMO, ...BOARD_FAKE_PROMO, ...ANGEL_FAKE_PROMO].map((p) => p.message)
);

let username = "CorporateSlave";
let highScore = 0;
let bestRank: Rank = "Intern";
let lastGameResult: GameOverResult | null = null;
let shareInProgress = false;
let leaderboardPeriod: LeaderboardPeriod = "daily";
let engine: GameEngine;
let prevRungsSnapshot: Rung[] = [];
let playerInPanic = false;
let earlyTapsRemaining = 0;
let playerEmojiFlashTimer: ReturnType<typeof setTimeout> | null = null;
let activeDailyModifier: DailyModifier = resolveDailyModifier();
let shiftToastShown = false;
let meetingMondayMemoShown = false;
let tickerHeadlineSet: TickerHeadline[] = [];
let tickerCacheKey: string | null = null;
let lastHeartbeatAt = 0;
let ceoTrapShown = false;
let boardTrapShown = false;
let angelTrapShown = false;
let emojiFlashLock = false;
let playerAtCorridor = true;
let qaCoffeePickups = 0;
let challengeTargetYears: number | null = null;
let challengeBannerDismissed = false;

type PlayerLayout = PlayerSide | "center";

const GRID_TINT_CLASSES = ["office-grid-reorg-week"] as const;
const FLOOR_BAND_CLASSES = ["office-grid-boardroom", "office-grid-investor-lounge"] as const;

let lastCorpEnvBand: CorpEnvBand | null = null;

let marketingGameCapture = false;
let pendingSubmitDeferred = false;
let pendingSubmitResult: GameOverResult | null = null;
let submitQueue: Promise<unknown> = Promise.resolve();
let activeGameOverSubmit: Promise<SubmitRunResult | null> | null = null;
let lastSubmitGameOverResult: GameOverResult | null = null;
let awaitingReviveRunSubmit = false;
let toastHideTimer: ReturnType<typeof setTimeout> | null = null;
let reviveContinuedAt: number | null = null;

const $ = (id: string) => document.getElementById(id)!;

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
  updateCorpGhostBg(years);
  updateFloorBandGrid(years);
}

function updateCorpGhostBg(years: number): void {
  const next = CORP_ENV_BAND_CLASSES[corpEnvBandForYears(years)];
  const targets = [
    document.getElementById("corpGhostBg"),
    document.getElementById("gamePlayArea"),
  ];
  for (const el of targets) {
    if (!el) continue;
    for (const cls of Object.values(CORP_ENV_BAND_CLASSES)) {
      el.classList.toggle(cls, cls === next);
    }
  }
}

function updateFloorBandGrid(years: number): void {
  const viewport = document.querySelector(".cl-viewport");
  if (!viewport) return;
  for (const cls of FLOOR_BAND_CLASSES) {
    viewport.classList.remove(cls);
  }
  if (years >= ANGEL_YEARS) {
    viewport.classList.add("office-grid-investor-lounge");
  } else if (years >= BOARD_YEARS) {
    viewport.classList.add("office-grid-boardroom");
  }
}

function maybeFlashFloorBandTransition(years: number): void {
  const band = corpEnvBandForYears(years);
  if (lastCorpEnvBand !== null && band !== lastCorpEnvBand) {
    triggerFloorBandFlash($("gamePlayArea"));
  }
  lastCorpEnvBand = band;
}

function updateReorgHudStrip(rank: Rank, rungScore?: number): void {
  const score = rungScore ?? engine?.getRungsClimbed() ?? 0;
  const show =
    rank !== "Intern" ||
    (activeDailyModifier.allowEarlyReorg && score >= INTERN_TUTORIAL_RUNGS);
  $("reorgHudStrip").classList.toggle("hidden", !show);
}

function shouldTickerScroll(): boolean {
  if (respectsReducedMotion()) return false;
  if (document.documentElement.dataset.ogCapture === "1") return false;
  if (getCaptureFlags().capture !== null) return false;
  return true;
}

function tickerCacheKeyFor(utcDate: Date, presetId: DailyModifier["id"], careerBest: number): string {
  return `${utcDate.toISOString().slice(0, 10)}|${presetId}|${rankFromYears(careerBest)}`;
}

function mountTickerMarqueeDOM(): void {
  if (tickerHeadlineSet.length === 0) return;
  const tickerEl = $("newsTickerText");
  const trackEl = tickerEl.parentElement;

  tickerEl.style.removeProperty("--ticker-start");
  tickerEl.style.removeProperty("--ticker-end");
  tickerEl.style.removeProperty("--ticker-duration");

  if (!shouldTickerScroll() || !trackEl) {
    tickerEl.textContent = formatTickerMarqueeText(tickerHeadlineSet);
    tickerEl.classList.add("news-ticker-text--static");
    return;
  }

  tickerEl.classList.remove("news-ticker-text--static");
  tickerEl.textContent = formatTickerMarqueeLoopText(tickerHeadlineSet);
  void tickerEl.offsetWidth;

  const trackW = trackEl.clientWidth;
  const loopW = tickerEl.scrollWidth;
  const copyW = loopW / 2;

  if (copyW <= trackW) {
    tickerEl.textContent = formatTickerMarqueeText(tickerHeadlineSet);
    tickerEl.classList.add("news-ticker-text--static");
    return;
  }

  const durationSec = tickerMarqueeDurationFromCopyWidth(copyW);
  tickerEl.style.setProperty("--ticker-start", `${trackW}px`);
  tickerEl.style.setProperty("--ticker-end", `${trackW - copyW}px`);
  tickerEl.style.setProperty("--ticker-duration", `${durationSec}s`);
  void tickerEl.offsetWidth;
}

function ensureTickerHeadlines(): void {
  const key = tickerCacheKeyFor(new Date(), activeDailyModifier.id, highScore);
  if (key === tickerCacheKey && tickerHeadlineSet.length > 0) {
    mountTickerMarqueeDOM();
    return;
  }
  tickerCacheKey = key;
  tickerHeadlineSet = pickTickerHeadlineSet({
    presetId: activeDailyModifier.id,
    careerBestYears: highScore,
  });
  mountTickerMarqueeDOM();
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

function saveLastRunYears(years: number): void {
  try {
    localStorage.setItem(LAST_RUN_STORAGE_KEY, JSON.stringify({ years, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

function getLastRunYears(): number | null {
  try {
    const raw = localStorage.getItem(LAST_RUN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { years?: unknown };
    return typeof parsed.years === "number" && Number.isFinite(parsed.years) ? parsed.years : null;
  } catch {
    return null;
  }
}

function isTutorialDone(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_DONE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markTutorialDone(): void {
  try {
    localStorage.setItem(TUTORIAL_DONE_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  trackEvent("tutorial_complete");
}

function isTutorialOverlayActive(): boolean {
  return Boolean(engine?.isActive()) && !isTutorialDone() && engine.getRungsClimbed() < 3;
}

function getTutorialWrongTapMessage(side: PlayerSide): string {
  const next = engine.getRungs()[1];
  if (next?.obstacle) {
    const blocked = side === "left" ? "LEFT" : "RIGHT";
    return `That ${blocked} lane is occupied — try the other side. HR is watching.`;
  }
  if (next?.coffee) {
    const coffeeSide = next.coffee === "left" ? "LEFT" : "RIGHT";
    return `Coffee is on ${coffeeSide} — tap ${coffeeSide} for +25% Energy.`;
  }
  return "Try the other side for this rung.";
}

function updateSafeSideTapPulse(): void {
  const leftBtn = $("btnTapLeft");
  const rightBtn = $("btnTapRight");
  leftBtn.classList.remove("safe-side-hint");
  rightBtn.classList.remove("safe-side-hint");

  if (!engine?.isActive() || respectsReducedMotion()) return;
  if (!shouldShowImminentHint(engine.getRungsClimbed())) return;

  const safeSide = getSafeTapSide(engine.getRungs()[1]);
  if (safeSide === "left") leftBtn.classList.add("safe-side-hint");
  else if (safeSide === "right") rightBtn.classList.add("safe-side-hint");
}

function updateEnergyLabelVisibility(): void {
  const label = $("energyLabel");
  if (!engine?.isActive()) {
    label.classList.add("hidden");
    return;
  }
  label.classList.toggle("hidden", getReapplyCount() >= 5);
}

function refreshChallengeBanner(): void {
  if (challengeTargetYears !== null) {
    $("challengeBannerText").textContent =
      `A colleague survived ${challengeTargetYears.toFixed(1)}y — HR doubts you can beat them. Punch in.`;
  }
  refreshHomeContextSlot();
}

function dismissChallengeBanner(): void {
  challengeBannerDismissed = true;
  refreshHomeContextSlot();
}

function refreshHomeContextSlot(): void {
  const showChallenge = challengeTargetYears !== null && !challengeBannerDismissed;
  $("dailyShiftBlock").classList.toggle("hidden", showChallenge);
  $("challengeBanner").classList.toggle("hidden", !showChallenge);
}

function updateImminentRungHint(): void {
  const hint = $("imminentHint");
  if (!engine?.isActive()) {
    hint.classList.add("hidden");
    updateSafeSideTapPulse();
    return;
  }
  if (isTutorialOverlayActive()) {
    hint.classList.add("hidden");
    updateSafeSideTapPulse();
    return;
  }
  const next = engine.getRungs()[1];
  if (!shouldShowImminentHint(engine.getRungsClimbed())) {
    hint.classList.add("hidden");
    updateSafeSideTapPulse();
    return;
  }
  hint.textContent = describeNextRung(next);
  hint.classList.remove("hidden");
  updateSafeSideTapPulse();
}

function updateMilestoneChip(years: number): void {
  const chip = $("milestoneChip");
  chip.textContent = milestoneLabel(years);
  chip.title = milestoneLabel(years);
}

function showToast(msg: string, opts?: { surface?: "shell" | "game" }): void {
  const toast = $("toastNotification");
  const onGame = !$("gameScreen").classList.contains("hidden");
  const onGameOver = !$("gameOverScreen").classList.contains("hidden");
  const aboveTapDeck = onGame && opts?.surface !== "shell";
  const aboveGameOverActions = onGameOver && !onGame;
  toast.classList.toggle("toast-above-tap-deck", aboveTapDeck);
  toast.classList.toggle("toast-above-game-over-actions", aboveGameOverActions);
  $("toastText").textContent = msg;
  toast.style.opacity = "1";
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toastHideTimer = null;
  }, 2500);
}

function submitFailureMessage(reason: ApiFailureReason, detail?: string): string {
  const bot = getBotUsername();
  if (reason === "auth") {
    return `HR couldn't verify your badge. Reopen from @${bot}.`;
  }
  if (reason === "rate_limit") {
    return "Score filing cooldown — HR is retrying automatically.";
  }
  if (reason === "validation") {
    if (detail?.includes("25 years")) {
      return "Synergy Sprint caps at 25y on the leaderboard — HR rejected the over-velocity filing.";
    }
    return "HR rejected the filing — score didn't pass audit. Local run counts.";
  }
  return "Score not filed with HR. Check connection.";
}

function showAuthDegradedBanner(reason?: ApiFailureReason): void {
  const bot = getBotUsername();
  const lead = $("authDegradedLead");
  const sub = $("authDegradedSub");
  if (reason === "auth") {
    lead.textContent = "Session expired.";
    sub.textContent = `Reopen via @${bot} to sync scores.`;
  } else if (reason === "network" || reason === "server") {
    lead.textContent = "Play works — scores sync when you're back on the grid.";
    sub.textContent = `Reopen via @${bot} if this sticks.`;
  } else {
    lead.textContent = "Session expired or offline.";
    sub.textContent = `Reopen via @${bot} to sync scores.`;
  }
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

function syncTelegramMainButton(tab: Screen): void {
  if (tab === "home") {
    showHomeMainButton(() => {
      hapticImpact("medium");
      startGame();
    });
    return;
  }
  hideHomeMainButton();
}

function syncSoundFabPlacement(tab: Screen): void {
  const btn = $("soundToggleBtn");
  const onHome = tab === "home" && isTelegram();
  btn.classList.toggle("sound-fab--home", onHome);
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
  syncTelegramMainButton(tab);
  syncSoundFabPlacement(tab);
  if (tab === "home") {
    refreshHomeContextSlot();
    ensureTickerHeadlines();
  }
  audio.nav();
  if (tab !== "game") {
    audio.stopBgm();
  }
  if (tab === "game") {
    requestAnimationFrame(() => layoutRungs());
  }
}

const RANK_BADGE: Record<Rank, string> = {
  Intern: "badge-rank-intern mt-0.5",
  Manager: "badge-rank-manager mt-0.5",
  Director: "badge-rank-director mt-0.5",
  CEO: "badge-rank-ceo mt-0.5",
  "Board Member": "badge-rank-board mt-0.5",
  "Angel Investor": "badge-rank-angel mt-0.5",
};

function playerDisplayEmoji(rank: Rank): string {
  if (rank === "Intern") return getStoredAvatarEmoji();
  return rankEmoji(rank);
}

const HOME_SKELETON_FIELD_IDS = ["usernameInput", "userTitleLabel", "homeMilestoneLabel", "highScoreBadge"];

function setHomeBadgeSkeleton(on: boolean): void {
  for (const id of HOME_SKELETON_FIELD_IDS) {
    $(id).classList.toggle("home-skeleton", on);
  }
}

function rankFromCareerHigh(years: number): Rank {
  return years > 0 ? rankFromYears(Math.floor(years)) : "Intern";
}

function refreshHomeBadgeUI(): void {
  $("avatarIcon").textContent = getStoredAvatarEmoji();
  const displayRank = highScore > 0 ? rankFromCareerHigh(highScore) : null;
  $("userTitleLabel").textContent =
    displayRank ? `Current rank: ${displayRank}` : `Starting rank: Intern`;
  $("homeMilestoneLabel").textContent = milestoneLabel(highScore);
  $("highScoreBadge").textContent = highScore.toFixed(1);
  refreshBeatGapLine();
  refreshChallengeBanner();
}

function refreshBeatGapLine(): void {
  const line = $("beatGapLine");
  const lastRun = getLastRunYears();
  if (lastRun === null || highScore <= 0 || lastRun >= highScore) {
    line.textContent = "";
    line.classList.add("hidden");
    return;
  }
  const gap = (highScore - lastRun).toFixed(1);
  line.textContent = `Last shift: ${lastRun.toFixed(1)}y — ${gap}y below your record. HR noticed.`;
  line.classList.remove("hidden");
}

function updateRankUI(rank: Rank, updatePlayer = true): void {
  $("rankBadgeIcon").textContent = rankEmoji(rank);
  $("rankBadgeText").textContent = rank;
  if (updatePlayer && !playerInPanic && !emojiFlashLock) {
    $("playerActionEmoji").textContent = playerDisplayEmoji(rank);
  }
  $("gameRankBadge").className = RANK_BADGE[rank];
  updateRankProp(rank);
  updateReorgHudStrip(rank, engine?.getRungsClimbed());
}

function setPlayerPanic(on: boolean): void {
  playerInPanic = on;
  $("playerClimber").classList.toggle("player-panic", on);
  if (emojiFlashLock) return;
  if (on) {
    $("playerActionEmoji").textContent = "😰";
  } else {
    $("playerActionEmoji").textContent = playerDisplayEmoji(engine.getCurrentRank());
  }
}

function refreshDailyShiftUI(): void {
  activeDailyModifier = resolveDailyModifier();
  $("dailyShiftLabel").textContent = activeDailyModifier.label;
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
}

function createObstacleBadge(type: ObstacleType, rungId: number, isImminent = false): HTMLElement {
  const rank = engine?.getCurrentRank() ?? "Intern";
  const display = obstacleBadgeDisplay(type, rank, {
    isImminent,
    dailyModifierId: activeDailyModifier.id,
    rungId,
  });
  const badge = document.createElement("div");
  badge.className =
    "obstacle-badge w-12 h-10 rounded-lg flex flex-col items-center justify-center border shadow-md text-center select-none obstacle-pulse";
  if (type === "meeting") {
    badge.className += " bg-red-100 border-red-400 text-red-900";
  } else if (type === "reorg") {
    badge.className += " bg-amber-100 border-amber-500 text-amber-900";
  } else if (type === "badge_gate") {
    badge.className += " bg-slate-100 border-slate-400 text-slate-800";
  } else if (type === "foliage") {
    badge.className += " bg-emerald-100 border-emerald-500 text-emerald-900";
  } else {
    badge.className += " bg-red-100 border-red-400 text-red-900";
  }
  badge.innerHTML = `<span class="text-lg leading-none">${display.emoji}</span><span class="text-nano uppercase font-black tracking-tight leading-none mt-0.5">${display.label}</span>`;
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
  const climberH = climber.offsetHeight;
  const footRung = playArea.querySelector("[data-rung-slot='0']") as HTMLElement | null;
  let anchor: HTMLElement | null = null;

  if (side === "center") {
    anchor =
      (footRung?.querySelector(".rung-center") as HTMLElement | null) ??
      (playArea.querySelector("[data-rung-slot='1'] .rung-center") as HTMLElement | null) ??
      ($("ladderTrack") as HTMLElement);
  } else {
    anchor = footRung?.querySelector(
      side === "left" ? ".left-slot" : ".right-slot"
    ) as HTMLElement | null;
  }

  if (!anchor) return;

  const anchorRect = anchor.getBoundingClientRect();
  const anchorTopRel = anchorRect.top - playRect.top;
  const rawLeft =
    anchorRect.left + anchorRect.width / 2 - playRect.left - playArea.clientLeft - climberW / 2;
  const maxLeft = Math.max(0, playArea.clientWidth - climberW);
  const left = Math.max(0, Math.min(maxLeft, rawLeft));
  climber.style.left = `${Math.round(left)}px`;

  const anchorCenterY = anchorTopRel + anchorRect.height / 2;
  const bottomPx = playArea.clientHeight - anchorCenterY - climberH / 2;
  climber.style.bottom = `${Math.max(0, Math.round(bottomPx))}px`;
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
    "rung-center shrink-0 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm flex items-center justify-center";
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
      rungEl.classList.remove("next-rung", "rung-future");
      continue;
    }
    rungEl.style.visibility = "visible";
    rungEl.dataset.rungId = String(rung.id);
    rungEl.classList.toggle("next-rung", i === 1);
    rungEl.classList.toggle("rung-future", i >= 2);

    const leftSlot = rungEl.querySelector(".left-slot") as HTMLElement;
    const rightSlot = rungEl.querySelector(".right-slot") as HTMLElement;
    const isImminent = i === 1;
    fillSlot(leftSlot, rung, "left", isImminent);
    fillSlot(rightSlot, rung, "right", isImminent);

    leftSlot.classList.remove("safe-side-hint", "next-obstacle-warn", "next-coffee-hint");
    rightSlot.classList.remove("safe-side-hint", "next-obstacle-warn", "next-coffee-hint");

    if ((shouldShowImminentHint(engine.getRungsClimbed()) || marketingGameCapture) && i === 1) {
      leftSlot.classList.toggle("safe-side-hint", rung.obstacle !== "left");
      rightSlot.classList.toggle("safe-side-hint", rung.obstacle !== "right");
    }

    if (i === 1 && rung.obstacle) {
      const blockedSlot = rung.obstacle === "left" ? leftSlot : rightSlot;
      const badge = blockedSlot.querySelector(".obstacle-badge:not(.coffee-badge)") as HTMLElement | null;
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
  maybeShowExecutiveTrapMemo();
}

function maybeShowExecutiveTrapMemo(): void {
  if (!engine) return;
  const rank = engine.getCurrentRank();
  const next = engine.getRungs()[1];
  if (!next?.type) return;

  if (rank === "CEO" && next.type === "burnout" && !ceoTrapShown) {
    ceoTrapShown = true;
    showHrMemo(CEO_TRAP_ANNOUNCEMENT, { variant: "promo", durationMs: 1600 });
    return;
  }

  if (rank === "Board Member" && next.type === "meeting" && !boardTrapShown) {
    boardTrapShown = true;
    showHrMemo(BOARD_TRAP_ANNOUNCEMENT, { variant: "promo", durationMs: 1600 });
    return;
  }

  if (
    rank === "Angel Investor" &&
    (next.type === "burnout" || next.type === "foliage") &&
    !angelTrapShown
  ) {
    angelTrapShown = true;
    showHrMemo(ANGEL_TRAP_ANNOUNCEMENT, { variant: "promo", durationMs: 1600 });
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
  const selfRow = $("leaderboardSelfRow");
  const gapHint = $("leaderboardGapHint");
  renderLeaderboardSkeleton(list);
  selfRow.classList.add("hidden");
  gapHint.classList.add("hidden");
  gapHint.textContent = "";

  const token = getSessionToken();
  const boardLabel = leaderboardPeriod === "weekly" ? "the last 7 days board" : "today's board";

  const [result, me] = await Promise.all([
    fetchLeaderboard(leaderboardPeriod),
    token ? fetchLeaderboardMe(leaderboardPeriod, token) : Promise.resolve(null),
  ]);

  if (result.ok && me?.on_board && me.rank != null) {
    for (const entry of result.entries) {
      if (entry.rank === me.rank) {
        entry.is_current_user = true;
        break;
      }
    }
  }

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
  } else {
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

  updateLeaderboardSelfRow(me, entries, boardLabel, token);
}

function updateLeaderboardSelfRow(
  me: LeaderboardMeResponse | null,
  entries: LeaderboardEntry[],
  boardLabel: string,
  token: string | null
): void {
  const selfRow = $("leaderboardSelfRow");
  const selfText = $("leaderboardSelfText");
  const gapHint = $("leaderboardGapHint");

  if (!token) {
    selfText.textContent = "Open from Telegram to see your rank on the board.";
    selfRow.classList.remove("hidden");
    return;
  }

  if (!me) {
    selfRow.classList.add("hidden");
    return;
  }

  if (me.on_board && me.rank != null && me.years_survived != null) {
    const rankLabel = me.final_rank ?? "Intern";
    selfText.textContent = `Your rank: #${me.rank} · ${me.years_survived.toFixed(1)}y · ${rankLabel}`;
    const top = entries[0];
    if (top && top.years_survived > me.years_survived) {
      const gap = top.years_survived - me.years_survived;
      gapHint.textContent = `#1 on ${boardLabel} is ${gap.toFixed(1)}y ahead`;
      gapHint.classList.remove("hidden");
    }
  } else {
    const bestLine =
      highScore > 0
        ? `Career high (all shifts): ${highScore.toFixed(1)}y (${bestRank}). Today's run may still be filing.`
        : "Play a run to land on the board.";
    selfText.textContent = `Not on ${boardLabel} yet. ${bestLine}`;
  }

  selfRow.classList.remove("hidden");
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

function bindShellActions(): void {
  const handlers: Record<string, () => void> = {
    "go-home": goHome,
    "start-game": startGame,
    "open-leaderboard": () => {
      switchTab("leaderboard");
      renderLeaderboard();
    },
    "open-howtoplay": () => switchTab("howtoplay"),
    "open-prompt-anatomy": openPromptAnatomy,
    "toggle-mute": toggleMute,
    "dismiss-auth-banner": dismissAuthBanner,
    "cycle-avatar": () => {
      const next = cycleAvatarEmoji(getStoredAvatarEmoji() as AvatarEmoji);
      $("avatarIcon").textContent = next;
      if (engine?.getCurrentRank() === "Intern" && !playerInPanic) {
        $("playerActionEmoji").textContent = next;
      }
      showToast("Avatar updated for your employee badge.");
    },
    "dismiss-challenge": dismissChallengeBanner,
    "revive-ad": onReviveAdClick,
    "copy-share": copyShareText,
  };

  document.querySelectorAll<HTMLElement>("[data-action]").forEach((el) => {
    const action = el.dataset.action;
    const handler = action ? handlers[action] : undefined;
    if (!handler) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      handler();
    });
  });
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
  updateSafeSideTapPulse();
}

function updateSprintTimerChip(): void {
  const chip = $("sprintTimerChip");
  const remaining = engine.getSprintSecondsRemaining();
  if (remaining === null) {
    chip.classList.add("hidden");
    return;
  }
  chip.textContent = `Sprint: ${remaining}s`;
  chip.classList.remove("hidden");
}

function hideReviveOffer(): void {
  $("reviveAdBtn").classList.add("hidden");
}

function buildReviveContext(result: GameOverResult, lbResult?: LeaderboardResult): ReviveContext & { reapplyCount: number } {
  let leaderboardGap: number | null = null;
  if (lbResult?.ok && lbResult.entries[0]) {
    const top = lbResult.entries[0];
    leaderboardGap = leaderboardGapToFirst(
      result,
      top.years_survived,
      Boolean(top.is_current_user)
    );
  }
  return {
    highScore,
    reviveUsedThisRun: engine.hasUsedRevive(),
    leaderboardGap,
    reapplyCount: getReapplyCount(),
  };
}

function isReviveEligibleBase(result: GameOverResult): boolean {
  return (
    isReviveFeatureEnabled() &&
    !engine.hasUsedRevive() &&
    result.deathType !== "sprint" &&
    result.yearsSurvived >= 3 &&
    Boolean(engine.getPendingReviveSnapshot())
  );
}

function updateReviveOffer(result: GameOverResult, lbResult?: LeaderboardResult): void {
  const ctx = buildReviveContext(result, lbResult);
  if (shouldOfferRevive(result, ctx)) {
    const copy = buildReviveCopy(result, ctx);
    $("reviveAdTitle").textContent = copy.title;
    $("reviveAdSubline").textContent = copy.subline;
    $("reviveAdBtn").classList.remove("hidden");
    trackEvent("revive_offer", { years: result.yearsSurvived, gap: ctx.leaderboardGap });
    debugLog("revive", "revive_offer_shown", {
      years: result.yearsSurvived,
      gap: ctx.leaderboardGap,
    });
    return;
  }
  hideReviveOffer();
}

async function flushPendingSubmit(): Promise<SubmitRunResult | null> {
  if (!pendingSubmitDeferred || !pendingSubmitResult) return null;
  const result = pendingSubmitResult;
  const initData = getInitData();
  const submitResult = await runSubmitOnly(result, initData);
  if (submitResult?.ok) {
    pendingSubmitDeferred = false;
    pendingSubmitResult = null;
  }
  if (submitResult && !submitResult.ok) {
    showSubmitResultToast(submitResult);
  }
  return submitResult;
}

function installPendingSubmitLifecycleGuards(): void {
  const flushOnLeave = (): void => {
    if (
      !shouldFlushPendingSubmitOnLeave(
        pendingSubmitDeferred,
        pendingSubmitResult !== null,
        awaitingReviveRunSubmit
      )
    ) {
      return;
    }
    void flushPendingSubmit();
  };
  window.addEventListener("pagehide", flushOnLeave);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushOnLeave();
  });
}

async function onReviveAdClick(): Promise<void> {
  const snapshot = engine.getPendingReviveSnapshot();
  if (!snapshot || !lastGameResult) return;

  const btn = $("reviveAdBtn") as HTMLButtonElement;
  btn.disabled = true;
  debugLog("revive", "revive_ad_started", {});

  try {
    await showRewardedAd();

    if (activeGameOverSubmit) {
      await activeGameOverSubmit;
    }
    if (pendingSubmitDeferred && pendingSubmitResult) {
      await flushPendingSubmit();
    }

    if (shouldClearPendingOnRevive(pendingSubmitDeferred)) {
      pendingSubmitDeferred = false;
      pendingSubmitResult = null;
    }

    awaitingReviveRunSubmit = true;
    reviveContinuedAt = Date.now();
    engine.restoreFromRevive(snapshot);
    hideReviveOffer();
    debugLog("revive", "revive_ad_completed", {});
    trackEvent("revive_complete");
    showToast(REVIVE_TOAST_COMPLETE, { surface: "shell" });

    playerAtCorridor = false;
    disableVerticalSwipe();
    switchTab("game");
    attachPlayAreaObserver();
    updateSprintTimerChip();
    updateRankUI(engine.getCurrentRank());
    updateMilestoneChip(engine.getRungsClimbed() / 4);
    updateFloorLabel(engine.getRungsClimbed() / 4);
    updateReorgHudStrip(engine.getCurrentRank());
    requestAnimationFrame(() => {
      layoutRungs();
      layoutPlayerPosition(engine.getPlayerSide());
    });
    hapticImpact("medium");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    debugLog("revive", "revive_ad_failed", { message });
    if (isDebugMode()) {
      console.warn("[revive] revive_ad_failed:", message);
    }
    showToast("HR Training unavailable — re-apply when ads load.", { surface: "shell" });
  } finally {
    btn.disabled = false;
  }
}

async function startGame(): Promise<void> {
  if (pendingSubmitDeferred) {
    await flushPendingSubmit();
  }
  resetSyncStatus();
  resetHrStamp();
  awaitingReviveRunSubmit = false;
  reviveContinuedAt = null;
  hideReviveOffer();
  hideHrMemo();
  hideHudTapHint();
  hideImminentHint();
  hideTapDeckHint();
  $("btnTapLeft").classList.remove("safe-side-hint");
  $("btnTapRight").classList.remove("safe-side-hint");
  $("burnoutMeter").className =
    "h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-75";
  $("burnoutMeter").style.width = "100%";
  if (isTutorialDone()) {
    showHudTapHint();
  }
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
  meetingMondayMemoShown = false;
  ceoTrapShown = false;
  boardTrapShown = false;
  angelTrapShown = false;
  lastCorpEnvBand = corpEnvBandForYears(0);
  qaCoffeePickups = 0;
  activeDailyModifier = engine.getDailyModifier();
  if (tickerHeadlineSet.length === 0) {
    ensureTickerHeadlines();
  }
  engine.setActiveTickerSet(tickerHeadlineSet);
  disableVerticalSwipe();
  audio.prepareBgmForRun();
  engine.start();
  attachPlayAreaObserver();
  if (challengeTargetYears !== null) {
    dismissChallengeBanner();
  }
  updateSprintTimerChip();
  updateRankUI("Intern");
  updateMilestoneChip(0);
  updateFloorLabel(0);
  updateReorgHudStrip("Intern");
  updateEnergyLabelVisibility();
  switchTab("game");
  requestAnimationFrame(() => {
    layoutRungs();
    layoutPlayerPosition("center");
    updateImminentRungHint();
  });
}

async function goHome(): Promise<void> {
  if (pendingSubmitDeferred) {
    await flushPendingSubmit();
  }
  resetSyncStatus();
  resetHrStamp();
  awaitingReviveRunSubmit = false;
  reviveContinuedAt = null;
  hideReviveOffer();
  engine.stop();
  if (playAreaResizeObserver) {
    playAreaResizeObserver.disconnect();
    playAreaResizeObserver = null;
  }
  $("sprintTimerChip").classList.add("hidden");
  hideHrMemo();
  hideHudTapHint();
  hideTapDeckHint();
  $("btnTapLeft").classList.remove("safe-side-hint");
  $("btnTapRight").classList.remove("safe-side-hint");
  flashBurnoutStress(false);
  playerInPanic = false;
  enableVerticalSwipe();
  refreshDailyShiftUI();
  refreshHomeBadgeUI();
  switchTab("home");
}

function setGameOverContextLine(line: GameOverContextLine | null): void {
  const el = $("gameOverContextLine");
  if (!line) {
    el.textContent = "";
    el.classList.add("hidden");
    el.classList.remove("text-indigo-700", "font-bold", "text-slate-500", "font-semibold");
    return;
  }
  el.textContent = line.text;
  el.classList.remove("hidden");
  const isLeaderboard = line.variant === "leaderboard";
  el.classList.toggle("text-indigo-700", isLeaderboard);
  el.classList.toggle("font-bold", isLeaderboard);
  el.classList.toggle("text-slate-500", !isLeaderboard);
  el.classList.toggle("font-semibold", !isLeaderboard);
}

function applyStatBestDelta(
  yearsSurvived: number,
  previousBest: number,
  previousBestRank: Rank | null,
  pendingStamp: boolean
): void {
  const delta = formatStatBestDelta(yearsSurvived, previousBest, previousBestRank, pendingStamp);
  $("statBestDelta").textContent = delta.text;
  $("statBestDelta").className = delta.className;
}

function applyLeaderboardGap(result: GameOverResult, lbResult: LeaderboardResult): void {
  if (challengeTargetYears !== null) return;

  const boardLabel = leaderboardPeriod === "weekly" ? "the last 7 days board" : "today's board";
  if (!lbResult.ok) return;

  const top = lbResult.entries[0];
  const line = pickLeaderboardGapContextLine({
    yearsSurvived: result.yearsSurvived,
    topYears: top?.years_survived ?? null,
    isCurrentUserTop: Boolean(top?.is_current_user),
    boardLabel,
  });
  setGameOverContextLine(line);
}

function showSubmitResultToast(submitResult: SubmitRunResult | null): void {
  if (!submitResult || submitResult.ok) return;
  if (!$("gameOverScreen").classList.contains("hidden")) {
    const detail = !submitResult.ok ? submitResult.detail : undefined;
    showToast(submitFailureMessage(submitResult.reason, detail), { surface: "shell" });
  }
}

async function executeSubmitOnly(result: GameOverResult, initData: string): Promise<SubmitRunResult | null> {
  if (!initData) return null;

  lastSubmitGameOverResult = result;
  setSyncStatus("syncing");
  notifySyncStarted();

  const previousBest = highScore;
  const submitResult = await submitRun(
    initData,
    {
      yearsSurvived: result.yearsSurvived,
      finalRank: result.finalRank,
      terminationCause: result.terminationCause,
      rungsClimbed: result.rungsClimbed,
      sprintMode: Boolean(activeDailyModifier.sprintDurationMs),
      runStartedAt: result.runStartedAt,
      runEndedAt: result.runEndedAt,
    },
    {
      previousBestScore: previousBest,
      onRetry: (_attempt, _waitMs, secondsRemaining) => {
        setSyncStatus("retrying", secondsRemaining);
        notifySyncRetrying();
      },
    }
  );

  notifySyncEnded();

  if (submitResult.ok) {
    pendingSubmitDeferred = false;
    pendingSubmitResult = null;
    highScore = nextHighScoreAfterSubmit(highScore, result.yearsSurvived, true, submitResult.bestScore);
    bestRank = rankFromCareerHigh(highScore);
    engine?.setCareerBestYears(highScore);
    $("highScoreBadge").textContent = highScore.toFixed(1);
    refreshHomeBadgeUI();
    applyStatBestDelta(result.yearsSurvived, previousBest, bestRank, false);
    setSyncStatus("ok");
  } else {
    setSyncStatus("failed");
    if (isReviveEligibleBase(result)) {
      pendingSubmitDeferred = true;
      pendingSubmitResult = result;
    }
  }

  return submitResult;
}

async function runSubmitOnly(result: GameOverResult, initData: string): Promise<SubmitRunResult | null> {
  if (!initData) return null;
  const chained = submitQueue.then(() => executeSubmitOnly(result, initData));
  submitQueue = chained.catch(() => undefined);
  return chained;
}

function enrichGameOverAsync(result: GameOverResult, submitResult: SubmitRunResult | null): void {
  void fetchLeaderboardWithMeHighlight(leaderboardPeriod, getSessionToken()).then((lbResult) => {
    applyLeaderboardGap(result, lbResult);
    if (isReviveEligibleBase(result)) {
      updateReviveOffer(result, lbResult);
    }
    if (submitResult && !submitResult.ok && pendingSubmitDeferred) {
      if (!shouldOfferRevive(result, buildReviveContext(result, lbResult.ok ? lbResult : undefined))) {
        void flushPendingSubmit();
      }
    }
  });
}

function retryLastSubmit(): void {
  if (!lastSubmitGameOverResult) return;
  const initData = getInitData();
  if (!initData) return;
  void runSubmitOnly(lastSubmitGameOverResult, initData).then((submitResult) => {
    if (submitResult?.ok) {
      enrichGameOverAsync(lastSubmitGameOverResult!, submitResult);
    } else if (submitResult && !submitResult.ok) {
      showSubmitResultToast(submitResult);
    }
  });
}

function seedGameOverForQa(): void {
  void import("./game/marketing-capture").then((m) => applyMarketingGameOverUi(m.MARKETING_GAMEOVER));
}

async function onGameOver(result: GameOverResult): Promise<void> {
  debugLog("gameover", "collision/death", { deathType: result.deathType });

  if (reviveContinuedAt !== null) {
    debugLog("revive", "revive_run_continued_seconds", {
      seconds: Math.round((Date.now() - reviveContinuedAt) / 1000),
    });
    reviveContinuedAt = null;
  }

  hideReviveOffer();
  hideHrMemo();
  hideHudTapHint();
  hideImminentHint();
  lastGameResult = result;
  saveLastRunYears(result.yearsSurvived);
  $("playerActionEmoji").classList.remove("idle-bob");

  const previousBest = highScore;
  const previousBestRank = bestRank;

  $("statYears").textContent = `${result.yearsSurvived.toFixed(1)} Years`;
  $("statRank").innerHTML = `<span>${rankEmoji(result.finalRank)}</span> ${result.finalRank}`;
  $("terminationCauseIcon").textContent = DEATH_EMOJI[result.deathType];
  $("terminationCauseLabel").textContent = DEATH_LABELS[result.deathType];
  $("terminationReason").textContent = formatTerminationDisplayDetail(
    result.deathType,
    result.terminationDetail
  );
  $("reviewId").textContent = `REF-${Math.floor(10000 + Math.random() * 90000)}`;

  const reapplyCount = incrementReapplyCount();
  $("gameOverPunchline").textContent = pickGameOverPunchline({
    reapplyCount,
    finalRank: result.finalRank,
    deathType: result.deathType,
    terminationFlavor: result.terminationFlavor,
  });

  const syncContext = pickSyncGameOverContextLine({
    yearsSurvived: result.yearsSurvived,
    finalRank: result.finalRank,
    challengeTargetYears,
    rankHintsSeen: loadRankHintsSeen(),
  });
  setGameOverContextLine(syncContext);
  if (syncContext?.markRankHint) {
    markRankHintSeen(syncContext.markRankHint);
  }

  const initData = getInitData();
  const pendingStamp = Boolean(initData) && result.yearsSurvived > previousBest;
  applyStatBestDelta(result.yearsSurvived, previousBest, previousBestRank, pendingStamp);

  resetSyncStatus();
  resetHrStamp();

  let submitPromise: Promise<SubmitRunResult | null> = Promise.resolve(null);
  if (initData) {
    if (awaitingReviveRunSubmit) {
      awaitingReviveRunSubmit = false;
    } else if (isReviveEligibleBase(result)) {
      pendingSubmitResult = result;
      pendingSubmitDeferred = false;
    }
    activeGameOverSubmit = runSubmitOnly(result, initData);
    submitPromise = activeGameOverSubmit;
    void submitPromise.finally(() => {
      if (activeGameOverSubmit === submitPromise) {
        activeGameOverSubmit = null;
      }
    });
  }

  flashBurnoutStress(false);
  setPlayerPanic(false);
  hapticNotification("error");
  triggerDeathFlash();

  const fastDeath = getReapplyCount() >= 3;

  const showGameOverActions = (): void => {
    enableVerticalSwipe();
    switchTab("gameover");
    triggerDeathCauseHold($("terminationCauseRow"));
    if (isReviveEligibleBase(result)) {
      updateReviveOffer(result, undefined);
    }
    void submitPromise.then((submitResult) => {
      if (submitResult && !submitResult.ok) {
        showSubmitResultToast(submitResult);
      }
      enrichGameOverAsync(result, submitResult);
    });
  };

  triggerDeathEmoji(result.deathType, () => {
    showGameOverActions();
    if (!fastDeath && !respectsReducedMotion()) {
      const card = $("gameOverScreen").querySelector(".card-performance") as HTMLElement | null;
      if (card) triggerShake(card);
    }
  });
}

function parseChallengeParam(param: string): number | null {
  const match = /^c_(\d{1,4})$/.exec(param);
  if (!match) return null;
  return parseInt(match[1]!, 10) / 10;
}

function buildShareText(): string {
  if (!lastGameResult) {
    return buildShareMessageText({
      yearsSurvived: 0,
      finalRank: "Intern",
      terminationDetail: "",
      terminationFlavor: "",
      deathType: "meeting",
    });
  }
  return buildShareMessageText({
    yearsSurvived: lastGameResult.yearsSurvived,
    finalRank: lastGameResult.finalRank,
    terminationDetail: lastGameResult.terminationDetail,
    terminationFlavor: lastGameResult.terminationFlavor,
    deathType: lastGameResult.deathType,
  });
}

function fallbackClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => {
        trackEvent("share_success", { method: "clipboard" });
        showToast("Review copied! Paste into Telegram to share.");
      },
      () => showToast("Could not copy — try again.")
    );
  }
  showToast("Could not copy — try again.");
  return Promise.resolve();
}

async function copyShareText(): Promise<void> {
  if (shareInProgress) return;
  shareInProgress = true;
  const shareBtn = document.getElementById("shareBtn") as HTMLButtonElement | null;
  if (shareBtn) shareBtn.disabled = true;

  try {
    const text = buildShareText();
    trackEvent("share_tap");

    if (canNativeShare() && lastGameResult) {
      const initData = getInitData();
      if (initData) {
        const prepared = await prepareShare({
          initData,
          yearsSurvived: lastGameResult.yearsSurvived,
          finalRank: lastGameResult.finalRank,
          shiftLabel: engine.getDailyModifier().label,
          terminationDetail: lastGameResult.terminationDetail,
          terminationFlavor: lastGameResult.terminationFlavor,
          deathType: lastGameResult.deathType,
        });
        if (prepared.ok) {
          const sent = await sharePreparedMessage(prepared.preparedMessageId);
          if (sent) {
            trackEvent("share_success", { method: "native" });
            showToast("Share sheet opened in Telegram.", { surface: "shell" });
            return;
          }
        }
      }
    }

    await fallbackClipboard(text);
  } finally {
    shareInProgress = false;
    if (shareBtn) shareBtn.disabled = false;
  }
}

function toggleMute(): void {
  audio.setMuted(!audio.isMuted());
  const soundIcon = $("soundIcon");
  const inGame = engine?.isActive();
  if (audio.isMuted()) {
    soundIcon.innerHTML = icon("volume-xmark", "text-red-400");
    if (inGame) {
      showHrMemo("Synthesizer muted.", { variant: "info", durationMs: 1000 });
    } else {
      showToast("Synthesizer Muted");
    }
  } else {
    soundIcon.innerHTML = icon("volume-high", "text-sm");
    if (inGame) {
      showHrMemo("Synthesizer live.", { variant: "info", durationMs: 1000 });
    } else {
      showToast("Synthesizer Unmuted");
    }
    audio.init();
    audio.unmuteTest();
  }
}

let lastPointerTapAt = 0;
let playAreaResizeObserver: ResizeObserver | null = null;
let viewportResizeTimer: ReturnType<typeof setTimeout> | null = null;

function onViewportResize(): void {
  if (!engine?.isActive()) return;
  layoutRungs();
  layoutPlayerPosition(playerAtCorridor ? "center" : engine.getPlayerSide());
}

function installViewportResizeHandler(): void {
  const schedule = (): void => {
    if (viewportResizeTimer !== null) clearTimeout(viewportResizeTimer);
    viewportResizeTimer = setTimeout(() => {
      viewportResizeTimer = null;
      onViewportResize();
    }, 100);
  };
  window.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", schedule);
}

function attachPlayAreaObserver(): void {
  const playArea = $("gamePlayArea");
  if (playAreaResizeObserver) {
    playAreaResizeObserver.disconnect();
  }
  playAreaResizeObserver = new ResizeObserver(() => {
    layoutRungs();
    if (engine.isActive()) {
      layoutPlayerPosition(playerAtCorridor ? "center" : engine.getPlayerSide());
    }
  });
  playAreaResizeObserver.observe(playArea);
}

function attemptGameTap(side: PlayerSide, source: "pointer" | "keyboard", buttonEl?: HTMLElement): void {
  const now = Date.now();
  if (now - lastPointerTapAt < MIN_TAP_INTERVAL_MS) {
    debugLog("tap", "ui throttle", { side, ms: now - lastPointerTapAt, source });
    showToast("Too fast — one tap per beat", { surface: "game" });
    if (source === "pointer" && buttonEl) {
      hapticImpact("rigid");
      triggerClimbPop(buttonEl);
    }
    return;
  }

  if (isTutorialOverlayActive()) {
    const required = getSafeTapSide(engine.getRungs()[1]);
    if (required !== null && side !== required) {
      showHrMemo(getTutorialWrongTapMessage(side), { variant: "info", durationMs: 1200 });
      hapticImpact("rigid");
      if (source === "pointer" && buttonEl) triggerClimbPop(buttonEl);
      return;
    }
  }

  lastPointerTapAt = now;
  const climbedBefore = engine.getRungsClimbed();
  engine.handleTap(side);
  if (!isTutorialDone() && climbedBefore < 3 && engine.getRungsClimbed() >= 3) {
    markTutorialDone();
  }
  updateImminentRungHint();
  if (earlyTapsRemaining > 0) {
    earlyTapsRemaining--;
    if (earlyTapsRemaining === 0) hideTapDeckHint();
  }
}

function bindTapButton(el: HTMLElement, side: PlayerSide): void {
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    attemptGameTap(side, "pointer", el);
  });
}

function signalCaptureReady(delayMs = 0): void {
  window.setTimeout(() => {
    requestAnimationFrame(() => {
      layoutRungs();
      requestAnimationFrame(() => {
        (window as unknown as Record<string, unknown>).__CL_CAPTURE_READY__ = true;
      });
    });
  }, delayMs);
}

function applyDailyModifierUi(modifier: DailyModifier): void {
  activeDailyModifier = modifier;
  $("dailyShiftLabel").textContent = modifier.label;
  const pill = $("dailyShiftPill");
  if (pill) {
    pill.title = modifier.description;
    pill.classList.toggle("ticker-shift-emphasis", modifier.id !== "standard");
  }

  const viewport = document.querySelector(".cl-viewport");
  if (viewport) {
    for (const cls of GRID_TINT_CLASSES) {
      viewport.classList.remove(cls);
    }
    if (modifier.gridTintClass) {
      viewport.classList.add(modifier.gridTintClass);
    }
  }
}

function mountMarketingHomeCapture(): void {
  void import("./game/marketing-capture").then((m) => {
    hideAuthDegradedBanner();
    username = m.MARKETING_HOME_USERNAME;
    ($("usernameInput") as HTMLInputElement).value = username;
    highScore = m.MARKETING_HOME_HIGH_SCORE;
    bestRank = rankFromYears(Math.floor(highScore));
    applyDailyModifierUi(m.MARKETING_HOME_MODIFIER);
    ensureTickerHeadlines();
    refreshHomeBadgeUI();
    switchTab("home");
    $("startScreen").scrollTop = 0;
    signalCaptureReady(500);
  });
}

function mountMarketingGameCapture(): void {
  void import("./game/marketing-capture").then((m) => {
    document.documentElement.dataset.ogCapture = "1";
    document.documentElement.dataset.captureVariant = "marketing";
    applyDailyModifierUi(m.MARKETING_GAME_MODIFIER);

    $("soundToggleBtn").classList.add("hidden");
    hideHudTapHint();
    hideTapDeckHint();
    hideHrMemo();

    prevRungsSnapshot = [];
    earlyTapsRemaining = 0;
    playerInPanic = false;
    playerAtCorridor = false;
    $("playerActionEmoji").classList.remove("idle-bob");

    engine.applyOgCaptureSnapshot(
      m.buildMarketingGameRungs(),
      m.MARKETING_GAME_SCORE,
      m.MARKETING_GAME_ENERGY,
      m.MARKETING_GAME_PLAYER_SIDE,
      m.MARKETING_GAME_RANK
    );

    updateRankUI(m.MARKETING_GAME_RANK);
    updateMilestoneChip(m.MARKETING_GAME_YEARS);
    updateFloorLabel(m.MARKETING_GAME_YEARS);
    updateReorgHudStrip(m.MARKETING_GAME_RANK, INTERN_TUTORIAL_RUNGS);
    $("burnoutMeter").style.width = `${m.MARKETING_GAME_ENERGY}%`;
    $("burnoutPercentLabel").textContent = `${m.MARKETING_GAME_ENERGY}%`;
    $("gameYearsLabel").textContent = m.MARKETING_GAME_YEARS.toFixed(1);
    updateImminentRungHint();

    switchTab("game");

    requestAnimationFrame(() => {
      layoutRungs();
      layoutPlayerPosition("center");
      signalCaptureReady();
    });
  });
}

function applyMarketingGameOverUi(result: GameOverResult): void {
  lastGameResult = result;
  $("statYears").textContent = `${result.yearsSurvived.toFixed(1)} Years`;
  $("statRank").innerHTML = `<span>${rankEmoji(result.finalRank)}</span> ${result.finalRank}`;
  $("terminationCauseIcon").textContent = DEATH_EMOJI[result.deathType];
  $("terminationCauseLabel").textContent = DEATH_LABELS[result.deathType];
  $("terminationReason").textContent = formatTerminationDisplayDetail(
    result.deathType,
    result.terminationDetail
  );
  $("reviewId").textContent = "REF-89412";
  applyStatBestDelta(result.yearsSurvived, 92.3, "Angel Investor", false);
  setGameOverContextLine(null);
  $("gameOverPunchline").textContent = pickGameOverPunchline({
    reapplyCount: 1,
    finalRank: result.finalRank,
    deathType: result.deathType,
    terminationFlavor: result.terminationFlavor,
  });
}

function mountMarketingGameOverCapture(): void {
  void import("./game/marketing-capture").then((m) => {
    hideAuthDegradedBanner();
    applyMarketingGameOverUi(m.MARKETING_GAMEOVER);
    switchTab("gameover");
    signalCaptureReady(300);
  });
}

function mountOgCaptureMode(): void {
  void import("./game/og-capture").then((og) => {
    document.documentElement.dataset.ogCapture = "1";
    activeDailyModifier = og.OG_CAPTURE_DAILY_MODIFIER;

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
      og.buildOgCaptureRungs(),
      og.OG_CAPTURE_SCORE,
      og.OG_CAPTURE_ENERGY,
      og.OG_CAPTURE_PLAYER_SIDE,
      og.OG_CAPTURE_RANK
    );

    updateRankUI(og.OG_CAPTURE_RANK);
    updateMilestoneChip(og.OG_CAPTURE_YEARS);
    updateFloorLabel(og.OG_CAPTURE_YEARS);
    updateReorgHudStrip(og.OG_CAPTURE_RANK, INTERN_TUTORIAL_RUNGS);
    $("burnoutMeter").style.width = `${og.OG_CAPTURE_ENERGY}%`;
    $("burnoutPercentLabel").textContent = `${og.OG_CAPTURE_ENERGY}%`;
    $("gameYearsLabel").textContent = og.OG_CAPTURE_YEARS.toFixed(1);

    switchTab("game");

    requestAnimationFrame(() => {
      layoutRungs();
      layoutPlayerPosition("center");
      requestAnimationFrame(() => {
        (window as unknown as Record<string, unknown>).__CL_OG_READY__ = true;
      });
    });
  });
}

export function mountApp(): void {
  initTelegram();
  installPendingSubmitLifecycleGuards();
  bindSyncStatusRetry();
  setSyncRetryHandler(retryLastSubmit);
  mountHrStamp();
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
        updateSprintTimerChip();
        updateEnergyLabelVisibility();
        $("gameYearsLabel").textContent = years.toFixed(1);
        if (earlyTapsRemaining > 0 && engine.getRungsClimbed() > 0) {
          triggerClimbPop($("gameYearsLabel"));
        }
        updateMilestoneChip(years);
        updateFloorLabel(years);
        maybeFlashFloorBandTransition(years);
        updateReorgHudStrip(engine.getCurrentRank(), engine.getRungsClimbed());
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
        triggerRankBadgePulse($("gameRankBadge"));
        showHrMemo(message, { variant: "promo", durationMs: 1400 });
        hapticNotification("success");
        const promoEmoji =
          rank === "Manager"
            ? "📋"
            : rank === "Director"
              ? "💼"
              : rank === "CEO"
                ? "👑"
                : rank === "Board Member"
                  ? "🏛️"
                  : rank === "Angel Investor"
                    ? "👼"
                    : "🎉";
        spawnFloatingParticles($("playerClimber"), promoEmoji, 4);
      },
      onGameOver,
      onCoffee: (side, rungId) => {
        qaCoffeePickups++;
        debugLog("coffee", "callback", { side, rungId });
        const badge = findImminentCoffeeBadge(side);
        if (badge) {
          triggerCoffeePickup(badge, $("gamePlayArea"));
        }
        flashPlayerEmoji("🤤", 550);
        showHrMemo("+25% Energy Recovery! ☕", { variant: "info" });
        triggerMeterFlash($("burnoutMeter"));
        spawnFloatingParticles($("playerClimber"), "☕", 5);
        hapticImpact("medium");
      },
      onToast: (msg) => {
        const isFakePromo = FAKE_PROMO_MESSAGES.has(msg);
        showHrMemo(msg, {
          variant: isFakePromo ? "promo" : "info",
          durationMs: isFakePromo ? 1400 : undefined,
        });
      },
      onNearMiss: () => {
        triggerNearMissWince($("playerClimber"));
        hapticImpact("light");
      },
      onTriagePrompt: () => {
        showHrMemo(TRIAGE_PROMPT, { variant: "alert", durationMs: 1800 });
        hapticImpact("medium");
      },
    },
    renderRungsWithReorgFeedback,
    updatePlayerPosition,
    () => {
      hideHudTapHint();
      if (isTutorialDone() && getReapplyCount() <= 1) {
        showHrMemo(
          "TAP LEFT or RIGHT — dodge the occupied side.",
          { variant: "info", durationMs: 1400 }
        );
      }
      if (!shiftToastShown && activeDailyModifier.id !== "standard") {
        shiftToastShown = true;
        showHrMemo("Shift rules active", { variant: "alert" });
      }
      if (
        !meetingMondayMemoShown &&
        activeDailyModifier.id === "meeting_monday"
      ) {
        meetingMondayMemoShown = true;
        showHrMemo(MEETING_MONDAY_OPENING_MEMO, { variant: "promo", durationMs: 1400 });
      }
    },
    getCaptureFlags().og ? getDailyModifierById("reorg_week") : undefined
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

  attachPlayAreaObserver();
  installViewportResizeHandler();

  window.addEventListener("keydown", (e) => {
    if (!engine.isActive()) return;
    if (e.repeat) return;
    if (e.key === "ArrowLeft") attemptGameTap("left", "keyboard");
    if (e.key === "ArrowRight") attemptGameTap("right", "keyboard");
  });

  document.querySelectorAll("[data-lb-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setLeaderboardPeriod(btn.getAttribute("data-lb-tab") as LeaderboardPeriod));
  });

  bindShellActions();

  (window as unknown as Record<string, unknown>).goHome = goHome;
  (window as unknown as Record<string, unknown>).startGame = startGame;
  (window as unknown as Record<string, unknown>).onReviveAdClick = onReviveAdClick;
  (window as unknown as Record<string, unknown>).cycleAvatarEmoji = () => {
    const next = cycleAvatarEmoji(getStoredAvatarEmoji() as AvatarEmoji);
    $("avatarIcon").textContent = next;
    if (engine?.getCurrentRank() === "Intern" && !playerInPanic) {
      $("playerActionEmoji").textContent = next;
    }
    showToast("Avatar updated for your employee badge.");
  };
  (window as unknown as Record<string, unknown>).switchTab = (tab: string) => {
    if (tab === "leaderboard") {
      switchTab("leaderboard");
      renderLeaderboard();
    } else if (tab === "howtoplay") {
      switchTab("howtoplay");
    } else if (tab === "gameover" && import.meta.env.DEV) {
      seedGameOverForQa();
      switchTab("gameover");
    }
  };
  (window as unknown as Record<string, unknown>).copyShareText = copyShareText;
  (window as unknown as Record<string, unknown>).dismissChallengeBanner = dismissChallengeBanner;
  (window as unknown as Record<string, unknown>).openPromptAnatomy = openPromptAnatomy;
  (window as unknown as Record<string, unknown>).toggleMute = toggleMute;
  (window as unknown as Record<string, unknown>).dismissAuthBanner = dismissAuthBanner;

  if (new URLSearchParams(window.location.search).get("qa") === "1") {
    (window as unknown as Record<string, unknown>).clQa = {
      snapshot: () => ({
        rungs: engine.getRungs().slice(0, 5).map((r) => ({
          id: r.id,
          obstacle: r.obstacle,
          coffee: r.coffee,
          type: r.type,
        })),
        timeLeft: engine.getTimeLeft(),
        climbed: engine.getRungsClimbed(),
        playerSide: engine.getPlayerSide(),
        coffeePickups: qaCoffeePickups,
      }),
      getCoffeePickups: () => qaCoffeePickups,
      forceImminentRung: (spec: { obstacle: PlayerSide; type: ObstacleType }) => {
        const rungs = engine.getRungs();
        if (rungs[1]) {
          rungs[1].obstacle = spec.obstacle;
          rungs[1].type = spec.type;
          rungs[1].coffee = null;
        }
      },
      refreshRungs: () => renderRungsWithReorgFeedback(),
    };
  }

  updateRankUI("Intern");
  refreshHomeBadgeUI();

  const captureFlags = getCaptureFlags();
  marketingGameCapture = captureFlags.capture === "game";

  if (captureFlags.og) {
    mountOgCaptureMode();
    return;
  }
  if (captureFlags.capture === "home") {
    mountMarketingHomeCapture();
    return;
  }
  if (captureFlags.capture === "game") {
    mountMarketingGameCapture();
    return;
  }
  if (captureFlags.capture === "gameover") {
    mountMarketingGameOverCapture();
    return;
  }

  refreshDailyShiftUI();
  syncTelegramBackButton("home");
  syncTelegramMainButton("home");
  syncSoundFabPlacement("home");

  const challengeYears = parseChallengeParam(getStartParam());
  if (challengeYears !== null && challengeYears > 0) {
    challengeTargetYears = challengeYears;
    challengeBannerDismissed = false;
    refreshChallengeBanner();
  } else {
    refreshHomeContextSlot();
  }

  ensureTickerHeadlines();

  const initData = getInitData();
  if (initData && isTelegram()) {
    setHomeBadgeSkeleton(true);
    fetchProfile(initData)
      .then((result) => {
        if (result.ok) {
          hideAuthDegradedBanner();
          const profile = result.profile;
          highScore = profile.best_score;
          bestRank = rankFromCareerHigh(highScore);
          engine?.setCareerBestYears(highScore);
          refreshHomeBadgeUI();
          ensureTickerHeadlines();
          if (profile.first_name || profile.username) {
            username = profile.username ?? profile.first_name ?? username;
            ($("usernameInput") as HTMLInputElement).value = username;
          }
        } else {
          showAuthDegradedBanner(result.reason);
        }
      })
      .finally(() => setHomeBadgeSkeleton(false));
  }
}
