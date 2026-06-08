import { describe, expect, it } from "vitest";

import { statusToReason } from "./api";

describe("statusToReason", () => {
  it("maps 401 to auth", () => {
    expect(statusToReason(401)).toBe("auth");
  });

  it("maps 429 to rate_limit", () => {
    expect(statusToReason(429)).toBe("rate_limit");
  });

  it("maps 400 and 422 to validation", () => {
    expect(statusToReason(400)).toBe("validation");
    expect(statusToReason(422)).toBe("validation");
  });

  it("maps 5xx to server", () => {
    expect(statusToReason(500)).toBe("server");
    expect(statusToReason(503)).toBe("server");
  });
});
