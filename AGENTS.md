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

| [primal.txt](primal.txt) | Product narrative and satirical tone (family alias: mother’s `primal_concept.txt`) |

| [snippet.txt](snippet.txt) | Game mechanics reference — port, don’t reinvent |

| [docs/mvp-scope.md](docs/mvp-scope.md) | v1 / v1.1 / out-of-scope |

| [docs/architecture.md](docs/architecture.md) | Stack, data flow, env matrix, security |

| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Mini-app tokens, utilities, UI guardrails (family alias: mother’s `DESIGN_SYSTEM.md`) |

| [CHANGELOG.md](CHANGELOG.md) | Release history (Keep a Changelog) |
| [ROADMAP.md](ROADMAP.md) | Release train, product pillars, v1.7+ planned work |
| [docs/DEPLOY_STATUS.md](docs/DEPLOY_STATUS.md) | Manual production deploy progress tracker |



## DITreneris family



Shared practices with [DITreneris/site](https://github.com/DITreneris/site): document index, `AGENTS.md`, changelog maintainer, `.cursor/rules` + skills, concept + prototype files, verifier-before-done. **Corporate Ladder** keeps satirical game scope and Telegram/backend stack — do not import Prompt Anatomy domains or professional marketing voice.



## Folder Map



| Path | Purpose |

|------|---------|

| `apps/mini-app/` | Vite + TypeScript frontend → deploy to Vercel |

| `apps/bot/` | aiogram Telegram bot → deploy to Railway |

| `packages/api/` | FastAPI REST API → deploy to Railway |

| `supabase/migrations/` | Postgres schema migrations |

| `docs/` | MVP scope, architecture, deploy status |
| `ROADMAP.md` | Release train and shipped baseline inventory |

| `DOCS_INDEX.md` | Document map and task router |

| `DEPLOY.md` | Production deploy checklist |

| `CHANGELOG.md` | Release history (Changelog Maintainer agent) |

| `.cursor/rules/` | Cursor AI rules |

| `.cursor/skills/` | Project-specific agent skills |

| `.cursor/agents/` | Named agents (verifier, changelog-maintainer) |

| `snippet.txt` | Original HTML prototype — mechanics canon |

| `primal.txt` | Original product concept |



## Local Development



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



## MVP Boundaries



**v1 (shipped):** Gameplay, Telegram auth, Daily + Weekly leaderboards, share, bot. v1.5 design polish and v1.6 fairness/onboarding complete in code.

**Next (v1.7):** Daily replays — see [ROADMAP.md](ROADMAP.md). Do not start without aligning with shipped baseline.



**v1.1 (do NOT implement without approval):** Friends leaderboard, All-time tab, analytics, anti-cheat replay.



**Never:** Virtual currency, skins, clans, quests, NFTs.



## Environment Variables



See [docs/architecture.md](docs/architecture.md) for full matrix.



## Agent Rules



1. Read [docs/mvp-scope.md](docs/mvp-scope.md) before adding features.

2. Match game mechanics to `snippet.txt` unless spec is explicitly updated.

3. Never commit secrets (.env, tokens, keys).

4. Keep humor tone per `.cursor/rules/satirical-copy.mdc`.

5. API writes go through service role; frontend never touches Supabase directly.



## Workflow



1. Pick skill + rules from [DOCS_INDEX.md](DOCS_INDEX.md) task router (or work inline with matching rules). For release-train / pillar work, read [ROADMAP.md](ROADMAP.md) shipped baseline first.

2. Make the change following `.cursor/rules/`.

3. Run tests: `cd packages/api && pytest`; `cd apps/mini-app && npm run lint && npm test && npm run build`.

4. If deploy-related: `scripts/smoke-local.ps1` or `scripts/smoke-local.sh`.

5. Record user-visible changes in `CHANGELOG.md` under `## [Unreleased]` — Changelog Maintainer or inline for small edits.

6. On feature work: run or delegate the `verifier` agent ([.cursor/agents/verifier.md](.cursor/agents/verifier.md)).



## When unsure



1. Open [DOCS_INDEX.md](DOCS_INDEX.md) and follow the task router.

2. Check [docs/mvp-scope.md](docs/mvp-scope.md) for scope.

3. Check [snippet.txt](snippet.txt) for mechanics.

4. Check [.cursor/rules/satirical-copy.mdc](.cursor/rules/satirical-copy.mdc) for copy tone.

5. Prefer the smallest diff that satisfies the request.



## Testing



```bash

cd packages/api && pytest

cd apps/mini-app && npm run lint && npm test && npm run build

```



## Deploy



See [DEPLOY.md](DEPLOY.md), [.cursor/rules/deployment.mdc](.cursor/rules/deployment.mdc), or [.cursor/skills/mini-app-deploy/SKILL.md](.cursor/skills/mini-app-deploy/SKILL.md).



## Agent Roles



| Role | Responsibility | Skill / Rule |

|------|----------------|--------------|

| **verifier** | Read-only pre-done QA (game, Telegram, API, leaderboards, CI) | [.cursor/agents/verifier.md](.cursor/agents/verifier.md) |

| **Changelog Maintainer** | Keep [CHANGELOG.md](CHANGELOG.md) accurate; weekly cyclic review; cut release sections on version tags | [.cursor/agents/changelog-maintainer.md](.cursor/agents/changelog-maintainer.md), [.cursor/skills/changelog-maintainer/SKILL.md](.cursor/skills/changelog-maintainer/SKILL.md), [.cursor/rules/changelog.mdc](.cursor/rules/changelog.mdc) |



Family equivalent on [DITreneris/site](https://github.com/DITreneris/site): `changelog-keeper`.



### Changelog Maintainer — Cyclic Schedule



The Changelog Maintainer agent should run a review **every 7 days** (or after each merge to `main`):



```

/loop 7d Read .cursor/skills/changelog-maintainer/SKILL.md and run the Cyclic Review workflow. Update CHANGELOG.md if anything is missing.

```



Any agent that ships user-facing changes must add an `[Unreleased]` entry before finishing — the Maintainer audits completeness on the weekly cycle.


