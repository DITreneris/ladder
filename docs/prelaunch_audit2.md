# Pre-Launch Product Audit #2 — Corporate Ladder

**Purpose:** Brutally honest launch-readiness decision for founders, dev, design, marketing, and investors — not generic UX feedback.  
**Audit date:** 2026-06-11  
**Platform:** Telegram Mini App · `@CorporateLadder_bot`  
**Stage:** Soft launch / pre-public launch (v2.2.0 code complete, deploy pending)  
**Verdict:** **CONDITIONAL GO** (score **62 / 100**)

**Inputs:** [ROADMAP.md](../ROADMAP.md) · [CHANGELOG.md](../CHANGELOG.md) (v2.0–v2.2) · [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) · [FF_METRICS_2026-06-11.md](FF_METRICS_2026-06-11.md) · [UX_RETENTION_PLAN.md](UX_RETENTION_PLAN.md) · [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md) · [ads-acquisition-plan.md](ads-acquisition-plan.md) · codebase review  
**Companion gates:** [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) · [DEPLOY_STATUS.md](DEPLOY_STATUS.md)

**Assumptions:** No live gameplay video in this audit; v2.1.1/v2.2.0 retention fixes not yet measured in production metrics; missions/quests = deferred v2.2 P3 (not shipped).

---

## 1. Executive verdict

| Field | Value |
|-------|-------|
| **Launch readiness score** | **62 / 100** |
| **Decision** | **CONDITIONAL GO** |
| **One-line reason** | Backend and satirical product identity are production-grade; external first-session retention (11s median run, 5y median score, weak return rate) blocks public launch until v2.1.1/v2.2.0 is deployed and re-measured. |
| **Soft launch / F&F** | Proceed after v2.2.0 deploy + DEVICE_QA sign-off |
| **Public launch / paid acquisition** | **NO-GO** until metrics gates pass (~2026-06-28 review) |

### Top 5 must-fix before public launch

1. Deploy **v2.1.1 + v2.2.0** and re-run `python scripts/ff-metrics.py` (~7 days post-deploy).
2. Sign **[DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md)** rows 1–8 on real iOS + Android.
3. Prove external **median run ≥30s** (baseline **11.25s** on 2026-06-11).
4. Validate **≥1 native Telegram share** end-to-end (`share_success` event or paste log).
5. Complete **Vercel OG redeploy** after `npm run adopt:og`.

---

## 2. What works

| Area | What is good | Why it matters | Impact |
|------|--------------|----------------|--------|
| Core loop | Tap L/R, one rung per beat, energy + coffee | Instant comprehension; thumb-friendly | High |
| Satirical positioning | HR framing, RE-APPLY loop, death/share copy | Differentiates from generic runners | High |
| Progression | Intern → Manager (10y) → Director (20y) → CEO (35y) | Mid-game goals; Director fixes CEO-only myth | High |
| Platform hardening | Session tokens, submit cooldown, plausibility caps | Score trust; pipeline green | High |
| Retention sprint (code) | Tutorial overlay, tap pulse, beat-your-gap, challenge links | Targets measured churn drivers | High (post-deploy) |
| Monetization design | AdsGram rewarded revive only; no currency/interstitials | Launch-safe | Medium |
| Leaderboards | Daily + Weekly, self-row highlight, gap-to-#1 | Social tension without v1.1 friends tab | Medium |
| Visual system | Emoji-first arcade, design tokens, marketing captures | Consistent OG/screenshots | Medium |
| Telegram integration | Bot, MainButton, shareMessage, `startapp=c_*` | Native growth path | Medium |

---

## 3. What does not work

| Problem | Evidence | Why it hurts | Severity |
|---------|----------|--------------|----------|
| First runs too short | External median run proxy **11.25s** vs target **≥30s** ([FF_METRICS_2026-06-11](FF_METRICS_2026-06-11.md)) | Players never reach Manager promo / triage | **Critical** |
| One-and-done externals | **9/11** one-day-only; daily runs **200 → 22** (Jun 4 → Jun 10) | No DAU, no LB tension, no virality | **Critical** |
| Meeting deaths dominate early | Meeting Overload avg **8.3y**; external median **5.0y** | First failure feels random | High |
| Share loop unvalidated | PUBLIC_LAUNCH gate #5 open | Viral thesis unproven | High |
| Retention fixes not in prod metrics | v2.2.0 deploy pending ([DEPLOY_STATUS](DEPLOY_STATUS.md)) | Audit may judge old onboarding | High |
| DEVICE_QA unsigned | v2.0 rows 1–8 blank | Triage/background/share untested on device | High |
| OG preview debt | Vercel redeploy pending | Weak cold CTR from Telegram/channels | Medium |
| Home cognitive load | Badge + ticker + shift + preview before first tap | Slows Punch In on short viewports | Medium |
| No day-2 hook | Daily 3-run quest + bot nudge deferred | Nothing pulls return except LB | Medium |
| No referral reward | Challenge link only — no invite incentive | Weak invite vs viral Telegram games | Medium |

---

## 4. GO / NO-GO by area

| Area | Status | Notes |
|------|--------|-------|
| Core game loop | **GO** | Clear, repeatable |
| First 30 seconds | **FIX** | 11s external median; v2.1.1 tutorial not yet in prod metrics |
| Onboarding | **FIX** | Overlay + pulse coded; device validation pending |
| Controls | **GO** | Tap deck, throttle, tutorial wrong-side memo |
| Mechanics | **GO** | Skill-based, fair telegraphs; triage at Manager+ |
| Difficulty curve | **FIX** | Rookie ramp helps; meetings still kill ~5y externals |
| Rewards | **FIX** | Promo toasts good; no persistent daily reward |
| Missions / quests | **NO-GO** (scope) | Not shipped — OK if retention fixed elsewhere |
| Leaderboard | **GO** | Thin DAU limits tension |
| Referral / invite | **FIX** | Challenge link + native share; zero validated shares |
| Visual style | **GO** | Coherent satirical office |
| Animation quality | **GO** | Micro-motions, reduced-motion safe |
| Decorations / environment | **GO** | Minimal arcade — correct for readability |
| Character / object clarity | **FIX** | Obstacle silhouettes similar (UX plan backlog) |
| UI clarity | **FIX** | Energy label (v2.1.1); home dense pre-first-run |
| Telegram integration | **GO** | Auth, share, deep links |
| Loading speed | **GO** | v1.9 optimizations |
| Bugs / crashes | **GO** (automated) | `submit_pipeline_ok`; manual matrix open |
| Economy / monetization | **GO** | Conservative revive gate |
| Viral potential | **FIX** | Mechanics present; signal missing |
| Retention potential | **FIX** | Beat-your-gap good; return rate weak |
| Audience fit | **GO** | Casual Telegram + office satire |

---

## 5. First 30 seconds

**Journey:** Bot → home → Punch In → corridor → tutorial rungs 1–3 → meeting/coffee → death ~5y (~11s).

| Moment | Risk | Fix (maps to release train) |
|--------|------|----------------------------|
| First screen | Scroll before action | Collapse preview for new users; CTA above fold — **v2.1.1** home trim |
| First action | Center corridor confusion | Forced L/R tutorial overlay — **v2.1.1** |
| First reward | Death before coffee | Wrong-side memo, no death on tutorial — **v2.1.1** |
| First failure | Abrupt meeting death | Game-over progression hint — **v2.1.1** backlog / post-deploy |
| First reason to continue | Weak if run &lt;10s | Beat-your-gap after submit — **v2.1.0** |
| First reason to invite | Clipboard friction | Native share + challenge link — **v2.2.0** |

---

## 6. Game mechanics

| Criterion | Verdict |
|-----------|---------|
| Simple enough | Yes — do not add controls pre-launch |
| Addictive enough | Partial — externals quit before hook |
| Skill-based enough | Yes |
| Fair enough | Mostly — rookie ramp + reorg freeze |
| Repeatable enough | Yes — daily shift presets |
| Differentiated enough | Yes — corporate satire + triage |
| Telegram-suitable | Yes — target 30–90s sessions |

**Recommendations (no overbuild):** Ship v2.1.1 tutorial; extend hints through first death; defer soft drain cap until external median ≥15s; defer clean-climb streak until share validated.

---

## 7. Visual, animation, decoration

**Locked direction:** *Funny cartoon* on *minimal arcade* playfield — [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) §1.

| Dimension | Grade | Low-hanging fix |
|-----------|-------|-----------------|
| Art direction | B+ | — |
| Visual hierarchy | B | Collapse home preview (v2.1.1) |
| Animation polish | B+ | Haptic on tutorial tap (backlog) |
| Obstacle readability | C+ | Distinct silhouettes — v2.2 backlog |
| Screenshot / OG | B+ | Vercel OG redeploy — **P0 ops** |

---

## 8. Engagement and retention

| Question | Answer |
|----------|--------|
| Return tomorrow? | Daily LB reset + today's shift + beat-your-gap |
| 5 sessions? | Only if Manager+ reached — externals rarely do |
| Invite someone? | Challenge link — no inviter reward |
| Weak loop | **Day-2 return** — no push, no quest |
| Missing reward | Copy-only daily shift acknowledgment (deferred P3) |
| Missing hook | **First Manager promotion** — most externals never see it |

**Retention loop:**

```
Daily shift (weak trigger)
  → Punch In
  → Tap climb + dodge
  → Death + HR verdict
  → Reward: Daily LB score + beat-your-gap
  → Progress: rank milestone
  → Social: share challenge / gap to #1
  → Return: ???  ← LOOP BREAKS (no bot nudge, no quest)
```

---

## 9. Virality

| Element | Status |
|---------|--------|
| Referral | Challenge deep link only — no dual reward |
| Share moments | Game-over + native share (v2.2) |
| Leaderboard tension | Gap-to-#1 — needs DAU |
| Telegram-native | Bot, startapp, shareMessage — strong tooling, weak proof |

**Top viral actions (effort → impact):**

1. Validate native share on device — **S / High**
2. Promote share as primary game-over secondary CTA — **S / High**
3. Test challenge banner round-trip — **S / High** (v2.2)
4. Bot idle nudge (24h) — **M / High** (deferred v2.2 P2)
5. Weekly standings screenshot for channel — **M / High**

Full list: [UX_RETENTION_PLAN.md](UX_RETENTION_PLAN.md) Phase 2.

---

## 10. Monetization / economy

| Dimension | Verdict |
|-----------|---------|
| Too early / aggressive | No — rewarded revive only on qualifying deaths |
| Too weak | Slightly — most externals die &lt;8y, never see revive |
| Clear / fair / fun | Yes — "Mandatory HR Training" on-brand |
| Launch-safe | Yes — no Stars shop, currency, or interstitials |

**Rule:** Paid acquisition ([ads-acquisition-plan.md](ads-acquisition-plan.md)) only after public launch GO — not in-app ads as growth substitute.

---

## 11. Low-hanging fruits (prioritized)

| Fix | Impact | Effort | Owner | Priority |
|-----|--------|--------|-------|----------|
| Deploy v2.1.1 + v2.2.0 | Unblocks all retention/virality fixes | S | DevOps | **P0** |
| DEVICE_QA v2.0 sign-off | Launch confidence | S | QA | **P0** |
| Vercel OG redeploy | Cold CTR | S | DevOps | **P0** |
| Re-run ff-metrics 7d post-deploy | Prove ≥30s target | S | Product | **P0** |
| Validate 1 native share | Virality gate | S | QA/Marketing | **P0** |
| Game-over progression hint | Fewer unfair quits | S | Game design | P1 |
| Obstacle silhouettes | Fewer mis-read deaths | S | Design | P1 |
| Bot idle nudge | Day-2 return | M | Dev | P2 |
| Daily 3-run copy quest | Habit without economy | S | Game design | P2 |

---

## 12. Launch blockers (public launch only)

| Blocker | Why | Fast fix | Minimum acceptable |
|---------|-----|----------|-------------------|
| External median run &lt;30s | Wastes paid CAC | Deploy v2.1.1; extend hints | ≥30s over 7-day window |
| DEVICE_QA unsigned | Device-only failures | 2h manual iOS + Android | Rows 1–8 signed |
| v2.2.0 not in production | Fixes unmeasured | Push + co-deploy | Prod = v2.2.0 bundle |
| Zero validated share | Growth unproven | QA native share to contact | ≥1 `share_success` |
| OG preview stale | Broken link posts | adopt:og + Vercel redeploy | Live og.png on prod |

**Not blockers for soft launch:** Friends LB, anti-cheat replay, daily quest, premium art.

---

## 13. Launch readiness checklist

### Must have (public launch)

- [ ] v2.2.0 deployed (API + mini-app)
- [ ] DEVICE_QA v2.0 signed
- [ ] `submit_pipeline_ok: true` post-deploy
- [ ] External median run ≥30s (7-day post-deploy)
- [ ] Externals ≥3 runs: ≥6/8 ratio
- [ ] ≥1 validated Telegram share
- [ ] OG image live
- [ ] [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) → **GO**

### Should have

- [ ] Beat-your-gap visible after first run
- [ ] Challenge banner tested with real `startapp=c_*`
- [ ] TON analytics events (tutorial_complete, share_tap)
- [ ] Marketing carousel from [docs/assets/marketing/](assets/marketing/)

### Can wait (post-launch)

- Friends / All-time leaderboard (v1.1)
- Bot re-engagement nudge
- Daily 3-run quest
- Soft drain cap @ 20y
- Server-side replay anti-cheat

---

## 14. Final recommendation

### CONDITIONAL GO

**Soft launch / F&F expansion:** Proceed after v2.2.0 deploy + DEVICE_QA. Technical stack and retention sprint code are strong enough for controlled widening.

**Public launch:** **NO-GO today.** Paying to acquire players who median **11 seconds** and **5 career years** then never return optimizes impressions, not LTV. Fix the first 30 seconds, prove it in metrics, then buy traffic ([ads-acquisition-plan.md](ads-acquisition-plan.md)).

---

## 15. Seven-day fix plan

| Day | Focus | Actions |
|-----|-------|---------|
| **1–2** | Critical | Push v2.2.0; co-deploy API; OG redeploy; post-deploy smoke + ff-metrics; start DEVICE_QA |
| **3–4** | Polish | Device-test tutorial + tap pulse; fix triage/background P0 only; verify beat-your-gap + LB |
| **5** | Retention + referral | QA native share; test challenge link round-trip; confirm analytics events |
| **6** | Playtesting | 3–5 fresh externals, 3-run script; log session length + share |
| **7** | Decision | Update [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md); GO for paid pilot if gates pass |

---

## ROADMAP integration map

This audit confirms and extends [ROADMAP.md](../ROADMAP.md) § UX audit → release map. Do **not** duplicate release train detail here — use ROADMAP as source of truth.

| Audit finding | ROADMAP leg | Action |
|---------------|-------------|--------|
| First 30s / onboarding | **v2.1.1** (deploy pending) | Measure post-deploy |
| Virality / share | **v2.2.0** (deploy pending) | Validate gate #5 |
| Public launch gates | **v2.5.0** (~Jun 28) | [PUBLIC_LAUNCH_REVIEW](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) |
| Obstacle silhouettes | v2.2 backlog | P1 post-deploy |
| Soft drain / streak | **Defer** | Per FF_REVIEW — onboarding first |
| Missions / quests | **Defer** (v2.2 P3) | Out of public launch scope |
| Paid acquisition | **v2.5.0 gate** | ads-acquisition-plan |

**Re-measure triggers:** Tag + deploy v2.2.0 → wait 7 days → `python scripts/ff-metrics.py` → fill PUBLIC_LAUNCH_REVIEW gates → vote GO / NO-GO / CONDITIONAL GO.

---

## Related docs

| Doc | Use when |
|-----|----------|
| [ROADMAP.md](../ROADMAP.md) | Status, release train, shipped baseline |
| [UX_RETENTION_PLAN.md](UX_RETENTION_PLAN.md) | Phased UX fixes mapped to versions |
| [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) | Public launch GO vote |
| [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) | Soft launch CONDITIONAL GO |
| [FF_METRICS_2026-06-11.md](FF_METRICS_2026-06-11.md) | Baseline external segment |
| [ads-acquisition-plan.md](ads-acquisition-plan.md) | Paid spend gates |

**Update this doc** when Jun 28 public launch review completes or post-v2.2.0 metrics materially change the verdict.
