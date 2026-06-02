import {
    prepareTrackDeltaSegments,
    prepareTrackPedalSegments,
} from "../helpers/trackSegmentors";
import { TelemetryData, TrackDisplayMode, TrackSegment } from "../types";

const useTrackSegments = (
    data: TelemetryData,
    secondaryData?: TelemetryData,
    mode: TrackDisplayMode = "pedals",
) => {
    const segmentData: Record<TrackDisplayMode, TrackSegment[] | undefined> = {
        pedals: prepareTrackPedalSegments(data),
        delta: prepareTrackDeltaSegments(data, secondaryData),
        lines: null,
    };

    const displayVariant = mode === "lines" ? "plain" : "segments";

    return [displayVariant, segmentData[mode]] as const;
};

export { useTrackSegments };
