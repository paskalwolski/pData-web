import { useMemo } from "react";
import { useTheme } from "@mui/material";
import { TelemetryData, TrackMarkerSet } from "../types";
import { detectApexes } from "../helpers/detectApexes";
import { detectFullThrottlePoints } from "../helpers/detectFullThrottlePoints";

// Stable reference for "no markers", so memoised consumers don't see a new array.
const NO_MARKERS: TrackMarkerSet[] = [];

/**
 * Every known marker set for a lap, each with its style:
 * - apex: corner apexes, a long thin blue bar along the track
 * - fullThrottle: full throttle point on corner exit, a green bar across the track
 * Data are telemetry indices (≈ metres along the lap).
 * The result keeps its identity until the telemetry or theme changes.
 */
const useTrackMarkers = (
    data: TelemetryData | undefined,
    isSecondary?: boolean,
): TrackMarkerSet[] => {
    const { palette } = useTheme();

    return useMemo(() => {
        if (!data) return NO_MARKERS;

        const apexes = detectApexes(data);

        return [
            {
                markerType: "apex",
                config: {
                    color: palette.blue.main,
                    scale: 1,
                    secondary: isSecondary,
                },
                data: apexes.map((apex) => apex.meter),
            },
            {
                markerType: "fullThrottle",
                config: {
                    color: palette.secondary.light,
                    scale: 1,
                    secondary: isSecondary,
                },
                data: detectFullThrottlePoints(data, apexes),
            },
        ];
    }, [data, palette, isSecondary]);
};

export { useTrackMarkers };
