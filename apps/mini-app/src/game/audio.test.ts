import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  audio,
  __getBgmElementForTest,
  __getRampTargetForTest,
  __resetBgmForTest,
  __setBgmModeForTest,
} from "./audio";

describe("audio BGM defer", () => {
  const loadMock = vi.fn();

  beforeEach(() => {
    __resetBgmForTest();
    loadMock.mockClear();
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal(
      "Audio",
      vi.fn().mockImplementation(() => ({
        loop: false,
        volume: 0,
        preload: "none",
        load: loadMock,
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    __resetBgmForTest();
  });

  it("does not create BGM element until prepareBgmForRun", () => {
    expect(__getBgmElementForTest()).toBeNull();
    audio.prepareBgmForRun();
    const el = __getBgmElementForTest();
    expect(el).not.toBeNull();
    expect(el?.preload).toBe("auto");
    expect(loadMock).toHaveBeenCalledOnce();
  });

  it("sets executive ramp target when intensifying board tier", () => {
    audio.prepareBgmForRun();
    const el = __getBgmElementForTest()!;
    el.volume = 0.14;
    __setBgmModeForTest("run");
    audio.intensifyExecutiveBgm("board");
    expect(__getRampTargetForTest()).toBe(0.17);
  });

  it("sets higher executive ramp target for angel tier", () => {
    audio.prepareBgmForRun();
    const el = __getBgmElementForTest()!;
    el.volume = 0.17;
    __setBgmModeForTest("run");
    audio.intensifyExecutiveBgm("angel");
    expect(__getRampTargetForTest()).toBe(0.2);
  });
});
