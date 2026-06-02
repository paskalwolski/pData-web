import * as d3 from "d3";
import React, { useCallback, useMemo } from "react";
import { TrackDisplayMode, TrackPositionData, TrackSegment } from "../../types";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { useTheme } from "@mui/material";
import { useSegmentTheme } from "../../hooks/useTrackTheme";

interface TrackTraceSegmentProps {
    lineGenerator: d3.Line<TrackPositionData>;
    segment: TrackSegment;
    displayMode: TrackDisplayMode;
    renderScale: number;
}
const TrackTraceSegment = ({
    lineGenerator,
    segment,
    displayMode,
    renderScale,
}: TrackTraceSegmentProps) => {
    const theme = useSegmentTheme();
    const segmentTheme = theme[segment.type];

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
            stroke={segmentTheme}
            strokeWidth={
                isSegmentHighlighted || isSegmentSelected
                    ? 8
                    : displayMode === "delta"
                      ? 4
                      : 3 * renderScale
            }
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
    secondary?: boolean;
    displayMode: TrackDisplayMode;
    renderScale: number;
};

const TrackPath = React.memo(
    ({
        variant,
        displayMode,
        trackSegmentData,
        positionData,
        xScale,
        yScale,
        secondary = false,
        renderScale,
    }: Props) => {
        const { palette } = useTheme();

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
                        stroke={
                            secondary
                                ? palette.secondary.main
                                : palette.primary.main
                        }
                        strokeDasharray={
                            secondary && displayMode !== "lines" ? "5 2" : "0"
                        }
                        strokeWidth={(secondary ? 2 : 3) * renderScale}
                    />
                )}
                {variant === "segments" &&
                    trackSegmentData?.map((s, i) => (
                        <TrackTraceSegment
                            key={`segment-${i}`}
                            lineGenerator={lineGen}
                            segment={s}
                            displayMode={displayMode}
                            renderScale={renderScale}
                        />
                    ))}
            </g>
        );
    },
);

export { TrackPath };
