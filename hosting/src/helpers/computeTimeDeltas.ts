import { TelemetryData, TelemetryDataSet, TrackSegmentType } from "../types";

const computeSmoothedDeltas = (
    primaryData: TelemetryData,
    secondaryData: TelemetryData,
): [TelemetryDataSet, TelemetryDataSet] => {
    /* Calculate the raw timeDelta values per index for an entire TelemetryData bundle */
    const smoothingWindow = 15;

    const rawDeltas = primaryData.lapTime.map((t, i) => {
        const t2 = secondaryData.lapTime[i];
        const delta = t != undefined && t2 != undefined ? t - t2 : undefined;
        return delta;
    });
    const slopeValues: Array<number> = [];
    const smoothedValues = rawDeltas.map((delta, i) => {
        const window = rawDeltas
            .slice(
                Math.max(0, i - smoothingWindow),
                Math.min(rawDeltas.length, i + smoothingWindow),
            )
            .filter((v): v is number => v != null);
        // Least Squares Regression for slope at this area
        const n = window.length;
        const sumX = (n * (n - 1)) / 2;
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        const sumY = window.reduce((acc, d) => acc + d, 0);
        const sumXY = window.reduce((acc, d, i) => acc + i * d, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        const fittedDelta = n > 1 ? slope * ((n - 1) / 2) + intercept : delta;
        slopeValues.push(slope);
        return fittedDelta;
    });

    return [smoothedValues, slopeValues] as const;
};

const computeDeltaSegmentBounds = (
    deltaSetSlopes: TelemetryDataSet,
    threshold: number = 0.3,
): Record<TrackSegmentType, Array<[number, number]>> => {
    let lastSegmentType: TrackSegmentType = "positive";
    let currentSegmentStart: number = 0;
    const segments: Record<TrackSegmentType, Array<[number, number]>> = {
        negative: [],
        positive: [],
        neutral: [],
    };

    deltaSetSlopes.forEach((d, i) => {
        const currentSegmentType: TrackSegmentType =
            Math.abs(d) < threshold
                ? lastSegmentType
                : d > threshold
                  ? "negative"
                  : "positive";

        if (currentSegmentType !== lastSegmentType) {
            segments[lastSegmentType].push([currentSegmentStart, i]);
            lastSegmentType = currentSegmentType;
            currentSegmentStart = i;
            return;
        }
    });
    if (currentSegmentStart !== deltaSetSlopes.length - 1) {
        segments[lastSegmentType].push([
            currentSegmentStart,
            deltaSetSlopes.length - 1,
        ]);
    }
    return segments;
};

export { computeSmoothedDeltas, computeDeltaSegmentBounds };
