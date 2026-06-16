# Corporate Ladder — Mini App

Telegram Mini App frontend (Vite + TypeScript + Tailwind).

**Production:** https://www.promptanatomy.lol

## Scripts

```bash
npm run dev          # local dev (VITE_API_URL in root .env)
npm run lint         # tsc --noEmit
npm test             # vitest
npm run build        # production bundle
npm run qa:viewport  # Playwright overflow (preview must be running)
npm run qa:layout    # post-tap width stability
npm run qa:coffee    # tutorial coffee + meeting death
npm run verify:og    # OG asset check
npm run verify:seo   # shell SEO assets
```

## Layout contract

In-run vertical budget (HUD → memo strip → play area → tap deck) is documented locally in [docs/MINI_APP_GOLDEN_STANDARD.md](../../docs/MINI_APP_GOLDEN_STANDARD.md).

**Before changing** `template.ts` game column DOM, ladder CSS, or `layoutRungs()`:

1. Read the golden standard DOM contract (§3)
2. Do not rename `#gameContentColumn`, `#hrMemoStrip`, `#gamePlayArea`, `#tapControlsBar`, or tap button IDs without updating `scripts/viewport-qa.mjs` and `scripts/layout-audit.mjs`

**Layout QA** (preview must be running on port 4173):

```bash
npx vite preview --host 127.0.0.1 --port 4173
npm run qa:viewport && npm run qa:layout
```

Note: use `npx vite preview --port 4173` — `npm run preview -- --port` misparses on Windows/npm.

## Design assets (local)

OG source: `design/Corporate_Ladder_og.png` → `npm run adopt:og` → `public/og.png`  
Marketing shots: `npm run capture:marketing` → `design/marketing/`

## Ops docs (local)

Device QA, deploy, launch gate — [docs/LEAD_PROJECTION.md](../../docs/LEAD_PROJECTION.md)
