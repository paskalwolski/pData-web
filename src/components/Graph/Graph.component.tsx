// @ts-nocheck
import * as d3 from "d3";
import { useMemo, useState, useRef, useEffect } from "react";
import GraphLine from "./GraphLine.component";

const Graph = ({
    targets,
    primaryLap,
    secondaryLap,
    selectedPoint,
    setSelectedPoint,
    graphRange,
    setGraphRange,
    stepped,
    fixed,
    ...props
}) => {
    const graphContainer = useRef();
    const [height, setHeight] = useState(200);
    const [width, setWidth] = useState(10);

    const getGraphContainerSize = () => {
        const newWidth = graphContainer.current.clientWidth;
        setWidth(newWidth);
    };

    useEffect(() => {
        // detect 'width' and 'height' on render
        getGraphContainerSize();
        // listen for resize changes, and detect dimensions again when they change
        window.addEventListener("resize", getGraphContainerSize);
        // cleanup event listener
        return () =>
            window.removeEventListener("resize", getGraphContainerSize);
    }, []);

    const [isSelecting, setIsSelecting] = useState(false);
    const [startSelection, setStartSelection] = useState(null);

    const graphData = useMemo(() => {
        const data = targets.map((t) => {
            return {
                target: t.target,
                color: t.color ?? "steelblue",
                data: primaryLap.lap_data.map((d, i) => ({
                    [t.target]: d[t.target],
                    distance: i,
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
                      data: secondaryLap.lap_data.map((d, i) => ({
                          [t.target]: d[t.target],
                          distance: i,
                      })),
                  };
              })
            : [];
        return [...data, ...secondaryData];
    }, [primaryLap?.lap_number, secondaryLap?.lap_number]);

    const domainExtent = useMemo(() => {
        const eList = graphData.map((g) => {
            return d3.extent(g.data, (d) => d[g.target]);
        });
        return eList.reduce((e1, e2) => [
            d3.min([e1[0], e2[0]]),
            d3.max([e1[1], e2[1]]),
        ]);
    }, [JSON.stringify(graphData)]);

    const xScale = useMemo(
        () => d3.scaleLinear().domain(graphRange).range([0, width]),
        [primaryLap.lap_number, JSON.stringify(graphRange), width, height]
    );

    const bufferedDomain = [
        domainExtent[0] - Math.abs(0.2 * domainExtent[0]), // Make sure negative values are reduced
        domainExtent[1] + Math.abs(domainExtent[1] * 0.1),
    ]; // Expand by ~10%

    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                // .domain([0, maxSpeed])
                .domain(bufferedDomain)
                .range([height, 0]),
        [JSON.stringify(bufferedDomain), width, height]
    ); // Hack to use the bufferedDomain list as a dep

    const cleanSelectionRange = (selectionA, selectionB) => {
        return [selectionA, selectionB].sort((a, b) => a - b);
    };

    const handleMouseMove = (e) => {
        const x0 = xScale.invert(d3.pointer(e)[0]);
        if (x0 >= 0 && x0 <= primaryLap.lap_data.length) {
            // const i = d3.bisector((d) => d.distance).left(primaryLap.lap_data, x0);
            setSelectedPoint(Number(x0.toFixed(0)));
        } else {
            setSelectedPoint(null);
        }
    };
    const handleMouseLeave = () => {
        if (isSelecting) {
            setGraphRange(cleanSelectionRange(startSelection, selectedPoint));
            setIsSelecting(false);
        }
        setSelectedPoint(null);
    };

    const handleMouseDown = (e) => {
        setIsSelecting(true);
        // const x0 = xScale.invert(d3.pointer(e)[0]);
        // const i = d3.bisector((d) => d.distance).left(primaryLap.lap_data, x0);
        setStartSelection(selectedPoint);
    };
    const handleMouseUp = (e) => {
        if (isSelecting) {
            setIsSelecting(false);
            setGraphRange(cleanSelectionRange(startSelection, selectedPoint));
        }
    };

    const graphDistance =
        // Find the x value for this point
        selectedPoint ? xScale(selectedPoint) : xScale(0);

    const getGraphValue = (data, target) =>
        // find the y value for this target type
        yScale(data[selectedPoint][target]);

    return (
        <div
            style={{
                border: `2px solid ${targets[0].color}`,
                borderRadius: "5px",
                margin: "2px",
                padding: "5px",
            }}
        >
            <div>
                {graphData &&
                    targets.map((t) => {
                        return (
                            <div
                                key={`${
                                    t.secondary ? "secondary" : "primary"
                                }-${t.target}`}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                }}
                            >
                                <div>{t.target}</div>
                                <div>
                                    Value:{" "}
                                    {selectedPoint
                                        ? primaryLap.lap_data[selectedPoint][
                                              t.target
                                          ].toFixed(fixed)
                                        : "-"}
                                </div>
                                {secondaryLap && (
                                    <>
                                        <div>
                                            Value:{" "}
                                            {selectedPoint
                                                ? secondaryLap.lap_data[
                                                      selectedPoint
                                                  ][t.target].toFixed(fixed)
                                                : "-"}
                                        </div>
                                        <div>
                                            Delta:{" "}
                                            {selectedPoint
                                                ? (
                                                      primaryLap.lap_data[
                                                          selectedPoint
                                                      ][t.target] -
                                                      secondaryLap.lap_data[
                                                          selectedPoint
                                                      ][t.target]
                                                  ).toFixed(fixed)
                                                : "-"}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
            </div>
            <div id="graphContainer" ref={graphContainer}>
                <svg width={width} height={height}>
                    {graphData &&
                        graphData.map((g, i) => {
                            return (
                                <GraphLine
                                    key={`line-${i}`}
                                    {...{ target: g, xScale, yScale }}
                                    stepped
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
                                {graphData.map((g, i) => {
                                    return (
                                        <circle
                                            cx={graphDistance}
                                            cy={getGraphValue(g.data, g.target)}
                                            opacity={1}
                                            r={4}
                                            fill={g.color ?? "darkgray"}
                                            key={`mark-${g.target}-${i}`}
                                        />
                                    );
                                })}
                            </g>
                        )}
                        {isSelecting && (
                            <rect
                                opacity={0.4}
                                fill={targets[0].color}
                                x={
                                    startSelection < selectedPoint
                                        ? xScale(startSelection)
                                        : xScale(selectedPoint)
                                }
                                rx={5}
                                y={yScale.range()[1]}
                                ry={5}
                                height={height}
                                width={
                                    startSelection < selectedPoint
                                        ? xScale(selectedPoint) -
                                          xScale(startSelection)
                                        : xScale(startSelection) -
                                          xScale(selectedPoint)
                                }
                            />
                        )}
                        <rect
                            style={{ pointerEvents: "all" }}
                            fill="none"
                            height={height}
                            width={width}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
};
export default Graph;
