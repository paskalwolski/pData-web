import { useMemo } from "react";
import { TelemetryDataSet } from "../../types";
import { useTelemetryPointContext } from "../../context/useTelemetryPoint";
import { useTheme } from "@mui/material";
import { createInterceptor } from "../../hooks/useInterceptor";

interface Props {
    data: TelemetryDataSet;
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
}

const TelemetryCrosshair = ({ xScale, yScale, data }: Props) => {
    const { palette } = useTheme();
    const interceptor = createInterceptor(xScale, yScale, data);

    const { selectedIndex } = useTelemetryPointContext();

    const [xIntercept, yIntercept] = useMemo(
        () => interceptor(selectedIndex),
        [interceptor, selectedIndex],
    );

    return (
        <g>
            {selectedIndex && (
                <line
                    x1={yIntercept}
                    x2={yIntercept}
                    y1={yScale.range()[0]}
                    y2={yScale.range()[1]}
                    stroke={palette.info.light}
                    strokeWidth={2}
                    strokeOpacity={0.4}
                />
            )}
            {yIntercept && (
                <line
                    x1={xScale.range()[0]}
                    x2={xScale.range()[1]}
                    y1={xIntercept}
                    y2={xIntercept}
                    stroke={palette.info.light}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                />
            )}
            {xIntercept && (
                <circle
                    cx={yIntercept}
                    cy={xIntercept}
                    r={4}
                    fill={palette.info.dark}
                    fillOpacity={0.8}
                />
            )}
        </g>
    );
};

export { TelemetryCrosshair };
