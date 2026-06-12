# Device QA — v2.0.0 (Corporate Triage + Platform Hardening)

**Gate:** Soft-launch GO **2026-06-14** ([FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md)) · `v2.0.0` tagged · **Baseline:** [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–10 must still pass

**Prod bundle:** [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md)

---

## v2.0-specific rows

| # | Area | Steps | Pass criteria | iOS | Android |
|---|------|-------|---------------|-----|---------|
| 1 | **Triage prompt** | Reach Manager (~10y); keep climbing until HR triage memo | Memo appears; next tap does **not** climb | [ ] | [ ] |
| 2 | **Triage choice** | Tap LEFT (or RIGHT) on prompt | Confirm toast; climb resumes on following taps | [ ] | [ ] |
| 3 | **Triage bias** | After choice, observe 2–3 imminent hazards | More hazards on chosen side; always one safe side | [ ] | [ ] |
| 4 | **Tutorial (glow only)** | Fresh run taps 1–3 | Safe-side button glow + wrong-tap HR memo only; no overlay card until rung 4 (v2.2.1) | [ ] | [ ] |
| 5 | **Background drain** | Start run; background Telegram 30s; return | Energy does not drain while hidden | [ ] | [ ] |
| 6 | **Keyboard throttle** | Desktop/browser arrows spam | "Too fast" toast on keyboard (same as buttons) | [ ] | n/a |
| 7 | **Leaderboard highlight** | Submit run; open Daily tab | Your row highlighted (session token flow) | [ ] | [ ] |
| 8 | **Score submit** | Offline game over | Failure toast; career high unchanged | [ ] | [ ] |
| 9 | **429 cooldown** | Two quick deaths | "Score filing cooldown" toast | [ ] | [ ] |
| 10 | **Synergy Sprint** | On sprint day, 60s cap | Sprint HUD + timeout game over | [ ] | [ ] |
| 11 | **Native share (DM)** | Finish run → Share → send to saved messages or contact | **3-line** body + inline card + Punch In button; no PA URL in body; `share_success` native or clipboard toast | [ ] | [ ] |
| 12 | **Native share (group)** | Open via `/go@bot` in supergroup → finish run → Share to same group | Same 3-line body; no WebView crash | [ ] | [ ] |

---

## Regression spot-check

Re-run [DEVICE_QA_v1.8.5.md](DEVICE_QA_v1.8.5.md) rows 1–5 (corridor, width, coffee, meeting death).

---

## Sign-off

| Platform | Tester | Date | Bundle hash |
|----------|--------|------|-------------|
| iOS | | | per [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md) |
| Android | | | per [DEBUG_ENV_TRIAGE](DEBUG_ENV_TRIAGE.md) |

**Due:** After v2.2.1 prod deploy · **Gate:** [FF_REVIEW_2026-06-14.md](FF_REVIEW_2026-06-14.md) §B row 4 (rows 1–8 required) · [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) gate #2

**Sign against bundle:** `main-CvPR04Oz.js` (local v2.2.1 build) or prod hash in [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) after Vercel redeploy.

---

## Jun 12 prod evidence (pre–device sign-off)

From Railway access logs `logs.1781234407184.json` ([20260612_analize.md](20260612_analize.md) §5b):

| Row | Prod signal | Device sign-off still needed |
|-----|-------------|------------------------------|
| 9 **429 cooldown** | **39× HTTP 429** on `POST /runs` (Jun 9–12); mini-app maps to `"Score filing cooldown. Retry in a few seconds."` | [ ] Confirm toast visible on **two quick deaths** (iOS + Android) |
| 11–12 **Share** | **0× `/share/prepare`** in log window | [ ] Complete rows 11–12; re-export Railway logs and confirm prepare hit |

### Share validation procedure (rows 11–12)

Expected **message body** (after share hook trim):

```
Director · 20.8y — {one death line}.
Think you can outlast me?
https://t.me/CorporateLadder_bot?startapp=c_208
```

Plus inline article card (title, description with PA co-brand) and **Punch In & Climb** button.

1. Open mini-app from @CorporateLadder_bot on **physical device** (not desktop browser).
2. Finish one run → tap **Share** on game-over.
3. Send via native `shareMessage` (DM row 11) or paste fallback.
4. Export Railway API logs → grep `/share/prepare` → expect **≥1× HTTP 200**.
5. Record outcome in sign-off table below.

Skill: [.cursor/skills/share-virality/SKILL.md](../.cursor/skills/share-virality/SKILL.md)

### 429 validation procedure (row 9)

1. Play two runs back-to-back with deaths &lt;10s apart (rapid retry).
2. On second submit failure, expect shell toast: **Score filing cooldown. Retry in a few seconds.**
3. Confirm career high unchanged until successful submit (score trust).

---

## Automated coverage (2026-06-12, pre v2.2.1 prod deploy)

Prod bundle to sign against after deploy: see [DEBUG_ENV_TRIAGE.md](DEBUG_ENV_TRIAGE.md) (`main-CvPR04Oz.js` local · `main-5Cc-kozO.js` prod 2026-06-12). Local CI smoke green 2026-06-12: pytest 41 · vitest 126 · lint/build · smoke-local · `ff-metrics.py` `submit_pipeline_ok: true` · `hardening_table_rows` still 0 (API redeploy pending).

Local CI smoke before manual device sign-off:

| Row | Automated signal |
|-----|------------------|
| 4 Tutorial rungs 1–3 | `engine.test.ts` — glow-only gating (v2.2.1); safe-side pulse + wrong-tap memo |
| 7 LB highlight | `api.test.ts` + session token flow |
| 8 Score submit | API pytest submit pipeline |
| Share | `telegram.test.ts` + `test_share.py`; manual DM + group rows 11–12 for gate #8 |

**Manual only:** triage prompt (1–3), background drain (5), keyboard throttle (6), layout/tap feel, Telegram BackButton, native share on device.

Operator: complete iOS + Android columns above, then update sign-off table and mark [PUBLIC_LAUNCH_REVIEW_2026-06-28.md](PUBLIC_LAUNCH_REVIEW_2026-06-28.md) gate **#2** `[x]`.
