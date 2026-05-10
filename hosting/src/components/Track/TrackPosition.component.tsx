import { useTheme } from "@mui/material";
import { TelemetryData } from "../../types";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { useCallback } from "react";

interface Props {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    telemetryData: TelemetryData;
}

export const TrackPosition = ({ xScale, yScale, telemetryData }: Props) => {
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
    return <circle r={4} fill={palette.primary.dark} cx={posX} cy={posY} />;
};
