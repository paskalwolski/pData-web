import * as d3 from "d3";
import React, { useCallback, useMemo } from "react";
import { TrackPositionData, TrackSegment, TrackSegmentType } from "../../types";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";

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
interface TrackTraceSegmentProps {
    lineGenerator: d3.Line<TrackPositionData>;
    segment: TrackSegment;
}
const TrackTraceSegment = ({
    lineGenerator,
    segment,
}: TrackTraceSegmentProps) => {
    const {
        selectionStartIndex,
        setSelectionStartIndex,
        selectionEndIndex,
        setSelectionEndIndex,
    } = useTelemetryPointContext();

    const handleSegmentSelection = useCallback(() => {
        setSelectionStartIndex(segment.indexStart);
        setSelectionEndIndex(segment.indexEnd);
    }, [
        segment.indexEnd,
        segment.indexStart,
        setSelectionEndIndex,
        setSelectionStartIndex,
    ]);

    const handleSegmentClear = useCallback(() => {
        setSelectionStartIndex(undefined);
        setSelectionEndIndex(undefined);
    }, [setSelectionStartIndex, setSelectionEndIndex]);

    const isSegmentSelected = useMemo(
        () =>
            selectionStartIndex <= segment.indexStart &&
            selectionEndIndex >= segment.indexEnd,
        [
            selectionStartIndex,
            segment.indexStart,
            segment.indexEnd,
            selectionEndIndex,
        ],
    );

    return (
        <path
            d={lineGenerator(segment.data)}
            fill="none"
            stroke={SEGMENT_COLOR_MAP[segment.type]}
            strokeWidth={isSegmentSelected ? 8 : 2}
            onMouseEnter={handleSegmentSelection}
            onMouseLeave={handleSegmentClear}
        />
    );
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
            {trackSegmentData.map((s, i) => (
                <TrackTraceSegment
                    key={`segment-${i}`}
                    lineGenerator={lineGen}
                    segment={s}
                />
            ))}
        </g>
    );
});

export { TrackPath };
