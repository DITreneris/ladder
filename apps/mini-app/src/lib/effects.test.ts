/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { triggerDeathEmoji } from "./effects";

describe("triggerDeathEmoji", () => {
  beforeEach(() => {
    document.body.innerHTML = '<span id="playerActionEmoji">🧑‍💻</span>';
    vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as MediaQueryList);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
