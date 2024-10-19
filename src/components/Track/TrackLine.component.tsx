// @ts-nocheck
import * as d3 from "d3";
import React from "react";

const TrackLine = React.memo(
    ({ data, xScale, yScale, setFocus, secondary }) => {
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

        return (
            <g style={{ filter: secondary ? "saturate(0.2)" : "saturate(1)" }}>
                {data.map((d, i) => {
                    if (i == data.length - 1) return;
                    const lineData = lineGenerator([d, data[i + 1]]);
                    return (
                        <path
                            d={lineData}
                            fill={"none"}
                            stroke={colorGen(d)}
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
        );
    }
);
export default TrackLine;
