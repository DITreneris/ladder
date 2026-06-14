import { describe, expect, it } from "vitest";

import { resolveReviveSubmitState, shouldClearPendingOnRevive } from "./submit-orchestrator";

describe("shouldClearPendingOnRevive", () => {
  it("does not clear when submit is still deferred", () => {
    expect(shouldClearPendingOnRevive(true)).toBe(false);
  });

  it("clears when submit is not deferred", () => {
    expect(shouldClearPendingOnRevive(false)).toBe(true);
  });
});

describe("resolveReviveSubmitState", () => {
  it("allows restore even when pending remains after failed flush", () => {
    expect(resolveReviveSubmitState({ flushOk: false, stillDeferred: true })).toEqual({
      canRestore: true,
      keepPending: true,
    });
  });

  it("drops pending flag after successful flush", () => {
    expect(resolveReviveSubmitState({ flushOk: true, stillDeferred: false })).toEqual({
      canRestore: true,
      keepPending: false,
    });
  });
});
