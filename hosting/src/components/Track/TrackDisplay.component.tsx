import { Box } from "@mui/material";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import {
    TelemetryData,
    TrackData,
    TrackPositionData,
    TrackSegment,
    TrackSegmentType,
} from "../../types";
import { useMemo } from "react";
import { TrackPath } from "./TrackPath.component";

interface Props {
    trackData: TrackData;
    telemetryData: TelemetryData;
    lapId: string;
}

const getTrackSegmentType = (
    gas: number | undefined,
    brake: number | undefined,
): TrackSegmentType => {
    const g = gas ?? 0;
    const b = brake ?? 0;
    if (g > 0 && b > 0) return "double-pedal";
    if (g === 1) return "gas-full";
    if (g >= 0.5) return "gas-mid";
    if (g > 0) return "gas-low";
    if (b === 1) return "brake-full";
    if (b >= 0.5) return "brake-mid";
    if (b > 0) return "brake-low";
    return "coast";
};

const prepareTrackSegments = (telemetryData: TelemetryData): TrackSegment[] => {
    const overallSegmentData: TrackSegment[] = [];
    let currentSegmentPositionData: TrackPositionData[] = [];
    let currentSegmentType: TrackSegmentType | undefined = undefined;
    let indexStart = 0;

    telemetryData.posX.forEach((_, i) => {
        const calculatedSegmentType = getTrackSegmentType(
            telemetryData.gas[i],
            telemetryData.brake[i],
        );
        const trackPositionData: TrackPositionData = {
            x: telemetryData.posX[i],
            z: telemetryData.posZ[i],
        };

        // Initialize segment type from the first point
        if (currentSegmentType === undefined) {
            currentSegmentType = calculatedSegmentType;
        }

        const isLastPoint = i === telemetryData.posX.length - 1;
        const isTypeChange = calculatedSegmentType !== currentSegmentType;

        if (isTypeChange || isLastPoint) {
            // Include this point in the closing segment for visual continuity
            currentSegmentPositionData.push(trackPositionData);
            // Store the segment
            overallSegmentData.push({
                data: currentSegmentPositionData,
                type: currentSegmentType,
                indexStart,
                indexEnd: i,
            });
            if (!isLastPoint) {
                // Start new segment from this point (overlap keeps the path connected)
                currentSegmentPositionData = [trackPositionData];
                indexStart = i;
                currentSegmentType = calculatedSegmentType;
            }
        } else {
            // Add the point to the segment
            currentSegmentPositionData.push(trackPositionData);
        }
    });

    return overallSegmentData;
};

const TrackDisplay = ({ trackData, telemetryData, lapId }: Props) => {
    const [containerRef, fullWidth, fullHeight] = useContainerSize();

    const trackSegmentData = useMemo(
        () => prepareTrackSegments(telemetryData),
        // Only force a recalculate when we switch laps
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lapId],
    );

    const { renderedWidth, renderedHeight, imageX, imageY } = useMemo(() => {
        // Step 1 — How much would we need to scale the image to fill each axis exactly?
        //   If this scale were used alone, the image would touch that edge perfectly,
        //   but might overflow the other axis.
        const scaleToFillWidth = fullWidth / trackData.width;
        const scaleToFillHeight = fullHeight / trackData.height;

        // Step 2 — Use the smaller of the two scales.
        //   The smaller scale is always the one that is constrained (i.e. would overflow
        //   first). Using it ensures the image fits within both axes simultaneously.
        const scale = Math.min(scaleToFillWidth, scaleToFillHeight);

        // Step 3 — Apply the scale to the image's natural dimensions.
        //   This gives us the pixel size the image will actually be rendered at.
        const renderedWidth = trackData.width * scale;
        const renderedHeight = trackData.height * scale;

        // Step 4 — Centre the rendered image within the SVG canvas.
        //   Any leftover space is split equally either side.
        const spareWidth = fullWidth - renderedWidth;
        const spareHeight = fullHeight - renderedHeight;
        const imageX = spareWidth / 2;
        const imageY = spareHeight / 2;

        return { renderedWidth, renderedHeight, imageX, imageY };
    }, [fullWidth, fullHeight, trackData.width, trackData.height]);

    // xScale / yScale map world-space coordinates (posX, posZ) onto SVG pixels.
    //
    // The image was authored so that a point at world position (wx, wz) lands on
    // image pixel  (wx + xOffset,  wz + yOffset).  In other words:
    //   image pixel 0   ↔  world value  -xOffset
    //   image pixel W   ↔  world value   W - xOffset   (W = trackData.width)
    //
    // After the fit-and-centre step, image pixel 0 maps to SVG pixel imageX and
    // image pixel W maps to SVG pixel imageX + renderedWidth — so the d3 range
    // simply follows the already-computed image placement.
    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([
                    -trackData.xOffset,
                    trackData.width - trackData.xOffset,
                ])
                .range([imageX, imageX + renderedWidth]),
        [trackData.xOffset, trackData.width, imageX, renderedWidth],
    );

    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([
                    -trackData.yOffset,
                    trackData.height - trackData.yOffset,
                ])
                .range([imageY, imageY + renderedHeight]),
        [trackData.yOffset, trackData.height, imageY, renderedHeight],
    );

    return (
        // The Box fills the parent and gives useContainerSize something to measure.
        // position: relative + overflow: hidden are needed so the absolutely-positioned
        // SVG stays clipped inside the Box without influencing its size — if the SVG
        // were in normal flow its explicit pixel dimensions would prevent the Box from
        // ever shrinking (the content would resist the resize).
        <Box
            ref={containerRef}
            sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <svg
                style={{ position: "absolute", top: 0, left: 0 }}
                width={fullWidth}
                height={fullHeight}
            >
                <defs>
                    {/*
                        The track image is used as a mask.
                        White pixels in the image reveal the rect beneath;
                        black pixels hide it. This lets us tint the track shape
                        with a fill colour (darkgray) rather than showing the
                        raw image.
                    */}
                    <mask id="track-mask">
                        <image
                            href={trackData.url}
                            x={imageX}
                            y={imageY}
                            width={renderedWidth}
                            height={renderedHeight}
                        />
                    </mask>
                </defs>

                {/*
                    This rect is the same size and position as the image.
                    The mask cuts it into the shape of the track.
                */}
                <rect
                    x={imageX}
                    y={imageY}
                    width={renderedWidth}
                    height={renderedHeight}
                    fill="darkgray"
                    mask="url(#track-mask)"
                />

                <TrackPath
                    trackSegmentData={trackSegmentData}
                    xScale={xScale}
                    yScale={yScale}
                />
            </svg>
        </Box>
    );
};

export { TrackDisplay };
