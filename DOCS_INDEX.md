# Document Index — Corporate Ladder

**Purpose:** Single navigation map for humans and coding agents.

**Repo:** [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) · **Sibling:** [github.com/DITreneris/site](https://github.com/DITreneris/site)

| Surface | URL |
|---------|-----|
| Mini App (production) | https://www.promptanatomy.lol |
| API (production) | https://ladder-production-642d.up.railway.app |
| Bot | Telegram — `@CorporateLadderBot` (or your `VITE_BOT_USERNAME`) |
| Database | Supabase project dashboard |

---

## DITreneris family charter

**Shared practices across repos:** `DOCS_INDEX.md`, `AGENTS.md`, Keep a Changelog + maintainer agent, `.cursor/rules` + skills, concept + prototype reference files, verifier-before-done workflow, minimal diffs.

| Repo | Product | Live |
|------|---------|------|
| [DITreneris/site](https://github.com/DITreneris/site) | Prompt Anatomy ecosystem marketing site | [promptanatomy.app](https://www.promptanatomy.app/) |
| **This repo** | Corporate Ladder Telegram Mini App game | Mini App on Vercel (see table above) |

**Corporate Ladder identity:** Satirical workplace arcade — *"Lumberjack meets modern office life."* Humor is the product. Do **not** import Prompt Anatomy’s 8-domain ecosystem or professional marketing tone. Mechanics and scope: [mvp-scope](docs/mvp-scope.md) + [ROADMAP](ROADMAP.md) § Shipped baseline (not root prototype files — see [archive](docs/archive/README.md)).

---

## Start here

| Audience | Read first | Then |
|----------|------------|------|
| **Human developer** | [README.md](README.md) | [DEPLOY.md](DEPLOY.md) → task row below |
| **Coding agent** | [AGENTS.md](AGENTS.md) | Matching **skill** + **rules** from task router |
| **Gameplay / engine** | [ROADMAP.md](ROADMAP.md) § Shipped baseline | [docs/mvp-scope.md](docs/mvp-scope.md) (boundaries only), `apps/mini-app/src/game/` |
| **Auth / API / DB** | [docs/architecture.md](docs/architecture.md) | Matching skill in task router |
| **Deploy / release** | [DEPLOY.md](DEPLOY.md) | [ROADMAP.md](ROADMAP.md) Status → [FF_EXECUTION](docs/FF_EXECUTION.md) |
| **F&F / device QA / tag** | [ROADMAP.md](ROADMAP.md) Status | [FF_EXECUTION](docs/FF_EXECUTION.md), [FF_REVIEW_2026-06-14](docs/FF_REVIEW_2026-06-14.md), [DEVICE_QA_v2.0](docs/DEVICE_QA_v2.0.md), [DEVICE_QA_v1.8.5](docs/DEVICE_QA_v1.8.5.md) |
| **Bug fix backlog / release TODO** | [docs/todo.md](docs/todo.md) | P0–P3 queue, verification matrix, test gaps |

---

## Task router

Use this table to pick the right skill, rules, and documents.

| Task | Agent / skill | Rule(s) | Primary documents |
|------|---------------|---------|-------------------|
| Game mechanics, engine, UI wiring | — (inline) | [mini-app-frontend.mdc](.cursor/rules/mini-app-frontend.mdc) | [ROADMAP](ROADMAP.md) § Shipped baseline, [mvp-scope](docs/mvp-scope.md) (in/out only), `game/`, `app.ts` |
| Scope / v1.1 approval | — | [project-context.mdc](.cursor/rules/project-context.mdc) | [mvp-scope](docs/mvp-scope.md) |
| Design / UI / tokens | — | [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), `apps/mini-app/src/style.css` |
| Satirical copy, promotions, failures | — | [satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) | `constants.ts`, `template.ts`, [ROADMAP](ROADMAP.md) § Narrative thesis |
| Telegram initData, `/auth/me` | `telegram-initdata-auth` | [python-api.mdc](.cursor/rules/python-api.mdc) | [docs/architecture.md](docs/architecture.md), `packages/api/`, `apps/mini-app/src/lib/telegram.ts` |
| Score submit → leaderboard | `score-pipeline` | [python-api.mdc](.cursor/rules/python-api.mdc), [supabase-db.mdc](.cursor/rules/supabase-db.mdc) | `packages/api/`, [supabase/migrations/](supabase/migrations/) |
| API routes, validation, rate limits | — | [python-api.mdc](.cursor/rules/python-api.mdc) | `packages/api/` |
| Schema, RLS, migrations | — | [supabase-db.mdc](.cursor/rules/supabase-db.mdc) | `supabase/migrations/` |
| Production deploy | `mini-app-deploy` | [deployment.mdc](.cursor/rules/deployment.mdc) | [DEPLOY.md](DEPLOY.md), [.env.example](.env.example) |
| Changelog, release notes | Changelog Maintainer | [changelog.mdc](.cursor/rules/changelog.mdc) | [CHANGELOG.md](CHANGELOG.md) |
| Pre-merge / feature QA | `verifier` | [project-context.mdc](.cursor/rules/project-context.mdc) | [.cursor/agents/verifier.md](.cursor/agents/verifier.md), [scripts/smoke-local.ps1](scripts/smoke-local.ps1) |
| Release train / pillar work | — | [project-context.mdc](.cursor/rules/project-context.mdc) | [ROADMAP.md](ROADMAP.md) Status + § Shipped baseline, [CHANGELOG.md](CHANGELOG.md) |
| F&F gate / device QA | `verifier` | [deployment.mdc](.cursor/rules/deployment.mdc) | [FF_EXECUTION](docs/FF_EXECUTION.md), [DEVICE_QA_v2.0](docs/DEVICE_QA_v2.0.md), [DEPLOY_STATUS](docs/DEPLOY_STATUS.md) |
| Discoverability / link previews (not full SEO) | — | [project-context.mdc](.cursor/rules/project-context.mdc) | [docs/discoverability-plan.md](docs/discoverability-plan.md), [docs/assets/README.md](docs/assets/README.md), `npm run adopt:og` |
| Layout QA (overflow) | `verifier` | [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | [apps/mini-app/scripts/viewport-qa.mjs](apps/mini-app/scripts/viewport-qa.mjs), CI workflow |
| Debug triage / incident history | `debug-steward` | [project-context.mdc](.cursor/rules/project-context.mdc) | [debug-triage](.cursor/skills/debug-triage/SKILL.md), [DEBUG_FIX_2026-06-01](docs/DEBUG_FIX_2026-06-01.md) |
| Co-branding / PA footer | — | [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | `apps/mini-app/src/lib/branding.ts`, [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §9 |

**Workflow (feature work):** change → `pytest` + mini-app `lint` / `test` / `build` → `smoke-local` if deploy-related → `[Unreleased]` in CHANGELOG → `verifier` on user-facing work.

---

## Document registry

### Tier 1 — Source of truth (read before editing)

| ID | Path | What it governs | Update when |
|----|------|-----------------|-------------|
| `scope` | [docs/mvp-scope.md](docs/mvp-scope.md) | v1 boundary, v1.1 deferrals, out-of-scope, terminology — **not** feature inventory | Scope / approval decisions |
| `architecture` | [docs/architecture.md](docs/architecture.md) | Stack, data flow, env matrix, security | Infra or API contract changes |
| `tokens` | [apps/mini-app/src/style.css](apps/mini-app/src/style.css) | Design tokens (`@theme`) and utilities (`@utility`) | New colors, spacing, shell component utilities |
| `design-system` | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Mini-app visual canon (v1.8.5), a11y matrix, agent guardrails | UI pattern or token changes |
| `env` | [.env.example](.env.example) | Required environment variable names | New env vars |

### Tier 2 — Human and agent guides

| ID | Path | Audience | Notes |
|----|------|----------|-------|
| `readme` | [README.md](README.md) | Developers | Onboarding, quick start |
| `roadmap` | [ROADMAP.md](ROADMAP.md) | Everyone | Status + release train; v1.9.0 + v2.0.0 tagged; soft launch active |
| `assets` | [docs/assets/README.md](docs/assets/README.md) | Marketing / OG | OG source (`Corporate_Ladder_og.png`) vs Playwright marketing shots |
| `license` | [LICENSE](LICENSE) | Legal / GitHub | Proprietary — all rights reserved |
| `deploy-status` | [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md) | Release | Manual deploy progress tracker |
| `device-qa` | [docs/DEVICE_QA_v1.8.1.md](docs/DEVICE_QA_v1.8.1.md) | Release | v1.8.1 regression (run before v1.8.2 delta) |
| `device-qa-v184` | [docs/DEVICE_QA_v1.8.4.md](docs/DEVICE_QA_v1.8.4.md) | Release | v1.8.4 trust + layout delta |
| `device-qa-v2` | [docs/DEVICE_QA_v2.0.md](docs/DEVICE_QA_v2.0.md) | Release | v2.0 triage + hardening — soft-launch gate |
| `device-qa-v185` | [docs/DEVICE_QA_v1.8.5.md](docs/DEVICE_QA_v1.8.5.md) | Release | v1.8.5 corridor + tutorial regression |
| `todo` | [docs/todo.md](docs/todo.md) | Release / QA | v1.8.5 bug audit backlog — P0–P3 fixes, verification, tests, deploy gates |
| `debug-repro` | [docs/DEBUG_REPRO.md](docs/DEBUG_REPRO.md) | QA | Manual R1–R5 reaction + L1–L5 layout checklist |
| `debug-env` | [docs/DEBUG_ENV_TRIAGE.md](docs/DEBUG_ENV_TRIAGE.md) | QA | Prod bundle hash triage table |
| `debug-incident-2026-06-01` | [docs/DEBUG_FIX_2026-06-01.md](docs/DEBUG_FIX_2026-06-01.md) | QA / agents | F&F debug postmortem — ladder width, lessons learned, CHANGELOG cross-links |
| `ff-test` | [docs/FF_TEST.md](docs/FF_TEST.md) | Product | Friends-and-family protocol + v1.9 decision |
| `ff-metrics-2026-06-04` | [docs/FF_METRICS_2026-06-04.md](docs/FF_METRICS_2026-06-04.md) | Product | F&F data snapshot (Phase 0 gate) |
| `ff-metrics-2026-06-10` | [docs/FF_METRICS_2026-06-10.md](docs/FF_METRICS_2026-06-10.md) | Product | Pre-review metrics template (fill Jun 10) |
| `ff-deploy-checklist` | [docs/FF_DEPLOY_CHECKLIST.md](docs/FF_DEPLOY_CHECKLIST.md) | Deploy | Combined v1.9 + v2.0 deploy; tags deferred to Jun 14 GO |
| `ff-review-2026-06-14` | [docs/FF_REVIEW_2026-06-14.md](docs/FF_REVIEW_2026-06-14.md) | Product | Soft launch GO plan + Jun 14 decision (F&F only; no public marketing) |
| `ff-execution` | [docs/FF_EXECUTION.md](docs/FF_EXECUTION.md) | Product / deploy | F&F gate runbook: deploy smoke, QA sign-off, dogfood, monitor, review |
| `v19-spike` | [docs/V19_SPIKE.md](docs/V19_SPIKE.md) | Product / agents | v1.9 parallel agent tracks; gate on Jun 14 F&F review |
| `discoverability` | [docs/discoverability-plan.md](docs/discoverability-plan.md) | Product / release | Telegram-first discoverability; minimal web metadata; defers full SEO |
| `agents` | [AGENTS.md](AGENTS.md) | Agents + leads | Scope, workflow, conventions |
| `deploy` | [DEPLOY.md](DEPLOY.md) | DevOps / release | Cold-deploy + verification checklist |
| `changelog` | [CHANGELOG.md](CHANGELOG.md) | Everyone | Keep a Changelog; `[Unreleased]` |
| `docs-index` | DOCS_INDEX.md (this file) | Everyone | Update when adding docs/agents/skills |
| `mini-app-readme` | [apps/mini-app/README.md](apps/mini-app/README.md) | Frontend | Play instructions, pre-release QA |

### Tier 2b — Archive (historical — not in routine audits)

| ID | Path | Notes |
|----|------|-------|
| `archive` | [docs/archive/README.md](docs/archive/README.md) | Policy + index; exclude from default agent context |
| `prototype-html` | [docs/archive/snippet.txt](docs/archive/snippet.txt) | v0 HTML prototype — parity archaeology only |
| `concept-v01` | [docs/archive/primal.txt](docs/archive/primal.txt) | Concept v0.1 — tone archaeology only |

### Tier 3 — Tooling and CI

| ID | Path | Notes |
|----|------|-------|
| `ci` | [.github/workflows/ci.yml](.github/workflows/ci.yml) | API pytest, bot import, mini-app lint/test/build/viewport QA |
| `smoke` | [scripts/smoke-local.ps1](scripts/smoke-local.ps1), [scripts/smoke-local.sh](scripts/smoke-local.sh) | Local CI-equivalent smoke |
| `viewport-qa` | [apps/mini-app/scripts/viewport-qa.mjs](apps/mini-app/scripts/viewport-qa.mjs) | Playwright overflow check (`npm run qa:viewport` in mini-app) |
| `preflight` | [scripts/verify-deploy-config.ps1](scripts/verify-deploy-config.ps1), [scripts/verify-deploy-config.sh](scripts/verify-deploy-config.sh) | Deploy artifact + `.env.example` check |
| `setup-env` | [scripts/setup-env.ps1](scripts/setup-env.ps1), [scripts/setup-env.sh](scripts/setup-env.sh) | Optional sync root `.env` into service dirs |

### Tier 4 — Cursor config

| ID | Path | Notes |
|----|------|-------|
| `rules` | [.cursor/rules/](.cursor/rules/) | Scoped and always-on rules |
| `skills` | [.cursor/skills/](.cursor/skills/) | Specialized workflows |
| `verifier` | [.cursor/agents/verifier.md](.cursor/agents/verifier.md) | Read-only QA agent |
| `debug-steward` | [.cursor/agents/debug-steward.md](.cursor/agents/debug-steward.md) | Debug triage order, incident postmortems |
| `changelog-maintainer` | [.cursor/agents/changelog-maintainer.md](.cursor/agents/changelog-maintainer.md) | Changelog release cuts and cyclic review |

---

## Agent roster

Agents live in [.cursor/agents/](.cursor/agents/). Invoke by name in Cursor.

| Agent | Mode | Skills | Owns |
|-------|------|--------|------|
| [verifier](.cursor/agents/verifier.md) | read-only | — | Pre-done QA: game, Telegram, API, leaderboards, CI commands |
| [debug-steward](.cursor/agents/debug-steward.md) | write | [debug-triage](.cursor/skills/debug-triage/SKILL.md) | Debug triage order, incident docs ([DEBUG_FIX_2026-06-01](docs/DEBUG_FIX_2026-06-01.md)) |
| [Changelog Maintainer](.cursor/agents/changelog-maintainer.md) | write | [changelog-maintainer](.cursor/skills/changelog-maintainer/SKILL.md) | [CHANGELOG.md](CHANGELOG.md) — **family equivalent:** mother repo’s `changelog-keeper` |

Main session handles game/API/copy work inline using skills and rules above.

---

## Skills catalog

| Skill | Path | When to load |
|-------|------|--------------|
| `telegram-initdata-auth` | [.cursor/skills/telegram-initdata-auth/SKILL.md](.cursor/skills/telegram-initdata-auth/SKILL.md) | Telegram login, initData HMAC, `/auth/me` failures |
| `score-pipeline` | [.cursor/skills/score-pipeline/SKILL.md](.cursor/skills/score-pipeline/SKILL.md) | Score submission, leaderboard, `game_runs` schema |
| `mini-app-deploy` | [.cursor/skills/mini-app-deploy/SKILL.md](.cursor/skills/mini-app-deploy/SKILL.md) | Production setup, env vars, first launch |
| `changelog-maintainer` | [.cursor/skills/changelog-maintainer/SKILL.md](.cursor/skills/changelog-maintainer/SKILL.md) | Changelog updates, weekly cyclic review, release cut |
| `debug-triage` | [.cursor/skills/debug-triage/SKILL.md](.cursor/skills/debug-triage/SKILL.md) | Gameplay “feels broken”, layout shift, prod vs repo, postmortems |

---

## Cursor rules

| Rule | Scope | Always on |
|------|-------|-----------|
| [project-context.mdc](.cursor/rules/project-context.mdc) | Project identity, MVP, family | **Yes** |
| [changelog.mdc](.cursor/rules/changelog.mdc) | `CHANGELOG.md` | No |
| [deployment.mdc](.cursor/rules/deployment.mdc) | `DEPLOY.md`, deploy scripts, Dockerfiles, `.env.example` | No |
| [satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) | Copy / messaging | No |
| [mini-app-frontend.mdc](.cursor/rules/mini-app-frontend.mdc) | `apps/mini-app/**` | No |
| [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | `apps/mini-app/**` | No |
| [python-api.mdc](.cursor/rules/python-api.mdc) | `packages/api/**` | No |
| [supabase-db.mdc](.cursor/rules/supabase-db.mdc) | `supabase/**` | No |

---

## Code map (quick)

```
069_ladder/
├── apps/mini-app/          # Vite + TS → Vercel
│   └── src/
│       ├── game/           # Engine, constants, audio (no DOM)
│       ├── lib/            # telegram.ts, api.ts, branding.ts, effects.ts
│       ├── app.ts          # UI controller
│       ├── template.ts     # HTML shell
│       └── style.css       # Design tokens and utilities
├── apps/bot/               # aiogram → Railway
├── packages/api/           # FastAPI → Railway
├── supabase/migrations/    # Postgres schema
├── docs/                   # mvp-scope, architecture
├── scripts/                # smoke, verify-deploy, setup-env
└── .cursor/                # rules, skills, agents
```

**Data flow:** Bot `/start` (private) or `/go@bot` (group) → Mini App (Vercel) → `POST /auth/me` → play → `POST /runs` → `GET /leaderboard`. Group keyboard: `t.me?startapp` (not `web_app`). See [docs/architecture.md](docs/architecture.md).

---

## Maintaining this index

Update **DOCS_INDEX.md** when you add or rename:

- Root-level docs (`*.md`) or [docs/archive/](docs/archive/) (update README when adding historical files)
- `.cursor/agents/` or `.cursor/skills/` entries
- Deploy scripts or env vars that affect operators
- Scope doc ([docs/mvp-scope.md](docs/mvp-scope.md)) full refresh — review registry and task router

Then add a bullet under [CHANGELOG.md](CHANGELOG.md) → `[Unreleased]`.
