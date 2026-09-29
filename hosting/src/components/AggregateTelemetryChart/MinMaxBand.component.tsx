import * as d3 from "d3";
import React, { useMemo } from "react";
import { useTheme } from "@mui/material";
import { TelemetryDataSet } from "../../types";

interface MinMaxBandProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    minSeries: TelemetryDataSet;
    maxSeries: TelemetryDataSet;
}

const MinMaxBand = React.memo(
    ({ xScale, yScale, minSeries, maxSeries }: MinMaxBandProps) => {
        const { palette } = useTheme();

        const areaPath = useMemo(() => {
            const points = minSeries
                .map((min, i) => ({ i, min, max: maxSeries[i] }))
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
        }, [minSeries, maxSeries, xScale, yScale]);

        return (
            <path
                d={areaPath}
                fill={palette.blue.main}
                stroke="none"
                fillOpacity={0.4}
            />
        );
    },
);

export { MinMaxBand };
