---
name: share-virality
description: Native Telegram share and challenge deep links. Use when wiring POST /share/prepare, shareMessage, challenge startapp params, or debugging share crashes in groups.
---

# Share + Virality

**Scope:** Native Telegram share sheet + challenge deep links. Not paid acquisition — see [docs/ads-acquisition-plan.md](../../docs/ads-acquisition-plan.md).

## Native share flow

```
Game over → prepareShare() (api.ts)
  → POST /share/prepare { initData, years_survived, final_rank, ... }
  → API: build_share_text() + savePreparedInlineMessage (Bot API)
  → client: WebApp.shareMessage(preparedMessageId)
  → shareMessageSent / shareMessageFailed handlers
  → clipboard fallback + toast on prepare failure, unsupported client, or user decline
```

**Do not** call `WebApp.shareMessage({ text })` — crashes in groups (v2.2.0 bug class). Use prepared message ID only.

## API (`POST /share/prepare`)

| Layer | File |
|-------|------|
| Route | `packages/api/app/routes/share.py` |
| Copy builder | `packages/api/app/share_copy.py` — flavor, shift line, challenge URL |
| Bot API | `packages/api/app/telegram/bot_api.py` — `savePreparedInlineMessage` |

Requires `TELEGRAM_BOT_TOKEN` on API (server-side Bot API call). Validates initData like `/runs`.

## Challenge deep links

**URL format:** `t.me/<bot>?startapp=c_<years×10>` — e.g. 24.5y → `c_245`

| Layer | Role |
|-------|------|
| `share_copy.py` | `build_challenge_link()` appended to share text |
| `telegram.ts` | `getStartParam()` + `tgWebAppStartParam` fallback |
| `app.ts` | Parse challenge param; set `challengeTargetYears`; greet toast on mount |
| `template.ts` | `#challengeBanner`, `#challengeBannerText`, dismiss button |

**UI:**
- Home banner when incoming `startapp=c_*` — dismiss on tap or first Punch In
- Game-over challenge line: cleared vs still open (years short of colleague's target)
- `#homeContextSlot` — challenge pins in rotating slot until dismissed

## Client files

| File | Role |
|------|------|
| `apps/mini-app/src/lib/api.ts` | `prepareShare()` → `POST /share/prepare` |
| `apps/mini-app/src/app.ts` | Share tap handler, challenge banner, game-over challenge copy |
| `apps/mini-app/src/lib/analytics.ts` | `share_tap`, `share_success` events |

## Verifier checks

- [ ] Private chat: native share opens sheet with prepared message
- [ ] Group chat: share does not crash (no `{ text }` payload)
- [ ] Prepare failure → clipboard fallback + toast
- [ ] Share text includes shift line + challenge URL
- [ ] Incoming challenge link shows banner and game-over challenge line

## Debugging

1. API 401/502 on prepare — check initData freshness and `TELEGRAM_BOT_TOKEN` on Railway API
2. Share sheet empty — verify Bot API 8.0+ and `savePreparedInlineMessage` response
3. Challenge not parsing — inspect `Telegram.WebApp.initDataUnsafe.start_param` and URL `tgWebAppStartParam`
4. Run `pytest packages/api/tests/test_share.py`
