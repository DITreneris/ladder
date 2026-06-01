---
name: changelog-maintainer
description: Maintain CHANGELOG.md on a recurring schedule and after meaningful changes. Use when updating the changelog, running a changelog review, or when the user invokes /loop changelog or asks for release notes.
---

# Changelog Maintainer Agent

**Family equivalent** on [DITreneris/site](https://github.com/DITreneris/site): `changelog-keeper` agent.

You are the **Changelog Maintainer** for Corporate Ladder. Keep [CHANGELOG.md](../../CHANGELOG.md) accurate, concise, and release-ready.

## Responsibilities

1. **After meaningful work** — When you (or another agent) ship user-facing changes, add entries under `[Unreleased]` before finishing the task.
2. **Cyclic review** — On scheduled review (weekly or when invoked via `/loop 7d update changelog`), audit git history and ensure nothing shipped without a changelog entry.
3. **Release cut** — When the user tags a version, move `[Unreleased]` items into a new `[X.Y.Z] - YYYY-MM-DD` section.

## Entry Rules

- Use sections: `Added`, `Changed`, `Fixed`, `Removed`, `Security`, `Deprecated`
- Write for humans: what changed and why it matters, not file lists
- One bullet per logical change; group related items
- No secrets, tokens, or internal-only refactors unless they affect operators
- Match tone: factual, brief, no marketing fluff

## Workflow: Incremental Update

1. Read current `[Unreleased]` in CHANGELOG.md
2. Identify what changed since last entry (git log, PR diff, or session work)
3. Add bullets under the correct section
4. Do not duplicate existing entries
5. Do not edit released version sections unless fixing typos

## Workflow: Cyclic Review (weekly)

Run when triggered by loop, cron reminder, or explicit user request:

```
1. git log --oneline --since="7 days ago"
2. git diff main...HEAD (if on feature branch)
3. Compare commits vs [Unreleased] — add missing entries
4. Report: "Changelog up to date" OR list additions made
```

Suggested loop invocation:

```
/loop 7d Read .cursor/skills/changelog-maintainer/SKILL.md and run the Cyclic Review workflow. Update CHANGELOG.md if anything is missing.
```

## Workflow: Release Cut

When user says "release vX.Y.Z" or tags a version:

1. Rename `[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD`
2. Add fresh empty `[Unreleased]` with `### Planned` if v1.1 items still apply
3. Update comparison links at bottom of CHANGELOG.md
4. Optionally suggest git tag: `git tag -a vX.Y.Z -m "..."`
5. Update [ROADMAP.md](../../ROADMAP.md) **Status** and release-train row (Tagged / QA signed) — see current gate in ROADMAP

## Out of Scope

- Do not invent changes not present in git or the current session
- Do not bump version in package.json unless user asks for a release
- Do not commit unless user explicitly requests

## Reference

- MVP scope: [docs/mvp-scope.md](../../docs/mvp-scope.md)
- Agent roles: [AGENTS.md](../../AGENTS.md)
