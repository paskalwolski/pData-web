import { useTheme } from "@mui/material";
import { TelemetryData } from "../../types";

interface Props {
    /** Telemetry indices (≈ metres along the lap) to mark. */
    markers: number[];
    telemetryData: TelemetryData;
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    renderScale: number;
    secondary?: boolean;
}

// Samples either side of the marker used to estimate the local track direction.
const DIRECTION_SPAN = 5;
// Bar size in world units; multiplied by renderScale so it zooms with the track.
const BAR_HALF_LENGTH = 7;
const BAR_WIDTH = 4;

export const TrackMarkers = ({
    markers,
    telemetryData,
    xScale,
    yScale,
    renderScale,
    secondary = false,
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
            {markers.map((meter) => {
                const centre = getBar(meter, BAR_HALF_LENGTH * renderScale);
                if (!centre) return null;
                const colour = secondary
                    ? palette.secondary.main
                    : palette.primary.main;

                return (
                    <g key={meter}>
                        <line
                            {...centre.line}
                            stroke={colour}
                            strokeWidth={BAR_WIDTH * renderScale}
                        />
                    </g>
                );
            })}
        </>
    );
};
