import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";
import TrackLine from "./TrackLine.component";

const Track = ({ primaryLap, selectedPoint, setSelectedPoint }) => {
    const [focusPos, setFocusPos] = useState(null);
    const height = 500;
    const width = 500;

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(primaryLap.lap_data, (data) => data.pos[0]))
                .range([0, width]),
        [primaryLap.lap_number]
    );
    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain(d3.extent(primaryLap.lap_data, (data) => data.pos[2]))
                .range([0, height]),
        [primaryLap.lap_number]
    );

    const setFocus = useMemo(
        // Factory which returns a function
        () => (i) => {
            setSelectedPoint(i);
            const d = primaryLap.lap_data[i];
            setFocusPos([xScale(d.pos[0]), yScale(d.pos[2])]);
        },
        [primaryLap.lap_number]
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
                {primaryLap && (
                    <TrackLine
                        {...{
                            data: primaryLap.lap_data,
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
