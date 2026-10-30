import { TelemetryData, TrackDisplayMode } from "../types";
import { detectApexes } from "./detectApexes";
import { detectFullThrottlePoints } from "./detectFullThrottlePoints";

/**
 * Telemetry indices (≈ metres along the lap) to mark on the track for the given mode.
 * - lines: corner apexes
 * - pedals: full throttle point on corner exit
 */
const detectTrackMarkers = (
    data: TelemetryData | undefined,
    displayMode: TrackDisplayMode,
): number[] => {
    if (!data) return [];
    switch (displayMode) {
        case "lines":
            return detectApexes(data).map((apex) => apex.meter);
        case "pedals":
            return detectFullThrottlePoints(data, detectApexes(data));
        default:
            return [];
    }
};

export { detectTrackMarkers };
