/**
 * Corp-env / juice knob presets for A/B capture and style.css defaults.
 * Single source — update style.css @theme from WINNER_PRESET after human pick.
 */

/** @typedef {{
 *   id: string;
 *   label: string;
 *   vars: Record<string, string>;
 *   flashKeyframes: string;
 *   flashDuration: string;
 *   washTransition: string;
 *   rankBadgeScale: number;
 *   rankBadgeShadowMix: number;
 *   rankPopScale: number;
 * }} ProgressionPreset */

/** @type {Record<string, ProgressionPreset>} */
export const PRESETS = {
  A: {
    id: "A",
    label: "current v2.4",
    vars: {
      "--cl-corp-wash-mix-intern": "18%",
      "--cl-corp-wash-mix-open": "17%",
      "--cl-corp-wash-mix-rank": "20%",
      "--cl-corp-wash-mix-rank-high": "22%",
      "--cl-corp-ghost-opacity": "0.2",
      "--cl-corp-ghost-blur": "6px",
    },
    flashKeyframes: `@keyframes floor-band-flash {
  0% { opacity: 1; filter: brightness(1); }
  40% { opacity: 0.82; filter: brightness(1.13); }
  100% { opacity: 1; filter: brightness(1); }
}`,
    flashDuration: "0.3s",
    washTransition: "background-color 0.3s ease",
    rankBadgeScale: 1.06,
    rankBadgeShadowMix: 45,
    rankPopScale: 1.35,
  },
  B: {
    id: "B",
    label: "balanced anti-glitch",
    vars: {
      "--cl-corp-wash-mix-intern": "16%",
      "--cl-corp-wash-mix-open": "15%",
      "--cl-corp-wash-mix-rank": "18%",
      "--cl-corp-wash-mix-rank-high": "19%",
      "--cl-corp-ghost-opacity": "0.17",
      "--cl-corp-ghost-blur": "6px",
      "--cl-corp-flash-brightness": "1.05",
      "--cl-corp-flash-duration": "0.2s",
      "--cl-corp-wash-transition-duration": "0.45s",
    },
    flashKeyframes: `@keyframes floor-band-flash {
  0% { opacity: 1; filter: brightness(1); }
  40% { opacity: 1; filter: brightness(1.05); }
  100% { opacity: 1; filter: brightness(1); }
}`,
    flashDuration: "0.2s",
    washTransition: "background-color 0.45s ease-in-out",
    rankBadgeScale: 1.04,
    rankBadgeShadowMix: 30,
    rankPopScale: 1.2,
  },
  C: {
    id: "C",
    label: "soft-min visibility",
    vars: {
      "--cl-corp-wash-mix-intern": "15%",
      "--cl-corp-wash-mix-open": "14%",
      "--cl-corp-wash-mix-rank": "17%",
      "--cl-corp-wash-mix-rank-high": "18%",
      "--cl-corp-ghost-opacity": "0.15",
      "--cl-corp-ghost-blur": "6px",
      "--cl-corp-flash-brightness": "1.04",
      "--cl-corp-flash-duration": "0.15s",
      "--cl-corp-wash-transition-duration": "0.5s",
    },
    flashKeyframes: `@keyframes floor-band-flash {
  0% { opacity: 1; filter: brightness(1); }
  40% { opacity: 1; filter: brightness(1.04); }
  100% { opacity: 1; filter: brightness(1); }
}`,
    flashDuration: "0.15s",
    washTransition: "background-color 0.5s ease-in-out",
    rankBadgeScale: 1.03,
    rankBadgeShadowMix: 25,
    rankPopScale: 1.15,
  },
};

/** Shipped default after A/B — preset B (balanced). */
export const WINNER_PRESET = PRESETS.B;

/**
 * @param {ProgressionPreset} preset
 * @returns {string}
 */
export function buildPresetOverrideCss(preset) {
  const varBlock = Object.entries(preset.vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");

  return `
:root {
${varBlock}
}
${preset.flashKeyframes}
.floor-band-flash {
  animation: floor-band-flash ${preset.flashDuration} ease-out;
}
.game-play-area {
  transition: ${preset.washTransition};
}
@keyframes rank-badge-pulse {
  0%, 100% { transform: scale(1); box-shadow: none; }
  50% {
    transform: scale(${preset.rankBadgeScale});
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-cl-promo) ${preset.rankBadgeShadowMix}%, transparent);
  }
}
@keyframes rank-pop {
  0% { transform: scale(1); }
  50% { transform: scale(${preset.rankPopScale}); }
  100% { transform: scale(1); }
}
`.trim();
}

/** Year marks for A/B comparison (DEVICE_QA row 13 focus: 7y vs 10y). */
export const AB_YEAR_SCENARIOS = [
  {
    years: 2,
    rank: "Intern",
    rankEmoji: "🎓",
    propEmoji: "📎",
    badgeClass: "badge-rank-intern mt-0.5",
    milestone: "Manager in 8.0y",
    floor: "Floor 3 — Intern Pit",
    corpEnvClass: "corp-env-intern-pit",
    obstacle: { emoji: "📅", label: "Meeting" },
  },
  {
    years: 7,
    rank: "Intern",
    rankEmoji: "🎓",
    propEmoji: "📎",
    badgeClass: "badge-rank-intern mt-0.5",
    milestone: "Manager in 3.0y",
    floor: "Floor 8 — Open Office",
    corpEnvClass: "corp-env-open-office",
    obstacle: { emoji: "🔄", label: "Reorg" },
  },
  {
    years: 10,
    rank: "Manager",
    rankEmoji: "🧑‍💼",
    propEmoji: "📋",
    badgeClass: "badge-rank-manager mt-0.5",
    milestone: "Director in 10.0y",
    floor: "Floor 11 — Middle Management",
    corpEnvClass: "corp-env-middle-management",
    obstacle: { emoji: "📅", label: "Meeting" },
  },
  {
    years: 12,
    rank: "Manager",
    rankEmoji: "🧑‍💼",
    propEmoji: "📋",
    badgeClass: "badge-rank-manager mt-0.5",
    milestone: "Director in 8.0y",
    floor: "Floor 13 — Middle Management",
    corpEnvClass: "corp-env-middle-management",
    obstacle: { emoji: "🔄", label: "Reorg" },
  },
];
