import { prepareTrackPedalSegments } from "../helpers/trackSegmentors";
import { TelemetryData } from "../types";

const useTrackSegments = (
    data: TelemetryData,
    secondaryData: TelemetryData,
    mode = "pedals",
) => {
    const trackPedalSegments = prepareTrackPedalSegments(data);

    const selectedSegments =
        mode === "pedals" ? trackPedalSegments : trackPedalSegments;

    return selectedSegments;
};

export { useTrackSegments };
