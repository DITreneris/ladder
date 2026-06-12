# Corporate Ladder — Bug Fix & Release TODO

**Purpose:** Actionable backlog from the v1.8.5 deep bug audit (2026-06-01). Tracks confirmed bugs, verification items, tests, and release gates toward v1.8.5 tag → F&F → v2.0 hardening.

**Status snapshot:** Soft launch **2026-06-14** · `v1.9.0` + `v2.0.0` tagged · prod bundle per [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) · Vercel OG redeploy pending · [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)

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
| G-1 | Push `main` to origin (if local ahead) | Dev | [x] | `46abf19` on origin |
| G-2 | **Vercel redeploy** mini-app (`apps/mini-app`) | DevOps | [x] | Prod `main-7DTXR6XJ.js` (2026-06-01) |
| G-3 | Telegram cache bust — reopen from @bot | QA | [x] | User confirmed new build loads |
| G-4 | **Device QA** iOS — [DEVICE_QA_v1.8.5](DEVICE_QA_v1.8.5.md) rows 1–10 | QA | [x] | Rows 1–5 signed; sprint-critical pass (2026-06-01) |
| G-5 | **Device QA** Android — same matrix | QA | [x] | Rows 1–5 signed; sprint-critical pass (2026-06-01) |
| G-6 | **Verifier** pass | Agent / lead | [x] | [.cursor/agents/verifier.md](../.cursor/agents/verifier.md) checklist green (2026-06-01 sprint) |
| G-7 | `git tag v1.8.5` + push tags | Dev | [x] | Tag on `46abf19` (2026-06-01) |
| G-8 | F&F window — [FF_EXECUTION](FF_EXECUTION.md) Phase D → E | Product | [~] | External testers active; 59+ runs in Supabase |

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

- [x] Confirm fix present in deployed bundle (not just local tree) — `main-7DTXR6XJ.js` prod 2026-06-01
- [x] Measure `#gamePlayArea.clientWidth` at tap 0 vs tap 5 — delta ≤ 2px (320px and 390px viewports) — `qa:layout` + DEVICE_QA row 5
- [x] DEVICE_QA v1.8.5 row 5 pass on iOS + Android

---

### P0-2 · Stale production bundle

| Field | Detail |
|-------|--------|
| **ID** | S-16 |
| **Severity** | P0 if prod ≠ repo |
| **Symptom** | Fixed bugs reappear on device; old JS hash in prod HTML |

**Tasks:**

- [x] Compare prod `index.html` script `src` hash vs local `apps/mini-app/dist/assets/main-*.js`
- [x] Update [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) triage table with current hash + date
- [x] Complete G-2 and G-3 above

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
- [x] **Device verified** — Telegram rows 3–4 (2026-06-01 human sign-off)

**Acceptance:** Coffee badge animates on tap 3; +25% energy in engine; no ghost coffee on imminent rung after climb; device QA rows 3–5 pass.

---

### P1-2b · Player foot-rung anchor + z-index (Reply-All visual / rung overlap)

| Field | Detail |
|-------|--------|
| **ID** | (layout) |
| **Files** | `app.ts` `layoutPlayerPosition`, `style.css`, `template.ts`, `scripts/layout-player-debug.mjs` |
| **Bug** | Fixed `bottom-20` + `.rung-center` z-index 10 > player z-index 5 — character overlapped by rung connector; stood under hazard column; **tap 0** corridor used `.next-rung` center (circle on face) |
| **Impact** | Reply-All looked “broken”; third rung bar drew over player head; corridor start matched broken Telegram screenshots |

**Tasks:**

- [x] Anchor `#playerClimber` to foot rung slot 0 after first tap (horizontal + vertical from `getBoundingClientRect`) — `ce34be1`
- [x] Z-index stack: player above connectors; `.next-rung` badges above player — `ce34be1`
- [x] Corridor start: anchor **foot** `.rung-center`, not `.next-rung` — `46abf19` ([DEBUG_FIX phase 7](DEBUG_FIX_2026-06-01.md))
- [x] Runtime check: `layout-player-debug.mjs` — tap 0 `climberCenterY` ≈ `footCenterY` (not `nextRungCenterY`)
- [x] **Device verified** — corridor + overlap rows 1, 5 (2026-06-01 human sign-off)

**Acceptance:** Tap 0 — player on foot corridor, no circle on face; after tap 1 — left/right on foot; meeting/coffee badges on imminent rung above player; no connector over head @320px.

---

### P1-3 · Client-trusted scores (leaderboard abuse)

| Field | Detail |
|-------|--------|
| **ID** | C-06 |
| **Files** | `packages/api/app/routes/runs.py` |
| **Bug** | Valid `initData` + consistent rungs/rank → any `years_survived` ≤ 100 accepted |
| **Impact** | Fake #1 on daily board |

**Tasks (minimum v2.0):**

- [x] Add server plausibility cap (max years + session duration vs rungs_climbed)
- [x] Log/reject outliers with 400 + clear detail
- [x] Document known limit in [mvp-scope.md](mvp-scope.md) until v1.1 replay validation

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
| **Tasks** | [x] Branch on `ApiFailureReason`: `auth` vs `network` vs `server` |
| **Acceptance** | Airplane mode shows connection message, not session expired |

### P2-2 · Share flow (native + clipboard)

| **ID** | C-04 |
| **Files** | `packages/api/app/routes/share.py`, `apps/mini-app/src/lib/telegram.ts`, `app.ts` `copyShareText()` |
| **Tasks** | [x] Native `shareMessage` via `savePreparedInlineMessage` + `POST /share/prepare` |
| **Tasks** | [x] Clipboard fallback on prepare failure / user decline |
| **Tasks** | [ ] Verify native share on iOS/Android Telegram in DM + group — **Jun 12 Railway logs: 0× `/share/prepare`** ([20260612_analize.md](20260612_analize.md) §5b) |
| **Acceptance** | Share button always gives clear next step (native send or copied / failed); `/share/prepare` visible in Railway logs |

### P2-3 · In-memory rate limit (10s submit cooldown)

| **ID** | C-07 |
| **Files** | `packages/api/app/routes/runs.py` — `_submit_timestamps` |
| **Bug** | Per-process dict; resets on deploy; not shared across Railway workers |
| **Tasks** | [ ] **Verify** double-submit on quick retry → 429 UX acceptable for F&F — **Jun 12 logs: 39× 429 fired**; DEVICE_QA row 9 unsigned |
| **Tasks** | [x] v2.0: Supabase-backed cooldown (`submit_cooldowns`) |
| **Tasks** | [ ] **Fix** prod persistence — Jun 12 audit: 0 rows in `submit_cooldowns` / `api_sessions`; in-memory fallback active ([20260612_analize.md](20260612_analize.md) §5, §5b) |
| **Acceptance** | F&F: user sees “Score filing cooldown…” toast; no silent drop; hardening tables populated after deploy |

### P2-4 · `initData` in leaderboard GET query string

| **ID** | C-08 |
| **Files** | `apps/mini-app/src/lib/api.ts`, `packages/api/app/routes/leaderboard.py` |
| **Risk** | Long URL; may appear in access logs |
| **Tasks** | [x] v2.0: POST `/leaderboard/me` + session token; initData removed from GET |
| **Acceptance** | initData not logged in production access logs |

### P2-5 · Game-over gap line always daily period

| **ID** | C-12 |
| **Files** | `apps/mini-app/src/app.ts` — `runPostGameOverIo()` |
| **Tasks** | [x] Use `leaderboardPeriod` or label “today’s board” explicitly |
| **Acceptance** | Copy matches user expectation when weekly tab was last viewed |

### P2-6 · Background tab energy drain unfairness

| **ID** | S-02 (deferred in ROADMAP) |
| **Files** | `apps/mini-app/src/game/engine.ts` — `setInterval` drain |
| **Tasks** | [x] Fixed timestep drain + `visibilitychange` pause — v2.0 |
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
| S-06 | Bot vs mini-app daily shift hash parity test | `apps/bot/shifts.py`, `daily-modifier.ts` | [x] `test_shifts.py` preset hash + labels |
| S-08 | Fixed `840px` shell on very short viewports | `template.ts` L11 | [ ] Verify |
| S-11 | Tighten CORS origins (allowlist + `CORS_ORIGINS` env) | `packages/api/app/main.py` | [x] |
| S-12 | Fail CI build if `VITE_API_URL` unset in prod | Vercel / CI | [x] |
| S-17 | Keyboard arrows bypass UI throttle toast | `app.ts` | [x] |
| — | ResizeObserver never disconnected | `app.ts` | [x] |

---

## 6. Runtime verification backlog

Items that **cannot** be confirmed from code alone. Check off during device QA / F&F.

| ID | Area | Check | iOS | Android | Desktop | Browser |
|----|------|-------|-----|---------|---------|---------|
| V-01 | Layout | Width stable taps 0–8 | [x] | [x] | [ ] | [ ] |
| V-02 | Tutorial | Tap 2 dodge meeting (RIGHT → tap LEFT) | [x] | [x] | [ ] | [ ] |
| V-03 | Tutorial | Tap 3 coffee +25% energy | [x] | [x] | [ ] | [ ] |
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

**F&F sprint schedule:** Tier A (V-08–V-14) during dogfood + first external runs · Tier B/C (V-04–V-07, V-15–V-19, DEVICE_QA rows 6–10) by **2026-06-10** · sign-off tracked in [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §B gate 6

**2026-06-04:** Upsert 500 fixed; `ff-metrics.py` green (346 runs). Re-verify V-08–V-14 on **post v2.0 deploy** bundle.

---

## 6b. Soft launch gates (Jun 14)

Cross-ref [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §B. Complete before GO vote.

| # | Gate | Status |
|---|------|--------|
| 1 | Prod bundle = repo `main` | [x] `main-CJgmaRAS.js` prod = local (2026-06-04) |
| 2 | Supabase `002` applied | [ ] manual — Supabase SQL editor |
| 3 | `ff-metrics.py` green post-deploy | [x] 2026-06-04 · re-run after deploy |
| 4 | DEVICE_QA v2.0 rows 1–8 (iOS + Android) | [ ] |
| 5 | DEVICE_QA v1.8.5 rows 6–10 spot-check | [ ] |
| 6 | Tier A V-08–V-14 (§6 above) | [ ] |
| 7 | ≥8 externals invited; ≥6 completed 3 runs | [ ] |
| 8 | Share validated (`Shift:` line) | [ ] |
| 9 | Zero open pain items | [ ] |

---

## 7. Automated tests to add

Prioritized. Link to test file when implemented.

| Priority | Test name | File (target) | Purpose | Status |
|----------|-----------|---------------|---------|--------|
| P0 | `layout-stable-after-first-tap` | `scripts/layout-audit.mjs` | C-01 regression guard | [x] |
| P1 | `onCoffee-before-renderRungs` | `engine.test.ts` | C-03 regression | [x] |
| P1 | `qa:coffee` Playwright | `scripts/coffee-pickup-qa.mjs` | tutorial coffee + meeting death | [x] |
| P1 | `layout-player-foot-anchor` | `scripts/layout-player-debug.mjs` | tap-0 player Y on foot, not imminent | [x] |
| P1 | `energy-depletion-game-over` | `engine.test.ts` | Timer death path | [x] |
| P1 | `high-score-not-updated-on-submit-fail` | `score-trust.test.ts` | C-02 | [x] |
| P1 | `near-miss-on-safe-side-tap` | `engine.test.ts` | v1.9 wince trigger | [x] |
| P1 | `sprint-timeout-game-over` | `engine.test.ts` | v1.9 Synergy Sprint | [x] |
| P1 | `rank-boundary-40-rungs-manager` | `engine.test.ts` + API | Submit at 10.0y | [x] |
| P2 | `generateRung-always-one-safe-side` | `engine.test.ts` | Fairness | [x] |
| P2 | `bot-miniapp-preset-parity` | new cross-lang test | S-06 | [x] `test_shifts.py` |
| P2 | `leaderboard-initData-highlights-user` | `test_api.py` | Auth on GET | [x] session token flow |
| P2 | E2E smoke: start → 3 taps → game over | Playwright | Full path | [ ] |

**Existing coverage (do not regress):**

- `engine.test.ts` — 19 cases (tutorial, reorg exempt, throttle, promo pause, coffee inject, near-miss, sprint)
- `test_api.py` — auth, runs validation, rate limit, rank mismatch
- `npm run qa:viewport` — overflow at 320/390px
- `npm run qa:layout` — column alignment + post-tap width stable
- `npm run qa:coffee` — tutorial coffee callback + meeting collision
- `scripts/layout-player-debug.mjs` — player vs foot/imminent Y @320×568 / 390×844

---

## 8. Environment & deploy checklist

Run before every prod deploy.

### Vercel (mini-app)

- [ ] `VITE_API_URL` → Railway API URL
- [ ] `VITE_BOT_USERNAME` → bot handle without `@`
- [ ] `VITE_PROMPT_ANATOMY_URL` (optional)
- [ ] Build succeeds: `npm run build`
- [ ] No secrets in bundle (only `VITE_*`)
- [x] **Next redeploy** — ship v2.0.0 bundle `main-C_cYxjEK.js` + Supabase migration `002_v2_hardening.sql`

### Railway (API)

- [ ] `TELEGRAM_BOT_TOKEN` or `TELEGRAM_WEBAPP_SECRET`
- [ ] `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `GET /health` → 200

### Railway (bot)

- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `MINI_APP_URL` → Vercel prod URL (not localhost)
- [ ] `/start` opens correct WebApp
- [ ] **Redeploy** — synergy_sprint label in rotation

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
| Shared rate limit store | Abuse across workers | **v2.0 shipped** (`submit_cooldowns`) |
| Remove initData from GET | Privacy / log exposure | **v2.0 shipped** (session token) |
| Score plausibility cap | Obvious cheat rejection | **v2.0 shipped** |
| Corporate triage rung | Product v2 thesis | **v2.0 shipped** — [V2_TRIAGE_SPIKE.md](V2_TRIAGE_SPIKE.md) |
| Fixed timestep drain + reorg | Background tab fairness | **v2.0 shipped** (visibility pause) |
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
| Release gates (G-1–G-8) | 1 | 7 |
| P0 | 0 | 2 |
| P1 | 0 | 4 |
| P2 | 3 | 4 |
| P3 | 1 | 8 |
| Runtime verification (V-01–V-19) | 16 | 6 |
| Automated tests to add | 1 | 12 |

**Last updated:** 2026-06-04 — F&F UX pack in repo; 76 vitest pass; combined deploy checklist [FF_DEPLOY_CHECKLIST.md](FF_DEPLOY_CHECKLIST.md); prod deploy pending

---

## 12. Quick reference — confirmed bug IDs

| ID | Severity | One-line summary |
|----|----------|------------------|
| C-01 | P0* | Ladder width shrink after first tap — **verified** |
| C-02 | P1 | High score UI before API success — **fixed** |
| C-03 | P1 | Coffee before render + fillSlot guard — **device verified** |
| (layout) | P1 | Foot anchor + corridor start — **device verified** |
| C-04 | P2 | Share clipboard-only |
| C-05 | P2 | Auth banner on network errors — **fixed** |
| C-06 | P1 | Client-trusted scores |
| C-07 | P2 | In-memory rate limit |
| C-08 | P2 | initData in leaderboard URL |
| C-09 | P3 | Extra HUD tick after energy death |
| C-10 | P3 | package.json version drift |
| C-11 | P3 | QA game over exposed on `window` |
| C-12 | P2 | Game-over gap always daily — **fixed** |

*P0 only if production has not received layout fix deploy.
