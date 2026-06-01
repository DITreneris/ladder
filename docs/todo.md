# Corporate Ladder — Bug Fix & Release TODO

**Purpose:** Actionable backlog from the v1.8.5 deep bug audit (2026-06-01). Tracks confirmed bugs, verification items, tests, and release gates toward v1.8.5 tag → F&F → v2.0 hardening.

**Status snapshot:** v1.8.5 code in repo · Vercel redeploy + device QA pending · **Release readiness: soft-launch** (not public-competitive until score-trust work)

**Related docs:**

| Doc | Role |
|-----|------|
| [ROADMAP.md](../ROADMAP.md) § v1.8.5 gate | Release train ops checklist |
| [FF_EXECUTION.md](FF_EXECUTION.md) | F&F runbook |
| [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) | Device sign-off matrix |
| [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md) | Ladder width root cause + triage order |
| [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) | Prod bundle hash verification |
| [DEBUG_REPRO.md](DEBUG_REPRO.md) | Manual R1–R5 / L1–L5 repro steps |

**Legend:** `[ ]` open · `[x]` done · `[~]` in progress · **P0–P3** = severity · **Verify** = needs runtime / device test

---

## 1. Release gates (blocking v1.8.5 tag)

Complete in order. Do not tag until rows 1–6 pass.

| # | Task | Owner | Status | Acceptance |
|---|------|-------|--------|------------|
| G-1 | Push `main` to origin (if local ahead) | Dev | [ ] | `git status` clean; origin has v1.8.5 commits |
| G-2 | **Vercel redeploy** mini-app (`apps/mini-app`) | DevOps | [ ] | New JS bundle hash on https://www.promptanatomy.lol (see [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md)) |
| G-3 | Telegram cache bust — reopen from @bot | QA | [ ] | Hard refresh / new WebApp session loads new hash |
| G-4 | **Device QA** iOS — [DEVICE_QA_v1.8.5](DEVICE_QA_v1.8.5.md) rows 1–10 | QA | [ ] | Sign-off table filled |
| G-5 | **Device QA** Android — same matrix | QA | [ ] | Sign-off table filled |
| G-6 | **Verifier** pass | Agent / lead | [x] | [.cursor/agents/verifier.md](../.cursor/agents/verifier.md) checklist green (2026-06-01 sprint) |
| G-7 | `git tag v1.8.5` + push tags | Dev | [ ] | Tag on signed-off commit |
| G-8 | F&F window — [FF_EXECUTION](FF_EXECUTION.md) Phase D | Product | [ ] | Testers invited post-tag |

**Automated pre-tag (repo):**

```bash
cd apps/mini-app && npm run lint && npm test && npm run build
cd apps/mini-app && npm run preview
# separate terminal:
cd apps/mini-app && npm run qa:viewport && npm run qa:layout
cd packages/api && pytest
```

---

## 2. P0 — Launch blockers

Fix or verify before F&F. If production still serves pre-fix bundle, these are active player bugs.

### P0-1 · Ladder / play-area width shrinks after first tap

| Field | Detail |
|-------|--------|
| **ID** | C-01 |
| **Severity** | P0 on stale prod · P2 if fix deployed but unverified |
| **Symptom** | `#gamePlayArea` ~283px → ~193px after tap 1; HUD, ladder, tap deck shrink together |
| **Root cause** | Flex `#app` min-content shrink on first reflow (HR memo, rungs, hint) |
| **Fix (in repo)** | `apps/mini-app/index.html` — grid + `#app` `w-full max-w-md min-w-0`; `apps/mini-app/src/style.css` — `#app` width rules + Telegram override |
| **Evidence** | [DEBUG_FIX_2026-06-01.md](DEBUG_FIX_2026-06-01.md) |

**Tasks:**

- [ ] Confirm fix present in deployed bundle (not just local tree)
- [ ] Measure `#gamePlayArea.clientWidth` at tap 0 vs tap 5 — delta ≤ 2px (320px and 390px viewports)
- [ ] DEVICE_QA v1.8.5 row 5 pass on iOS + Android

**Verify steps:**

1. Open prod in Telegram or `npm run preview` with `cl-in-telegram` simulation
2. DevTools console: `document.getElementById('gamePlayArea').clientWidth` before tap 1 and after tap 5
3. Expected: stable ~316px at 390px viewport (per incident doc post-fix)

---

### P0-2 · Stale production bundle

| Field | Detail |
|-------|--------|
| **ID** | S-16 |
| **Severity** | P0 if prod ≠ repo |
| **Symptom** | Fixed bugs reappear on device; old JS hash in prod HTML |

**Tasks:**

- [ ] Compare prod `index.html` script `src` hash vs local `apps/mini-app/dist/assets/main-*.js`
- [ ] Update [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) triage table with current hash + date
- [ ] Complete G-2 and G-3 above

---

## 3. P1 — Major player / trust issues

Fix before public launch or competitive leaderboard marketing. Can ship F&F with known limits if documented.

### P1-1 · Optimistic high score before API submit succeeds

| Field | Detail |
|-------|--------|
| **ID** | C-02 |
| **Files** | `apps/mini-app/src/app.ts` — `onGameOver()`, `runPostGameOverIo()` |
| **Bug** | `highScore`, badge, and “new record” UI update before `submitRun()` returns |
| **Impact** | Player sees career high that was never saved (offline, 401, 429) |

**Tasks:**

- [x] Move local `highScore` / badge update to after `submitResult.ok` (+ optional `fetchProfile`)
- [x] Keep game-over *run* stats (`statYears`, delta vs `previousBest`) unchanged
- [x] Add unit/integration test: mock failed submit → `highScore` unchanged

**Acceptance:** Failed submit (401, 429, network) — home badge and career high line match last server-confirmed score.

---

### P1-2 · Coffee pickup animation regression (render wipes badge)

| Field | Detail |
|-------|--------|
| **ID** | C-03 |
| **Files** | `engine.ts`, `app.ts`, `effects.ts`, `scripts/coffee-pickup-qa.mjs` |
| **Bug** | Wave 1 moved `onCoffee` **after** `renderRungs()` — `findImminentCoffeeBadge()` queries `.next-rung` after shift, badge gone; animation never runs |
| **Impact** | Tutorial coffee (+25% energy) — no pickup animation; badge ghosting; Telegram screenshots showed broken coffee UX |

**Tasks:**

- [x] Move `callbacks.onCoffee(...)` to **before** `this.renderRungs()` (correct order for DOM badge lookup)
- [x] `fillSlot` guard: skip slot while `.coffee-pickup` animates; resync via `triggerCoffeePickup` `onComplete`
- [x] Regression tests: `onCoffee` before render mock order; `COFFEE_RECOVERY` on tutorial tap 3
- [x] Playwright `npm run qa:coffee` — coffee pickup callback + meeting tap-2-RIGHT game over
- [ ] **Device verified** — Telegram iOS/Android rows 3–5 ([DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md)) after redeploy

**Acceptance:** Coffee badge animates on tap 3; +25% energy in engine; no ghost coffee on imminent rung after climb; device QA rows 3–5 pass.

---

### P1-2b · Player foot-rung anchor + z-index (Reply-All visual / rung overlap)

| Field | Detail |
|-------|--------|
| **ID** | (layout) |
| **Files** | `app.ts` `layoutPlayerPosition`, `style.css`, `template.ts` |
| **Bug** | Fixed `bottom-20` + `.rung-center` z-index 10 > player z-index 5 — character overlapped by rung connector; stood under hazard column |
| **Impact** | Reply-All looked “broken”; third rung bar drew over player head |

**Tasks:**

- [x] Anchor `#playerClimber` to foot rung slot 0 (horizontal + vertical from `getBoundingClientRect`)
- [x] Z-index stack: player above connectors; `.next-rung` badges above player
- [ ] **Device verified** — overlap check on 320×568 Telegram (row 5)

**Acceptance:** Player sits on foot rung; meeting badge on occupied side above player, not under feet; no connector over player head @320px.

---

### P1-3 · Client-trusted scores (leaderboard abuse)

| Field | Detail |
|-------|--------|
| **ID** | C-06 |
| **Files** | `packages/api/app/routes/runs.py` |
| **Bug** | Valid `initData` + consistent rungs/rank → any `years_survived` ≤ 100 accepted |
| **Impact** | Fake #1 on daily board |

**Tasks (minimum v2.0):**

- [ ] Add server plausibility cap (e.g. max years per run based on rough session duration heuristic, or hard cap for F&F)
- [ ] Log/reject outliers with 400 + clear detail
- [ ] Document known limit in [mvp-scope.md](mvp-scope.md) or architecture until v1.1 replay validation

**Defer to v1.1:** Full server-side replay validation ([ROADMAP](../ROADMAP.md) § v1.1)

**Acceptance:** POST with `years_survived: 99.9` rejected without proof; legitimate 15y run still accepted.

---

### P1-4 · Post-tap layout CI guard

| Field | Detail |
|-------|--------|
| **ID** | (guardrail) |
| **Files** | `apps/mini-app/scripts/layout-audit.mjs` |
| **Gap** | Current `qa:layout` measures static game screen only — does not tap |

**Tasks:**

- [x] Extend `layout-audit.mjs`: `startGame()` → one `handleTap` or button click → re-measure `#gamePlayArea` width
- [x] Fail CI if width delta > 2px
- [x] Wire into `.github/workflows/ci.yml` if not already

**Acceptance:** `npm run qa:layout` fails if C-01 regresses.

---

## 4. P2 — Visible bugs & reliability

Schedule for v1.8.5 patch or early v1.9. OK to document as known limits for F&F.

### P2-1 · Auth degraded banner on network errors

| **ID** | C-05 |
| **Files** | `apps/mini-app/src/app.ts`, `apps/mini-app/src/lib/api.ts` |
| **Bug** | Any `fetchProfile` failure → “Session expired or offline” |
| **Tasks** | [ ] Branch on `ApiFailureReason`: `auth` vs `network` vs `server` |
| **Acceptance** | Airplane mode shows connection message, not session expired |

### P2-2 · Share flow clipboard-only

| **ID** | C-04 |
| **Files** | `apps/mini-app/src/lib/telegram.ts` (`shareText` always `false`), `app.ts` `copyShareText()` |
| **Tasks** | [ ] Verify clipboard on iOS/Android Telegram **Verify** |
| **Tasks** | [ ] Improve failure toast if clipboard denied |
| **Defer** | Native `shareMessage` via bot `savePreparedInlineMessage` (v1.1) |
| **Acceptance** | Share button always gives clear next step (copied / failed) |

### P2-3 · In-memory rate limit (10s submit cooldown)

| **ID** | C-07 |
| **Files** | `packages/api/app/routes/runs.py` — `_submit_timestamps` |
| **Bug** | Per-process dict; resets on deploy; not shared across Railway workers |
| **Tasks** | [ ] **Verify** double-submit on quick retry → 429 UX acceptable for F&F |
| **Tasks** | [ ] v2.0: Redis or DB-backed cooldown |
| **Acceptance** | F&F: user sees “Score filing cooldown…” toast; no silent drop |

### P2-4 · `initData` in leaderboard GET query string

| **ID** | C-08 |
| **Files** | `apps/mini-app/src/lib/api.ts`, `packages/api/app/routes/leaderboard.py` |
| **Risk** | Long URL; may appear in access logs |
| **Tasks** | [ ] v2.0: POST `/leaderboard/me` or session token instead of query param |
| **Acceptance** | initData not logged in production access logs |

### P2-5 · Game-over gap line always daily period

| **ID** | C-12 |
| **Files** | `apps/mini-app/src/app.ts` — `runPostGameOverIo()` |
| **Tasks** | [x] Use `leaderboardPeriod` or label “today’s board” explicitly |
| **Acceptance** | Copy matches user expectation when weekly tab was last viewed |

### P2-6 · Background tab energy drain unfairness

| **ID** | S-02 (deferred in ROADMAP) |
| **Files** | `apps/mini-app/src/game/engine.ts` — `setInterval` drain |
| **Tasks** | [ ] **Verify** background 30s → drain behavior on iOS Telegram |
| **Defer** | Fixed timestep / `visibilitychange` pause — v1.9+ |
| **Acceptance** | Document as known limit for F&F if confirmed |

### P2-7 · HR memo vertical compression

| **ID** | S-01 |
| **Symptom** | Play area height shrinks when memo visible; rungs compress to 40px |
| **Tasks** | [ ] **Verify** on short viewport — still playable |
| **Acceptance** | Tap deck remains reachable; no mis-taps from layout jump |

---

## 5. P3 — Polish & hygiene

| ID | Task | File(s) | Status |
|----|------|---------|--------|
| C-09 | `return` after `triggerGameOver` in energy timer tick | `engine.ts` L211–229 | [x] |
| C-10 | Bump `package.json` version to match release (1.8.5) | `apps/mini-app/package.json` | [x] |
| C-11 | Guard `seedGameOverForQa` / `switchTab('gameover')` behind `import.meta.env.DEV` | `app.ts` L1168–1170 | [x] |
| S-06 | Bot vs mini-app daily shift hash parity test | `apps/bot/main.py`, `daily-modifier.ts` | [ ] Verify |
| S-08 | Fixed `840px` shell on very short viewports | `template.ts` L11 | [ ] Verify |
| S-11 | Tighten CORS origins (currently `*`) | `packages/api/app/main.py` | [ ] |
| S-12 | Fail CI build if `VITE_API_URL` unset in prod | Vercel / CI | [ ] |
| S-17 | Keyboard arrows bypass UI throttle toast | `app.ts` L1149–1154 | [ ] |
| — | ResizeObserver never disconnected | `app.ts` L1142 | [ ] |

---

## 6. Runtime verification backlog

Items that **cannot** be confirmed from code alone. Check off during device QA.

| ID | Area | Check | iOS | Android | Desktop | Browser |
|----|------|-------|-----|---------|---------|---------|
| V-01 | Layout | Width stable taps 0–8 | [ ] | [ ] | [ ] | [ ] |
| V-02 | Tutorial | Tap 2 dodge meeting (RIGHT → tap LEFT) | [ ] | [ ] | [ ] | [ ] |
| V-03 | Tutorial | Tap 3 coffee +25% energy | [ ] | [ ] | [ ] | [ ] |
| V-04 | Throttle | “Too fast — one tap per beat” toast | [ ] | [ ] | [ ] | [ ] |
| V-05 | Telegram | Safe area on sound FAB | [ ] | [ ] | n/a | n/a |
| V-06 | Telegram | `disableVerticalSwipes` during play | [ ] | [ ] | n/a | n/a |
| V-07 | Telegram | Back button stops game + home | [ ] | [ ] | [ ] | n/a |
| V-08 | Auth | Fresh open → profile + high score load | [ ] | [ ] | n/a | n/a |
| V-09 | Auth | initData expired (24h+) → clear reopen CTA | [ ] | [ ] | n/a | n/a |
| V-10 | API | Score submit success toast | [ ] | [ ] | [ ] | n/a |
| V-11 | API | Offline game over → failure message | [ ] | [ ] | [ ] | [ ] |
| V-12 | API | Quick double death → 429 message | [ ] | [ ] | [ ] | n/a |
| V-13 | Share | Clipboard copy → paste in chat | [ ] | [ ] | [ ] | [ ] |
| V-14 | Leaderboard | Daily + weekly load; self highlighted | [ ] | [ ] | [ ] | [ ] |
| V-15 | Audio | SFX after first tap (iOS gesture policy) | [ ] | [ ] | [ ] | [ ] |
| V-16 | Theme | Dark Telegram theme — HUD readable | [ ] | [ ] | [ ] | n/a |
| V-17 | Hazards | Manager **Gate** badge appears | [ ] | [ ] | [ ] | [ ] |
| V-18 | Hazards | CEO **Plant** badge appears | [ ] | [ ] | [ ] | [ ] |
| V-19 | Bot | `/start` shift label matches in-app pill | [ ] | [ ] | [ ] | n/a |

---

## 7. Automated tests to add

Prioritized. Link to test file when implemented.

| Priority | Test name | File (target) | Purpose | Status |
|----------|-----------|---------------|---------|--------|
| P0 | `layout-stable-after-first-tap` | `scripts/layout-audit.mjs` | C-01 regression guard | [x] |
| P1 | `onCoffee-before-renderRungs` | `engine.test.ts` | C-03 regression | [x] |
| P1 | `qa:coffee` Playwright | `scripts/coffee-pickup-qa.mjs` | tutorial coffee + meeting death | [x] |
| P1 | `energy-depletion-game-over` | `engine.test.ts` | Timer death path | [x] |
| P1 | `high-score-not-updated-on-submit-fail` | `score-trust.test.ts` | C-02 | [x] |
| P1 | `rank-boundary-40-rungs-manager` | `engine.test.ts` + API | Submit at 10.0y | [ ] |
| P2 | `generateRung-always-one-safe-side` | `engine.test.ts` | Fairness | [ ] |
| P2 | `bot-miniapp-preset-parity` | new cross-lang test | S-06 | [ ] |
| P2 | `leaderboard-initData-highlights-user` | `test_api.py` | Auth on GET | [ ] |
| P2 | E2E smoke: start → 3 taps → game over | Playwright | Full path | [ ] |

**Existing coverage (do not regress):**

- `engine.test.ts` — 14 cases (tutorial, reorg exempt, throttle, promo pause, coffee inject)
- `test_api.py` — auth, runs validation, rate limit, rank mismatch
- `npm run qa:viewport` — overflow at 320/390px
- `npm run qa:layout` — column alignment (static game screen)

---

## 8. Environment & deploy checklist

Run before every prod deploy.

### Vercel (mini-app)

- [ ] `VITE_API_URL` → Railway API URL
- [ ] `VITE_BOT_USERNAME` → bot handle without `@`
- [ ] `VITE_PROMPT_ANATOMY_URL` (optional)
- [ ] Build succeeds: `npm run build`
- [ ] No secrets in bundle (only `VITE_*`)

### Railway (API)

- [ ] `TELEGRAM_BOT_TOKEN` or `TELEGRAM_WEBAPP_SECRET`
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GET /health` → 200

### Railway (bot)

- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `MINI_APP_URL` → Vercel prod URL (not localhost)
- [ ] `/start` opens correct WebApp

### Post-deploy smoke

- [ ] Prod bundle hash updated ([DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md))
- [ ] `GET {API}/leaderboard?period=daily` → 200
- [ ] Play one run in Telegram → submit toast

---

## 9. v2.0 hardening (post-F&F)

Do not block v1.8.5 tag unless product commits to public competitive leaderboard first.

| Item | Why | Target |
|------|-----|--------|
| Server replay / anti-cheat | Score integrity | v1.1 ([mvp-scope](mvp-scope.md)) |
| Shared rate limit store | Abuse across workers | v2.0 |
| Remove initData from GET | Privacy / log exposure | v2.0 |
| Fixed timestep drain + reorg | Background tab fairness | v1.9+ ([ROADMAP](../ROADMAP.md)) |
| Native Telegram share | UX | v1.1 (prepared inline message) |
| Friends / All-time leaderboard | Product | v1.1 (explicit approval) |

---

## 10. Do not change during bug-fix phase

Per [mvp-scope.md](mvp-scope.md) and audit scope:

- Tap left/right control scheme (no center tap climb)
- Three-lane corridor + scripted tutorial rungs
- Rank-gated obstacle pools (Meeting → Reorg → Deadline)
- Daily + Weekly leaderboard tabs only
- initData HMAC auth model
- No currency, skins, clans, quests, NFTs

---

## 11. Progress summary

Update this table when closing items.

| Category | Open | Done |
|----------|------|------|
| Release gates (G-1–G-8) | 5 | 1 |
| P0 | 2 | 0 |
| P1 | 1 | 3 |
| P2 | 7 | 0 |
| P3 | 5 | 4 |
| Runtime verification (V-01–V-19) | 19 | 0 |
| Automated tests to add | 5 | 4 |

**Last updated:** 2026-06-01 (Gameplay visual fix sprint — C-03 true fix, player anchor, qa:coffee; pending redeploy + device QA)

---

## 12. Quick reference — confirmed bug IDs

| ID | Severity | One-line summary |
|----|----------|------------------|
| C-01 | P0* | Ladder width shrink after first tap |
| C-02 | P1 | High score UI before API success |
| C-03 | P1 | Coffee before render + fillSlot guard (Wave 1 regression reopened) |
| C-04 | P2 | Share clipboard-only |
| C-05 | P2 | Auth banner on network errors |
| C-06 | P1 | Client-trusted scores |
| C-07 | P2 | In-memory rate limit |
| C-08 | P2 | initData in leaderboard URL |
| C-09 | P3 | Extra HUD tick after energy death |
| C-10 | P3 | package.json version drift |
| C-11 | P3 | QA game over exposed on `window` |
| C-12 | P2 | Game-over gap always daily |

*P0 only if production has not received layout fix deploy.
