# F&F cohort outreach — Jun 11 warm leads (2026-06-12)

**Goal:** Convert 1–2 run externals to ≥3 runs before T+7 metrics (~2026-06-18).  
**Baseline:** [FF_METRICS_2026-06-12.md](FF_METRICS_2026-06-12.md) · [20260612_analize.md](20260612_analize.md)  
**Success metric:** +2 externals cross ≥3 runs (gate #3 in [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md))

---

## Execution checklist (operator)

- [ ] Ping Jun 11 warm leads (priority table below) — satirical DM template
- [ ] Special case: **BadrChioua** (0 runs) — activation debug
- [ ] Mark `[x] pinged` / `[x] returned` per row as DMs go out
- [ ] Do **not** widen public marketing until T+7 review ([20260612_analize.md](20260612_analize.md))
- [ ] Re-run `python scripts/ff-metrics.py` weekly; update [FF_METRICS_2026-06-18.md](FF_METRICS_2026-06-18.md) at T+7

**Status (2026-06-12):** Tracker ready; outreach not yet executed — fill checkboxes as DMs are sent.

---

## Message template

> Hey {name} — you survived **{best_score}y** on Corporate Ladder. Think you can beat it?
> Punch in again: https://t.me/CorporateLadder_bot
> (Tap the ladder, dodge meetings, climb the ranks.)

Tone: satirical, short, no pressure. DM or group reply where you already have context.

---

## Priority list (1–2 runs, Jun 11 wave)

| Name | Runs | Best score | Status |
|------|------|------------|--------|
| Dana | 6 | 1.3y | [ ] pinged [ ] returned |
| Benja | 1 | 1.3y | [ ] pinged [ ] returned |
| Ripal | 1 | 6.3y | [ ] pinged [ ] returned |
| Mills94boom | 2 | 3.8y | [ ] pinged [ ] returned |
| Safaarys | 2 | 7.5y | [ ] pinged [ ] returned |
| Bluenew55 | 2 | 0.3y | [ ] pinged [ ] returned |
| yornight | 2 | 14.5y | [ ] pinged [ ] returned |
| joan1nkece | 2 | 8.5y | [ ] pinged [ ] returned |
| devilofwallstreet | 2 | 3.3y | [ ] pinged [ ] returned |
| Brotokumer | 1 | 3.5y | [ ] pinged [ ] returned |
| NAKHODA_Jelal | 1 | 4.0y | [ ] pinged [ ] returned |
| WinCent | 2 | 2.8y | [ ] pinged [ ] returned |
| Bread_night | 2 | 9.3y | [ ] pinged [ ] returned |
| modertma | 2 | 0.3y | [ ] pinged [ ] returned |

## Special case — 0 runs

| Name | Registered | Status |
|------|------------|--------|
| BadrChioua | 2026-06-11 19:56 UTC | [ ] pinged — ask: did app open? any error on first Punch In? |

---

## Tracking

After outreach, re-run:

```bash
python scripts/ff-metrics.py
```

Update [FF_METRICS_2026-06-12.md](FF_METRICS_2026-06-12.md) or Jun 18 snapshot with:

- `externals_gte3_runs` count
- Names that moved from 1–2 → 3+ runs
- Return rate delta

**Do not** widen public marketing until T+7 review confirms depth improvement.
