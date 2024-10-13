import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const Track = ({ selectedLap, selectedPoint, setSelectedPoint }) => {
    const focusRef = useRef(null);
    const [focusPos, setFocusPos] = useState([0, 0]);
    const [focusVisible, setFocusVisible] = useState(false);
    const saniData = selectedLap.lap_data.sort(
        (a, b) => a.distance - b.distance
    );
    const dataPoints = saniData.length;
    const height = 500;
    const width = 500;

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(selectedLap.lap_data, (data) => data.pos[0]))
        .range([0, width]);
    const yScale = d3
        .scaleLinear()
        .domain(d3.extent(selectedLap.lap_data, (data) => data.pos[2]))
        .range([0, height]);

    const lineGenerator = d3
        .line()
        .x((d) => xScale(d.pos[0]))
        .y((d) => yScale(d.pos[2]))
        .curve(d3.curveCatmullRom);

    const colorGen = (n) => {
        let gas, brake;
        ({ gas, brake } = n);
        if (gas != 0 && brake != 0) {
            return `#000000`;
        } else if (gas) {
            return d3.hsl(120, 1, 1 - gas * 0.5).formatHex8();
        } else if (brake) {
            return d3.hsl(0, 1, 1 - brake * 0.5).formatHex8();
        } else {
            return "#FFFFFF";
        }
    };

    useEffect(() => {
        if (!selectedPoint) return;
        setFocus(selectedPoint);
    }, [selectedPoint]);

    const setFocus = (i) => {
        const d = saniData[i];
        setFocusPos([xScale(d.pos[0]), yScale(d.pos[2])]);
        setFocusVisible(true);
    };

    const showFocus = () => {
        console.log("Showing Focus");
        setFocusVisible(true);
    };
    const hideFocus = () => {
        console.log("Hiding Focus");
        setFocusVisible(false);
    };

    return (
        <div>
            <svg width={width} height={height} style={{ margin: "10px" }}>
                <g>
                    {saniData.map((data, i) => {
                        if (i == dataPoints - 1) return;
                        const lineData = lineGenerator([data, saniData[i + 1]]);
                        return (
                            <path
                                d={lineData}
                                fill={"none"}
                                stroke={colorGen(data)}
                                strokeWidth={2}
                                id={`path-${i}`}
                                key={`path-${i}`}
                                onMouseOver={() => {
                                    setFocus(i);
                                }}
                            />
                        );
                    })}
                </g>
                {focusVisible && (
                    <circle
                        ref={focusRef}
                        r={3}
                        fill={"red"}
                        stroke={"red"}
                        strokeWidth={2}
                        cx={focusPos[0]}
                        cy={focusPos[1]}
                    />
                )}
            </svg>
        </div>
    );
};

export default Track;
