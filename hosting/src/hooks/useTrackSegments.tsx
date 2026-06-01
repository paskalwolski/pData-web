import {
    prepareTrackDeltaSegments,
    prepareTrackPedalSegments,
} from "../helpers/trackSegmentors";
import { TelemetryData } from "../types";

const useTrackSegments = (
    data: TelemetryData,
    secondaryData?: TelemetryData,
    mode = "pedals",
) => {
    const trackPedalSegments = prepareTrackPedalSegments(data);
    const trackDeltaSegments = prepareTrackDeltaSegments(data, secondaryData);

    const selectedSegments =
        mode === "pedals"
            ? trackPedalSegments
            : mode === "delta"
              ? trackDeltaSegments
              : trackPedalSegments;

    return selectedSegments;
};

export { useTrackSegments };
