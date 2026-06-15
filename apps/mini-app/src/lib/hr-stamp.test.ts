/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./analytics", () => ({
  trackEvent: vi.fn(),
}));

import {
  getHrStampCountForTests,
  getHrStampPhaseForTests,
  notifySyncEnded,
  notifySyncRetrying,
  notifySyncStarted,
  remountHrStampForTests,
  resetHrStamp,
} from "./hr-stamp";

function setupDom(reducedMotion = false): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  document.body.innerHTML = `
    <div id="hrStampPad" class="hr-stamp-pad hidden mt-3">
      <p id="hrStampHint" class="hr-stamp-hint hidden" aria-live="polite"></p>
      <button type="button" id="hrStampBtn" class="hr-stamp-btn">
        <span class="hr-stamp-btn-label">Vent to HR</span>
        <span class="hr-stamp-btn-sub">Stamps: <span id="hrStampCount">0</span></span>
      </button>
      <span id="hrStampPop" class="hr-stamp-pop hidden"></span>
    </div>`;
  resetHrStamp();
  remountHrStampForTests();
}

describe("hr-stamp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setupDom(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals pad after slow sync threshold with slow hint and phase class", () => {
    notifySyncStarted();
    expect(document.getElementById("hrStampPad")!.classList.contains("hidden")).toBe(true);
    vi.advanceTimersByTime(2000);
    const pad = document.getElementById("hrStampPad")!;
    expect(pad.classList.contains("hidden")).toBe(false);
    expect(pad.classList.contains("hr-stamp-pad--slow")).toBe(true);
    expect(document.getElementById("hrStampHint")!.textContent).toBe(
      "HR backlog — stamp while they catch up."
    );
    expect(getHrStampPhaseForTests()).toBe("slow");
  });

  it("reveals pad immediately on retry with retry hint and phase class", () => {
    notifySyncRetrying();
    const pad = document.getElementById("hrStampPad")!;
    expect(pad.classList.contains("hidden")).toBe(false);
    expect(pad.classList.contains("hr-stamp-pad--retry")).toBe(true);
    expect(document.getElementById("hrStampHint")!.textContent).toBe("Cooldown — HR is stalling.");
    expect(getHrStampPhaseForTests()).toBe("retry");
  });

  it("increments stamp count on tap with phase-appropriate labels only", () => {
    notifySyncRetrying();
    const btn = document.getElementById("hrStampBtn")!;
    btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    expect(getHrStampCountForTests()).toBe(1);
    expect(document.getElementById("hrStampCount")!.textContent).toBe("1");
    const popText = document.getElementById("hrStampPop")!.textContent ?? "";
    expect(popText).not.toMatch(/APPROVED|REJECTED|FILED/);
  });

  it("reveals pad under reduced motion after slow sync threshold", () => {
    setupDom(true);
    notifySyncStarted();
    vi.advanceTimersByTime(2000);
    expect(document.getElementById("hrStampPad")!.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("hrStampHint")!.classList.contains("hidden")).toBe(false);
  });

  it("hides pad on sync end after taps", () => {
    notifySyncRetrying();
    const btn = document.getElementById("hrStampBtn")!;
    btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    notifySyncEnded();
    vi.advanceTimersByTime(700);
    expect(document.getElementById("hrStampPad")!.classList.contains("hidden")).toBe(true);
    expect(getHrStampPhaseForTests()).toBe(null);
  });
});
