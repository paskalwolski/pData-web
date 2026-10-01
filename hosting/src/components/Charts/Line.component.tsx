import * as d3 from "d3";
import React, { useMemo } from "react";

interface LineProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    stepped?: boolean;
    data: Array<number | undefined>;
    color: string;
    dashed?: boolean;
    /** When true, gaps (undefined/null values) are not connected. Defaults to false (connect over gaps). */
    gapped?: boolean;
}

const Line = React.memo(
    ({
        data,
        xScale,
        yScale,
        stepped = false,
        color,
        dashed = false,
        gapped = false,
    }: LineProps) => {
        const line = useMemo(() => {
            let points: { i: number; v: number | undefined }[];
            let defined: (p: { i: number; v: number | undefined }) => boolean;
            if (gapped) {
                points = data.map((v, i) => ({ i, v }));
                defined = (p) => p.v !== undefined && p.v !== null;
            } else {
                points = data
                    .map((v, i) => ({ i, v }))
                    .filter((p) => p.v !== undefined && p.v !== null);
                defined = () => true;
            }

            let d = d3
                .line<{ i: number; v: number | undefined }>()
                .defined(defined)
                .x((p) => xScale(p.i))
                .y((p) => yScale(p.v as number));
            if (!stepped) {
                d = d.curve(d3.curveCatmullRom);
            }
            return d(points);
        }, [data, stepped, xScale, yScale, gapped]);

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
