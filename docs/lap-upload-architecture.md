# Lap Upload Architecture

## Overview

The upload system processes laps individually as they complete. Each lap either stands alone or belongs to a tracked session, determined by the `keepAllLaps` flag included in the lap payload. The uploader is responsible for deciding which path applies and for carrying a `sessionId` forward between laps when appropriate.

---

## Uploader States

### State A — Standalone Lap (`keepAllLaps: false`)

The default. Used for practice, qualifying, and hotlap-type sessions where only the best laps matter.

- No session document is created.
- Every lap is written to `test_laps` with an `expiresAt` timestamp.
- The driver's combo record is checked immediately on arrival.
  - If the new lap is **faster than the slowest top-3**, it replaces it:
    - New lap is written **without** `expiresAt`.
    - Knocked-out lap has `expiresAt` assigned (it was previously stored without one).
  - If the new lap **does not qualify**, it is written with `expiresAt` set.
- Response returns only `lapId`. No `sessionId` is returned.

### State B — Session Lap (`keepAllLaps: true`)

Used for race-type sessions where the full picture matters, including pit laps and invalid laps.

- If the payload includes a `sessionId`: the lap is written and associated to the existing session.
- If no `sessionId` is present: a new session document is created in `test_sessions`, and the resulting `sessionId` is returned in the response.
- All laps in this path are written to `test_laps` **without** `expiresAt`.
- Response returns both `lapId` and `sessionId`.

---

## Lap Payload Shape

```ts
interface LapPayload {
  // Present only in State B, from the 2nd lap onwards
  sessionId?: string

  lapNumber: number
  lapTime: string
  isValid: boolean
  isPit: boolean
  lapData: object  // telemetry

  sessionData: {
    driver: string
    car: string
    track: string
    sessionTime: string
    sessionType: "RACE" | "PRACTICE" | "QUALIFYING" | "HOTLAP"
    keepAllLaps: boolean
  }
}
```

---

## Response Shape

| Path | Response |
|---|---|
| Standalone lap | `{ lapId }` |
| Session lap (new session) | `{ lapId, sessionId }` |
| Session lap (existing session) | `{ lapId, sessionId }` |
| Dropped lap | `{ dropped: true, reason: string }` |

---

## Collections

### `test_laps`
All laps, regardless of path.

| Field | Notes |
|---|---|
| `sessionId` | Present only for State B laps |
| `lapTime`, `lapNumber`, `isValid`, `isPit`, `lapData` | Core lap data |
| `driver`, `car`, `track`, `sessionTime`, `sessionType` | Denormalised from `sessionData` |
| `expiresAt` | Set for non-qualifying standalone laps. `null` for top-3 and session laps. Can be manually set to `null` to permanently retain a lap |

### `test_sessions`
Created only in State B. One document per tracked session.

| Field | Notes |
|---|---|
| `driver`, `car`, `track`, `sessionTime`, `sessionType` | From `sessionData` |
| `keepAllLaps` | Always `true` for documents in this collection |

### `drivers`
One document per driver. Holds driver metadata. Top-3 fastest lap references are stored in a nested subcollection hierarchy that mirrors the existing `tracks` and `cars` collections.

```
drivers/{driverId}
  name: string
  // ...other driver metadata

  /best_laps/               ← subcollection
    /{trackId}/             ← document (trackId matches tracks/{trackId})
      /cars/                ← subcollection
        /{carId}/           ← document (carId matches cars/{carId})
          laps: FastestLapRef[]   ← up to 3, sorted ascending by lapTime
```

Each `FastestLapRef` contains only `{ lapId, lapTime }` — a pointer back to the full lap document in `test_laps`, plus the lap time for fast comparison without a secondary read. No other lap data is stored here. `test_laps` is the single source of truth for all lap content. Track and car IDs used here are the same string identifiers used as document IDs in the `tracks` and `cars` collections. The car document's `laps` field is the array that gets maintained atomically within a transaction on lap arrival.

---

## Lap Expiry

A scheduled Cloud Function periodically queries `test_laps` where `expiresAt < now` and deletes matching documents. This keeps storage bounded for non-qualifying standalone laps while allowing a review window before deletion.

Laps can be permanently retained by setting `expiresAt` to `null`. This is a manual process.

---

## Flow Diagrams

### State A — Standalone Lap

```
Lap arrives (keepAllLaps: false)
  │
  ├─ Write lap to test_laps (with expiresAt)
  │
  └─ Read drivers/{driverId}/best_laps/{trackId}/cars/{carId}
       │
       ├─ Fewer than 3 laps stored?
       │    └─ Add to top-3, clear expiresAt on this lap → return { lapId }
       │
       ├─ New lap beats slowest top-3?
       │    └─ Replace slowest: assign expiresAt to old lap, clear on new → return { lapId }
       │
       └─ Not faster → lap retains expiresAt → return { lapId }
```

### State B — Session Lap

```
Lap arrives (keepAllLaps: true)
  │
  ├─ sessionId present?
  │    ├─ Yes → write lap with sessionId → return { lapId, sessionId }
  │    └─ No  → create session in test_sessions
  │               └─ write lap with new sessionId → return { lapId, sessionId }
```
