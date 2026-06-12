---
name: share-virality
description: Native Telegram share and challenge deep links. Use when wiring POST /share/prepare, shareMessage, challenge startapp params, or debugging share crashes in groups.
---

# Share + Virality

**Scope:** Native Telegram share sheet + challenge deep links. Not paid acquisition — see [docs/ads-acquisition-plan.md](../../docs/ads-acquisition-plan.md).

## Native share flow (primary — keep)

```
Game over → prepareShare() (api.ts)
  → POST /share/prepare { initData, years_survived, final_rank, ... }
  → API: build_share_text() + build_inline_article() + savePreparedInlineMessage
  → client: WebApp.shareMessage(preparedMessageId)
  → shareMessageSent / shareMessageFailed handlers
  → clipboard fallback + toast on prepare failure, unsupported client, or user decline
```

**Do not** call `WebApp.shareMessage({ text })` — crashes in groups (v2.2.0 bug class). Use prepared message ID only.

**Do not** switch to clipboard-only — native share satisfies gate #5; clipboard is fallback only.

## Copy split (short body + rich card)

| Layer | Content |
|-------|---------|
| **`message_text`** (3 lines) | `{rank} · {years}y — {one death line}.` / `Think you can outlast me?` / challenge URL |
| **Inline article title** | `{rank} · {years}y — Corporate Ladder` |
| **Inline article description** | Full termination detail/flavor + `Built with Prompt Anatomy` (no URL) |
| **Inline button** | Punch In & Climb → challenge URL |

Death line rule: flavor if ≤90 chars, else first sentence of `termination_detail`. No Employee, Shift, Cause+flavor pair, or PA URL in body.

## API (`POST /share/prepare`)

| Layer | File |
|-------|------|
| Route | `packages/api/app/routes/share.py` |
| Copy builder | `packages/api/app/share_copy.py` |
| Bot API | `packages/api/app/telegram/bot_api.py` — `savePreparedInlineMessage` |

Requires `TELEGRAM_BOT_TOKEN` on API (server-side Bot API call). Validates initData like `/runs`.

## Challenge deep links

**URL format:** `t.me/<bot>?startapp=c_<years×10>` — e.g. 24.5y → `c_245`

| Layer | Role |
|-------|------|
| `share_copy.py` / `share-copy.ts` | `build_challenge_link()` |
| `telegram.ts` | `getStartParam()` + `tgWebAppStartParam` fallback |
| `app.ts` | Parse challenge param; set `challengeTargetYears`; greet toast on mount |
| `template.ts` | `#challengeBanner`, `#challengeBannerText`, dismiss button |

## Client files

| File | Role |
|------|------|
| `apps/mini-app/src/lib/share-copy.ts` | Clipboard fallback text — **must match** `share_copy.py` |
| `apps/mini-app/src/lib/api.ts` | `prepareShare()` → `POST /share/prepare` |
| `apps/mini-app/src/app.ts` | Share tap handler, challenge banner, game-over challenge copy |
| `apps/mini-app/src/lib/analytics.ts` | `share_tap`, `share_success` events |

## Verifier checks

- [ ] Private chat: native share opens sheet with **3-line** body + card + button
- [ ] Group chat: share does not crash (no `{ text }` payload)
- [ ] Prepare failure → clipboard fallback uses **same** 3-line text + toast
- [ ] Share body includes challenge URL `startapp=c_*`; no Prompt Anatomy URL in body
- [ ] Incoming challenge link shows banner and game-over challenge line

## Debugging

1. API 401/502 on prepare — check initData freshness and `TELEGRAM_BOT_TOKEN` on Railway API
2. Share sheet empty — verify Bot API 8.0+ and `savePreparedInlineMessage` response
3. Challenge not parsing — inspect `Telegram.WebApp.initDataUnsafe.start_param` and URL `tgWebAppStartParam`
4. Run `pytest packages/api/tests/test_share.py` and `npm test src/lib/share-copy.test.ts`
