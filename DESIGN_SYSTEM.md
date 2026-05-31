# Corporate Ladder — Design System

**Status:** v1.6 (implementation maturity)  
**Audience:** Frontend developers, coding agents  
**Scope:** Telegram Mini App shell UI (`apps/mini-app`) — not a visual redesign

**Family sibling:** [DITreneris/site](https://github.com/DITreneris/site) shares token/utility *process*; do **not** import Prompt Anatomy navy/gold brand or marketing layout.

---

## 1. Executive summary

Corporate Ladder is a satirical workplace arcade inside Telegram. Visual identity: **blue/indigo primary actions**, **amber promotions/ticker**, **dark phone shell + light viewport**. Humor is the product — see [primal.txt](primal.txt) and [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc).

**Token source of truth:** [`apps/mini-app/src/style.css`](apps/mini-app/src/style.css) — Tailwind v4 `@theme` + `@utility`.

**Agent rules:** [.cursor/rules/mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc)

---

## 2. Surface model

```
┌─────────────────────────────┐
│  Shell header (dark)        │  ← --cl-header-* from Telegram themeParams
├─────────────────────────────┤
│  Viewport (light + grid)    │  ← --cl-secondary-bg
│  ┌ start / game / LB ────┐  │
│  │  Shell screens        │  │  ← card-light, btn-cl-*
│  │  Game HUD (white bar)  │  │  ← badge-rank-*, text-label-upper
│  │  Climb area + tap zones│  │  ← mechanics styling; minimal DS churn
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 3. Token inventory

### 3.1 Static tokens (`@theme`)

| Token | Value | Usage |
|-------|-------|-------|
| `cl-shell` | `#0f172a` | Ticker bar, dark accents |
| `cl-viewport` | `#f8fafc` | Default viewport bg fallback |
| `cl-primary` | `#2563eb` | Primary CTA, title accent, next-rung highlight |
| `cl-primary-dark` | `#1d4ed8` | Hover states |
| `cl-accent-indigo` | `#4338ca` | CTA gradient mix |
| `cl-promo` | `#fbbf24` | Ticker text |
| `cl-promo-bg` | `#0f172a` | Ticker background |
| Rank tokens | see `@theme` | `cl-rank-intern-*`, `manager-*`, `ceo-*` |

### 3.2 Runtime Telegram tokens (`:root --cl-*`)

Set by [`applyTelegramTheme()`](apps/mini-app/src/lib/telegram.ts) from `themeParams`:

| CSS var | Telegram param | Fallback |
|---------|----------------|----------|
| `--cl-bg` | `bg_color` | `#020617` |
| `--cl-secondary-bg` | `secondary_bg_color` | `#f8fafc` |
| `--cl-text` | `text_color` | `#0f172a` |
| `--cl-button` | `button_color` | `#2563eb` |
| `--cl-header-bg` | `header_bg_color` | `#0f172a` |
| `--cl-accent` | `accent_text_color` | `#2563eb` |

**Precedence:** Inside Telegram, `--cl-*` overrides static tokens for shell/button surfaces. Game-critical contrast (next-rung highlight) uses `--color-cl-primary` so it stays visible when Telegram themes vary.

### 3.3 Typography tokens

| Utility | Size | Use |
|---------|------|-----|
| `text-nano` | 9px | Keyboard hints, YOU label |
| `text-micro` | 10px | Badges, bot handle, HUD micro labels |
| `text-caption` | 11px | Secondary copy, ticker, how-to-play body |
| `text-label-upper` | 10px uppercase | Stat labels (Longevity, Energy) |

**Forbidden:** `text-[9px]`, `text-[10px]`, `text-[11px]` in `apps/mini-app/src/`.

---

## 4. Utility catalog

| Utility | Role |
|---------|------|
| `focus-ring` | Visible focus on shell interactives |
| `btn-cl-primary` | Primary CTA (Telegram button gradient) |
| `btn-cl-primary-sm` | Full-width primary, compact padding |
| `btn-cl-secondary` | White bordered secondary |
| `btn-cl-share` | Emerald share button |
| `btn-cl-muted` | Slate tertiary / back |
| `card-light` | Employee badge shell |
| `card-light-sm` | How-to-play row |
| `card-performance` | Game-over performance card |
| `ticker-bar` | Compact home news strip + amber promo surfaces; `#newsTickerText` scrolls one headline from `NEWS_TICKER_HEADLINES` (game-over foreshadow unchanged) |
| `tap-controls-bar` | Fixed bottom grid for TAP LEFT / TAP RIGHT deck |
| `btn-tap-zone` | Game climb button — h-28, gradient slate, snippet parity |
| `badge-rank-intern` / `-manager` / `-ceo` | In-game rank pill |
| `lb-tab-active` / `lb-tab-inactive` | Leaderboard period toggle |
| `lb-row-self` | Current-user leaderboard highlight |
| `text-micro` / `text-caption` / `text-nano` | Typography |
| `text-label-upper` | Uppercase stat labels |
| `icon-sm` / `icon-md` | Icon sizing |

**Legacy alias:** `.cl-primary-btn` → `btn-cl-primary` (kept for compatibility).

---

## 5. Telegram theming rules

1. Call `applyTelegramTheme()` on load and on `themeChanged` event.
2. Shell classes `.cl-header`, `.cl-viewport`, `.cl-phone-shell` consume `--cl-*`.
3. Primary buttons use `--cl-button` gradient — respects user's Telegram accent.
4. **Fixed game contrast:** `.next-rung .rung-center` uses `--color-cl-primary`, not `--cl-accent`, so the climb target stays visible on exotic themes.
5. If a Telegram theme fails WCAG on shell text, fix via token fallback in `telegram.ts`, not ad-hoc hex in templates.

---

## 6. Rank badges

| Rank | Utility | When |
|------|---------|------|
| Intern | `badge-rank-intern` | Default; < 10 years |
| Manager | `badge-rank-manager` | ≥ 10 years |
| CEO | `badge-rank-ceo` | ≥ 35 years |

Set in `updateRankUI()` via `RANK_BADGE` map in [`app.ts`](apps/mini-app/src/app.ts).

---

## 7. Animation policy

Game animations live in `style.css` (climb-pop, shake-finite, ticker-scroll, etc.). All listed in the `@media (prefers-reduced-motion: reduce)` block — animations disabled, game remains playable.

**Do not add** decorative marketing animations to shell screens beyond existing row-fade-in and home hero entrance (`home-hero-enter`). Home shows a **compact scrolling news strip** (`ticker-bar` + `news-ticker-text`); ticker pool still drives optional game-over foreshadow.

---

## 8. Accessibility

### 8.1 Touch targets

Shell buttons: `min-h-[44px]` via `btn-cl-*` utilities. **Exceptions (documented):** game tap deck `btn-tap-zone` at `h-28` (112px — snippet parity), leaderboard tab pills (compact toggle).

### 8.1.1 Telegram full-viewport mode (`.cl-in-telegram`)

- Hide in-app `.cl-header` — use Telegram native title + `BackButton` API
- Floating `.sound-fab` for mute toggle (not duplicated in header)
- Safe-area padding on `.cl-phone-shell` via `--tg-content-safe-area-inset-*` + `env(safe-area-inset-*)`
- Home: compact hero + identity card (Employee Badge / ACTIVE EMPLOYMENT) + scrolling news strip + daily shift pill + description; rule above sticky `.start-cta-bar` (no scroll on default phones)
- Game: compact `.game-hud`, slim `.tap-prompt-bar` below HUD, `#gamePlayArea` for ladder only, fixed `.tap-controls-bar` with visible TAP LEFT / TAP RIGHT `btn-tap-zone` buttons; rung height scales dynamically (40–52px) to fit 7 visible rungs; keyboard hints hidden in Telegram
- Minimum readable type in Telegram: 11px (`text-nano`), 12px (`text-micro`)

### 8.2 Focus

All shell `<button>` elements and username input use `focus-ring`.

### 8.3 Contrast matrix (spot-checked, WCAG AA target)

| Foreground | Background | Usage | Result |
|------------|------------|-------|--------|
| `#0f172a` (slate-900) | `#ffffff` | Headings on viewport | Pass AA |
| `#64748b` (slate-500) | `#ffffff` | Secondary body | Pass AA |
| `#fbbf24` (amber-400) | `#0f172a` | News ticker | Pass AA large |
| `#1d4ed8` (blue-700) | `#eff6ff` | Intern rank badge | Pass AA |
| `#b45309` (amber-700) | `#fffbeb` | Manager rank badge | Pass AA |
| `#047857` (emerald-700) | `#ecfdf5` | CEO rank badge | Pass AA |
| `#ffffff` | `--cl-button` gradient | Primary CTA | Pass AA |
| `#94a3b8` (slate-400) | `#ffffff` | Micro labels only | Pass AA large |

If Telegram theme breaks next-rung visibility, ensure `--cl-accent` fallback meets 3:1 against viewport background.

---

## 9. Agent guardrails

### Do

- Use utilities from `style.css`
- Update this doc when adding utilities
- Run `npm run build` after UI changes
- Run `npm run qa:viewport` after layout changes (preview server required)

### Do not

- Invent hex/rgba in `template.ts` or `app.ts`
- Duplicate card/button class stacks inline
- Import Prompt Anatomy gold/navy as primary brand
- Change game mechanics styling without gameplay reason
- Use ad-hoc `text-[NNpx]` sizes

---

## 9. Game HUD & game-over (v1.6)

In-play and failure surfaces — clarity over decoration. Animation class names: [ROADMAP.md](ROADMAP.md) § Animation.

| Pattern | Usage | Notes |
|---------|--------|-------|
| **Milestone chip** | HUD during play | `Manager in X.y` / `CEO in X.y` / corner office secured; `text-micro` |
| **Death cause row** | Game-over card | Icon + label per failure type (Meeting, Reorg, Deadline, Energy) |
| **Retry tip** | Below death cause | Satirical one-liner from `constants.ts`; `text-caption` |
| **Tap-zone glow** | Active tap feedback | `btn-tap-zone-left/right:active` inset accent — v1.6 control feel |
| **Career high line** | Performance card | Best rank + years from profile when available |

Game-over layout uses `card-light` + performance review framing (REJECTED stamp). Obstacle badges: red meeting, amber reorg, bright red deadline (CEO contrast).

---

## 10. Co-branding (Prompt Anatomy)

Attribution for the [Prompt Anatomy](https://www.promptanatomy.app/) ecosystem — **secondary** to Corporate Ladder game identity.

| Utility | Usage |
|---------|--------|
| `brand-attribution` | Subfooter container on shell screens |
| `brand-attribution-logo` | PA logo icon (18×18, from `/branding/prompt-anatomy-logo.png`) |
| `brand-attribution-link` | Single-line logo + “Prompt Anatomy” link with external icon |

**Surfaces:** home, game over, leaderboard, how-to-play — **not** active gameplay.

**Rules:**
- Muted slate text only; PA logo in dark square is fine in footer
- Do **not** adopt PA navy/gold as game primary palette
- External links via `openPromptAnatomy()` → `Telegram.WebApp.openLink`
- Copy: professional for PA attribution; satire stays in game copy

**Module:** [`apps/mini-app/src/lib/branding.ts`](apps/mini-app/src/lib/branding.ts)

---

## 11. Do-not-change list

- No Prompt Anatomy navy/gold primary palette
- No marketing-site layout (hero, footer grid, tab panels)
- No mechanics changes without `snippet.txt` / scope update
- No React / component-library migration for MVP
- Game tap zones stay `h-28` (not 44px)

---

## 12. QA checklist

- [ ] `cd apps/mini-app && npm run lint && npm test && npm run build`
- [ ] `npm run preview` → `npm run qa:viewport` (no horizontal overflow at 320–768px)
- [ ] Telegram light + dark theme: shell adapts, next-rung visible
- [ ] `prefers-reduced-motion`: animations off, game playable
- [ ] Grep: no `text-[` pixel sizes in `apps/mini-app/src/`

---

**Declared:** Design System **v1.6** — 2026-05-31.
