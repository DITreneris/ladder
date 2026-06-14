import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { statusToReason, submitRun, SUBMIT_COOLDOWN_RETRY_MS } from "./api";

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

describe("submitRun", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("derives Director rank from years and retries after 429", async () => {
    let runsCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (!String(url).includes("/runs")) {
          return new Response(null, { status: 204 });
        }
        runsCalls += 1;
        if (runsCalls === 1) {
          return new Response(JSON.stringify({ detail: "Too many submissions" }), { status: 429 });
        }
        return new Response(JSON.stringify({ ok: true, best_score: 30, best_rank: "Director" }), { status: 200 });
      })
    );

    const promise = submitRun("init-data-test", {
      yearsSurvived: 30,
      finalRank: "Manager",
      terminationCause: "test",
      rungsClimbed: 120,
      runStartedAt: Date.now() - 60_000,
    });

    await vi.advanceTimersByTimeAsync(SUBMIT_COOLDOWN_RETRY_MS);
    const result = await promise;

    expect(result).toEqual({ ok: true, bestScore: 30, bestRank: "Director" });
    expect(runsCalls).toBe(2);
    const fetchMock = vi.mocked(fetch);
    const apiCall = fetchMock.mock.calls.find((c) => String(c[0]).includes("/runs"));
    const firstBody = JSON.parse(String(apiCall?.[1]?.body));
    expect(firstBody.final_rank).toBe("Director");
    expect(firstBody.years_survived).toBe(30);
    expect(firstBody.run_started_at).toBeTypeOf("number");
    expect(firstBody.run_ended_at).toBeTypeOf("number");
  });

  it("retries after 503 then succeeds", async () => {
    let runsCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        if (!String(url).includes("/runs")) {
          return new Response(null, { status: 204 });
        }
        runsCalls += 1;
        if (runsCalls === 1) {
          return new Response(JSON.stringify({ detail: "Submit temporarily unavailable" }), {
            status: 503,
          });
        }
        return new Response(JSON.stringify({ ok: true, best_score: 5, best_rank: "Intern" }), {
          status: 200,
        });
      })
    );

    const promise = submitRun("init-data-test", {
      yearsSurvived: 5,
      finalRank: "Intern",
      terminationCause: "test",
      rungsClimbed: 20,
      runStartedAt: Date.now() - 60_000,
    });

    await vi.advanceTimersByTimeAsync(SUBMIT_COOLDOWN_RETRY_MS);
    const result = await promise;

    expect(result).toEqual({ ok: true, bestScore: 5, bestRank: "Intern" });
    expect(runsCalls).toBe(2);
  });
});
