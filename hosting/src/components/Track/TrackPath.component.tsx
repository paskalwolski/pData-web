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
    const lineGenerator = () =>
        d3
            .line<DataPoint>()
            .defined((d) => !!d && d.posX != null && d.posZ != null)
            .x((d) => xScale(d.posX))
            .y((d) => yScale(d.posZ))
            .curve(d3.curveLinear)(data);

    return (
        <g>
            <path
                d={lineGenerator()}
                fill="none"
                stroke="steelblue"
                strokeWidth={2}
            />
        </g>
    );
});

export { TrackPath };
