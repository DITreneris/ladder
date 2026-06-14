/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHrStampCountForTests, mountHrStamp, notifySyncStarted, resetHrStamp } from "./hr-stamp";

describe("hr-stamp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    document.body.innerHTML = `
      <div id="hrStampPad" class="hidden">
        <button type="button" id="hrStampBtn">
          <span id="hrStampCount">0</span>
        </button>
        <span id="hrStampPop" class="hidden"></span>
      </div>`;
    resetHrStamp();
    mountHrStamp();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals pad after slow sync threshold", () => {
    notifySyncStarted();
    expect(document.getElementById("hrStampPad")!.classList.contains("hidden")).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(document.getElementById("hrStampPad")!.classList.contains("hidden")).toBe(false);
  });

  it("increments stamp count on tap", () => {
    document.getElementById("hrStampPad")!.classList.remove("hidden");
    const btn = document.getElementById("hrStampBtn")!;
    btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    expect(getHrStampCountForTests()).toBe(1);
    expect(document.getElementById("hrStampCount")!.textContent).toBe("1");
  });
});
