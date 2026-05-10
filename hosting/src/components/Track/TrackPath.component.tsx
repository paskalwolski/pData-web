import * as d3 from "d3";
import React, { useCallback, useMemo } from "react";
import { TrackPositionData, TrackSegment, TrackSegmentType } from "../../types";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";

const SEGMENT_COLOR_MAP: Record<TrackSegmentType, string> = {
    gas: "rgb(0, 255, 0)",
    brake: "#FF0000",
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
        highlightStartIndex,
        setHighlightStartIndex,
        highlightEndIndex,
        setHighlightEndIndex,
        selectionStartIndex,
        setSelectionStartIndex,
        selectionEndIndex,
        setSelectionEndIndex,
    } = useTelemetryPointContext();

    const handleMouseEnter = useCallback(() => {
        setHighlightStartIndex(segment.indexStart);
        setHighlightEndIndex(segment.indexEnd);
    }, [
        segment.indexEnd,
        segment.indexStart,
        setHighlightEndIndex,
        setHighlightStartIndex,
    ]);

    const handleMouseLeave = useCallback(() => {
        setHighlightStartIndex(undefined);
        setHighlightEndIndex(undefined);
    }, [setHighlightStartIndex, setHighlightEndIndex]);

    const handleClick = useCallback(() => {
        if (
            selectionStartIndex === segment.indexStart &&
            selectionEndIndex === segment.indexEnd
        ) {
            setSelectionStartIndex(undefined);
            setSelectionEndIndex(undefined);
        } else {
            setSelectionStartIndex(segment.indexStart);
            setSelectionEndIndex(segment.indexEnd);
        }
    }, [
        segment.indexEnd,
        segment.indexStart,
        selectionStartIndex,
        selectionEndIndex,
        setSelectionEndIndex,
        setSelectionStartIndex,
    ]);

    const isSegmentHighlighted = useMemo(
        () =>
            highlightStartIndex <= segment.indexStart &&
            highlightEndIndex >= segment.indexEnd,
        [
            highlightStartIndex,
            segment.indexStart,
            segment.indexEnd,
            highlightEndIndex,
        ],
    );

    const isSegmentSelected = useMemo(
        () =>
            selectionStartIndex != null &&
            selectionEndIndex != null &&
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
            strokeWidth={isSegmentHighlighted || isSegmentSelected ? 8 : 2}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        />
    );
};

type Props = (
    | {
          variant: "segments";
          trackSegmentData: TrackSegment[];
          positionData?: TrackPositionData[];
      }
    | {
          variant: "plain";
          positionData: TrackPositionData[];
          trackSegmentData?: TrackSegment[];
      }
) & {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
};

const TrackPath = React.memo(
    ({ variant, trackSegmentData, positionData, xScale, yScale }: Props) => {
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
                {variant == "plain" && (
                    <path
                        d={lineGen(positionData)}
                        fill="none"
                        stroke="white"
                        strokeWidth={2}
                    />
                )}
                {variant === "segments" &&
                    trackSegmentData?.map((s, i) => (
                        <TrackTraceSegment
                            key={`segment-${i}`}
                            lineGenerator={lineGen}
                            segment={s}
                        />
                    ))}
            </g>
        );
    },
);

export { TrackPath };
