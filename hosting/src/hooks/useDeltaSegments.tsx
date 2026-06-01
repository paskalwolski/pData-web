import { useMemo } from "react";
import { TelemetryData, TelemetryDataSet } from "../types";
import {
    computeDeltaSegmentBounds,
    computeSmoothedDeltas,
} from "../helpers/computeTimeDeltas";
import { mapValues } from "lodash";

const useChartDeltaSegments = (
    primaryData: TelemetryData,
    secondaryData: TelemetryData,
) => {
    const [smoothedDeltas, smoothedDeltaSlopes] = useMemo(
        () => computeSmoothedDeltas(primaryData, secondaryData),
        [primaryData, secondaryData],
    );
    const segmentBounds = useMemo(
        () => computeDeltaSegmentBounds(smoothedDeltaSlopes),
        [smoothedDeltaSlopes],
    );
    const segmentData = mapValues(segmentBounds, (segmentChunks) => {
        const segment: TelemetryDataSet = Array(smoothedDeltas.length).fill(
            undefined,
        );
        segmentChunks.map(([segmentStart, segmentEnd]) =>
            smoothedDeltas
                .slice(segmentStart, segmentEnd + 1)
                .forEach((d, i) => (segment[segmentStart + i] = d)),
        );
        return segment;
    });

    return [smoothedDeltas, segmentData] as const;
};

export { useChartDeltaSegments };
