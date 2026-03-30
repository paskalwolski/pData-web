import * as d3 from "d3";
import React, { useMemo } from "react";
import { TrackPositionData, TrackSegment, TrackSegmentType } from "../../types";

const SEGMENT_COLOR_MAP: Record<TrackSegmentType, string> = {
    "double-pedal": "#000000",
    "gas-full": "rgb(0, 255, 0)",
    "gas-mid": "rgba(0, 255, 0, 0.66)",
    "gas-low": "rgba(0, 255, 0, 0.33)",
    "brake-full": "#FF0000",
    "brake-mid": "rgba(255, 0, 0, 0.66)",
    "brake-low": "rgba(255, 0, 0, 0.33)",
    coast: "#FFFFFF",
};

interface Props {
    trackSegmentData: TrackSegment[];
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
}

const TrackPath = React.memo(({ trackSegmentData, xScale, yScale }: Props) => {
    const lineGen = useMemo(
        () =>
            d3
                .line<TrackPositionData>()
                .defined((d) => d.x != null && d.z != null)
                .x((d) => xScale(d.x))
                .y((d) => yScale(d.z))
                .curve(d3.curveLinear),
        [xScale, yScale],
    );

    return (
        <g>
            {trackSegmentData.map((segment, i) => (
                <path
                    key={`segment-${i}`}
                    d={lineGen(segment.data)}
                    fill="none"
                    stroke={SEGMENT_COLOR_MAP[segment.type]}
                    strokeWidth={2}
                />
            ))}
        </g>
    );
});

export { TrackPath };
