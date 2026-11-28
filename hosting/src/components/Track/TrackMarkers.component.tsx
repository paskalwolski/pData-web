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
// Base marker size in world units; multiplied by the style's scale and by renderScale
// so markers zoom with the track.
const BAR_LENGTH = 26;
const BAR_WIDTH = 4;

export const TrackMarkers = ({
    markerSets,
    markerVisibility,
    telemetryData,
    xScale,
    yScale,
    renderScale,
}: Props) => {
    const { posX, posZ } = telemetryData;
    if (!posX || !posZ) return null;

    // Centre and on-screen unit direction across the track (perpendicular to it) at the
    // track position `index`. Measured in pixel space so the bar stays perpendicular on screen.
    const getBar = (index: number) => {
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
        return { cx, cy, ux: -dy / len, uy: dx / len };
    };

    return (
        <>
            {markerSets
                .filter((set) => markerVisibility[set.markerType])
                .map(({ markerType, config, data }) =>
                    data.map((meter) => {
                        const bar = getBar(meter);
                        if (!bar) return null;

                        const size = (config.scale ?? 1) * renderScale;
                        const ax = (bar.ux * BAR_LENGTH * size) / 2;
                        const ay = (bar.uy * BAR_LENGTH * size) / 2;

                        return (
                            <line
                                key={`${markerType}-${meter}`}
                                x1={bar.cx - ax}
                                y1={bar.cy - ay}
                                x2={bar.cx + ax}
                                y2={bar.cy + ay}
                                stroke={config.color}
                                strokeWidth={BAR_WIDTH * renderScale}
                                strokeLinecap={
                                    config.secondary ? "round" : undefined
                                }
                                strokeDasharray={
                                    config.secondary
                                        ? `${0} ${6 * renderScale}`
                                        : undefined
                                }
                            />
                        );
                    }),
                )}
        </>
    );
};
