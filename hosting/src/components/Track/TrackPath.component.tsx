import * as d3 from "d3";
import React from "react";

interface DataPoint {
    posX: number | undefined;
    posZ: number | undefined;
    gas: number | undefined;
    brake: number | undefined;
}

interface Props {
    data: DataPoint[];
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
}

const TrackPath = React.memo(({ data, xScale, yScale }: Props) => {
    const lineGenerator = d3
        .line<DataPoint>()
        .defined((d) => d.posX !== undefined && d.posZ !== undefined)
        .x((d) => xScale(d.posX!))
        .y((d) => yScale(d.posZ!))
        .curve(d3.curveCatmullRom);

    return (
        <g>
            {data.map((d, i) => {
                if (i === data.length - 1) return null;
                return (
                    <path
                        key={`track-path-${i}`}
                        d={lineGenerator([d, data[i + 1]]) ?? undefined}
                        fill="none"
                        stroke="white"
                        strokeWidth={2}
                    />
                );
            })}
        </g>
    );
});

export { TrackPath };
