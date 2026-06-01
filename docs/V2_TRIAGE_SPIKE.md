# V2.0 Corporate Triage Rung — Implementation Spike

**Status:** Approved for v2.0.0 · **Scope:** [mvp-scope.md](mvp-scope.md) v2 exception · **Roadmap:** [ROADMAP.md](../ROADMAP.md) v2 thesis

---

## Summary

**Corporate triage rung** adds a Manager+ beat where the player assigns P1 backlog to a lane. The next few spawns bias hazards toward that side. Same L/R dodge rules; always one safe side on the imminent rung.

---

## Locked decisions

| Decision | Choice |
|----------|--------|
| **Trigger** | Manager+ rank; every **16 rungs** (~4 years) after tutorial |
| **Player input** | Next TAP LEFT/RIGHT after HR prompt — **not a climb**; assigns backlog lane |
| **Effect** | **75%** hazard spawn on chosen side for **3** generated rungs |
| **Fairness** | Single-side obstacles only; imminent rung always dodgeable; Frozen reorg rules unchanged |
| **Tutorial** | No triage before rung 12 (intern tutorial window) |
| **Satire** | HR triage / P1 backlog copy via HR memo rail |
| **API** | Client-only bias; server plausibility uses `rungs_climbed` + session duration (no new endpoints) |

---

## Player flow

```mermaid
sequenceDiagram
  participant Player
  participant Engine
  participant UI
  Player->>Engine: climb to Manager (40+ rungs)
  Engine->>Engine: score delta >= 16 since last triage
  Engine->>UI: onTriagePrompt HR memo
  Player->>Engine: tap LEFT or RIGHT (choice)
  Engine->>Engine: triageBiasSide set; no score++
  Engine->>UI: confirm toast
  Player->>Engine: normal climbs
  Engine->>Engine: next 3 hazards bias chosen side
```

---

## Copy (satirical)

| Moment | Text |
|--------|------|
| Prompt | `HR triage: tap LEFT or RIGHT to overload that lane with P1 backlog.` |
| Subline | `Your next tap assigns backlog — not a climb.` |
| Confirm | `P1 backlog routed to the LEFT/RIGHT lane for the next few rungs.` |

---

## Constants

See [`constants.ts`](../apps/mini-app/src/game/constants.ts):

- `TRIAGE_RUNG_INTERVAL = 16`
- `TRIAGE_BIAS_RUNGS = 3`
- `TRIAGE_SPAWN_BIAS = 0.75`

---

## Out of scope (v2.0)

- Both sides lethal
- Center tap / third lane control
- Server replay validation (v1.1)
- Triage on Intern rank

---

## QA

Device matrix: [DEVICE_QA_v2.0.md](DEVICE_QA_v2.0.md)

Automated: `engine.test.ts` — triage prompt, choice tap, spawn fairness

---

## Sign-off

| Role | Date | Status |
|------|------|--------|
| Product | 2026-06-01 | Approved (combined v2.0 release) |
| Engineering | 2026-06-01 | Implemented |
