import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const Graph = ({
    target,
    selectedLap,
    selectedPoint,
    setSelectedPoint,
    ...props
}) => {
    const height = 200;
    const width = 500;
    const focusRef = useRef(null);
    const [focusPos, setFocusPos] = useState(null);

    const colour = props?.colour ?? "steelblue";

    const saniData = selectedLap.lap_data.sort(
        (a, b) => a.distance - b.distance
    );

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(saniData, (data) => data.distance))
        .range([0, width]);

    const domain = d3.extent(selectedLap.lap_data, (data) => data[target]);
    const bufferedDomain = [domain[0] * 0.8, domain[1] * 1.1]; // Expand by ~10%
    const yScale = d3
        .scaleLinear()
        // .domain([0, maxSpeed])
        .domain(bufferedDomain)
        .range([height, 0]);

    const lineGenerator = d3
        .line()
        .x((d) => xScale(Number(Number(d.distance).toFixed(0))))
        .y((d) => yScale(d[target]));
    const linePath = lineGenerator(saniData);

    const handleMouseEnter = () => {
        return;
    };
    const handleMouseMove = (e) => {
        const x0 = xScale.invert(d3.pointer(e)[0]);
        const i = d3.bisector((d) => d.distance).left(saniData, x0);
        setSelectedPoint(i);
    };
    const handleMouseLeave = () => {};

    useEffect(() => {
        if (!selectedPoint) return;
        const selectedData = saniData[selectedPoint];
        setFocusPos({
            x: xScale(selectedData.distance),
            y: yScale(selectedData[target]),
        });
    }, [selectedPoint]);

    // This (with some mods) goes to the trackdisplay to show 2d position
    // useEffect(() => {
    //     if (!selectedPoint) return;
    //     const selectedData = saniData[selectedPoint];
    //     setFocusCoord([
    //         xScale(selectedData.distance),
    //         yScale(selectedData[target]),
    //     ]);
    // }, [selectedPoint]);

    return (
        <div>
            <svg width={width} height={height}>
                {/* TODO: Draw the axis? */}
                <path
                    d={linePath}
                    stroke={colour}
                    strokeWidth={2}
                    fill="none"
                />
                <g>
                    <g>
                        <line
                            ref={focusRef}
                            x1={focusPos?.x}
                            x2={focusPos?.x}
                            y1={yScale.range()[0]}
                            y2={yScale.range()[1]}
                            stroke="red"
                        />
                        <circle
                            cx={focusPos?.x}
                            cy={focusPos?.y}
                            opacity={1}
                            r={3}
                        />
                    </g>
                    <rect
                        style={{ pointerEvents: "all" }}
                        fill="none"
                        height={height}
                        width={width}
                        onMouseEnter={handleMouseEnter}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />
                </g>
            </svg>
        </div>
    );
};
export default Graph;
