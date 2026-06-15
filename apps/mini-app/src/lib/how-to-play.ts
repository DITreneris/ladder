import {
  ANGEL_YEARS,
  BOARD_YEARS,
  CEO_YEARS,
  CORP_ENV_BAND_LABELS,
  DIRECTOR_YEARS,
  MANAGER_YEARS,
  OPEN_OFFICE_YEARS,
  type CorpEnvBand,
} from "../game/constants";

export type PlaybookTier = {
  yearLabel: string;
  floor: string;
  rank: string;
  summary: string;
};

const CORP_ENV_BAND_ORDER: readonly CorpEnvBand[] = [
  "intern-pit",
  "open-office",
  "middle-management",
  "director-wing",
  "executive-suite",
  "boardroom",
  "investor-lounge",
];

export const PLAYBOOK_TIERS: readonly PlaybookTier[] = [
  {
    yearLabel: `0–<${OPEN_OFFICE_YEARS}y`,
    floor: CORP_ENV_BAND_LABELS["intern-pit"],
    rank: "Intern",
    summary: "Meetings only. Onboarding theater.",
  },
  {
    yearLabel: `${OPEN_OFFICE_YEARS}–<${MANAGER_YEARS}y`,
    floor: CORP_ENV_BAND_LABELS["open-office"],
    rank: "Intern",
    summary: "Hot desks — backdrop shifts, same hazards.",
  },
  {
    yearLabel: `${MANAGER_YEARS}–<${DIRECTOR_YEARS}y`,
    floor: CORP_ENV_BAND_LABELS["middle-management"],
    rank: "Manager",
    summary: "Reorgs swap sides; badge gates appear.",
  },
  {
    yearLabel: `${DIRECTOR_YEARS}–<${CEO_YEARS}y`,
    floor: CORP_ENV_BAND_LABELS["director-wing"],
    rank: "Director",
    summary: "Quarterly deadlines join the stack.",
  },
  {
    yearLabel: `${CEO_YEARS}–<${BOARD_YEARS}y`,
    floor: CORP_ENV_BAND_LABELS["executive-suite"],
    rank: "CEO",
    summary: "Rare desk plants. The boardroom myth HR keeps on the org chart.",
  },
  {
    yearLabel: `${BOARD_YEARS}–<${ANGEL_YEARS}y`,
    floor: CORP_ENV_BAND_LABELS.boardroom,
    rank: "Board Member",
    summary: "Governance hazards — promoted off the ladder.",
  },
  {
    yearLabel: `${ANGEL_YEARS}y+`,
    floor: CORP_ENV_BAND_LABELS["investor-lounge"],
    rank: "Angel Investor",
    summary: "Endgame rank. HR audits scores up to 100y.",
  },
];

export function playbookFloorNamesInOrder(): string[] {
  return CORP_ENV_BAND_ORDER.map((band) => CORP_ENV_BAND_LABELS[band]);
}

function escapeYearLabelForHtml(yearLabel: string): string {
  return yearLabel.replace(/</g, "&lt;");
}

export function renderPlaybookLadderHtml(): string {
  return PLAYBOOK_TIERS.map((tier) => {
    const year = escapeYearLabelForHtml(tier.yearLabel);
    const head = `${year} · ${tier.floor} · ${tier.rank}`;
    return `<li><strong>${head}:</strong> ${tier.summary}</li>`;
  }).join("");
}
