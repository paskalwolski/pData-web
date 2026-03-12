# Telemetry Storage Optimisation

## Problem

Each lap document in Firestore contains a `lapData` field: an array of telemetry point objects, one per meter of the lap. With laps ranging from 4km to 21km and up to 10 data points per meter, a single lap document can contain between 4,000 and 210,000 objects.

**Current shape:**
```json
{
  "lapData": [
    { "time": 1000, "distance": 0, "gas": 1.0, "brake": 0.0, "rpm": 3000 },
    { "time": 1048, "distance": 1, "gas": 0.98, "brake": 0.0, "rpm": 3100 },
    ...
  ]
}
```

Two problems with this:

1. **Key repetition**: Every object repeats the same key names. For 70,000 points with 8 keys, that's 70,000 redundant copies of each key name — significant wasted bytes in transfer.
2. **Eager loading**: When a session is selected in the UI, all of its laps are fetched at once. Full telemetry is included in every lap document read, even when only summary data (lap time, validity) is needed to render the session view.

---

## Objective 1 — Columnar Layout

Restructure `lapData` from an array of objects (row-oriented) to an object of arrays (column-oriented):

**Before:**
```json
[
  { "t": 1000, "d": 0, "gas": 1.0, "brake": 0.0 },
  { "t": 1048, "d": 1, "gas": 0.98, "brake": 0.0 }
]
```

**After:**
```json
{
  "t":     [1000, 1048, ...],
  "d":     [0, 1, ...],
  "gas":   [1.0, 0.98, ...],
  "brake": [0.0, 0.0, ...]
}
```

This eliminates repeated key names entirely. All values for a given channel are contiguous, which also benefits future cross-lap distance comparison (the `d` array is a direct positional index shared by all channels).

### Objective 1a — Store columnar data in the Firestore document

The simplest first step: keep telemetry in the lap document, but store it in columnar format. This reduces transfer size and key redundancy without changing the read pattern.

The `lapData` field type changes from `Array<object>` to `Record<string, Array<number>>`.

### Optional Objective 1b — Move telemetry to a subcollection

To fix the eager-loading problem, move the columnar telemetry out of the top-level lap document and into a subcollection:

```
laps/{lapId}                    ← scalar metadata only (lapTime, isValid, isPit, etc.)
  /telemetry/                   ← subcollection
    /data                       ← single document containing the columnar arrays
```

This means:
- Fetching all laps for a session reads only the small metadata documents — fast and cheap.
- Fetching telemetry for a specific lap requires one additional targeted read.
- The `lapData` field is removed from the top-level document entirely.

---

## Objective 2 — File-Based Storage (Later)

As a future improvement, telemetry can be moved out of Firestore entirely and stored as a binary file in Firebase Storage (already configured in the project). The Firestore lap document would hold a `telemetryPath` reference instead of data. This enables binary float encoding and CDN-based delivery, further reducing transfer size and Firestore read costs.

This is not urgent and should be revisited once the columnar subcollection approach is in place.

---

## Implementation Plan — `functions/src/index.ts`

### Step 1 — Add a `toLapColumns` helper

Add a function that transforms the incoming row-oriented `lapData` array into a columnar object. This is the only data transformation needed and should be kept separate from the write logic.

```ts
function toLapColumns(lapData: Record<string, number>[]): Record<string, number[]> {
  if (!lapData.length) return {};
  const keys = Object.keys(lapData[0]);
  const columns: Record<string, number[]> = {};
  for (const key of keys) {
    columns[key] = lapData.map((row) => row[key]);
  }
  return columns;
}
```

### Step 2 — Update `handleLap` to write columnar telemetry to a subcollection

In the `handleLap` function, after the lap document is created:

1. Remove `lapData` from `baseLapFields` (it should not go into the top-level document).
2. Write the columnar telemetry to `laps/{lapId}/telemetry/data` as a separate write.

**Current `baseLapFields`:**
```ts
const baseLapFields = {
  lapNumber: lapPayload.lapNumber,
  lapTime: lapPayload.lapTime,
  isValid: lapPayload.isValid,
  isPit: lapPayload.isPit,
  lapData: lapPayload.lapData,  // ← remove this
  driver, car, track, sessionTime, sessionType,
};
```

**Revised write sequence:**
```ts
const lapRef = firestore.collection("test_laps").doc();
await lapRef.set({ ...baseLapFields });

const columns = toLapColumns(lapPayload.lapData as Record<string, number>[]);
await lapRef.collection("telemetry").doc("data").set(columns);
```

### Step 3 — Update `LapPayload` type

Tighten the `lapData` type in `types.ts` from `object` to reflect the row-oriented input shape:

```ts
lapData: Record<string, number>[]
```

---

## Firestore document shapes after changes

### `test_laps/{lapId}` (top-level, metadata only)

| Field | Type | Notes |
|---|---|---|
| `lapNumber` | number | |
| `lapTime` | string | |
| `isValid` | boolean | |
| `isPit` | boolean | |
| `driver`, `car`, `track` | string | Denormalised |
| `sessionTime`, `sessionType` | string | Denormalised |
| `sessionId` | string? | State B laps only |
| `expiresAt` | Timestamp? | Standalone non-qualifying laps |

### `test_laps/{lapId}/telemetry/data` (subcollection, telemetry)

| Field | Type | Example |
|---|---|---|
| `t` | number[] | `[1000, 1048, ...]` |
| `d` | number[] | `[0, 1, 2, ...]` |
| `gas` | number[] | `[1.0, 0.98, ...]` |
| `brake` | number[] | `[0.0, 0.0, ...]` |
| `rpm` | number[] | `[3000, 3100, ...]` |
| *(other channels)* | number[] | One array per telemetry key |
