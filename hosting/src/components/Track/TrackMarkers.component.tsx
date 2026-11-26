import { useTheme } from "@mui/material";
import {
    TelemetryData,
    TrackMarkerVisibility,
    TrackMarkerSet,
} from "../../types";

interface Props {
    /** Marker sets of one lap; `markerVisibility` decides which are drawn. */
    markerSets: TrackMarkerSet[];
    markerVisibility: TrackMarkerVisibility;
    /** Lap the marker indices refer to; supplies track positions. */
    telemetryData: TelemetryData;
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    renderScale: number;
}

// Samples either side of the marker used to estimate the local track direction.
const DIRECTION_SPAN = 5;
// Bar size in world units; multiplied by renderScale so it zooms with the track.
const BAR_HALF_LENGTH = 7;
const BAR_WIDTH = 4;

export const TrackMarkers = ({
    markerSets,
    markerVisibility,
    telemetryData,
    xScale,
    yScale,
    renderScale,
}: Props) => {
    const { palette } = useTheme();
    const { posX, posZ } = telemetryData;
    if (!posX || !posZ) return null;

    // Perpendicular bar centred on the track position at `index`.
    // Direction is measured in pixel space so the bar stays perpendicular on screen.
    const getBar = (index: number, halfLength: number) => {
        const prev = Math.max(0, index - DIRECTION_SPAN);
        const next = Math.min(posX.length - 1, index + DIRECTION_SPAN);
        if (
            posX[index] == null ||
            posZ[index] == null ||
            posX[prev] == null ||
            posZ[prev] == null ||
            posX[next] == null ||
            posZ[next] == null
        )
            return null;

        const cx = xScale(posX[index]);
        const cy = yScale(posZ[index]);
        const dx = xScale(posX[next]) - xScale(posX[prev]);
        const dy = yScale(posZ[next]) - yScale(posZ[prev]);
        const len = Math.hypot(dx, dy) || 1;
        const nx = (-dy / len) * halfLength;
        const ny = (dx / len) * halfLength;
        return {
            cx,
            cy,
            line: { x1: cx - nx, y1: cy - ny, x2: cx + nx, y2: cy + ny },
        };
    };

    return (
        <>
            {markerSets
                .filter((set) => markerVisibility[set.markerType])
                .map(({ markerType, style, data }) =>
                    data.map((meter) => {
                        const centre = getBar(
                            meter,
                            BAR_HALF_LENGTH * (style.scale ?? 1) * renderScale,
                        );
                        if (!centre) return null;

                        return (
                            <g key={`${markerType}-${meter}`}>
                                <line
                                    {...centre.line}
                                    stroke={palette[style.color].main}
                                    strokeWidth={
                                        BAR_WIDTH *
                                        (style.scale ?? 1) *
                                        renderScale
                                    }
                                    strokeDasharray={
                                        style.dashed
                                            ? `${4 * renderScale}`
                                            : undefined
                                    }
                                />
                            </g>
                        );
                    }),
                )}
        </>
    );
};
