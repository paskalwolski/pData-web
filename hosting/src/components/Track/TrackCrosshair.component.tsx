import { useTheme } from "@mui/material";
import { TelemetryData } from "../../types";
import { useTelemetryPointContext } from "../../context/useTelemetryPoint";
import { useCallback } from "react";

interface Props {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    telemetryData: TelemetryData;
}

export const TrackCrosshair = ({ xScale, yScale, telemetryData }: Props) => {
    const { palette } = useTheme();
    const { selectedIndex } = useTelemetryPointContext();

    const calculatePosition = useCallback(
        (i?: number) => {
            if (i === undefined) {
                return [undefined, undefined];
            }
            return [
                xScale(telemetryData.posX[i]),
                yScale(telemetryData.posZ[i]),
            ];
        },
        [telemetryData, xScale, yScale],
    );

    const [posX, posY] = calculatePosition(selectedIndex);

    if (posX === undefined || posY === undefined) return null;

    const [xMin, xMax] = xScale.range();
    const [yMin, yMax] = yScale.range();

    return (
        <>
            <line
                x1={posX}
                y1={yMin}
                x2={posX}
                y2={yMax}
                stroke={palette.info.light}
                strokeWidth={1}
                strokeOpacity={0.4}
            />
            <line
                x1={xMin}
                y1={posY}
                x2={xMax}
                y2={posY}
                stroke={palette.info.light}
                strokeWidth={1}
                strokeOpacity={0.4}
            />
            <circle r={4} fill={palette.info.light} cx={posX} cy={posY} />
        </>
    );
};
