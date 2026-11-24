import { TelemetryData, TrackMarkerSet, TrackMarkerStyle } from "../types";
import { detectApexes } from "./detectApexes";
import { detectFullThrottlePoints } from "./detectFullThrottlePoints";

// Base look of each known marker set. Colour is filled in per lap.
const APEX_STYLE: Omit<TrackMarkerStyle, "color"> = {};
const FULL_THROTTLE_STYLE: Omit<TrackMarkerStyle, "color"> = {};

/**
 * Every known marker set for a lap, each with its style:
 * - apex: corner apexes
 * - fullThrottle: full throttle point on corner exit
 * Data are telemetry indices (≈ metres along the lap).
 */
const detectTrackMarkers = (
    data: TelemetryData | undefined,
    secondary?: boolean,
): TrackMarkerSet[] => {
    if (!data) return [];

    const color = secondary ? "secondary" : "primary";
    const apexes = detectApexes(data);

    return [
        {
            markerType: "apex",
            style: { ...APEX_STYLE, color },
            data: apexes.map((apex) => apex.meter),
        },
        {
            markerType: "fullThrottle",
            style: { ...FULL_THROTTLE_STYLE, color },
            data: detectFullThrottlePoints(data, apexes),
        },
    ];
};

export { detectTrackMarkers };
