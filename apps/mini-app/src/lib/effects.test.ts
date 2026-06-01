/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { triggerDeathEmoji } from "./effects";

describe("triggerDeathEmoji", () => {
  const mockMediaQueryList = {
    matches: false,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;

  beforeEach(() => {
    document.body.innerHTML = '<span id="playerActionEmoji">🧑‍💻</span>';
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mockMediaQueryList));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps death emoji until onComplete (does not restore rank emoji early)", () => {
    vi.useFakeTimers();
    const el = document.getElementById("playerActionEmoji")!;
    let completed = false;

    triggerDeathEmoji("meeting", () => {
      completed = true;
    });

    expect(el.textContent).toBe("💥");
    vi.advanceTimersByTime(200);
    expect(el.textContent).toBe("💥");
    vi.advanceTimersByTime(200);
    expect(completed).toBe(true);
    expect(el.textContent).toBe("💥");
    vi.useRealTimers();
  });
});
