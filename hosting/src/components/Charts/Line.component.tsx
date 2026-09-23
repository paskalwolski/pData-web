import * as d3 from "d3";
import React, { useMemo } from "react";

interface LineProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    stepped?: boolean;
    data: Array<number | undefined>;
    color: string;
    dashed?: boolean;
}

const Line = React.memo(
    ({
        data,
        xScale,
        yScale,
        stepped = false,
        color,
        dashed = false,
    }: LineProps) => {
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
                stroke={color}
                strokeWidth={2}
                strokeDasharray={dashed ? "5 2" : "0"}
                fill="none"
            />
        );
    },
);

export { Line };
