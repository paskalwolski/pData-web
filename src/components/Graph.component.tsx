import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";

const Graph = ({
    targets,
    selectedLap,
    selectedPoint,
    setSelectedPoint,
    ...props
}) => {
    const height = 200;
    const width = 500;
    const [focusPos, setFocusPos] = useState(null);
    const [focusVisible, setFocusVisible] = useState(false);

    // const colour = props?.colour ?? "steelblue";

    // Create the list of domains
    const yDomainList = targets.map((g) =>
        d3.extent(selectedLap.lap_data, (data) => data[g.target])
    );
    // Find the min/max
    const domain = useMemo(
        () =>
            yDomainList.reduce((d, bounds) => {
                return [d3.min([d[0], bounds[0]]), d3.max([d[1], bounds[1]])];
            }),
        [selectedLap.lap_number]
    );

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(
                    d3.extent(selectedLap.lap_data, (data) => data.distance)
                )
                .range([0, width]),
        [selectedLap.lap_number]
    );

    const bufferedDomain = [domain[0] * 0.8, domain[1] * 1.1]; // Expand by ~10%
    const yScale = d3
        .scaleLinear()
        // .domain([0, maxSpeed])
        .domain(bufferedDomain)
        .range([height, 0]);

    const lineGenerator = (target) =>
        d3
            .line()
            .x((d) => xScale(Number(Number(d.distance).toFixed(0))))
            .y((d) => yScale(d[target]))(selectedLap.lap_data);

    const handleMouseMove = (e) => {
        const x0 = xScale.invert(d3.pointer(e)[0]);
        const i = d3.bisector((d) => d.distance).left(selectedLap.lap_data, x0);
        setSelectedPoint(i);
    };
    const handleMouseLeave = () => {
        setSelectedPoint(null);
    };

    const graphDistance =
        // Find the x value for this point
        selectedPoint
            ? xScale(selectedLap.lap_data[selectedPoint].distance)
            : 0;
    const getGraphValue = (target) => {
        // find the y value for this target type
        return yScale(selectedLap.lap_data[selectedPoint][target]);
    };

    return (
        <div>
            <svg width={width} height={height}>
                {targets.map((g) => {
                    return (
                        <path
                            d={lineGenerator(g.target)}
                            stroke={g.color ?? "steelblue"}
                            strokeWidth={2}
                            fill="none"
                        />
                    );
                })}
                <g>
                    {selectedPoint && (
                        <g>
                            <line
                                x1={graphDistance}
                                x2={graphDistance}
                                y1={yScale.range()[0]}
                                y2={yScale.range()[1]}
                                stroke="red"
                                strokeWidth={2}
                            />
                            {targets.map((g) => {
                                return (
                                    <circle
                                        cx={graphDistance}
                                        cy={getGraphValue(g.target)}
                                        opacity={1}
                                        r={3}
                                        stroke={g.color ?? "steelblue"}
                                        strokeWidth={2}
                                        fill="none"
                                    />
                                );
                            })}
                        </g>
                    )}
                    <rect
                        style={{ pointerEvents: "all" }}
                        fill="none"
                        height={height}
                        width={width}
                        // onMouseEnter={handleMouseEnter}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />
                </g>
            </svg>
        </div>
    );
};
export default Graph;
