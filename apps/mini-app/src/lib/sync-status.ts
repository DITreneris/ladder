import { hapticImpact, hapticNotification } from "./telegram";

export type SyncStatusState = "hidden" | "syncing" | "retrying" | "ok" | "failed";

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let onRetryClick: (() => void) | null = null;

function chipEl(): HTMLElement | null {
  return document.getElementById("syncStatusChip");
}

function clearHideTimer(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

export function setSyncRetryHandler(handler: (() => void) | null): void {
  onRetryClick = handler;
}

export function resetSyncStatus(): void {
  clearHideTimer();
  setSyncStatus("hidden");
}

export function hideSyncStatus(): void {
  setSyncStatus("hidden");
}

export function setSyncStatus(state: SyncStatusState, countdownSec?: number): void {
  const el = chipEl();
  if (!el) return;

  clearHideTimer();

  if (state === "hidden") {
    el.classList.add("hidden");
    el.classList.remove("sync-status-chip--syncing", "sync-status-chip--retrying", "sync-status-chip--ok", "sync-status-chip--failed");
    el.removeAttribute("role");
    return;
  }

  el.classList.remove("hidden");
  el.classList.remove("sync-status-chip--syncing", "sync-status-chip--retrying", "sync-status-chip--ok", "sync-status-chip--failed");
  el.classList.add(`sync-status-chip--${state}`);
  el.setAttribute("role", "status");

  const textEl = document.getElementById("syncStatusText");
  if (!textEl) return;

  if (state === "syncing") {
    textEl.textContent = "Stamping timesheet…";
  } else if (state === "retrying") {
    const sec = countdownSec ?? 0;
    textEl.textContent = sec > 0 ? `HR cooldown — retry in ${sec}s` : "HR cooldown — retrying…";
  } else if (state === "ok") {
    textEl.textContent = "Filed with HR";
    hapticNotification("success");
    hideTimer = setTimeout(() => setSyncStatus("hidden"), 1200);
  } else if (state === "failed") {
    textEl.textContent = "Run saved locally — tap to retry";
  }
}

export function bindSyncStatusRetry(): void {
  const el = chipEl();
  if (!el || el.dataset.bound === "1") return;
  el.dataset.bound = "1";
  el.addEventListener("click", () => {
    if (el.classList.contains("sync-status-chip--failed") && onRetryClick) {
      hapticImpact("light");
      onRetryClick();
    }
  });
}
