import { useCallback, useMemo } from "react";
import { TelemetryDataSet } from "../../types";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { useTheme } from "@mui/material";

interface Props {
    data: TelemetryDataSet;
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
}

const TelemetryInterceptor = ({ xScale, yScale, data }: Props) => {
    const { palette } = useTheme();
    const createYInterceptor = useCallback(
        (dataSet: TelemetryDataSet) => (x: number | undefined) =>
            yScale(dataSet[x]),
        [yScale],
    );

    const primaryInterceptor = createYInterceptor(data);

    const { selectedIndex } = useTelemetryPointContext();

    const primaryIntercept = useMemo(
        () => primaryInterceptor(selectedIndex),
        [primaryInterceptor, selectedIndex],
    );

    return (
        <g>
            {selectedIndex && (
                <line
                    x1={xScale(selectedIndex)}
                    x2={xScale(selectedIndex)}
                    y1={yScale.range()[0]}
                    y2={yScale.range()[1]}
                    stroke={palette.info.dark}
                    strokeWidth={2}
                />
            )}
            {primaryIntercept && (
                <circle
                    cx={xScale(selectedIndex)}
                    cy={primaryIntercept}
                    r={4}
                    fill={palette.info.dark}
                    fillOpacity={0.8}
                />
            )}
        </g>
    );
};

export { TelemetryInterceptor };
