# Corporate Ladder — Mini App

A fast-paced Telegram Mini App: tap left/right to climb the corporate ladder, dodge meetings and reorgs, and manage your energy.

**Production URL:** https://www.promptanatomy.lol — see [DEPLOY.md](../../DEPLOY.md) and [ROADMAP.md](../../ROADMAP.md).

## How to Play

1. Tap **Punch In & Climb** — you start in the center corridor; first tap starts energy drain.
2. Tap **LEFT** or **RIGHT** for the **next** rung's safe side (three lanes visually, two buttons).
3. First runs teach: clear rung → dodge meeting → grab coffee (+25% energy); gentler hazard rate through ~3y; hints through 10y.
4. **Building floors** (Intern Pit → Open Office → Middle Management → Executive Suite) are flavor on the HUD; **rank gates** drive mechanics: Intern = meetings only; Manager @ 10y = +reorgs and badge gates; Director @ 20y = +deadlines; CEO @ 35y = +desk plants.
5. Survive as many **Career Years** as possible before HR terminates you. Reorg Week daily shift may add reorgs after the onboarding ramp (~3y), not from rung one.

## Pre-release QA

Automated (run before tag):

- [x] No horizontal overflow at 320–768px (`npm run qa:viewport` with preview running)
- [x] Home primary CTA reachable at 320×568 in Telegram mode (`viewport-qa.mjs` home-cta check)
- [x] Game play area ≥ 50% of game screen height in Telegram mode (`viewport-qa.mjs`; tap deck outside play area)
- [x] Memo-visible play area ≥ 45% at 320×800 (`viewport-qa.mjs`)
- [x] HUD tap hint references TAP LEFT / TAP RIGHT (`viewport-qa.mjs`)
- [x] Seven rungs fit inside `#gamePlayArea` at all QA viewports (`viewport-qa.mjs` rung-fit check)
- [x] First runs: only meeting obstacles (Intern phase) — `engine.test.ts`
- [x] Next rung visually highlighted — CSS `.next-rung`
- [x] Energy below 25%: panic visual + stress grid — `app.ts` + CSS
- [x] Leaderboard loads with skeleton — `renderLeaderboardSkeleton`
- [x] `prefers-reduced-motion`: no animations, game still playable — `effects.ts` + CSS
- [x] Browser dev: phone shell still visible — `.cl-phone-shell` (hidden only in Telegram)

Manual (requires Telegram on device — [docs/FF_EXECUTION.md](../../docs/FF_EXECUTION.md) runbook + [docs/DEVICE_QA_v1.8.1.md](../../docs/DEVICE_QA_v1.8.1.md) + [docs/DEVICE_QA_v1.8.2.md](../../docs/DEVICE_QA_v1.8.2.md)):

- [ ] Telegram iOS: single tap = single climb (no double)
- [ ] Telegram Android: same
- [x] In Telegram: no duplicate in-app header; full viewport + safe areas (code — verify on device)
- [ ] Telegram BackButton returns to home from game / leaderboard / how-to-play
- [ ] After 10 years: reorgs appear
- [ ] Share produces readable 4–5 line message
- [ ] Score submit toast when authenticated

## Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 6 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Game | Vanilla TS engine (no canvas framework) |
| Platform | Telegram WebApp SDK |

## Project Structure

```
src/
├── game/           # Engine, constants, audio (no DOM)
│   ├── engine.ts   # Game loop, collision, burnout
│   ├── constants.ts
│   ├── audio.ts
│   └── types.ts
├── lib/
│   ├── telegram.ts # WebApp SDK, theme, share
│   └── api.ts      # Railway API client
├── app.ts          # UI controller, screen routing
├── template.ts     # HTML shell (screens)
├── style.css       # Tailwind @theme + @utility + Telegram theme CSS vars
└── main.ts         # Entry point
```

## Environment Variables

Loaded from **repo root** `.env` (see `vite.config.ts` `envDir`).

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | FastAPI base URL (e.g. `http://localhost:8000`) |
| `VITE_BOT_USERNAME` | Bot username without `@` (`CorporateLadder_bot`; share deep links) |
| `VITE_TELEGRAM_ANALYTICS_TOKEN` | Optional — TON Builders Analytics Keys SDK token (production) |
| `VITE_TELEGRAM_ANALYTICS_APP_NAME` | Optional — defaults to `corporate_ladder` (case-sensitive) |
| `VITE_ADSGRAM_REVIVE_ENABLED` | Optional — enable rewarded revive flow (ad-free test when Block ID unset) |
| `VITE_ADSGRAM_BLOCK_ID` | Optional — AdsGram Reward block ID for live ads |

Never put `TELEGRAM_BOT_TOKEN` or Supabase keys in this app.

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint     # tsc --noEmit
npm run test     # Vitest (engine + constants)
npm run build    # Production bundle → dist/
npm run preview  # Preview production build
npm run qa:viewport  # Playwright overflow check (preview must be running)
npm run capture:marketing  # Marketing set → docs/assets/marketing/
npm run capture:hero  # Legacy alias → copies 01-home to docs/assets/gameplay.png
npm run adopt:og      # Link previews from docs/assets/Corporate_Ladder_og.png (canonical)
npm run capture:og    # Legacy Playwright composite (optional)
npm run verify:og     # Assert OG PNG dimensions (CI)
npm run verify:seo    # Static SEO/GEO shell files (CI)
npm run verify:seo:live  # HTTP smoke — requires preview (PREVIEW_URL)
```

After `npm run build`, confirm crawler assets copied: `test -f dist/sitemap.xml && test -f dist/robots.txt && test -f dist/llms.txt`.

## Design system

Token source: `src/style.css` (`@theme` + `@utility`). Guide: [../../DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md).

After layout changes: `npm run build && npm run preview` (terminal 1), then `npm run qa:viewport` (terminal 2).

### OG link-preview images

**Canonical:** edit [../../docs/assets/Corporate_Ladder_og.png](../../docs/assets/Corporate_Ladder_og.png) (1200×630), then:

```bash
npm run adopt:og    # → public/og.png + .github/social-preview.png
npm run verify:og
```

Redeploy Vercel after changing `public/og.png` (link-preview caches).

**Legacy composite** (live gameplay crop + `og-preview.html`): `npm run build && npm run preview` then `npm run capture:og`.

Marketing phone shots: `npm run capture:marketing` — [../../docs/assets/marketing/README.md](../../docs/assets/marketing/README.md).

## Local Development

From repo root:

```bash
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

cd apps/mini-app
npm install
npm run dev
```

Outside Telegram, the app uses localStorage for nickname and high score. Inside Telegram, auth uses `initData` → `POST /auth/me`.

### Daily shift (v1.7 dev QA)

UTC date picks a spawn preset for all players. In dev:

- URL: `?dailyPreset=meeting_monday` (also `coffee_break`, `reorg_week`, `standard`, `synergy_sprint`)
- Or `localStorage.setItem('cl-daily-preset', 'reorg_week')` then reload

Verify home badge, spawn feel, and share text includes `Shift:`.

## Telegram Integration

- **Auth:** `getInitData()` for `/auth/me` and `/runs`; cached `session_token` for `POST /leaderboard/me`
- **Theme:** `themeParams` mapped to `--cl-*` CSS variables (light/dark)
- **Share:** `Telegram.WebApp.shareMessage()` with clipboard fallback
- **Leaderboards:** Daily + Weekly only (v1)

## Deploy

Vercel — root directory: `apps/mini-app`. Set `VITE_API_URL` and `VITE_BOT_USERNAME` at build time.

Full checklist: [../../.cursor/skills/mini-app-deploy/SKILL.md](../../.cursor/skills/mini-app-deploy/SKILL.md)
