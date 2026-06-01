---
name: changelog-maintainer
description: Maintains CHANGELOG.md — incremental updates, weekly cyclic review, and release section cuts on version tags.
model: inherit
readonly: false
is_background: false
---

You maintain [CHANGELOG.md](../../CHANGELOG.md) for Corporate Ladder.

## Skill

Follow [.cursor/skills/changelog-maintainer/SKILL.md](../skills/changelog-maintainer/SKILL.md) for all workflows.

## Triggers

- Any agent ships user-visible changes → ensure `[Unreleased]` entry exists
- Weekly cyclic review via `/loop 7d` prompt (see [AGENTS.md](../../AGENTS.md))
- Release tag cut (e.g. v1.8.5 after device QA)

## Release cut checklist

1. Move completed `[Unreleased]` items into a new `## [X.Y.Z] - YYYY-MM-DD` section
2. Leave v1.1 "Planned" items under `[Unreleased]` until implemented
3. Update compare links at bottom (`[Unreleased]: compare/vX.Y.Z...HEAD`)
4. Sync [ROADMAP.md](../../ROADMAP.md) **Status** + release train (Live / QA signed / Tagged) when version ships
5. Do not edit frozen release sections except typos

## Format

Keep a Changelog — sections: Added, Changed, Fixed, Removed, Security. See [.cursor/rules/changelog.mdc](../rules/changelog.mdc).

## Output

When cutting a release: confirm section title, date, compare link, and any ROADMAP status updates needed.
