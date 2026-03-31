import { useTheme } from "@mui/material";
import * as d3 from "d3";
import React, { useMemo } from "react";

interface TelemetryLineProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    stepped?: boolean;
    data: Array<number | undefined>;
    secondary?: boolean;
}
const TelemetryLine = React.memo(
    ({
        data,
        xScale,
        yScale,
        stepped = false,
        secondary = false,
    }: TelemetryLineProps) => {
        const { palette } = useTheme();

        const line = useMemo(() => {
            let d = d3
                .line<number | undefined>()
                .defined((d) => d !== undefined && d !== null)
                .x((_, i) => xScale(i))
                .y((d) => yScale(d as number));
            if (!stepped) {
                d = d.curve(d3.curveCatmullRom);
            }
            return d(data);
        }, [data, stepped, xScale, yScale]);

        return (
            <path
                d={line}
                stroke={
                    secondary ? palette.secondary.dark : palette.primary.dark
                }
                strokeWidth={2}
                strokeDasharray={secondary ? "5 2" : "0"}
                fill="none"
            />
        );
    },
);

export { TelemetryLine };
