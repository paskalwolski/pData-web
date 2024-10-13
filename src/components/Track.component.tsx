import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";
import TrackLine from "./TrackLine.component";

const Track = ({ selectedLap, selectedPoint, setSelectedPoint }) => {
    const [focusPos, setFocusPos] = useState(null);
    const height = 500;
    const width = 500;

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, (data) => data.pos[0]))
                .range([0, width]),
        [selectedLap.lap_number]
    );
    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, (data) => data.pos[2]))
                .range([0, height]),
        [selectedLap.lap_number]
    );

    const setFocus = useMemo(
        // Factory which returns a function
        () => (i) => {
            setSelectedPoint(i);
            const d = selectedLap.lap_data[i];
            setFocusPos([xScale(d.pos[0]), yScale(d.pos[2])]);
        },
        [selectedLap.lap_number]
    );

    useEffect(() => {
        if (!selectedPoint) {
            setFocusPos(null);
            return;
        }
        setFocus(selectedPoint);
    }, [selectedPoint]);

    return (
        <div>
            <svg width={width} height={height} style={{ margin: "10px" }}>
                {selectedLap && (
                    <TrackLine
                        {...{
                            data: selectedLap.lap_data,
                            xScale,
                            yScale,
                            setFocus,
                        }}
                    />
                )}
                {focusPos && (
                    <circle
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
