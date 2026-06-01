# Changelog

All notable changes to Corporate Ladder are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Maintainer:** Changelog Maintainer agent — see [AGENTS.md](AGENTS.md#agent-roles) and [.cursor/skills/changelog-maintainer/SKILL.md](.cursor/skills/changelog-maintainer/SKILL.md).

## [Unreleased]

### Planned (v1.1)
- All-time / Legends tab
- Analytics events
- Server-side replay validation (anti-cheat)

## [1.8.2] - 2026-06-01

v1.8.2 — F&F-ready bundle: mobile UX hotfix, trust UX, responsive ladder, discoverability (no new mechanics, screens, or API).

### Added
- Vercel Web Analytics — `@vercel/analytics` on mini-app production deploy (page views; no dev tracking)
- OG image pipeline — Playwright composite (`capture:og`, `og-preview.html`, `?og=1` seeded gameplay); `public/og.png` (1200×630); `.github/social-preview.png` (1280×640); `verify:og` CI check
- Phase 0 discoverability — `index.html` meta description, Open Graph (`og:image` dimensions + alt), Twitter cards, `noindex`; `public/robots.txt`
- [docs/discoverability-plan.md](docs/discoverability-plan.md) — Telegram-first discoverability roadmap (defers full SEO)
- [docs/FF_TEST.md](docs/FF_TEST.md) — friends-and-family protocol (2026-05-31 → 2026-06-14)
- [docs/FF_EXECUTION.md](docs/FF_EXECUTION.md) — F&F gate runbook (deploy smoke, QA sign-off, dogfood, monitor, review)
- [docs/DEVICE_QA_v1.8.1.md](docs/DEVICE_QA_v1.8.1.md) — Telegram iOS/Android sign-off checklist
- [docs/DEVICE_QA_v1.8.2.md](docs/DEVICE_QA_v1.8.2.md) — delta checklist for mobile UX hotfix and F&F trust UX
- Viewport QA — 320×568 home CTA reachability; memo-visible play area ≥ 45%; HUD hint copy assertion; tap bar visibility check
- `showHrMemoCombined()` — single memo from multiple lines to save vertical HUD budget

### Changed
- In-run announcements — HR memo rail below game HUD (People Ops / HR Systems); tap hint folded into HUD; shell toast reserved for home/game-over actions; tap deck no longer covered during play
- Home opening — compact amber news strip (headline pool), visible daily shift description, `ticker-shift-emphasis` on non-standard shifts, Employee Badge header, satirical rule line, hero entrance fade
- Game controls — restore snippet-style bottom tap deck (`tap-controls-bar` + visible h-28 TAP LEFT / TAP RIGHT buttons); remove transparent play-area overlay
- Coffee pickup — card badge with ☕ and **+25%** label (matches obstacle badges); green pulse on next rung; pickup pop and particles from the cup
- Leaderboard — weekly tab **Last 7 Days** (rolling 7-day API); satirical empty state when no runs yet
- First-run onboarding — `#hudTapHint` deck-first copy (TAP LEFT / TAP RIGHT); `.tap-deck-hint` pulse on tap bar for first 5 taps
- Home (Telegram) — `#startScreen` scrolls on short viewports so primary CTA stays reachable
- Manager promotion — one combined HR memo instead of three queued memos
- CEO promotion — trap announcement deferred until first deadline on ladder
- Mute during game — HR memo feedback instead of shell toast over tap deck
- Telegram username field — solid border when read-only (not dashed editable affordance)
- Viewport QA — play-area ratio 50% (tap deck outside `#gamePlayArea`); game HUD and play area share one content column at 320px and 390px
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — deck-first onboarding and home scroll rules
- [docs/DEVICE_QA_v1.8.1.md](docs/DEVICE_QA_v1.8.1.md) — row 5 references `#hudTapHint` not tap-prompt bar
- [ROADMAP.md](ROADMAP.md) — one-page game research (2026-06-01): adoption map, F&F decision tree, v1.9 implementation sketches; v1.9 gate tied to [docs/FF_EXECUTION.md](docs/FF_EXECUTION.md) (~2026-06-14)

### Fixed
- **Gameplay looked broken: narrow ladder in a wide frame** — HUD and tap deck spanned the phone width while the ladder stayed 192px (`w-48`) with grey dead zones on both sides. `#ladderTrack` now fills the shared content column; player position and reorg slide distance come from DOM layout; OG gameplay crop regenerated
- Coffee visibility — player sprite no longer draws over next-rung coffee (`z-index`, `bottom-20`)
- Score submit failures — game-over toasts for auth, rate limit, and network errors (not success-only)
- Auth session degradation — dismissible home banner when Telegram profile sync fails; reopen-from-bot copy
- Meeting Monday badges — Reply-All vs Standup derived from rung id (no re-render flicker)
- Share toast — "Share sheet opened" instead of implying share succeeded
- API `/runs` — reject `final_rank` inconsistent with `years_survived` (Intern < 10y, Manager 10–35y, CEO ≥ 35y)

### Removed
- Unused `.tap-prompt-bar` CSS (superseded by HUD hint + tap deck)

## [1.8.1] - 2026-05-31

v1.8.1 — Telegram mobile polish and playability (no new mechanics, screens, or API).

### Changed
- Prompt Anatomy footer — single compact link (logo + "Prompt Anatomy ↗") instead of separate "Powered by" line and full-width CTA
- Telegram mobile shell — hide duplicate in-app header; native `BackButton`; floating sound FAB; safe-area / `viewport-fit=cover` padding for notched devices
- Gameplay visibility — overlay tap zones on the ladder (full play area); dynamic rung scaling so all 7 rungs fit; tap-prompt bar below HUD; compact home with rule above CTA (home ticker removed); safe-side hints for first 5 taps
- Viewport QA — play-area ratio threshold raised to 65%; rung-fit check that seven slots fit inside `#gamePlayArea`
- [ROADMAP.md](ROADMAP.md) — release train through v1.8 shipped; v1.8.1 ship gate; deploy gate closed; F&F → v1.9
- [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md), [DOCS_INDEX.md](DOCS_INDEX.md), [README.md](README.md) — production URLs live

### Fixed
- Bot Docker startup crash on Railway — skip repo-root `.env` lookup when `main.py` runs from `/app` (IndexError on `parents[2]`)

## [1.8.0] - 2026-05-31

v1.8 — narrative beats and arena identity (copy-first; no new obstacle logic).

### Added
- Rotating home news ticker pool (15 headlines) with optional foreshadow payoff on game-over flavor (20% when headline matches death type)
- Manager promotion nemesis one-liner (VP of People Ops); CEO corner-office trap announcement at 35y
- RE-APPLY session counter in `localStorage` with tiered flavor on game-over (1 / 5 / 10+ runs)
- Intern fake-promotion toasts at ~2y, ~5y, and ~9.9y before real Manager promo
- Expanded rank-flavored failure lines; shift-specific death flavor for Meeting Monday, Coffee Break, and Reorg Week
- Floor labels on ladder rail (years band → office floor name)
- Rank props on player (Intern lanyard, Manager clipboard, CEO monocle)
- Reorg HUD strip — `ORG CHART UNSTABLE` when reorgs are active
- Promotion `PROMOTED` stamp animation on promo overlay
- Heartbeat SFX under 15% energy; death-cause icon hold on game-over card
- Game-over daily leaderboard gap line (`#1 is X.Xy ahead` or `#1 on today's board`)
- Bot `/start` mentions today's shift label (UTC preset rotation)

### Changed
- [ROADMAP.md](ROADMAP.md) v1.8 Batch 1–3 implemented; [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md) local smoke row

## [1.7.0] - 2026-05-31

v1.7 — daily replays via UTC shift presets (no new screens or API changes).

### Added
- Daily shift — UTC date picks spawn preset (Open Floor Plan, Meeting Monday, Coffee Break, Reorg Week); home badge, engine weight overrides, share `Shift:` line; dev `?dailyPreset=` override
- `.cursor/agents/changelog-maintainer.md` — agent file for Changelog Maintainer (was skill-only)
- `docs/assets/gameplay.png` — README hero screenshot (generated via `capture:hero`)

### Changed
- [ROADMAP.md](ROADMAP.md) — narrative thesis section; v1.7 marked code done; v1.8 restructured (MoSCoW, Batch 1–3 plot-beat backlog)
- Full refresh of [docs/mvp-scope.md](docs/mvp-scope.md) — shipped v1 product (Energy/Deadline, v1.5/v1.6 polish, co-branding, terminology table)
- [AGENTS.md](AGENTS.md), [DOCS_INDEX.md](DOCS_INDEX.md), [README.md](README.md) — ROADMAP, DEPLOY_STATUS, task router rows, code map
- [docs/architecture.md](docs/architecture.md) — `VITE_PROMPT_ANATOMY_URL`, root `.env`, known limits, leaderboard `initData`
- [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md) — v1.5 + v1.6 deploy gate, v1.6 QA smoke row
- [DEPLOY.md](DEPLOY.md) — `VITE_PROMPT_ANATOMY_URL` on Vercel
- Cursor rules: `project-context`, `mini-app-frontend`, `mini-app-ui`, `satirical-copy`, `python-api`, `deployment` (globs + env sync)
- Skills: `mini-app-deploy`, `score-pipeline` — env vars, termination cause examples, leaderboard `initData`
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) v1.6 — Game HUD & game-over patterns section
- [verifier.md](.cursor/agents/verifier.md) — v1.6 gameplay checklist
- [primal.txt](primal.txt), [snippet.txt](snippet.txt) — header/footer parity notes pointing to current spec
- Initial GitHub publish to [DITreneris/ladder](https://github.com/DITreneris/ladder); PA logo at `apps/mini-app/public/branding/prompt-anatomy-logo.png`

## [1.6.0] - 2026-05-31

v1.6 — progress clarity and fairness polish on the v1.5 design baseline.

### Added
- HUD milestone chip — `Manager in X.y` / `CEO in X.y` / corner office secured during play
- Game-over death cause icon + label and satirical retry tip per failure type
- Career high line on performance card (best rank + years from profile)
- Intern tutorial ramp — lower meeting spawn rate for first 12 rungs; one guaranteed coffee spawn if none collected by rung 8
- 2s energy drain pause after promotion so new rank rules are readable
- Character emoji flashes on coffee pickup and promotion; tap-zone active border glow
- Reorg fairness — imminent next rung no longer swaps during reorg ticks; reorg SFX on every swap

### Changed
- Manager rank emoji to neutral `🧑‍💼`
- Deadline obstacle badge — brighter red styling for CEO-phase readability

## [1.5.0] - 2026-05-31

v1.5 pre-release — polish, onboarding clarity, GitHub presentation, deploy readiness.

### Added
- Prompt Anatomy co-branding — footer with logo, “Powered by” link, and “Visit Prompt Anatomy” CTA on home, game over, leaderboard, and how-to-play; share text and bot welcome attribution
- `apps/mini-app/public/branding/prompt-anatomy-logo.png` — fixes footer 404
- `DESIGN_SYSTEM.md` — mini-app design tokens, utilities, a11y matrix
- `.cursor/rules/mini-app-ui.mdc` — shell UI guardrails for agents
- `apps/mini-app/scripts/viewport-qa.mjs` — Playwright horizontal overflow check for shell screens
- `apps/mini-app/scripts/capture-hero.mjs` — README hero screenshot capture
- `@theme` + `@utility` token layer in `apps/mini-app/src/style.css` (CL-native blue/amber, not PA gold)
- `DOCS_INDEX.md` — monorepo document map, task router, DITreneris family charter
- `DEPLOY.md` — cold-deploy and post-deploy verification checklist
- `ROADMAP.md` — v1.5 status, v1.1 deferrals, deploy gate
- `LICENSE` — proprietary, all rights reserved
- `.github/ISSUE_TEMPLATE/` — bug report and feature request templates
- `.cursor/agents/verifier.md` — read-only pre-merge QA agent
- Expanded `AGENTS.md` with deployment table, workflow, and family cross-links
- Climb squash animation, finite game-over shake, reorg slide, coffee/promo particles
- Telegram haptic feedback and vertical-swipe lock during gameplay
- `prefers-reduced-motion` support for accessibility
- Leaderboard loading skeleton and row stagger animation
- Home-screen one-line tutorial; CSS news ticker (replaces marquee)
- Next-rung highlight, reorg telegraph flash, idle bob and panic character states
- Death emoji flash per obstacle type; rank-specific promotion particles
- Rank-gated obstacles (meetings only as Intern; reorgs at Manager; deadlines at CEO)
- Pre-release QA checklist in mini-app README (automated vs manual split)
- Safe-side green hint for first 3 taps; rank-unlock toasts (Manager/CEO)
- Career phases section in How-to-Play; personal best delta on game over
- Next-rung obstacle warn pulse; `docs/assets/gameplay.png` README hero

### Changed
- Mini-app shell UI refactored to design-system utilities (`btn-cl-primary`, `card-light`, `badge-rank-*`, typography tokens)
- Font Awesome bundled via npm (CDN removed from `index.html`)
- `README.md`, `project-context.mdc`, and deploy skill point to `DOCS_INDEX` / `DEPLOY`
- Changelog Maintainer skill notes family alias `changelog-keeper` (mother repo)
- Rung rendering uses incremental DOM updates instead of full rebuild each tap
- Burnout meter renamed to **Energy**; burnout obstacle renamed to **Deadline** (UI)
- Share text trimmed to 5-line performance review format
- Enriched promotion and rank-flavored failure copy
- Slower base energy drain (~15% buffer); CEO reorg interval 500ms
- Full viewport layout in Telegram (phone shell hidden); shell kept for browser dev
- Tap input uses single `pointerdown` handler (fixes mobile double-tap)
- Promo overlay auto-dismiss reduced to 1.5s
- Game-over card shows termination flavor quote (in addition to share text)
- Obstacle badge micro-type uses `text-nano` per design system
- Root `README.md` — how to play, live demo table, hero screenshot, known issues

### Fixed
- Player climber initial position aligned with tap positions
- Reorg slide animates correct badge slot (left/right query fix)
- Clipboard share failure shows error toast
- Energy no longer drains before the player's first climb tap

### Security
- No change

## [1.0.0] - 2026-05-31

v1 launch hardening — env ergonomics, tests, Telegram theme, deploy tooling.

### Added
- **Unified env loading:** repo root `.env` read by API, bot, and mini-app (Vite `envDir`); `scripts/setup-env.ps1` / `setup-env.sh` for optional sync
- **API integration tests:** `/auth/me`, `/runs` (valid, invalid hash, rung mismatch, rate limit, invalid rank), weekly leaderboard; expired `auth_date` unit test
- **Deploy scripts:** `scripts/verify-deploy-config.*`, `scripts/smoke-local.*` for preflight and local smoke
- **Telegram theme:** `themeParams` → `--cl-*` CSS variables; shell/header adapt to light/dark mode
- **Mini-app README:** play instructions, folder map, env vars, commands
- **Vitest:** rank thresholds, engine collision/coffee/stop tests; CI runs `npm test`

### Fixed
- Offline high score now persists to `localStorage` when not in Telegram
- Burnout game-over copy typo ("Collant" → "Cognitive overload")
- Bot handle in header uses `VITE_BOT_USERNAME` instead of hardcoded `@CorporateLadderBot`
- Telegram username input is read-only when opened inside Telegram
- `final_rank` validated as `Intern` | `Manager` | `CEO` on score submit

### Changed
- Documented in-memory rate limit caveat for multi-replica Railway in `docs/architecture.md`

## [0.1.0] - 2026-05-31

Initial monorepo scaffold — MVP v1 foundation.

### Added
- **Monorepo layout:** `apps/mini-app`, `apps/bot`, `packages/api`, `supabase/`
- **Mini App (TypeScript + Vite + Tailwind):** game engine ported from prototype — tap left/right, 3 obstacles, coffee recovery, burnout meter, 3 ranks (Intern → Manager → CEO)
- **Telegram integration:** WebApp SDK wrapper, initData auth, share with clipboard fallback
- **FastAPI backend:** `POST /auth/me`, `POST /runs`, `GET /leaderboard?period=daily|weekly`, Telegram HMAC validation, score sanity checks
- **Telegram bot (aiogram):** `/start` with Mini App launch button
- **Supabase schema:** `users`, `game_runs` tables with RLS (public read, service-role writes)
- **Docs:** `docs/mvp-scope.md`, `docs/architecture.md`, `README.md`, `AGENTS.md`
- **Cursor config:** 6 rules, 3 project skills (telegram auth, score pipeline, deploy)
- **CI:** GitHub Actions — API pytest, bot import smoke test, mini-app lint + build
- **Deploy configs:** Railway Dockerfiles for API and bot, Vercel config for mini-app

### Changed
- Leaderboard UI: Daily + Weekly tabs only (Legends/All-time deferred to v1.1)
- Score persistence: localStorage prototype replaced with API + Supabase path (localStorage fallback when outside Telegram)

### Security
- Bot token and Supabase service role key restricted to Railway API; never exposed in frontend

[Unreleased]: compare/v1.8.1...HEAD
[1.8.1]: compare/v1.8.0...v1.8.1
[1.8.0]: compare/v1.7.0...v1.8.0
[1.7.0]: compare/v1.6.0...v1.7.0
[1.6.0]: compare/v1.5.0...v1.6.0
[1.5.0]: compare/v1.0.0...v1.5.0
[1.0.0]: compare/v0.1.0...v1.0.0
[0.1.0]: releases/tag/v0.1.0
