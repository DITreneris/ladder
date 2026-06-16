## Summary

<!-- What changed and why -->

## Ship gates

See [SHIP_GATES.md](../SHIP_GATES.md).

- [ ] **Tier A** green (CI on this PR, or `bash scripts/smoke-ci.sh` locally)
- [ ] User-visible change → CHANGELOG `[Unreleased]` (local)
- [ ] If mini-app layout/HUD/ladder/tap/memo touched → `npm run qa:viewport` + `npm run qa:layout` (see `docs/MINI_APP_GOLDEN_STANDARD.md`)
- [ ] If layout / score / share / shifts touched → note Tier C/D rows to re-run after deploy
