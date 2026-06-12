---
name: ff-metrics-release
description: F&F metrics, release cut ceremony, GO/NO-GO gates. Use before tagging, public launch review, or interpreting ff-metrics.py output.
---

# F&F Metrics + Release Gates

**Scope:** Operational release gates and metrics interpretation — not feature implementation.

## When to load

- Pre-tag release cut (v2.x)
- F&F GO/NO-GO decision
- Public launch review (~Jun 28)
- Interpreting player retention / external segment data

## Metrics script

```bash
python scripts/ff-metrics.py
```

**Key flags in output:**

| Flag | Meaning |
|------|---------|
| `migration_002_ok` | Supabase `submit_cooldowns` + `api_sessions` present |
| `submit_pipeline_ok` | Score submit path healthy in prod |
| `deep_analytics` | Paginated playtime, progression, retention segments |
| `hardening_table_rows` | Row counts for `submit_cooldowns` + `api_sessions` (expect >0 after API redeploy) |

Snapshots: [FF_METRICS_2026-06-18.md](../../docs/FF_METRICS_2026-06-18.md) (T+7 template) · [FF_METRICS_2026-06-12.md](../../docs/FF_METRICS_2026-06-12.md), [20260612_analize.md](../../docs/20260612_analize.md) (latest) · [FF_METRICS_2026-06-11.md](../../docs/FF_METRICS_2026-06-11.md), [20260608_analize.md](../../docs/20260608_analize.md).

**Critical:** DB aggregates skew **core team** (~83% runs) — read **external segment** separately for GO decisions.

## Gate documents

| Doc | Use |
|-----|-----|
| [FF_EXECUTION.md](../../docs/FF_EXECUTION.md) | F&F runbook: deploy, QA, dogfood, monitor |
| [FF_REVIEW_2026-06-14.md](../../docs/FF_REVIEW_2026-06-14.md) | CONDITIONAL GO verdict |
| [DEVICE_QA_v2.0.md](../../docs/DEVICE_QA_v2.0.md) | Manual device sign-off (iOS + Android) |
| [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](../../docs/PUBLIC_LAUNCH_REVIEW_2026-06-28.md) | Public launch GO checklist |
| [FF_COHORT_OUTREACH_2026-06-12.md](../../docs/FF_COHORT_OUTREACH_2026-06-12.md) | Jun 11 warm-lead DM tracker + satirical template |
| [prelaunch_audit2.md](../../docs/prelaunch_audit2.md) | Pre-launch audit #2 (62/100 CONDITIONAL GO) |

## External success metrics (F&F)

- Median run ≥30s (external segment)
- ≥6/8 externals with ≥3 runs
- Telegram share validated on device (native prepare flow + challenge link)
- DEVICE_QA v2.0 rows 1–8 signed

## Release cut ceremony

1. `pytest` + mini-app `lint` / `test` / `build`
2. Run [verifier](../../agents/verifier.md) — **Release slice** section
3. Deploy **Railway API first** (cooldown/session fix), then Vercel mini-app
4. `python scripts/ff-metrics.py` → confirm **`hardening_table_rows.submit_cooldowns` > 0** (gate #8) and `submit_pipeline_ok: true`
5. Update [DEBUG_ENV_TRIAGE.md](../../docs/DEBUG_ENV_TRIAGE.md) prod bundle hash
6. Tag on `origin`; update ROADMAP **Status**
7. Changelog Maintainer: `[Unreleased]` → `## [X.Y.Z]`

### T+7 metrics (~7 days post-tag)

1. `python scripts/ff-metrics.py` → save stdout JSON
2. Fill [FF_METRICS_2026-06-18.md](../../docs/FF_METRICS_2026-06-18.md) (or dated successor) — compare externals ≥3 runs, median run seconds, return rate vs [FF_METRICS_2026-06-12.md](../../docs/FF_METRICS_2026-06-12.md)
3. Update baseline table in [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](../../docs/PUBLIC_LAUNCH_REVIEW_2026-06-28.md)
4. Cross-check cohort outreach: [FF_COHORT_OUTREACH_2026-06-12.md](../../docs/FF_COHORT_OUTREACH_2026-06-12.md) — did warm leads return?

## Status sync rule

When ROADMAP **Status** changes, sync in same PR:
- [.cursor/rules/project-context.mdc](../../rules/project-context.mdc)
- [AGENTS.md](../../../AGENTS.md)
- [.cursor/rules/deployment.mdc](../../rules/deployment.mdc)
- [.cursor/skills/mini-app-deploy/SKILL.md](../mini-app-deploy/SKILL.md)
- [verifier.md](../../agents/verifier.md) Release slice (if new features shipped)

## Out of scope

- Building custom analytics dashboard (v1.1)
- Paid acquisition pilots before public launch GO — [ads-acquisition-plan.md](../../docs/ads-acquisition-plan.md)
