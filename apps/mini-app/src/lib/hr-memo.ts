import { triggerPromoConfetti, triggerPromoStamp } from "./effects";

export type HrMemoVariant = "info" | "promo" | "alert";

export interface HrMemoEntry {
  text: string;
  variant: HrMemoVariant;
  from: string;
  durationMs: number;
}

export interface HrMemoOptions {
  variant?: HrMemoVariant;
  from?: string;
  durationMs?: number;
}

const DEFAULT_FROM: Record<HrMemoVariant, string> = {
  info: "People Ops",
  promo: "People Ops",
  alert: "HR Systems",
};

export function randomRef(): string {
  return `REF-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function createHrMemoScheduler(
  onShow: (entry: HrMemoEntry) => void,
  onHide: () => void
) {
  const queue: HrMemoEntry[] = [];
  let showing = false;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer(): void {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function showNext(): void {
    if (queue.length === 0) {
      showing = false;
      onHide();
      return;
    }

    showing = true;
    const entry = queue.shift()!;
    onShow(entry);

    clearTimer();
    hideTimer = setTimeout(() => {
      hideTimer = null;
      showNext();
    }, entry.durationMs);
  }

  return {
    show(text: string, opts?: HrMemoOptions): void {
      const variant = opts?.variant ?? "info";
      queue.push({
        text,
        variant,
        from: opts?.from ?? DEFAULT_FROM[variant],
        durationMs: opts?.durationMs ?? 1200,
      });
      while (queue.length > 1) {
        const dropIdx = queue.findIndex((e) => e.variant !== "promo");
        if (dropIdx === -1) break;
        queue.splice(dropIdx, 1);
      }
      if (!showing) showNext();
    },
    hide(): void {
      queue.length = 0;
      clearTimer();
      showing = false;
      onHide();
    },
    getQueueLength(): number {
      return queue.length;
    },
    isShowing(): boolean {
      return showing;
    },
  };
}

function applyVariant(rail: HTMLElement, variant: HrMemoVariant): void {
  rail.classList.remove("hr-memo-rail--info", "hr-memo-rail--promo", "hr-memo-rail--alert");
  rail.classList.add(`hr-memo-rail--${variant}`);
  rail.querySelector(".hr-memo-stamp-wrap")?.classList.toggle("hidden", variant !== "promo");
}

function renderMemo(entry: HrMemoEntry): void {
  const rail = document.getElementById("hrMemoRail");
  const strip = document.getElementById("hrMemoStrip");
  const fromEl = document.getElementById("hrMemoFrom");
  const textEl = document.getElementById("hrMemoText");
  const refEl = document.getElementById("hrMemoRef");
  if (!rail || !fromEl || !textEl || !refEl) return;

  applyVariant(rail, entry.variant);
  fromEl.textContent = entry.from;
  textEl.textContent = entry.text;
  refEl.textContent = randomRef();
  rail.classList.remove("hidden", "hr-memo-enter");
  strip?.classList.add("hr-memo-strip--active");
  void rail.offsetWidth;
  rail.classList.add("hr-memo-enter");

  if (entry.variant === "promo") {
    triggerPromoConfetti(rail);
    triggerPromoStamp(rail);
  }
}

function hideRail(): void {
  document.getElementById("hrMemoRail")?.classList.add("hidden");
  document.getElementById("hrMemoStrip")?.classList.remove("hr-memo-strip--active");
}

const hrMemo = createHrMemoScheduler(renderMemo, hideRail);

export function showHrMemo(text: string, opts?: HrMemoOptions): void {
  hrMemo.show(text, opts);
}

/** Join lines into one memo (2-line clamp) to save vertical HUD budget. */
export function showHrMemoCombined(lines: string[], opts?: HrMemoOptions): void {
  const text = lines.filter(Boolean).join(" ");
  if (!text) return;
  hrMemo.show(text, opts);
}

export function hideHrMemo(): void {
  hrMemo.hide();
}

/** @internal Test hook for queue behavior without DOM. */
export function createHrMemoSchedulerForTests(
  onShow: (entry: HrMemoEntry) => void,
  onHide: () => void
) {
  return createHrMemoScheduler(onShow, onHide);
}
