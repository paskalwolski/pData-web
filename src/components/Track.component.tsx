import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import TrackLine from "./TrackLine.component";

const Track = ({ selectedLap, selectedPoint, setSelectedPoint }) => {
    const focusRef = useRef(null);
    const [focusPos, setFocusPos] = useState([0, 0]);
    const [focusVisible, setFocusVisible] = useState(false);
    const saniData = useMemo(
        () => selectedLap.lap_data.sort((a, b) => a.distance - b.distance),
        [selectedLap.lap_number]
    );
    const height = 500;
    const width = 500;

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, (data) => data.pos[0]))
                .range([0, width]),
        [saniData.lap_number]
    );
    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, (data) => data.pos[2]))
                .range([0, height]),
        [saniData.lap_number]
    );

    const setFocus = useMemo(
        // Factory which returns a function
        () => (i) => {
            setSelectedPoint(i);
            const d = saniData[i];
            setFocusPos([xScale(d.pos[0]), yScale(d.pos[2])]);
            setFocusVisible(true);
        },
        [saniData]
    );

    useEffect(() => {
        if (!selectedPoint) return;
        setFocus(selectedPoint);
    }, [selectedPoint]);

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
                {saniData && (
                    <TrackLine
                        {...{ data: saniData, xScale, yScale, setFocus }}
                    />
                )}
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
