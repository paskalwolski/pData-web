import { useTheme } from "@mui/material";
import * as d3 from "d3";
import React from "react";
import { Line } from "../Charts";

interface TelemetryLineProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    stepped?: boolean;
    data: Array<number | undefined>;
    secondary?: boolean;
    color?: string;
}
const TelemetryLine = React.memo(
    ({
        data,
        xScale,
        yScale,
        stepped = false,
        secondary = false,
        color,
    }: TelemetryLineProps) => {
        const { palette } = useTheme();

        const resolvedColor =
            color ??
            (secondary ? palette.secondary.dark : palette.primary.dark);

        return (
            <Line
                data={data}
                xScale={xScale}
                yScale={yScale}
                stepped={stepped}
                color={resolvedColor}
                dashed={secondary}
            />
        );
    },
);

export { TelemetryLine };
