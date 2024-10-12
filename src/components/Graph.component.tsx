import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const Graph = ({ selectedLap, selectedPoint, setSelectedPoint, ...props }) => {
    const height = 200;
    const width = 500;
    const focusRef = useRef(null);
    const [focusCoord, setFocusCoord] = useState([0, 0]);

    const saniData = selectedLap.lap_data.sort(
        (a, b) => a.distance - b.distance
    );

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(saniData, (data) => data.distance))
        .range([0, width]);

    const domain = d3.extent(selectedLap.lap_data, (data) => data.speed);
    const bufferedDomain = [domain[0] * 0.8, domain[1] * 1.1]; // Expand by ~10%
    const yScale = d3
        .scaleLinear()
        // .domain([0, maxSpeed])
        .domain(bufferedDomain)
        .range([height, 0]);

    const lineGenerator = d3
        .line()
        .x((d) => xScale(Number(Number(d.distance).toFixed(0))))
        .y((d) => yScale(d.speed));
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
        setFocusCoord([
            xScale(selectedData.distance),
            yScale(selectedData.speed),
        ]);
    }, [selectedPoint]);

    return (
        <div>
            <svg width={width} height={height}>
                {/* TODO: Draw the axis? */}
                <path
                    d={linePath}
                    stroke="steelblue"
                    strokeWidth={2}
                    fill="none"
                />
                <g>
                    <circle
                        ref={focusRef}
                        cx={focusCoord[0] ?? 0}
                        cy={focusCoord[1] ?? 0}
                        opacity={1}
                        r={5}
                    />
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
