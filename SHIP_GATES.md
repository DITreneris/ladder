# Ship Gates — Corporate Ladder

**Canonical deploy gate index.** Update the prod anchor on each tag cut.

| | |
|---|---|
| **Tag** | `v2.4.1` @ `3cb5b97` (2026-06-27) |
| **Prod bundle** | `main-DwH-T8bE.js` (2026-06-27; v2.4.1 — atomic submit, migrations 006/007, game-over/button UX) |
| **Surfaces** | Mini App https://www.promptanatomy.lol · API https://ladder-production-642d.up.railway.app · Bot `@CorporateLadder_bot` |
| **Open gates** | D1–D2 device QA + share 11–12 (see Tier D) · T+7 metrics ~Jun 18 |

**Do not duplicate here:**
- **What is built / must not regress** → [ROADMAP.md](ROADMAP.md) § Shipped baseline (local)
- **Env vars + cold deploy** → [DEPLOY.md](DEPLOY.md)
- **Deep manual QA** → [.cursor/agents/verifier.md](.cursor/agents/verifier.md) (local)
- **Device sign-off rows** → [docs/DEVICE_QA_v2.0.md](docs/DEVICE_QA_v2.0.md) (local)
- **Prod bundle hash log** → [docs/DEBUG_ENV_TRIAGE.md](docs/DEBUG_ENV_TRIAGE.md) (local)
- **Time-bound ops brief** → [docs/LEAD_PROJECTION.md](docs/LEAD_PROJECTION.md) (local)

---

## When to run which tier

| Event | Required tiers |
|-------|----------------|
| **Every PR → main** | A |
| **Hotfix deploy** | A + B + C1–C2 |
| **Tagged release (v2.x)** | A + B + C + update prod anchor |
| **Public launch / marketing** | A + B + C + D |

---

## Tier A — Merge (blocks PR → main)

Enforced by [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Enable branch protection on `main` requiring jobs `api`, `bot`, `mini-app`.

| ID | Gate | Command / job | Pass |
|----|------|---------------|------|
| A1 | API tests + audit | `ci.yml` job `api` | pytest green; pip-audit clean |
| A2 | Bot tests | `ci.yml` job `bot` | pytest green |
| A3 | Mini-app lint / test / build | `ci.yml` job `mini-app` | lint + vitest + build green |
| A4 | Layout width stable | `npm run qa:layout` in CI | `#gamePlayArea` delta ≤ 2px |
| A5 | Viewport + coffee QA | `qa:viewport`, `qa:coffee` in CI | Playwright scripts pass |
| A6 | SEO / OG assets | `verify:seo`, `verify:og`, `verify:seo:live` | dist assets valid |

**Local pre-push (fast parity):** `bash scripts/smoke-ci.sh` — pytest + lint/test/build; Playwright runs in CI only.

---

## Tier B — Deploy (blocks push to prod)

Human checklist before Vercel/Railway auto-deploy from `main`.

| ID | Gate | Pass |
|----|------|------|
| B1 | Supabase migrations | `002_v2_hardening.sql` + `003_leaderboard_rpc.sql` + `006_submit_run_atomic.sql` applied |
| B2 | Local smoke | `bash scripts/smoke-ci.sh` exits 0 |
| B3 | Deploy order | API → mini-app → bot ([DEPLOY.md](DEPLOY.md)) |
| B4 | User-visible changes | `[Unreleased]` entry in CHANGELOG (local) |
| B5 | Schema/API coupling | When score validation or shifts change: API + mini-app same window |

---

## Tier C — Post-deploy (blocks "release good")

Run after prod deploy completes. Subset automated via [`.github/workflows/prod-smoke.yml`](.github/workflows/prod-smoke.yml) (`workflow_dispatch`).

| ID | Gate | Command | Pass |
|----|------|---------|------|
| C1 | API health | `curl -s https://ladder-production-642d.up.railway.app/health` | `"status":"ok"`, `"db":"ok"` |
| C2 | Submit pipeline | `python scripts/ff-metrics.py` (local) | `submit_pipeline_ok: true`, `migration_002_ok: true` |
| C3 | Cooldown persistence | same script | `hardening_table_rows.submit_cooldowns` > 0 after device cooldown test |
| C4 | Bundle recorded | update [docs/DEBUG_ENV_TRIAGE.md](docs/DEBUG_ENV_TRIAGE.md) | hash matches Vercel prod |
| C5 | Telegram spot check | reopen from `@CorporateLadder_bot` | one full run; score on Daily LB |

**Prod bundle check:**

```bash
curl -s "https://www.promptanatomy.lol" | grep -o 'main-[^"]*\.js'
```

**Note:** C2–C3 require local `scripts/ff-metrics.py` (Supabase service key — not in GitHub Actions).

---

## Tier D — Launch (blocks tag ceremony / public marketing)

Manual, periodic — not every deploy.

| ID | Gate | Doc | Pass |
|----|------|-----|------|
| D1 | Device QA rows 1–8 | [docs/DEVICE_QA_v2.0.md](docs/DEVICE_QA_v2.0.md) | iOS + Android signed |
| D2 | Native share rows 11–12 | same | DM + group share; no WebView crash |
| D3 | T+7 metrics ceremony | [ff-metrics-release skill](.cursor/skills/ff-metrics-release/SKILL.md) | external segment vs baseline |
| D4 | Public launch GO | [docs/PUBLIC_LAUNCH_REVIEW_2026-06-28.md](docs/PUBLIC_LAUNCH_REVIEW_2026-06-28.md) | all gates green |

**Release cut ceremony:** Tier A + B + C → verifier Release slice → tag on `origin` → update prod anchor above → ROADMAP Status.

---

## Enforcement

1. **Merge:** Branch protection on `main` — require status checks `api`, `bot`, `mini-app` (GitHub → Settings → Branches).
2. **Deploy:** Tier B is human — run `smoke-ci.sh` before push; PR template reminds contributors.
3. **Post-deploy:** Run `prod-smoke` workflow manually after deploy; complete C2–C5 locally.
4. **Launch:** Tier D sign-off before public marketing or paid acquisition.

**Break-glass:** Critical hotfix may skip B2 locally if CI on the commit is green; always run Tier C before calling prod good. Log bypass in DEBUG_ENV_TRIAGE.

Optional later: GitHub Environment `production` with required reviewer for Railway/Vercel manual deploys.
