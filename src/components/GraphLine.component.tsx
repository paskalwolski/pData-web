import * as d3 from "d3";
import React, { useEffect } from "react";

const GraphLine = React.memo(({ target, xScale, yScale }) => {
    const lineGenerator = () => {
        return d3
            .line()
            .x((d) => xScale(Number(Number(d.distance).toFixed(0))))
            .y((d) => yScale(d[target.target]))(target.data);
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
