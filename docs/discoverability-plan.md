# Discoverability Plan — Corporate Ladder

**Status:** Approved approach · **Not traditional SEO** · **Doc map:** [DOCS_INDEX.md](../DOCS_INDEX.md)

Corporate Ladder is a **Telegram Mini App game**. Users find it via the bot, in-chat shares, and word of mouth — not Google search. This plan covers the minimum web/Telegram discoverability work worth doing, and explicitly defers full SEO/GEO until (unless) distribution strategy changes.

---

## Decision

| Question | Answer |
|----------|--------|
| Do we need full SEO (sitemap, schema, blog, llms.txt)? | **No** — not on the mini-app URL at current stage |
| Do we need Telegram-native discoverability? | **Yes** — bot profile, share loop, F&F recruitment |
| Do we need link-preview metadata? | **Yes** — low effort, helps when URL is pasted outside Telegram |
| Where does “what is Corporate Ladder?” live for web/AI? | **Prompt Anatomy site** (`DITreneris/site`) — not the game shell |

**Primary growth loop:**

```
@CorporateLadderBot /start → Mini App → play → share → friend opens bot
```

---

## Current baseline (audit snapshot)

| Area | Status | Notes |
|------|--------|-------|
| `index.html` metadata | Minimal | Title only; no description, OG, or canonical |
| `robots.txt` | Missing | No crawl policy |
| `sitemap.xml` | Missing | N/A for single-page app shell |
| `llms.txt` | Missing | Defer |
| Schema.org | Missing | Defer |
| Bot welcome copy | OK | `apps/bot/main.py` — `/start` + shift line |
| Share loop | OK | `shareMessage` + clipboard fallback |
| Co-branding link | OK | Footer → Prompt Anatomy |
| Marketing site entity | Missing | No CL page on promptanatomy.app yet |

**Production surfaces:**

| Surface | URL | Role |
|---------|-----|------|
| Mini App | https://www.promptanatomy.lol | WebApp shell (Telegram-first) |
| Bot | `@CorporateLadderBot` | Primary entry point |
| Ecosystem marketing | https://www.promptanatomy.app | Correct home for public “about” copy |

---

## Phased roadmap

### Phase 0 — Now (during F&F gate)

**Goal:** Sane link previews + no accidental Google indexing of thin SPA. **Do not block device QA or F&F.**

| # | Task | Owner | Effort | Files / surface | Status |
|---|------|-------|--------|-----------------|--------|
| 0.1 | Add meta description + Open Graph + Twitter card tags | Dev | S | `apps/mini-app/index.html` | **Done** |
| 0.2 | Add `robots.txt` with `Disallow: /` (or `noindex` meta) | Dev | S | `apps/mini-app/public/robots.txt` | **Done** |
| 0.3 | Audit BotFather: description, about, commands | Ops | S | [@BotFather](https://t.me/BotFather) | Manual |
| 0.4 | Confirm F&F share message uses bot link, not raw mini-app URL | Ops | S | [docs/FF_TEST.md](FF_TEST.md) | **Done** |
| 0.5 | OG image (1200×630) Playwright composite + GitHub social preview | Dev | S | `scripts/capture-og.mjs` → `public/og.png`, `.github/social-preview.png` | **Done** |

**Acceptance criteria:**

- [x] No layout or shell copy changes beyond `<head>` metadata (OG capture uses `?og=1` dev mode only)
- [ ] Pasting `https://www.promptanatomy.lol` in Slack/Discord/iMessage shows title + description + image (test after Vercel deploy)
- [ ] F&F testers recruited via `t.me/CorporateLadderBot` link (ops — share message updated in FF_TEST)

**Suggested metadata (copy-only in `<head>`):**

```html
<meta name="description" content="Satirical office climb game in Telegram. Dodge meetings, survive reorgs, don't burn out. Open @CorporateLadderBot to play." />
<meta property="og:title" content="Corporate Ladder" />
<meta property="og:description" content="Climb the corporate ladder in Telegram. Lumberjack meets modern office life." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.promptanatomy.lol/" />
<meta name="twitter:card" content="summary_large_image" />
```

Add `og:image` once `public/og.png` exists.

---

### Phase 1 — After F&F review (~2026-06-14)

**Goal:** Ecosystem discoverability if retention/share signal is positive. **Gate:** [docs/FF_TEST.md](FF_TEST.md) metrics review.

| # | Task | Owner | Effort | Surface |
|---|------|-------|--------|---------|
| 1.1 | Add Corporate Ladder blurb + bot link on Prompt Anatomy site | Dev (site repo) | S | `DITreneris/site` — `/games/corporate-ladder` or footer “Projects” |
| 1.2 | One paragraph entity definition for AI/search citation | Content | S | Same page — what it is, who it's for, how to play |
| 1.3 | Link from bot “Visit Prompt Anatomy” back to CL section (optional) | Dev | S | `apps/bot/main.py` keyboard if site has anchor |

**Trigger to proceed:** Any of — share rate &gt; 0 among testers, ≥3 runs/user in week 1, or explicit decision to widen beyond F&F.

**Trigger to skip:** Low engagement, no shares, “boring after run 2” dominates feedback → invest in v1.9 juice, not web discoverability.

---

### Phase 2 — Only if web acquisition becomes a goal

**Goal:** Public landing page separate from game shell. **Do not bolt onto `apps/mini-app`.**

| # | Task | Owner | Effort | Notes |
|---|------|-------|--------|-------|
| 2.1 | Static landing page: pitch + “Open in Telegram” CTA | Dev | M | On `promptanatomy.app` or `corporateladder.game` — not the WebApp |
| 2.2 | `SoftwareApplication` schema on landing page only | Dev | S | `applicationCategory: Game` |
| 2.3 | Sitemap entry for landing URL only | Dev | S | Site repo, not mini-app |
| 2.4 | Google Search Console + Bing Webmaster (landing domain) | Ops | S | After landing ships |
| 2.5 | Press / Product Hunt one-pager | Content | M | Reuse landing copy |

**Do not implement until:** Product decision to pursue non-Telegram acquisition channels.

---

### Phase 3 — Measurement (optional, post Phase 1)

| Metric | Source | When |
|--------|--------|------|
| Share rate | F&F survey + ask testers | F&F window |
| Games per user | Supabase `game_runs` | [FF_TEST.md](FF_TEST.md) SQL |
| Bot `/start` volume | Telegram bot analytics (manual) | After wider share |
| Referral from PA site | UTM on bot link | After Phase 1.1 |
| Web impressions | GSC | Only after Phase 2 landing |

---

## KISS / Marry / Kill

### KISS — do these

- `<head>` metadata on mini-app (Phase 0)
- `robots.txt` disallow or `noindex` on app URL
- BotFather profile polish
- F&F message → bot deep link
- One CL paragraph on Prompt Anatomy site (Phase 1, if F&F positive)

### Marry — keep and strengthen

- Telegram share loop (`shareMessage`, shift line, co-branding)
- Bot `/start` welcome + daily shift hook
- `@CorporateLadderBot` as canonical entry (env: `VITE_BOT_USERNAME`)
- ROADMAP retention metrics over search metrics

### Kill — do not do (this repo, this stage)

- Full SEO audit playbook on `apps/mini-app`
- FAQ pages, comparison pages, glossary, blog inside game repo
- `llms.txt` on the game URL
- Indexing the SPA as a marketing site
- Google Search Console for `promptanatomy.lol` before Phase 2 decision
- Marketing-site layout in mini-app (hero, footer grid) — per [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)
- v1.1 analytics platform as substitute for F&F qualitative signal

---

## Repository checklist (Phase 0 implementation)

| File | Action |
|------|--------|
| `apps/mini-app/index.html` | Add description, OG, Twitter meta |
| `apps/mini-app/public/robots.txt` | Create — `User-agent: *` / `Disallow: /` |
| `apps/mini-app/public/og.png` | 1200×630 link preview (Playwright composite) |
| `.github/social-preview.png` | 1280×640 GitHub repo share image |
| `apps/mini-app/public/favicon.ico` | Optional — if missing in browser tab |
| `apps/mini-app/vercel.json` | No change expected (SPA rewrite stays) |
| `CHANGELOG.md` | `[Unreleased]` entry when Phase 0 ships |
| `DITreneris/site` | Phase 1 only — out of scope for ladder repo |

---

## Alignment with release train

| Milestone | Discoverability action |
|-----------|------------------------|
| **Phase 0** (shipped in v1.8.2) | OG/meta/`og.png`/`robots.txt` — done |
| **v1.8.2 device QA + tag** (now) | No new discoverability work — finish [DEVICE_QA_v1.8.2](DEVICE_QA_v1.8.2.md) |
| **F&F test** (2026-05-31 → 2026-06-14) | Bot-link recruitment; optional share copy tweaks from feedback |
| **F&F review** (~2026-06-14) | Go/no-go on Phase 1 |
| **v1.9** | Game juice if F&F weak; Phase 1 if widening audience |
| **v1.1 platform** | Analytics (explicit approval) — separate from SEO |

---

## OK / Fail (target after Phase 0)

| Area | Target | Fix if fail |
|------|--------|-------------|
| Link previews | OK | Complete OG tags + optional og.png |
| Accidental SEO | OK (noindex/disallow) | Add robots.txt |
| Telegram entry | OK | BotFather + F&F message |
| AI entity clarity | Fail until Phase 1 | PA site paragraph |
| Web organic growth | N/A (deferred) | Phase 2 landing if needed |

---

## Related documents

- [docs/FF_TEST.md](FF_TEST.md) — F&F metrics and recruitment
- [docs/DEVICE_QA_v1.8.2.md](DEVICE_QA_v1.8.2.md) — current release gate (after Phase 0 shipped)
- [docs/FF_EXECUTION.md](FF_EXECUTION.md) — F&F runbook
- [ROADMAP.md](../ROADMAP.md) — release train
- [docs/mvp-scope.md](mvp-scope.md) — scope boundaries
- [DITreneris/site](https://github.com/DITreneris/site) — ecosystem marketing (Phase 1)
