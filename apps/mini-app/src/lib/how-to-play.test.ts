import { describe, expect, it } from "vitest";
import {
  ANGEL_YEARS,
  BOARD_YEARS,
  CEO_YEARS,
  CORP_ENV_BAND_LABELS,
  DIRECTOR_YEARS,
  MANAGER_YEARS,
  OPEN_OFFICE_YEARS,
} from "../game/constants";
import {
  PLAYBOOK_TIERS,
  playbookFloorNamesInOrder,
  renderPlaybookLadderHtml,
} from "./how-to-play";

describe("PLAYBOOK_TIERS", () => {
  it("has seven tiers matching corp-env bands", () => {
    expect(PLAYBOOK_TIERS).toHaveLength(7);
    expect(PLAYBOOK_TIERS).toHaveLength(Object.keys(CORP_ENV_BAND_LABELS).length);
  });

  it("uses floor labels in corp-env order", () => {
    expect(PLAYBOOK_TIERS.map((t) => t.floor)).toEqual(playbookFloorNamesInOrder());
    expect(PLAYBOOK_TIERS.map((t) => t.floor)).toEqual(Object.values(CORP_ENV_BAND_LABELS));
  });

  it("uses year boundaries aligned with game constants", () => {
    expect(PLAYBOOK_TIERS[0]!.yearLabel).toBe(`0–<${OPEN_OFFICE_YEARS}y`);
    expect(PLAYBOOK_TIERS[1]!.yearLabel).toBe(`${OPEN_OFFICE_YEARS}–<${MANAGER_YEARS}y`);
    expect(PLAYBOOK_TIERS[2]!.yearLabel).toBe(`${MANAGER_YEARS}–<${DIRECTOR_YEARS}y`);
    expect(PLAYBOOK_TIERS[3]!.yearLabel).toBe(`${DIRECTOR_YEARS}–<${CEO_YEARS}y`);
    expect(PLAYBOOK_TIERS[4]!.yearLabel).toBe(`${CEO_YEARS}–<${BOARD_YEARS}y`);
    expect(PLAYBOOK_TIERS[5]!.yearLabel).toBe(`${BOARD_YEARS}–<${ANGEL_YEARS}y`);
    expect(PLAYBOOK_TIERS[6]!.yearLabel).toBe(`${ANGEL_YEARS}y+`);
  });
});

describe("renderPlaybookLadderHtml", () => {
  it("renders merged ladder rows without unlock summary", () => {
    const html = renderPlaybookLadderHtml();
    expect(html).toContain("Middle Management");
    expect(html).toContain("Angel Investor");
    expect(html).not.toContain("Unlock by rank");
    expect(html).not.toContain("<ul");
    expect((html.match(/<li>/g) ?? []).length).toBe(7);
  });

  it("escapes less-than in year labels for HTML", () => {
    const html = renderPlaybookLadderHtml();
    expect(html).toContain("0–&lt;5y");
    expect(html).not.toContain("0–<5y");
  });
});
