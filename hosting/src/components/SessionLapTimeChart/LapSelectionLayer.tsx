import { useCallback } from "react";
import * as d3 from "d3";
import { useTheme } from "@mui/material";
import { LapInfo } from "../../types";

interface VisibleLap extends LapInfo {
    i: number;
    color: string;
}

interface Props {
    laps: VisibleLap[];
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    width: number;
    height: number;
    padding: number;
    selectedLap: VisibleLap | undefined;
    hoverLap?: VisibleLap;
    onSelect: (lap: VisibleLap | undefined) => void;
}

const nearestLap = (laps: VisibleLap[], index: number) =>
    laps.reduce<VisibleLap | undefined>(
        (closest, lap) =>
            closest === undefined ||
            Math.abs(lap.i - index) < Math.abs(closest.i - index)
                ? lap
                : closest,
        undefined,
    );

const LapSelectionLayer = ({
    laps,
    xScale,
    yScale,
    width,
    height,
    padding,
    selectedLap,
    hoverLap,
    onSelect,
}: Props) => {
    const { palette } = useTheme();

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const index = Math.round(xScale.invert(d3.pointer(e)[0]));
            onSelect(nearestLap(laps, index));
        },
        [laps, xScale, onSelect],
    );

    const handleMouseLeave = useCallback(
        () => onSelect(undefined),
        [onSelect],
    );

    return (
        <>
            {hoverLap && hoverLap.i !== selectedLap?.i && (
                <>
                    <line
                        x1={xScale(hoverLap.i)}
                        x2={xScale(hoverLap.i)}
                        y1={padding}
                        y2={height - padding}
                        stroke={palette.text.secondary}
                        strokeDasharray="4 2"
                    />
                    <circle
                        r={6}
                        cx={xScale(hoverLap.i)}
                        cy={yScale(hoverLap.lapTime)}
                        fill="none"
                        stroke={palette.text.secondary}
                        strokeWidth={2}
                    />
                </>
            )}
            {selectedLap && (
                <>
                    <line
                        x1={xScale(selectedLap.i)}
                        x2={xScale(selectedLap.i)}
                        y1={padding}
                        y2={height - padding}
                        stroke={palette.text.secondary}
                        strokeDasharray="4 2"
                    />
                    <circle
                        r={6}
                        cx={xScale(selectedLap.i)}
                        cy={yScale(selectedLap.lapTime)}
                        fill="none"
                        stroke={palette.text.primary}
                        strokeWidth={2}
                    />
                </>
            )}
            <rect
                style={{ pointerEvents: "all", cursor: "crosshair" }}
                fill="none"
                height={height}
                width={width}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            />
        </>
    );
};

export { LapSelectionLayer };
export type { VisibleLap };
