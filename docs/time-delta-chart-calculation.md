# Time Delta Chart — Calculation Methodology

## Overview

The Time Delta Chart compares two laps by computing, at each metre of the track, the cumulative time difference between the primary and secondary lap. The primary lap is the focal point: a **negative delta** means the primary is gaining time (faster), a **positive delta** means the primary is losing time (slower).

The chart splits the delta into two series — one for gaining sections and one for losing sections — so they can be coloured independently. The assignment of a point to a series is based on the **local trend** of the delta, not its instantaneous value.

---

## Input Data

`primaryLapData` and `secondaryLapData` are arrays indexed by **metre along the ideal track spline**. Each element is the cumulative lap time in **milliseconds** at that metre. The arrays are therefore the same length, one sample per metre.

---

## Step 1 — Raw Delta

For each metre `i`:

```
delta[i] = primaryLapData[i] − secondaryLapData[i]
```

A value of `undefined` is produced when either lap has no sample at that metre (gap in data). The first index (metre 0) is included but both values should be zero; in practice there is minor noise, which is handled by the smoothing steps below.

---

## Step 2 — Local Trend via Least Squares Regression

To avoid colouring based on point-by-point noise, the slope of the delta at each point is estimated using **Ordinary Least Squares (OLS) linear regression** over a centred window of ±`smoothingWindow` metres.

Only defined (non-`undefined`) values within the window are included. For a window of `n` valid samples with values `y₀…yₙ₋₁` at positions `0…n−1`:

```
Σx  = n(n−1)/2
Σx² = n(n−1)(2n−1)/6
Σy  = Σ yᵢ
Σxy = Σ i·yᵢ

slope = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)
```

The slope is in units of **ms per metre**. A negative slope means the gap is closing (primary gaining); a positive slope means the gap is widening (primary losing).

---

## Step 3 — Fitted Delta

Rather than plotting the raw delta, the chart plots the **fitted value from the regression line at the centre of the window**. This smooths out measurement noise while preserving the overall shape:

```
intercept   = (Σy − slope · Σx) / n
fittedDelta = slope · (n−1)/2 + intercept
```

When the window contains only one point (data edge), the raw delta is used as a fallback.

`rawData` (the unsmoothed deltas) is passed separately to the chart for use in the crosshair/tooltip, so the displayed value on hover reflects the true measured gap, not the smoothed one.

---

## Step 4 — Hysteresis (Polarity Stability)

On flat sections of the track where the delta barely changes, the slope oscillates around zero, causing rapid polarity flipping between the two series. To prevent this, a **hysteresis threshold** is applied:

- The current polarity (`lastDeltaNegative`) is only updated when `|slope| ≥ [Hysteresis Threshold] ms/m`.
- Below the threshold, the previous polarity is held.

This means a real trend change must be detectable (at least 0.1 ms of gap change per metre) before the colouring switches. The threshold is a tuning parameter — increase it to require a stronger signal before flipping, decrease it to be more reactive.

---

## Step 5 — Series Assignment and Boundary Continuity

Each fitted delta is pushed to one of two arrays:

| Condition | `negativeDelta` | `positiveDelta` |
|-----------|----------------|----------------|
| `lastDeltaNegative = true` (primary gaining) | `fittedDelta` | `undefined` |
| `lastDeltaNegative = false` (primary losing) | `undefined` | `fittedDelta` |

**Boundary points** (where polarity just flipped) are added to **both** arrays. This ensures the two chart lines share a common point at every transition, preventing visual gaps where one coloured segment ends and the other begins.

---

## Tuning Parameters

| Parameter | Location | Current Value | Effect |
|-----------|----------|---------------|--------|
| `smoothingWindow` | `TimeDeltaChart.tsx` | `20` | Half-width of regression window in metres. Larger = smoother slope, slower to react to real changes |
| Hysteresis threshold | `TimeDeltaChart.tsx` | `0.1 ms/m` | Minimum slope magnitude to trigger a polarity change. Larger = more stable colouring on flat sections |

Both values are approximate and should be revisited as the dataset and track sample density evolve.
