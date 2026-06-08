import { describe, expect, it } from "vitest";

import { shouldFlushPendingSubmitOnLeave } from "./pending-submit";

describe("shouldFlushPendingSubmitOnLeave", () => {
  it("flushes when deferred with result and not mid-revive run", () => {
    expect(shouldFlushPendingSubmitOnLeave(true, true, false)).toBe(true);
  });

  it("does not flush when not deferred", () => {
    expect(shouldFlushPendingSubmitOnLeave(false, true, false)).toBe(false);
  });

  it("does not flush when no pending result", () => {
    expect(shouldFlushPendingSubmitOnLeave(true, false, false)).toBe(false);
  });

  it("does not flush while awaiting revive run submit", () => {
    expect(shouldFlushPendingSubmitOnLeave(true, true, true)).toBe(false);
  });
});
