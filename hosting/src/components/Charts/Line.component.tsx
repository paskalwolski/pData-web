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
            const points = data
                .map((v, i) => ({ i, v }))
                .filter(
                    (p): p is { i: number; v: number } =>
                        p.v !== undefined && p.v !== null,
                );

            let d = d3
                .line<{ i: number; v: number }>()
                .x((p) => xScale(p.i))
                .y((p) => yScale(p.v));
            if (!stepped) {
                d = d.curve(d3.curveCatmullRom);
            }
            return d(points);
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
