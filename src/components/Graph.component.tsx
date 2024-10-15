import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";

const Graph = ({
    targets,
    primaryLap,
    secondaryLap,
    selectedPoint,
    setSelectedPoint,
    ...props
}) => {
    const height = 200;
    const width = 500;

    const graphData = useMemo(() => {
        console.log("Recalculating graphdata");
        const data = targets.map((t) => {
            return {
                target: t.target,
                color: t.color ?? "steelblue",
                data: primaryLap.lap_data.map((d) => ({
                    [t.target]: d[t.target],
                    distance: d["distance"],
                })),
            };
        });
        // If secondaryLap, add that too
        const secondaryData = secondaryLap
            ? targets.map((t) => {
                  return {
                      target: t.target,
                      color: t.color ?? "steelblue",
                      secondary: true,
                      data: secondaryLap.lap_data.map((d) => ({
                          [t.target]: d[t.target],
                          distance: d["distance"],
                      })),
                  };
              })
            : [];
        return [...data, ...secondaryData];
    }, [primaryLap?.lap_number, secondaryLap?.lap_number]);

    const domainExtent = useMemo(() => {
        console.log(graphData);
        const eList = graphData.map((g) => {
            return d3.extent(g.data, (d) => d[g.target]);
        });
        return eList.reduce((e1, e2) => [
            d3.min([e1[0], e2[0]]),
            d3.max([e1[1], e2[1]]),
        ]);
    }, [graphData]);

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(primaryLap.lap_data, (data) => data.distance))
                .range([0, width]),
        [primaryLap.lap_number]
    );

    const bufferedDomain = [
        domainExtent[0] - Math.abs(0.2 * domainExtent[0]), // Make sure negative values are reduced
        domainExtent[1] + Math.abs(domainExtent[1] * 1.1),
    ]; // Expand by ~10%
    const yScale = d3
        .scaleLinear()
        // .domain([0, maxSpeed])
        .domain(bufferedDomain)
        .range([height, 0]);

    const lineGenerator = (data, target) => {
        console.log(data[0]);
        return d3
            .line()
            .x((d) => xScale(Number(Number(d.distance).toFixed(0))))
            .y((d) => yScale(d[target]))(data);
    };

    const handleMouseMove = (e) => {
        const x0 = xScale.invert(d3.pointer(e)[0]);
        const i = d3.bisector((d) => d.distance).left(primaryLap.lap_data, x0);
        setSelectedPoint(i);
    };
    const handleMouseLeave = () => {
        setSelectedPoint(null);
    };

    const graphDistance =
        // Find the x value for this point
        selectedPoint ? xScale(primaryLap.lap_data[selectedPoint].distance) : 0;
    const getGraphValue = (data, target) => {
        // find the y value for this target type
        return yScale(data[selectedPoint][target]);
    };

    return (
        <div>
            <svg width={width} height={height}>
                {graphData &&
                    graphData.map((g, i) => {
                        return (
                            <path
                                d={lineGenerator(g.data, g.target)}
                                stroke={g.color}
                                strokeWidth={2}
                                strokeDasharray={g.secondary ? "5 2" : "0"}
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
                                stroke="gray"
                                strokeWidth={2}
                                opacity={0.4}
                            />
                            {graphData.map((g) => {
                                return (
                                    <circle
                                        cx={graphDistance}
                                        cy={getGraphValue(g.data, g.target)}
                                        opacity={1}
                                        r={4}
                                        fill={g.color ?? "darkgray"}
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
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />
                </g>
            </svg>
        </div>
    );
};
export default Graph;
