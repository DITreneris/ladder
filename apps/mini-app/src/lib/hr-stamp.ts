import { trackEvent } from "./analytics";
import { respectsReducedMotion } from "./effects";
import { hapticImpact } from "./telegram";

type StampPhase = "slow" | "retry";

const SLOW_LABELS = [
  "PENDING REVIEW",
  "NEEDS VP SIGN-OFF",
  "ROUTING TO COMPLIANCE",
  "IN THE TRAY",
  "NEEDS MORE SYNERGY",
] as const;

const RETRY_LABELS = [
  "IN QUEUE",
  "STILL PROCESSING",
  "AWAITING STAMP",
  "COOLDOWN HOLD",
  "NEEDS MORE SYNERGY",
] as const;

const PHASE_HINT: Record<StampPhase, string> = {
  slow: "HR backlog — stamp while they catch up.",
  retry: "Cooldown — HR is stalling.",
};

const SLOW_SYNC_MS = 2000;
const FILED_POP_MS = 350;
const EXIT_ANIM_MS = 280;

let stampCount = 0;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let syncStartedAt = 0;
let mounted = false;
let activePhase: StampPhase | null = null;
let ventTracked = false;

function padEl(): HTMLElement | null {
  return document.getElementById("hrStampPad");
}

function countEl(): HTMLElement | null {
  return document.getElementById("hrStampCount");
}

function popEl(): HTMLElement | null {
  return document.getElementById("hrStampPop");
}

function hintEl(): HTMLElement | null {
  return document.getElementById("hrStampHint");
}

function pickLabel(phase: StampPhase): string {
  const pool = phase === "retry" ? RETRY_LABELS : SLOW_LABELS;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function clearPhaseClasses(pad: HTMLElement): void {
  pad.classList.remove("hr-stamp-pad--slow", "hr-stamp-pad--retry", "hr-stamp-pad--enter", "hr-stamp-pad--exit");
}

function showPad(phase: StampPhase): void {
  if (document.documentElement.dataset.ogCapture === "1") return;

  const pad = padEl();
  if (!pad) return;

  activePhase = phase;
  clearPhaseClasses(pad);
  pad.classList.add(`hr-stamp-pad--${phase}`);

  const hint = hintEl();
  if (hint) {
    hint.textContent = PHASE_HINT[phase];
    hint.classList.remove("hidden");
  }

  pad.classList.remove("hidden");
  if (!respectsReducedMotion()) {
    pad.classList.add("hr-stamp-pad--enter");
    pad.addEventListener(
      "animationend",
      () => pad.classList.remove("hr-stamp-pad--enter"),
      { once: true }
    );
  }
}

function hidePadImmediate(): void {
  const pad = padEl();
  if (pad) {
    clearPhaseClasses(pad);
    pad.classList.add("hidden");
  }
  hintEl()?.classList.add("hidden");
  popEl()?.classList.add("hidden");
  activePhase = null;
  ventTracked = false;
}

function hidePadAnimated(): void {
  const pad = padEl();
  if (!pad || pad.classList.contains("hidden")) {
    hidePadImmediate();
    return;
  }

  if (respectsReducedMotion()) {
    hidePadImmediate();
    return;
  }

  pad.classList.remove("hr-stamp-pad--enter");
  pad.classList.add("hr-stamp-pad--exit");
  pad.addEventListener(
    "animationend",
    () => hidePadImmediate(),
    { once: true }
  );
  setTimeout(() => {
    if (!pad.classList.contains("hidden")) hidePadImmediate();
  }, EXIT_ANIM_MS + 50);
}

export function resetHrStamp(): void {
  stampCount = 0;
  syncStartedAt = 0;
  ventTracked = false;
  activePhase = null;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  hidePadImmediate();
}

export function hideHrStamp(): void {
  hidePadImmediate();
}

export function notifySyncStarted(): void {
  if (document.documentElement.dataset.ogCapture === "1") return;
  syncStartedAt = Date.now();
  showTimer = setTimeout(() => {
    showTimer = null;
    if (syncStartedAt > 0) showPad("slow");
  }, SLOW_SYNC_MS);
}

export function notifySyncRetrying(): void {
  if (document.documentElement.dataset.ogCapture === "1") return;
  showPad("retry");
}

export function notifySyncEnded(): void {
  syncStartedAt = 0;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }

  const pad = padEl();
  if (!pad || pad.classList.contains("hidden")) {
    hidePadImmediate();
    return;
  }

  if (stampCount > 0 && !respectsReducedMotion()) {
    const pop = popEl();
    if (pop) {
      pop.textContent = "FILED";
      pop.classList.remove("hidden", "hr-stamp-pop--animate");
      void pop.offsetWidth;
      pop.classList.add("hr-stamp-pop--animate");
    }
    setTimeout(() => hidePadAnimated(), FILED_POP_MS);
    return;
  }

  hidePadAnimated();
}

export function mountHrStamp(): void {
  if (mounted) return;
  const btn = document.getElementById("hrStampBtn");
  if (!btn) return;
  mounted = true;
  btn.addEventListener("pointerdown", onStampTap);
}

function onStampTap(e: PointerEvent): void {
  e.preventDefault();
  const pad = padEl();
  if (!pad || pad.classList.contains("hidden") || !activePhase) return;
  stampCount += 1;
  const count = countEl();
  if (count) count.textContent = String(stampCount);
  const pop = popEl();
  if (pop) {
    pop.textContent = pickLabel(activePhase);
    pop.classList.remove("hidden", "hr-stamp-pop--animate");
    void pop.offsetWidth;
    pop.classList.add("hr-stamp-pop--animate");
    pop.addEventListener(
      "animationend",
      () => pop.classList.remove("hr-stamp-pop--animate"),
      { once: true }
    );
  }
  if (!ventTracked) {
    ventTracked = true;
    trackEvent("hr_stamp_vent", { reason: activePhase, count: stampCount });
  }
  hapticImpact("light");
}

/** Re-bind after DOM replacement (unit tests only). */
export function remountHrStampForTests(): void {
  mounted = false;
  mountHrStamp();
}

export function getHrStampCountForTests(): number {
  return stampCount;
}

export function getHrStampPhaseForTests(): StampPhase | null {
  return activePhase;
}
