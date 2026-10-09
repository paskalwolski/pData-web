import { Apex, TelemetryData, TelemetryDataSet } from "../types";

// === TUNABLES ===
// Edit these inline to explore how apex detection behaves.

/** Moving-average window (samples ≈ metres) applied to steer before detection. */
const SMOOTHING_WINDOW = 9;
/** A turn starts when |steer| rises above this (degrees). */
const ENTER_THRESHOLD = 20;
/** A turn ends when |steer| falls below this (the "returned to zero" point, degrees). */
const EXIT_THRESHOLD = 8;
/** Turns shorter than this (samples) are treated as corrections and dropped. */
const MIN_TURN_LENGTH = 15;
/** Two peaks only count separately if the dip between them is at least this deep (degrees). */
const PEAK_PROMINENCE = 15;
/** Minimum distance (samples) between two apexes inside one turn. */
const MIN_PEAK_SEPARATION = 80;
// === END TUNABLES ===

const fillGaps = (data: TelemetryDataSet): number[] => {
    const out: number[] = new Array(data.length).fill(0);
    let lastIdx = -1;
    for (let i = 0; i < data.length; i++) {
        const v = data[i];
        if (v === undefined || v === null || Number.isNaN(v)) continue;
        if (lastIdx === -1) {
            for (let j = 0; j < i; j++) out[j] = v;
        } else {
            for (let j = lastIdx + 1; j < i; j++) {
                out[j] =
                    out[lastIdx] +
                    ((v - out[lastIdx]) * (j - lastIdx)) / (i - lastIdx);
            }
        }
        out[i] = v;
        lastIdx = i;
    }
    if (lastIdx !== -1) {
        for (let j = lastIdx + 1; j < data.length; j++) out[j] = out[lastIdx];
    }
    return out;
};

const movingAverage = (values: number[], window: number): number[] => {
    if (window <= 1) return values;
    const half = Math.floor(window / 2);
    const prefix = [0];
    for (const v of values) prefix.push(prefix[prefix.length - 1] + v);
    return values.map((_, i) => {
        const lo = Math.max(0, i - half);
        const hi = Math.min(values.length - 1, i + half);
        return (prefix[hi + 1] - prefix[lo]) / (hi - lo + 1);
    });
};

interface Turn {
    start: number;
    end: number;
}

const findTurns = (abs: number[]): Turn[] => {
    const turns: Turn[] = [];
    let current: Turn | null = null;

    const close = (endIdx: number) => {
        if (current && endIdx - current.start + 1 >= MIN_TURN_LENGTH) {
            turns.push({ ...current, end: endIdx });
        }
        current = null;
    };

    for (let i = 0; i < abs.length; i++) {
        if (current && abs[i] < EXIT_THRESHOLD) close(i - 1);
        if (!current && abs[i] > ENTER_THRESHOLD) {
            current = { start: i, end: i };
        }
    }
    if (current) close(abs.length - 1);
    return turns;
};

/** Local maxima of |s| within a turn (first sample of any plateau). */
const findPeaks = (abs: number[], start: number, end: number): number[] => {
    const peaks: number[] = [];
    for (let i = start; i <= end; i++) {
        const left = i > start ? abs[i - 1] : -Infinity;
        const right = i < end ? abs[i + 1] : -Infinity;
        if (abs[i] > left && abs[i] >= right) peaks.push(i);
    }
    return peaks;
};

/** Repeatedly drop the smaller of any neighbouring peak pair that is too shallow or too close. */
const filterPeaks = (abs: number[], peaks: number[]): number[] => {
    const result = [...peaks];
    let changed = true;
    while (changed && result.length > 1) {
        changed = false;
        for (let k = 0; k < result.length - 1; k++) {
            const a = result[k];
            const b = result[k + 1];
            const dip = Math.min(...abs.slice(a, b + 1));
            const shallow = Math.min(abs[a], abs[b]) - dip < PEAK_PROMINENCE;
            const close = b - a < MIN_PEAK_SEPARATION;
            if (shallow || close) {
                result.splice(abs[a] >= abs[b] ? k + 1 : k, 1);
                changed = true;
                break;
            }
        }
    }
    return result;
};

const detectApexes = (data: TelemetryData): Apex[] => {
    if (!data?.steer?.length) return [];

    // 1. Clean: interpolate missing samples, then smooth out jitter.
    const s = movingAverage(fillGaps(data.steer), SMOOTHING_WINDOW);

    // 2. Direction is irrelevant: work with steering magnitude (degrees) only.
    const abs = s.map(Math.abs);

    // 3. Split the lap into turns (ENTER/EXIT thresholds, min length),
    //    then within each turn find local peaks of |steer| and prune
    //    shallow / too-close ones. Each surviving peak is an apex; it
    //    inherits its turn's start/end.
    return findTurns(abs).flatMap((turn) =>
        filterPeaks(abs, findPeaks(abs, turn.start, turn.end)).map(
            (meter): Apex => ({
                meter,
                peak: abs[meter],
                startMeter: turn.start,
                endMeter: turn.end,
            }),
        ),
    );
};

export { detectApexes };
