import { useTheme } from "@mui/material";
import * as d3 from "d3";
import React, { useMemo } from "react";

interface ScatterData {
    x: number;
    y: number | undefined;
    z: string;
}

interface ScatterProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    data: ScatterData[];
}

const Scatter = React.memo(({ data, xScale, yScale }: ScatterProps) => {
    const { palette } = useTheme();
    const scatterGroup = useMemo(
        () =>
            data.map((d) => (
                <circle
                    key={`${d.x}-${d.y}`}
                    r={5}
                    cx={xScale(d.x)}
                    cy={yScale(d.y)}
                    fill={d.z ?? palette.primary.dark}
                />
            )),
        [data, xScale, yScale, palette.primary.dark],
    );

    return scatterGroup;
});

export { Scatter };
