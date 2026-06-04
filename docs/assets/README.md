# docs/assets — image sources

| Asset | Role | Regenerate |
|-------|------|------------|
| [`Corporate_Ladder_og.png`](Corporate_Ladder_og.png) | **Source of truth** for link preview OG (1200×630 artwork) | Edit file, then `cd apps/mini-app && npm run adopt:og` |
| [`marketing/`](marketing/) | Telegram/carousel screenshots (Playwright) | `npm run capture:marketing` — see [marketing/README.md](marketing/README.md) |
| [`gameplay.png`](gameplay.png) | Root README hero (copy of `marketing/01-home.png`) | `npm run capture:hero` |

**Production outputs** (committed elsewhere):

- `apps/mini-app/public/og.png` — Telegram / SEO `og:image`
- `.github/social-preview.png` — GitHub repo share (1280×640 letterbox from source OG)
