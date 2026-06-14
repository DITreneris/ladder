/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hideSyncStatus, resetSyncStatus, setSyncStatus } from "./sync-status";

describe("sync-status", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="syncStatusChip" class="hidden">
        <span id="syncStatusText"></span>
      </div>`;
  });

  afterEach(() => {
    resetSyncStatus();
  });

  it("shows syncing copy", () => {
    setSyncStatus("syncing");
    const chip = document.getElementById("syncStatusChip")!;
    expect(chip.classList.contains("hidden")).toBe(false);
    expect(document.getElementById("syncStatusText")!.textContent).toBe("Stamping timesheet…");
  });

  it("shows retry countdown", () => {
    setSyncStatus("retrying", 9);
    expect(document.getElementById("syncStatusText")!.textContent).toBe("HR cooldown — retry in 9s");
  });

  it("hides chip", () => {
    setSyncStatus("syncing");
    hideSyncStatus();
    expect(document.getElementById("syncStatusChip")!.classList.contains("hidden")).toBe(true);
  });
});
