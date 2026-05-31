# Corporate Ladder — Mini App

A fast-paced Telegram Mini App: tap left/right to climb the corporate ladder, dodge meetings and reorgs, and manage your energy.

**Production URL:** Set after Vercel deploy — see [DEPLOY.md](../../DEPLOY.md) and [ROADMAP.md](../../ROADMAP.md).

## How to Play

1. Tap **Punch In & Climb** — first tap starts the run.
2. Tap **left** or **right** to climb one rung per tap; avoid obstacles on your side.
3. Grab **coffee** (+25% energy recovery) when you can.
4. Survive as many **Career Years** as possible before HR terminates you.

## Pre-release QA

Automated (run before tag):

- [x] No horizontal overflow at 320–768px (`npm run qa:viewport` with preview running)
- [x] First runs: only meeting obstacles (Intern phase) — `engine.test.ts`
- [x] Next rung visually highlighted — CSS `.next-rung`
- [x] Energy below 25%: panic visual + stress grid — `app.ts` + CSS
- [x] Leaderboard loads with skeleton — `renderLeaderboardSkeleton`
- [x] `prefers-reduced-motion`: no animations, game still playable — `effects.ts` + CSS
- [x] Browser dev: phone shell still visible — `.cl-phone-shell` (hidden only in Telegram)

Manual (requires Telegram on device — after production deploy):

- [ ] Telegram iOS: single tap = single climb (no double)
- [ ] Telegram Android: same
- [ ] In Telegram: no fake notch; full viewport height
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
| `VITE_BOT_USERNAME` | Bot username without `@` (share deep links) |

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
```

## Design system

Token source: `src/style.css` (`@theme` + `@utility`). Guide: [../../DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md).

After layout changes: `npm run build && npm run preview` (terminal 1), then `npm run qa:viewport` (terminal 2).

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

- URL: `?dailyPreset=meeting_monday` (also `coffee_break`, `reorg_week`, `standard`)
- Or `localStorage.setItem('cl-daily-preset', 'reorg_week')` then reload

Verify home badge, spawn feel, and share text includes `Shift:`.

## Telegram Integration

- **Auth:** `getInitData()` on every authenticated API call
- **Theme:** `themeParams` mapped to `--cl-*` CSS variables (light/dark)
- **Share:** `Telegram.WebApp.shareMessage()` with clipboard fallback
- **Leaderboards:** Daily + Weekly only (v1)

## Deploy

Vercel — root directory: `apps/mini-app`. Set `VITE_API_URL` and `VITE_BOT_USERNAME` at build time.

Full checklist: [../../.cursor/skills/mini-app-deploy/SKILL.md](../../.cursor/skills/mini-app-deploy/SKILL.md)
