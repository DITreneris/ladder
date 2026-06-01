# AGENTS.md — Corporate Ladder

Guide for AI agents working in this repository.

## What This Is

Telegram Mini App game: tap left/right to climb a corporate ladder, avoid obstacles, compete on leaderboards. Monorepo with TypeScript frontend, Python API/bot, Supabase database.

**Tagline:** "Lumberjack meets modern office life."

## Deployment

| | |
|---|---|
| **Mini App** | Vercel — root `apps/mini-app` |
| **API** | Railway — `packages/api` |
| **Bot** | Railway — `apps/bot` |
| **Database** | Supabase Postgres |
| **GitHub** | [github.com/DITreneris/ladder](https://github.com/DITreneris/ladder) |
| **Sibling (family)** | [github.com/DITreneris/site](https://github.com/DITreneris/site) — Prompt Anatomy marketing |

## Document map

**Full index:** [DOCS_INDEX.md](DOCS_INDEX.md) — task router, document registry, agent roster, skills catalog.

## Source of truth

| File | Purpose |
|------|---------|
| [DOCS_INDEX.md](DOCS_INDEX.md) | Navigation map for humans and agents |
| [ROADMAP.md](ROADMAP.md) | **Status** block, release train, shipped baseline (v1.5 → v1.8.5), v1.9 plan |
| [docs/FF_EXECUTION.md](docs/FF_EXECUTION.md) | F&F operational gate (device QA → tag → testers) |
| [CHANGELOG.md](CHANGELOG.md) | Per-release shipped detail (Keep a Changelog) |
| [docs/mvp-scope.md](docs/mvp-scope.md) | Scope boundaries, v1.1 deferrals, out-of-scope (not feature inventory) |
| [ROADMAP.md](ROADMAP.md) § Shipped baseline | What is built (mechanics, UI, satire) |
| [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) | Satirical tone (active copy rules) |
| [docs/mvp-scope.md](docs/mvp-scope.md) | v1 / v1.1 / out-of-scope |
| [docs/architecture.md](docs/architecture.md) | Stack, data flow, env matrix, security |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Mini-app tokens, utilities, UI guardrails (through v1.8.5) |
| [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md) | Manual production deploy progress |

## DITreneris family

Shared practices with [DITreneris/site](https://github.com/DITreneris/site): document index, `AGENTS.md`, changelog maintainer, `.cursor/rules` + skills, concept + prototype files, verifier-before-done. **Corporate Ladder** keeps satirical game scope and Telegram/backend stack — do not import Prompt Anatomy domains or professional marketing voice.

## Folder map

| Path | Purpose |
|------|---------|
| `apps/mini-app/` | Vite + TypeScript frontend → Vercel |
| `apps/bot/` | aiogram Telegram bot → Railway |
| `packages/api/` | FastAPI REST API → Railway |
| `supabase/migrations/` | Postgres schema migrations |
| `docs/` | MVP scope, architecture, F&F runbooks (`FF_EXECUTION`, `FF_TEST`, `DEVICE_QA_*`) |
| `ROADMAP.md` | Release train + shipped baseline |
| `DOCS_INDEX.md` | Document map and task router |
| `DEPLOY.md` | Production deploy checklist |
| `CHANGELOG.md` | Release history (Changelog Maintainer) |
| `.cursor/rules/` | Cursor AI rules |
| `.cursor/skills/` | Project-specific agent skills |
| `.cursor/agents/` | Named agents (verifier, changelog-maintainer) |
| `docs/archive/` | Historical `snippet.txt` + `primal.txt` — not routine audits ([README](docs/archive/README.md)) |

## Local development

```bash
# API (port 8000)
cd packages/api
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Bot
cd apps/bot
pip install -r requirements.txt
python main.py

# Mini App (port 5173)
cd apps/mini-app
npm install
npm run dev
```

Copy `.env.example` to `.env` and fill in credentials.

## MVP boundaries

**v1 (shipped):** Gameplay, Telegram auth, Daily + Weekly leaderboards, share, bot. v1.5–v1.8.5 code in repo.

**Next:** v1.8.5 deploy + device QA + tag → friends-and-family → v1.9 — see [ROADMAP.md](ROADMAP.md) **Status**.

**v1.1 (do NOT implement without approval):** Friends leaderboard, All-time tab, analytics, anti-cheat replay.

**Never:** Virtual currency, skins, clans, quests, NFTs.

## Environment variables

See [docs/architecture.md](docs/architecture.md) for full matrix.

## Agent rules

1. Read [docs/mvp-scope.md](docs/mvp-scope.md) before adding features (in/out, v1.1).
2. Match [ROADMAP.md](ROADMAP.md) § Shipped baseline unless spec is explicitly updated.
3. Never commit secrets (.env, tokens, keys).
4. Keep humor tone per [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc).
5. API writes go through service role; frontend never touches Supabase directly.

## Workflow

1. Pick skill + rules from [DOCS_INDEX.md](DOCS_INDEX.md) task router. For release / F&F: [ROADMAP.md](ROADMAP.md) **Status** → [docs/FF_EXECUTION.md](docs/FF_EXECUTION.md).
2. Make the change following `.cursor/rules/`.
3. Run tests: `cd packages/api && pytest`; `cd apps/mini-app && npm run lint && npm test && npm run build`.
4. If deploy-related: `scripts/smoke-local.ps1` or `scripts/smoke-local.sh`.
5. Record user-visible changes in `CHANGELOG.md` under `## [Unreleased]`.
6. On feature work: run or delegate `verifier` ([.cursor/agents/verifier.md](.cursor/agents/verifier.md)).

## When unsure

1. [DOCS_INDEX.md](DOCS_INDEX.md) task router
2. [docs/mvp-scope.md](docs/mvp-scope.md) — in/out and v1.1; [ROADMAP.md](ROADMAP.md) § Shipped baseline — what exists
3. [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) copy tone
4. Smallest diff that satisfies the request

## Testing

```bash
cd packages/api && pytest
cd apps/mini-app && npm run lint && npm test && npm run build
```

After layout changes: `cd apps/mini-app && npm run preview` then `npm run qa:viewport` and `npm run qa:layout`.

## Deploy

[DEPLOY.md](DEPLOY.md) · [.cursor/rules/deployment.mdc](.cursor/rules/deployment.mdc) · [.cursor/skills/mini-app-deploy/SKILL.md](.cursor/skills/mini-app-deploy/SKILL.md)

Current gate: tag `v1.8.5` after [docs/DEVICE_QA_v1.8.5.md](docs/DEVICE_QA_v1.8.5.md) — [ROADMAP.md](ROADMAP.md).

## Agent roles

| Role | Responsibility | Skill / rule |
|------|----------------|--------------|
| **verifier** | Read-only pre-done QA (game, Telegram, API, leaderboards, CI) | [.cursor/agents/verifier.md](.cursor/agents/verifier.md) |
| **debug-steward** | Debug triage order, incident postmortems, DEBUG_* doc accuracy | [.cursor/agents/debug-steward.md](.cursor/agents/debug-steward.md), [.cursor/skills/debug-triage/SKILL.md](.cursor/skills/debug-triage/SKILL.md), [docs/DEBUG_FIX_2026-06-01.md](docs/DEBUG_FIX_2026-06-01.md) |
| **Changelog Maintainer** | CHANGELOG accuracy; weekly review; release cuts on tags | [.cursor/agents/changelog-maintainer.md](.cursor/agents/changelog-maintainer.md), [.cursor/skills/changelog-maintainer/SKILL.md](.cursor/skills/changelog-maintainer/SKILL.md), [.cursor/rules/changelog.mdc](.cursor/rules/changelog.mdc) |

Family equivalent on [DITreneris/site](https://github.com/DITreneris/site): `changelog-keeper`.

### Changelog Maintainer — cyclic schedule

Every **7 days** (or after merge to `main`):

```
/loop 7d Read .cursor/skills/changelog-maintainer/SKILL.md and run the Cyclic Review workflow. Update CHANGELOG.md if anything is missing.
```

Any agent that ships user-visible changes must add an `[Unreleased]` entry before finishing.
