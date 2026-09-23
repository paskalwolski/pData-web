import { useTheme } from "@mui/material";
import * as d3 from "d3";
import React, { useMemo } from "react";

interface ScatterProps {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    data: Array<number | undefined>;
    color?: string;
}

const Scatter = React.memo(({ data, xScale, yScale, color }: ScatterProps) => {
    const { palette } = useTheme();
    const scatterGroup = useMemo(
        () =>
            data.map((d, i) => (
                <circle
                    key={i}
                    r={5}
                    cx={xScale(i)}
                    cy={yScale(d)}
                    fill={color ?? palette.primary.dark}
                />
            )),
        [data, xScale, yScale, color, palette.primary.dark],
    );

    return scatterGroup;
});

export { Scatter };
