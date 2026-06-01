/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detachBadgeForOverlay, triggerCoffeePickup, triggerDeathEmoji } from "./effects";

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

describe("coffee pickup overlay", () => {
  let reducedMotion = false;
  const mockMediaQueryList = {
    get matches() {
      return reducedMotion;
    },
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as MediaQueryList;

  beforeEach(() => {
    reducedMotion = false;
    document.body.innerHTML = `
      <div id="gamePlayArea" class="game-play-area" style="position:relative;width:320px;height:400px">
        <div class="next-rung">
          <div class="left-slot"><div class="coffee-badge obstacle-badge">coffee</div></div>
        </div>
      </div>`;
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mockMediaQueryList));
    Element.prototype.getBoundingClientRect = vi.fn(function (this: Element) {
      if (this.classList?.contains("coffee-badge")) {
        return { left: 40, top: 80, width: 48, height: 40, right: 88, bottom: 120, x: 40, y: 80, toJSON: () => ({}) };
      }
      if (this.id === "gamePlayArea") {
        return { left: 0, top: 0, width: 320, height: 400, right: 320, bottom: 400, x: 0, y: 0, toJSON: () => ({}) };
      }
      return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON: () => ({}) };
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reparents badge into play area before animation", () => {
    const playArea = document.getElementById("gamePlayArea")!;
    const badge = playArea.querySelector(".coffee-badge") as HTMLElement;
    const slot = playArea.querySelector(".left-slot") as HTMLElement;

    triggerCoffeePickup(badge, playArea);

    expect(slot.contains(badge)).toBe(false);
    expect(playArea.contains(badge)).toBe(true);
    expect(badge.style.position).toBe("absolute");
    expect(badge.classList.contains("coffee-pickup")).toBe(true);
  });

  it("lets imminent slot repaint after detach", () => {
    const playArea = document.getElementById("gamePlayArea")!;
    const badge = playArea.querySelector(".coffee-badge") as HTMLElement;
    const slot = playArea.querySelector(".left-slot") as HTMLElement;

    detachBadgeForOverlay(badge, playArea);
    slot.innerHTML = `<div class="obstacle-badge">meeting</div>`;

    expect(slot.querySelector(".coffee-badge")).toBeNull();
    expect(slot.querySelector(".obstacle-badge")?.textContent).toBe("meeting");
    expect(playArea.contains(badge)).toBe(true);
  });

  it("removes badge immediately under reduced motion", () => {
    reducedMotion = true;
    const playArea = document.getElementById("gamePlayArea")!;
    const badge = playArea.querySelector(".coffee-badge") as HTMLElement;
    let completed = false;

    triggerCoffeePickup(badge, playArea, () => {
      completed = true;
    });

    expect(completed).toBe(true);
    expect(document.querySelector(".coffee-badge")).toBeNull();
    reducedMotion = false;
  });

  it("calls onComplete after animation end", () => {
    const playArea = document.getElementById("gamePlayArea")!;
    const badge = playArea.querySelector(".coffee-badge") as HTMLElement;
    let completed = false;

    triggerCoffeePickup(badge, playArea, () => {
      completed = true;
    });

    badge.dispatchEvent(new Event("animationend"));
    expect(completed).toBe(true);
    expect(document.querySelector(".coffee-badge")).toBeNull();
  });
});
