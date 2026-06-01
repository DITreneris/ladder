import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { audio, __getBgmElementForTest, __resetBgmForTest } from "./audio";

describe("audio BGM defer", () => {
  const loadMock = vi.fn();

  beforeEach(() => {
    __resetBgmForTest();
    loadMock.mockClear();
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
});
