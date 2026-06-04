# Marketing screenshots — Corporate Ladder

Real Playwright captures from the production build (390×844 phone shell). Regenerate after UI changes:

```bash
cd apps/mini-app
npm run build && npm run preview -- --host 127.0.0.1 --port 4173
# terminal 2
npm run capture:marketing
```

Capture modes: `/?capture=home|game|gameover` (see `src/game/marketing-capture.ts`).

**Link preview OG** (separate from marketing shots):

```bash
# After editing docs/assets/Corporate_Ladder_og.png (source artwork, 1200×630)
npm run adopt:og
npm run verify:og
```

Legacy Playwright composite (phone crop + `og-preview.html`): `npm run capture:og` — optional, not canonical.

## Files

| File | Use | Suggested caption |
|------|-----|-------------------|
| `01-home.png` | Telegram intro, landing hero | *Tap left or right. Dodge meetings. Survive the org chart.* |
| `02-gameplay-dodge.png` | Carousel slide 2, README gameplay | *One tap, one rung. Don't attend the meeting.* |
| `03-game-over.png` | Carousel slide 3, humor hook | *Employment terminated. HR will not be taking questions.* |

Link previews: `apps/mini-app/public/og.png` (1200×630) from `docs/assets/Corporate_Ladder_og.png` via `npm run adopt:og`.

## Rubric evaluation (v1 — post pipeline)

Scores 1–5; pass threshold ≥4.

| Criterion | 01-home | 02-gameplay | 03-game-over |
|-----------|---------|-------------|--------------|
| 3-second clarity | 5 | 5 | 5 |
| Thumbnail legibility (~200px) | 5 | 4 | 4 |
| Satire signal | 5 | 5 | 5 |
| Layout trust (no banner/clip) | 5 | 5 | 5 |
| Action affordance | 4 | 5 | 3 |
| Brand | 5 | 4 | 5 |
| **Average** | **4.8** | **4.7** | **4.5** |

**Pass:** all shots ≥4 average; no criterion below 3.

### Notes

- **Home:** Clean seed (no auth banner), standard shift, inline PUNCH IN visible in browser shell.
- **Gameplay:** Reorg Week tint, imminent hint (*Meeting on RIGHT → tap LEFT*), tap deck + safe-side highlight — best teaching frame.
- **Game over:** `OBSTACLE_DEATH_COPY.meeting` detail + `FAILURE_REASONS[0]` flavor; REJECTED stamp visible.

### Future A/B (optional)

- Gameplay at **6.0y** with Manager badge (aspiration) — trade-off: loses tutorial hints unless forced.
- Home **tight crop** (hero + badge only) if carousel needs less scroll context.
- Device Telegram capture for F&F posts (native MainButton visible).

## Legacy alias

`npm run capture:hero` runs marketing capture and copies `01-home.png` → `docs/assets/gameplay.png` for README compatibility.
