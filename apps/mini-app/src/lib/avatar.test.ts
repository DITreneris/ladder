import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AVATAR_EMOJI_OPTIONS,
  cycleAvatarEmoji,
  getStoredAvatarEmoji,
  setStoredAvatarEmoji,
} from "./avatar";

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("avatar emoji picker", () => {
  beforeEach(() => {
    (globalThis as { localStorage?: Storage }).localStorage = createStorage();
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it("defaults to neutral technologist emoji", () => {
    expect(getStoredAvatarEmoji()).toBe("🧑‍💻");
  });

  it("persists selection", () => {
    setStoredAvatarEmoji("👩‍💻");
    expect(getStoredAvatarEmoji()).toBe("👩‍💻");
  });

  it("cycles through all options", () => {
    setStoredAvatarEmoji("👩‍💻");
    expect(cycleAvatarEmoji("👩‍💻")).toBe("👨‍💻");
    expect(cycleAvatarEmoji("👨‍💻")).toBe("🧑‍💻");
    expect(cycleAvatarEmoji("🧑‍💻")).toBe("👩‍💻");
    expect(AVATAR_EMOJI_OPTIONS).toHaveLength(3);
  });
});
