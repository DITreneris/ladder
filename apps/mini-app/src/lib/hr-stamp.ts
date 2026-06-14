import { respectsReducedMotion } from "./effects";
import { hapticImpact } from "./telegram";

const STAMP_LABELS = [
  "APPROVED",
  "REJECTED",
  "NEEDS MORE SYNERGY",
  "PENDING REVIEW",
  "FILED",
  "NEEDS VP SIGN-OFF",
] as const;

const SLOW_SYNC_MS = 2000;

let stampCount = 0;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let syncStartedAt = 0;
let mounted = false;

function padEl(): HTMLElement | null {
  return document.getElementById("hrStampPad");
}

function countEl(): HTMLElement | null {
  return document.getElementById("hrStampCount");
}

function popEl(): HTMLElement | null {
  return document.getElementById("hrStampPop");
}

function pickLabel(): string {
  return STAMP_LABELS[Math.floor(Math.random() * STAMP_LABELS.length)]!;
}

export function resetHrStamp(): void {
  stampCount = 0;
  syncStartedAt = 0;
  mounted = false;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  hideHrStamp();
}

export function hideHrStamp(): void {
  padEl()?.classList.add("hidden");
  popEl()?.classList.add("hidden");
}

export function notifySyncStarted(): void {
  if (respectsReducedMotion()) return;
  if (document.documentElement.dataset.ogCapture === "1") return;
  syncStartedAt = Date.now();
  showTimer = setTimeout(() => {
    showTimer = null;
    if (syncStartedAt > 0) padEl()?.classList.remove("hidden");
  }, SLOW_SYNC_MS);
}

export function notifySyncRetrying(): void {
  if (respectsReducedMotion()) return;
  if (document.documentElement.dataset.ogCapture === "1") return;
  padEl()?.classList.remove("hidden");
}

export function notifySyncEnded(): void {
  syncStartedAt = 0;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  hideHrStamp();
}

export function mountHrStamp(): void {
  if (mounted) return;
  const btn = document.getElementById("hrStampBtn");
  if (!btn) return;
  mounted = true;
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const pad = padEl();
    if (!pad || pad.classList.contains("hidden")) return;
    stampCount += 1;
    const count = countEl();
    if (count) count.textContent = String(stampCount);
    const pop = popEl();
    if (pop) {
      pop.textContent = pickLabel();
      pop.classList.remove("hidden", "hr-stamp-pop--animate");
      void pop.offsetWidth;
      pop.classList.add("hr-stamp-pop--animate");
      pop.addEventListener(
        "animationend",
        () => pop.classList.remove("hr-stamp-pop--animate"),
        { once: true }
      );
    }
    hapticImpact("light");
  });
}

export function getHrStampCountForTests(): number {
  return stampCount;
}
