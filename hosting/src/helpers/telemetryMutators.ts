import { TelemetryDataSet } from "../types";
import { round as mathRound } from "lodash";

export type TelemetryMutator = (data: TelemetryDataSet) => TelemetryDataSet;

const invert: TelemetryMutator = (data) => data.map((d) => -d);

const round: TelemetryMutator = (data) => data.map((d) => mathRound(d, 0));

/**
 * Centered moving average over `window` samples (1 sample = 1m).
 * Undefined samples stay undefined and are skipped when averaging;
 * the window shrinks at the edges of the series.
 */
const movingAverage =
    (window: number): TelemetryMutator =>
    (data) => {
        const half = Math.floor(window / 2);
        return data.map((d, i) => {
            if (d == null) return d;
            let sum = 0;
            let count = 0;
            const end = Math.min(data.length - 1, i + half);
            for (let j = Math.max(0, i - half); j <= end; j++) {
                const v = data[j];
                if (v == null) continue;
                sum += v;
                count++;
            }
            return sum / count;
        });
    };

export { invert, round, movingAverage };
