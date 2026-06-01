# Friends-and-family test — Corporate Ladder



**Window:** 2026-05-31 → 2026-06-14 (2 weeks) · **Gate:** Complete [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) + [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) first



**Execution runbook:** [FF_EXECUTION.md](FF_EXECUTION.md) (deploy smoke, dogfood, monitor, review)



Use results to pick **1–2 v1.9 items** — see [ROADMAP.md](../ROADMAP.md) § v1.9+ and provisional v1.9.0 row.



---



## Pre-F&F engineering (2026-06-01)



- [x] Score submit failure toasts

- [x] Auth degradation banner

- [x] Deterministic Meeting Monday badges

- [x] Share toast accuracy

- [x] API rank vs years validation

- [x] Production redeploy from `main` (Vercel + Railway API) — `d862c3c` 2026-06-01
- [x] Post-deploy smoke — API health + OG meta (automated); Telegram steps 2–7 manual in [FF_EXECUTION.md](FF_EXECUTION.md) Phase B



---



## Device QA assignment



| Platform | Signer | Status |

|----------|--------|--------|

| **iOS** | Core team | Pending — [DEVICE_QA_v1.8.1.md](DEVICE_QA_v1.8.1.md) + [DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) |

| **Android** | Recruit before external invite | Pending — same checklists |



---



## Recruit (5–10 testers)



Mix **iOS + Android**; not all on the core team.



**Share message:**



> Corporate Ladder — satirical office climb game in Telegram. Open **https://t.me/CorporateLadderBot** and play **3 runs** over the next few days. Tell me: (1) do taps feel responsive? (2) boring after run 2? (3) would you share your score?



**Bot (primary entry):** https://t.me/CorporateLadderBot · `@CorporateLadderBot` · **Mini App URL (WebApp shell only):** https://www.promptanatomy.lol



| Tester | Platform | Invited | Runs (wk1) | Notes |

|--------|----------|---------|------------|-------|

| _(Android QA signer)_ | Android | [ ] | | DEVICE_QA sign-off |

| | iOS / Android | [ ] | | |

| | | | | |

| | | | | |

| | | | | |

| | | | | |



---



## Internal dogfood (core team, before external invite)



| Member | Run 1 | Run 2 | Run 3 + share | Date |

|--------|-------|-------|---------------|------|

| | [ ] | [ ] | [ ] | |

| | [ ] | [ ] | [ ] | |



---



## Metrics (targets from [mvp-scope.md](mvp-scope.md))



| Metric | Target | Actual | How measured |

|--------|--------|--------|--------------|

| Session length | 30–90s | | Ask / observe |

| Games per user (wk1) | ≥3 | | Supabase query below |

| Share rate | Any shares | | Ask testers |

| Daily return (engaged) | ≥2 days/wk | | `game_runs` timestamps |



### Supabase SQL (last 14 days)



```sql

SELECT user_id, COUNT(*) AS runs,

       MIN(created_at) AS first_run,

       MAX(created_at) AS last_run,

       COUNT(DISTINCT DATE(created_at AT TIME ZONE 'UTC')) AS active_days

FROM game_runs

WHERE created_at > NOW() - INTERVAL '14 days'

GROUP BY user_id

ORDER BY runs DESC;

```



### Monitor check-ins (run SQL on days 1, 4, 7, 10)



| Day | Date | Notes |

|-----|------|-------|

| 1 | 2026-06-01 | Deploy `d862c3c`; device QA kickoff |

| 4 | 2026-06-04 | |

| 7 | 2026-06-07 | |

| 10 | 2026-06-10 | |



---



## Feedback buckets



Log in GitHub Issues or a scratch column:



| Bucket | Examples |

|--------|----------|

| **pain** | Missed taps, unreadable rungs, BackButton broken |

| **samey** | Same feel every run despite v1.8 beats |

| **too hard** | Energy drain, obstacle density |

| **love it** | Share moments, funny copy |



| Date | Tester | Bucket | Detail | Action |

|------|--------|--------|--------|--------|

| | | | | |



- Bugs → [.github/ISSUE_TEMPLATE/bug_report.md](../.github/ISSUE_TEMPLATE/bug_report.md)

- Ideas → [.github/ISSUE_TEMPLATE/feature_request.md](../.github/ISSUE_TEMPLATE/feature_request.md)



**Hotfix policy:** ship **pain** within 24h; defer **samey** / **too hard** to Jun 14 review.



---



## End-of-F&F review (2026-06-14)



Answer:



1. **Taps solid on real devices?** → If no: hotfix, not v1.9

2. **Sessions samey?** → Antagonist NPC or decals

3. **Want shorter runs?** → Synergy Sprint preset



### Decision matrix → v1.9 pick



| Signal | Pick |

|--------|------|

| Unfair deaths / didn't see threat | Near-miss wince |

| Runs too long / "one more try" | Synergy Sprint preset |

| Arena flat | Sticky-note decals |

| Still same every day | Antagonist emoji NPC |

| Need numbers | Lightweight analytics (v1.1 — approval required) |



**Provisional default (if mixed):** Near-miss wince + Synergy Sprint — confirm in ROADMAP v1.9.0 row before coding.

**Implementation spike (agent-ready):** [V19_SPIKE.md](V19_SPIKE.md)

**Record decision here:**



- [ ] Review date: **2026-06-14**

- [ ] v1.9 item 1: _______________

- [ ] v1.9 item 2 (optional): _______________

- [ ] Verifier pass before tag: [ ]

- [ ] CHANGELOG cut + git tag: _______________


