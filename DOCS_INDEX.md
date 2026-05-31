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

**Corporate Ladder identity:** Satirical workplace arcade — *"Lumberjack meets modern office life."* Humor is the product. Do **not** import Prompt Anatomy’s 8-domain ecosystem, professional marketing tone, or `snippet.txt` palette guard (here, [`snippet.txt`](snippet.txt) is **mechanics** canon).

---

## Start here

| Audience | Read first | Then |
|----------|------------|------|
| **Human developer** | [README.md](README.md) | [DEPLOY.md](DEPLOY.md) → task row below |
| **Coding agent** | [AGENTS.md](AGENTS.md) | Matching **skill** + **rules** from task router |
| **Gameplay / engine** | [snippet.txt](snippet.txt) | [docs/mvp-scope.md](docs/mvp-scope.md) |
| **Auth / API / DB** | [docs/architecture.md](docs/architecture.md) | Matching skill in task router |
| **Deploy / release** | [DEPLOY.md](DEPLOY.md) | [.cursor/skills/mini-app-deploy/SKILL.md](.cursor/skills/mini-app-deploy/SKILL.md) |

---

## Task router

Use this table to pick the right skill, rules, and documents.

| Task | Agent / skill | Rule(s) | Primary documents |
|------|---------------|---------|-------------------|
| Game mechanics, engine, UI wiring | — (inline) | [mini-app-frontend.mdc](.cursor/rules/mini-app-frontend.mdc) | [snippet.txt](snippet.txt), `apps/mini-app/src/game/`, `apps/mini-app/src/app.ts` |
| Design / UI / tokens | — | [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), `apps/mini-app/src/style.css` |
| Satirical copy, promotions, failures | — | [satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) | [primal.txt](primal.txt), `apps/mini-app/src/template.ts` |
| Telegram initData, `/auth/me` | `telegram-initdata-auth` | [python-api.mdc](.cursor/rules/python-api.mdc) | [docs/architecture.md](docs/architecture.md), `packages/api/`, `apps/mini-app/src/lib/telegram.ts` |
| Score submit → leaderboard | `score-pipeline` | [python-api.mdc](.cursor/rules/python-api.mdc), [supabase-db.mdc](.cursor/rules/supabase-db.mdc) | `packages/api/`, [supabase/migrations/](supabase/migrations/) |
| API routes, validation, rate limits | — | [python-api.mdc](.cursor/rules/python-api.mdc) | `packages/api/` |
| Schema, RLS, migrations | — | [supabase-db.mdc](.cursor/rules/supabase-db.mdc) | `supabase/migrations/` |
| Production deploy | `mini-app-deploy` | [deployment.mdc](.cursor/rules/deployment.mdc) | [DEPLOY.md](DEPLOY.md), [.env.example](.env.example) |
| Changelog, release notes | Changelog Maintainer | [changelog.mdc](.cursor/rules/changelog.mdc) | [CHANGELOG.md](CHANGELOG.md) |
| Pre-merge / feature QA | `verifier` | [project-context.mdc](.cursor/rules/project-context.mdc) | [.cursor/agents/verifier.md](.cursor/agents/verifier.md), [scripts/smoke-local.ps1](scripts/smoke-local.ps1) |
| Release train / pillar work | — | [project-context.mdc](.cursor/rules/project-context.mdc) | [ROADMAP.md](ROADMAP.md), [CHANGELOG.md](CHANGELOG.md) |
| Discoverability / link previews (not full SEO) | — | [project-context.mdc](.cursor/rules/project-context.mdc) | [docs/discoverability-plan.md](docs/discoverability-plan.md), [docs/FF_TEST.md](docs/FF_TEST.md) |
| Layout QA (overflow) | `verifier` | [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | [apps/mini-app/scripts/viewport-qa.mjs](apps/mini-app/scripts/viewport-qa.mjs), CI workflow |
| Co-branding / PA footer | — | [mini-app-ui.mdc](.cursor/rules/mini-app-ui.mdc) | `apps/mini-app/src/lib/branding.ts`, [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) §9 |

**Workflow (feature work):** change → `pytest` + mini-app `lint` / `test` / `build` → `smoke-local` if deploy-related → `[Unreleased]` in CHANGELOG → `verifier` on user-facing work.

---

## Document registry

### Tier 1 — Source of truth (read before editing)

| ID | Path | What it governs | Update when |
|----|------|-----------------|-------------|
| `concept` | [primal.txt](primal.txt) | Brand narrative, tone, audience — **family alias:** mother repo’s `primal_concept.txt` | Product messaging changes |
| `prototype` | [snippet.txt](snippet.txt) | Game mechanics reference (port, don’t reinvent) | Spec explicitly updated |
| `scope` | [docs/mvp-scope.md](docs/mvp-scope.md) | v1 / v1.1 / out-of-scope boundaries | Scope decisions |
| `architecture` | [docs/architecture.md](docs/architecture.md) | Stack, data flow, env matrix, security | Infra or API contract changes |
| `tokens` | [apps/mini-app/src/style.css](apps/mini-app/src/style.css) | Design tokens (`@theme`) and utilities (`@utility`) | New colors, spacing, shell component utilities |
| `design-system` | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Mini-app visual canon, a11y matrix, agent guardrails | UI pattern or token changes |
| `env` | [.env.example](.env.example) | Required environment variable names | New env vars |

### Tier 2 — Human and agent guides

| ID | Path | Audience | Notes |
|----|------|----------|-------|
| `readme` | [README.md](README.md) | Developers | Onboarding, quick start |
| `roadmap` | [ROADMAP.md](ROADMAP.md) | Everyone | Release train through v1.8 shipped; v1.8.1 polish; v1.9 next |
| `license` | [LICENSE](LICENSE) | Legal / GitHub | Proprietary — all rights reserved |
| `deploy-status` | [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md) | Release | Manual deploy progress tracker |
| `device-qa` | [docs/DEVICE_QA_v1.8.1.md](docs/DEVICE_QA_v1.8.1.md) | Release | v1.8.1 Telegram device sign-off |
| `ff-test` | [docs/FF_TEST.md](docs/FF_TEST.md) | Product | Friends-and-family protocol + v1.9 decision |
| `discoverability` | [docs/discoverability-plan.md](docs/discoverability-plan.md) | Product / release | Telegram-first discoverability; minimal web metadata; defers full SEO |
| `agents` | [AGENTS.md](AGENTS.md) | Agents + leads | Scope, workflow, conventions |
| `deploy` | [DEPLOY.md](DEPLOY.md) | DevOps / release | Cold-deploy + verification checklist |
| `changelog` | [CHANGELOG.md](CHANGELOG.md) | Everyone | Keep a Changelog; `[Unreleased]` |
| `docs-index` | DOCS_INDEX.md (this file) | Everyone | Update when adding docs/agents/skills |
| `mini-app-readme` | [apps/mini-app/README.md](apps/mini-app/README.md) | Frontend | Play instructions, pre-release QA |

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
| `changelog-maintainer` | [.cursor/agents/changelog-maintainer.md](.cursor/agents/changelog-maintainer.md) | Changelog release cuts and cyclic review |

---

## Agent roster

Agents live in [.cursor/agents/](.cursor/agents/). Invoke by name in Cursor.

| Agent | Mode | Skills | Owns |
|-------|------|--------|------|
| [verifier](.cursor/agents/verifier.md) | read-only | — | Pre-done QA: game, Telegram, API, leaderboards, CI commands |
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

**Data flow:** Bot `/start` → Mini App (Vercel) → `POST /auth/me` → play → `POST /runs` → `GET /leaderboard`. See [docs/architecture.md](docs/architecture.md).

---

## Maintaining this index

Update **DOCS_INDEX.md** when you add or rename:

- Root-level docs (`*.md`, concept/prototype files)
- `.cursor/agents/` or `.cursor/skills/` entries
- Deploy scripts or env vars that affect operators
- Scope doc ([docs/mvp-scope.md](docs/mvp-scope.md)) full refresh — review registry and task router

Then add a bullet under [CHANGELOG.md](CHANGELOG.md) → `[Unreleased]`.
