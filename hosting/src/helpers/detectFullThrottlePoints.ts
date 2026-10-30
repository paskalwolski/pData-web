import { Apex, TelemetryData } from "../types";

// === TUNABLES ===
/** Gas at or above this (0–1) counts as full throttle. */
const FULL_THROTTLE_THRESHOLD = 0.98;
/** Full throttle must be held this many samples (≈ metres) to count, filtering blips. */
const MIN_HOLD_LENGTH = 20;
// === END TUNABLES ===

const isFullThrottle = (data: TelemetryData, i: number) =>
    (data.gas?.[i] ?? 0) >= FULL_THROTTLE_THRESHOLD;

/**
 * For each apex, find the first point after it where the driver commits to
 * (and holds) full throttle, searching up to the next apex.
 * Returns telemetry indices (≈ metres along the lap).
 */
const detectFullThrottlePoints = (
    data: TelemetryData,
    apexes: Apex[],
): number[] => {
    if (!data?.gas?.length) return [];
    const length = data.gas.length;
    const points: number[] = [];

    apexes.forEach((apex, k) => {
        // Flat-out corners: no throttle application to mark.
        let flatOut = true;
        for (let i = apex.startMeter; i <= apex.endMeter; i++) {
            if (!isFullThrottle(data, i)) {
                flatOut = false;
                break;
            }
        }
        if (flatOut) return;

        const searchEnd = apexes[k + 1]?.meter ?? length;
        let runStart = -1;
        for (let i = apex.meter; i < searchEnd; i++) {
            if (!isFullThrottle(data, i)) {
                runStart = -1;
                continue;
            }
            if (runStart === -1) runStart = i;
            if (i - runStart + 1 >= MIN_HOLD_LENGTH) {
                points.push(runStart);
                return;
            }
        }
    });

    return points;
};

export { detectFullThrottlePoints };
