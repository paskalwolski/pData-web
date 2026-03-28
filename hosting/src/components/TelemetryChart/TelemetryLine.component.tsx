import * as d3 from "d3";
import React from "react";

interface TelemetryLineProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    stepped?: boolean;
    data: Array<number | undefined>;
}
const TelemetryLine = React.memo(
    ({ data, xScale, yScale, stepped }: TelemetryLineProps) => {
        const lineGenerator = () => {
            let d = d3
                .line<number | undefined>()
                .defined((d) => !!d)
                .x((d, i) => (d ? xScale(i) : undefined))
                .y((d) => (d ? yScale(d) : undefined));
            if (!stepped) {
                d = d.curve(d3.curveCatmullRom);
            }
            return d(data);
        };

        return (
            <path
                d={lineGenerator()}
                stroke="steelblue"
                strokeWidth={2}
                strokeDasharray={"0"}
                fill="none"
            />
        );
    },
);

export { TelemetryLine };
