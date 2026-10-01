import * as d3 from "d3";
import React, { useMemo } from "react";
import { TelemetryDataSet } from "../../types";

interface BandProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    min: TelemetryDataSet;
    max: TelemetryDataSet;
    color: string;
    opacity?: number;
}

const Band = React.memo(
    ({ xScale, yScale, min, max, color, opacity = 0.4 }: BandProps) => {
        const areaPath = useMemo(() => {
            const points = min
                .map((lo, i) => ({ i, min: lo, max: max[i] }))
                .filter(
                    (p): p is { i: number; min: number; max: number } =>
                        p.min !== undefined &&
                        p.min !== null &&
                        p.max !== undefined &&
                        p.max !== null,
                );

            const area = d3
                .area<{ i: number; min: number; max: number }>()
                .x((p) => xScale(p.i))
                .y0((p) => yScale(p.min))
                .y1((p) => yScale(p.max))
                .curve(d3.curveCatmullRom);

            return area(points);
        }, [min, max, xScale, yScale]);

        return (
            <path
                d={areaPath}
                fill={color}
                stroke="none"
                fillOpacity={opacity}
            />
        );
    },
);

export { Band };
