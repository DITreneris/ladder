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

## Design assets (local)

OG source: `design/Corporate_Ladder_og.png` → `npm run adopt:og` → `public/og.png`  
Marketing shots: `npm run capture:marketing` → `design/marketing/`

## Ops docs (local)

Device QA, deploy, launch gate — [docs/LEAD_PROJECTION.md](../../docs/LEAD_PROJECTION.md)
