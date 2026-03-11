// @ts-nocheck
import * as d3 from "d3";
import React, { useEffect } from "react";

const GraphLine = React.memo(({ target, xScale, yScale, stepped }) => {
    const lineGenerator = () => {
        let d = d3
            .line()
            .x((d) => xScale(d.distance))
            .y((d) => yScale(d[target.target]));
        if (!stepped) {
            d = d.curve(d3.curveCatmullRom);
        }
        return d(target.data);
    };

    return (
        <path
            d={lineGenerator()}
            stroke={target.color}
            strokeWidth={2}
            strokeDasharray={target.secondary ? "5 2" : "0"}
            fill="none"
        />
    );
});

export default GraphLine;
