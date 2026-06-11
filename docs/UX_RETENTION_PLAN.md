# UX / Retention Action Plan — Corporate Ladder

**Purpose:** Integrate the Jun 2026 UX/UI audit with [ROADMAP.md](../ROADMAP.md) release train — what ships when, what stays deferred, and how to measure success.  
**Inputs:** F&F metrics ([FF_METRICS_2026-06-08.md](FF_METRICS_2026-06-08.md)), [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md), [20260608_analize.md](20260608_analize.md), marketing captures ([assets/marketing/](assets/marketing/)), design system.  
**Owner:** Product + frontend · **Review:** After each tag + `ff-metrics.py` re-run.

---

## 1. Executive summary

Corporate Ladder is **technically ship-ready** (CONDITIONAL GO) but **retention-thin for externals**: median ~5.0y/run, many sub-30s first runs, 9/11 externals one-day-only. The ROADMAP already addresses part of this via **v2.1.0 retention sprint** (rookie ramp, beat-your-gap, challenge links). The audit adds **first-session UX polish** not yet on the release train — grouped as **v2.1.1 hotfix** (pre–v2.2.0) so v2.1.0 cut ceremony stays clean.

**Do not:** rebalance difficulty (soft drain cap, CEO threshold), paid acquisition, or heavy arena redesign — all explicitly deferred or out of scope in ROADMAP.

---

## 2. ROADMAP analysis (current state)

### Status snapshot (2026-06-11)

| Lane | ROADMAP state | Audit alignment |
|------|---------------|-----------------|
| **v2.1.0** | Code complete — tag/deploy pending | Retention mechanics shipped in code; **ops gate** still open (DEVICE_QA, OG redeploy) |
| **v2.2.0** | Planned — virality + monetization polish | Matches audit P0: native share, AdsGram hardening, challenge banner, events |
| **v2.5.0** | Gated ~2026-06-28 | Public launch only after external retention metrics improve |
| **v1.1** | Deferred | Full analytics dashboard — use TON Builders + v2.2 lightweight events instead |
| **Backlog** | Soft drain cap, clean-climb streak — **DEFER** | Audit agrees — do not ship until onboarding fixed |

### v2.1.0 — already in code (audit: keep, validate)

| ROADMAP item | Audit verdict | Post-deploy check |
|--------------|---------------|-------------------|
| Director @ 20y | Keep — fixes “CEO-only endgame” narrative | Sync **home gameplay preview** copy (still says Intern→CEO only) |
| Beat-your-gap home line | Keep — Day-1 return lever | Surface above fold after first run |
| Share challenge deep link | Keep — viral loop seed | Validate one Telegram paste (F&F gate #8) |
| Adaptive rookie ramp (20 rungs) | Keep — addresses meeting deaths | Measure external median years ↑ |
| AdsGram revive | Keep — monetization structure OK | Keep **conservative gate** until first-run ≥30s |
| TON analytics | Keep — fills v1.1 analytics gap partially | Wire v2.2 events for share/revive funnel |
| SEO hardening | Keep — discoverability Phase 0 | OG redeploy on operational checklist |

**v2.1.0 cut ceremony** (from ROADMAP — unchanged):

1. `npm run lint && npm test && npm run build` + API `pytest`
2. Verifier ([.cursor/agents/verifier.md](../.cursor/agents/verifier.md))
3. `python scripts/ff-metrics.py` → `migration_002_ok: true`
4. DEVICE_QA v2.0 rows 1–8 signed
5. Tag `v2.1.0` · CHANGELOG cut · ROADMAP Status → **Tagged**

### v2.2.0 — planned (audit: prioritize as written)

| ROADMAP priority | Item | Audit rank |
|------------------|------|------------|
| **P0** | Native Telegram share sheet | Audit #7 — highest viral ROI |
| **P0** | AdsGram prod hardening | Pair with revive threshold experiments |
| **P1** | Challenge home banner (`startapp=c_*`) | Audit #10 |
| **P1** | Lightweight event logging | Measure share/revive/onboarding |
| **P2** | Soft drain cap @ ~20y | **Still defer** unless sessions >90s median |
| **P2** | Clean-climb streak | Copy-only — after share loop works |
| **P2** | Bot re-engagement nudge | Day-1 return |
| **P3** | Daily 3-run quest (copy-only) | No currency — scope-safe |

### Explicitly out of scope (ROADMAP — audit must not propose)

- Virtual currency, skins, clans, NFTs, Telegram Stars shop
- Phaser/canvas rewrite, heavy parallax, full arena redesign
- Friends / All-time leaderboard (v1.1)
- New control schemes or moving hazards

**Visual direction (locked):** *Funny cartoon* on *minimal arcade* playfield — clarity over decoration ([DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) §1).

---

## 3. Gap analysis — audit items not on ROADMAP

These are **new work** mapped to a release leg without changing MVP scope.

| Gap | Pillar | Proposed release | Effort |
|-----|--------|------------------|--------|
| First-run forced tutorial overlay (rung 1–3) | Mechanics + UI | **v2.1.1** | Low |
| HUD “Energy” label (first session) | Graphics | **v2.1.1** | Low |
| Safe-side tap deck pulse ↔ `#imminentHint` | Animation | **v2.1.1** | Low |
| Haptic on every tap | Animation | **v2.1.1** | Low |
| Game-over rank vs years explainer | Satire + clarity | **v2.1.1** | Low |
| Home above-fold trim (collapse mechanics card) | Graphics | **v2.1.1** | Low |
| Director @ 20y in home/how-to preview copy | Satire | **v2.1.0 cut** (copy-only) | Low |
| Obstacle silhouette differentiation | Graphics | **v2.2.0** | Low |
| Floor background color bands | Graphics | **v2.2.0** or backlog | Low–Med |
| Custom 48px climber SVG | Graphics | **Backlog** | Med |
| Revive gate loosen (first daily qualifying run) | Monetization | **v2.2.0** with AdsGram hardening | Low |

**v2.1.1** = retention hotfix release between v2.1.0 tag and v2.2.0 feature leg — not a ROADMAP version row yet; add to ROADMAP when work starts.

---

## 4. Phased action plan

### Phase 0 — v2.1.0 cut (now → tag)

**Goal:** Ship retention sprint code + close operational gates.

| # | Action | Source | Owner |
|---|--------|--------|-------|
| 0.1 | Fix home `#homeGameplayPreview` — include Director @ 20y | Audit + ROADMAP shipped baseline | Frontend |
| 0.2 | DEVICE_QA v2.0 sign-off (rows 1–8) | ROADMAP operational checklist | QA |
| 0.3 | Vercel OG redeploy (`npm run adopt:og`) | ROADMAP Status | DevOps |
| 0.4 | Deploy API + mini-app together (Director rank validation) | ROADMAP v2.1.0 | DevOps |
| 0.5 | Verifier + tag `v2.1.0` | ROADMAP cut ceremony | Release |
| 0.6 | `ff-metrics.py` re-run — baseline external segment | ROADMAP next actions | Product |

**Exit criteria:** Tag on `origin`; external median years/run recorded as baseline.

---

### Phase 1 — v2.1.1 retention hotfix (post-tag → ~2 weeks)

**Goal:** External first-run ≥30s median; reduce one-and-done.

| Rank | Improvement | Files (primary) | Impact |
|------|-------------|-----------------|--------|
| 1 | Tutorial overlay — force LEFT/RIGHT on scripted rungs 1–3 before free input | `app.ts`, `template.ts`, `style.css` | High |
| 2 | HUD “Energy” micro-label first 5 runs | `template.ts`, `app.ts` | High |
| 3 | Pulse safe-side `btn-tap-zone` when `#imminentHint` active | `app.ts`, `style.css` | High |
| 4 | `HapticFeedback.impactOccurred('light')` on tap | `app.ts`, `telegram.ts` | Medium |
| 5 | Game-over `#progressionHintLine` default — rank vs years one-liner | `app.ts`, `constants.ts` | Medium |
| 6 | Home — collapse `#homeGameplayPreview` behind “How to Survive” link after first run | `template.ts`, `app.ts` | High |

**Pillar checklist** (ROADMAP §): all items pass — mechanics clarity, readable HUD, &lt;200ms motion, satire tone, no new screens required.

**Exit criteria (external segment only):**

| Metric | Baseline (Jun 8) | Target |
|--------|------------------|--------|
| Median years/run | 5.0y | ≥7y |
| Median run duration (proxy) | ~11.5s | ≥30s |
| Externals ≥3 runs | 4/8 | ≥6/8 |
| One-and-done | 2+ churn | ≤1 new churn/week |

---

### Phase 2 — v2.2.0 virality + monetization (ROADMAP next leg)

**Goal:** Share loop + revive reliability before public launch review (~2026-06-28).

| Item | ROADMAP | Audit addition |
|------|---------|----------------|
| Native Telegram share | P0 | Replace clipboard; validate F&F gate #8 |
| AdsGram hardening | P0 | Fallback UI when ad fails; revive metrics |
| Challenge home banner | P1 | Incoming `startapp=c_*` |
| Lightweight events | P1 | `tutorial_complete`, `share_tap`, `revive_offer`, `revive_complete` |
| Obstacle silhouettes | — (audit) | Distinct shapes per hazard type |
| Floor color bands | — (audit) | Tie to `floorLabel` bands |
| Revive threshold A/B | — (audit) | ≥5y + near PB on first daily death |

**Defer inside v2.2.0** unless metrics contradict: soft drain cap, clean-climb streak (ROADMAP P2 — data said defer).

---

### Phase 3 — v2.5.0 public launch gate (~2026-06-28)

From [ads-acquisition-plan.md](ads-acquisition-plan.md) + ROADMAP Status:

| Gate | Target |
|------|--------|
| Externals ≥3 runs | ≥6/8 (or revised cohort, same ratio) |
| First-run churn | No dominant 1-run quit without fix |
| Share signal | ≥1 validated Telegram share |
| DEVICE_QA v2.0 | Signed |
| Public launch review | **GO** vote recorded |

**If gates fail:** Phase 1 iteration — **not** paid AdsGram acquisition.

---

## 5. Top 20 improvements — release map

| Rank | Improvement | Release | Priority |
|------|-------------|---------|----------|
| 1 | First-run tutorial overlay | v2.1.1 | Do now |
| 2 | HUD Energy label (first session) | v2.1.1 | Do now |
| 3 | Safe-side tap pulse + hint link | v2.1.1 | Do now |
| 4 | Game-over rank vs years explainer | v2.1.1 | Do now |
| 5 | Home above-fold trim | v2.1.1 | Do now |
| 6 | Haptic on tap | v2.1.1 | Do now |
| 7 | Director copy in home preview | v2.1.0 cut | Do now |
| 8 | Tag + deploy v2.1.0 retention sprint | v2.1.0 cut | Do now |
| 9 | Native Telegram share | v2.2.0 P0 | Do next |
| 10 | Challenge home banner | v2.2.0 P1 | Do next |
| 11 | Promotion spectacle always on rank-up | v2.1.1 / v2.2.0 | Do next |
| 12 | Obstacle silhouette differentiation | v2.2.0 | Do next |
| 13 | Revive threshold tweak + metrics | v2.2.0 P0 | Do next |
| 14 | Floor background color bands | v2.2.0 / backlog | Do next |
| 15 | Energy bar segment ticks | v2.2.0 | Do next |
| 16 | Telegram marketing captures | Ops | Do next |
| 17 | Lightweight funnel events | v2.2.0 P1 | Do next |
| 18 | Custom climber SVG | Backlog | Later |
| 19 | Bot re-engagement nudge | v2.2.0 P2 | Later |
| 20 | Dynamic audio layering | Backlog | Later |

---

## 6. Retention & monetization (ROADMAP-aligned)

| Lever | ROADMAP / plan action |
|-------|----------------------|
| **First session** | v2.1.1 tutorial + Energy label + rookie ramp (v2.1.0) |
| **Day 1 return** | Beat-your-gap (v2.1.0) + bot nudge (v2.2.0) |
| **Revive usage** | Keep gate conservative through Phase 1; loosen in v2.2.0 with metrics |
| **Ad motivation** | “Mandatory HR Training” copy + gap subline (`revive.ts`) — show preview line on game-over |
| **Referral** | Challenge link (v2.1.0) + native share (v2.2.0) |
| **Telegram loops** | PA channel soft posts post-GO; bot `/go` |
| **Reward economy** | No currency — LB gaps, rank badges, RE-APPLY flavor tiers only |

---

## 7. Before / after (target feel)

After Phase 0–1: player punches in within two seconds, tutorial forces three successful taps, Energy is labeled, and the first death explains rank vs years. After Phase 2: sharing is one native Telegram action with challenge link; revive appears on meaningful near-miss deaths with reliable ads. The game stays emoji-light and scope-safe — richer office mood via color bands and hazard shapes, not a canvas rewrite.

---

## 8. Top 5 first moves (team consensus)

1. **Complete v2.1.0 cut** — tag, deploy API+mini-app, DEVICE_QA, OG — unlocks real external measurement of retention sprint.
2. **Ship v2.1.1 tutorial overlay** — highest ROI for external median run length; engine already scripts rungs 1–3.
3. **Fix Director copy on home** — zero-risk trust fix before tag.
4. **Re-run `ff-metrics.py` on external segment** — baseline before/after v2.1.1.
5. **Schedule v2.2.0 native share as first feature** — ROADMAP P0 matches audit; blocks public launch share gate.

---

## Related documents

| Doc | Use |
|-----|-----|
| [ROADMAP.md](../ROADMAP.md) | Release train, scope, cut ceremony |
| [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) | CONDITIONAL GO verdict |
| [ads-acquisition-plan.md](ads-acquisition-plan.md) | Paid ads gates |
| [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md) | Visual guardrails |
| [docs/mvp-scope.md](mvp-scope.md) | In/out boundaries |

**Update this plan** when v2.1.0 tags, v2.1.1 ships, or Jun 28 launch review completes.
