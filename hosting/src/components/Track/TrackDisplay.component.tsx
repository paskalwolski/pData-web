import { Box } from "@mui/material";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import {
    TelemetryData,
    TrackData,
    TrackPositionData,
    TrackDisplayMode,
} from "../../types";
import { useMemo, useState } from "react";
import { TrackPath } from "./TrackPath.component";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { TrackCrosshair } from "./TrackCrosshair.component";
import { useTrackSegments } from "../../hooks/useTrackSegments";
import { TrackDisplayMenu } from "./TrackDisplayMenu.component";

interface Props {
    trackData?: TrackData;
    telemetryData: TelemetryData;
    secondaryTelemetryData?: TelemetryData;
}

const TrackDisplay = ({
    trackData,
    telemetryData,
    secondaryTelemetryData,
}: Props) => {
    const [containerRef, fullWidth, fullHeight] = useContainerSize();
    const { selectionStartIndex, selectionEndIndex } =
        useTelemetryPointContext();

    const [displayMode, setDisplayMode] = useState<TrackDisplayMode>("pedals");

    const [displayVariant, activeSegmentData] = useTrackSegments(
        telemetryData,
        secondaryTelemetryData,
        displayMode,
    );

    const primaryPositionData = useMemo<TrackPositionData[] | undefined>(() => {
        if (!telemetryData) return undefined;
        const { posX, posZ } = telemetryData;
        return posX.map((_, i) => ({ x: posX[i], z: posZ[i] }));
    }, [telemetryData]);

    const secondaryPositionData = useMemo<
        TrackPositionData[] | undefined
    >(() => {
        if (!secondaryTelemetryData) return undefined;
        const { posX, posZ } = secondaryTelemetryData;
        return posX.map((_, i) => ({ x: posX[i], z: posZ[i] }));
    }, [secondaryTelemetryData]);

    // TODO: Clean the calculation pipeline for this
    const fallbackDimensions = useMemo(() => {
        const allX = [
            ...(telemetryData.posX ?? []),
            ...(secondaryTelemetryData?.posX ?? []),
        ];
        const allZ = [
            ...(telemetryData.posZ ?? []),
            ...(secondaryTelemetryData?.posZ ?? []),
        ];
        const [minX, maxX] = d3.extent(allX, (v) => v);
        const [minZ, maxZ] = d3.extent(allZ, (v) => v);
        if (
            minX === undefined ||
            maxX === undefined ||
            minZ === undefined ||
            maxZ === undefined
        )
            return null;
        return {
            width: maxX - minX,
            height: maxZ - minZ,
            xOffset: -minX,
            yOffset: -minZ,
        };
    }, [
        telemetryData.posX,
        telemetryData.posZ,
        secondaryTelemetryData?.posX,
        secondaryTelemetryData?.posZ,
    ]);

    const effectiveDimensions = useMemo(
        () => ({ ...fallbackDimensions, ...trackData }),
        [fallbackDimensions, trackData],
    );

    // When a selection is active, shrink the viewport to the selection's world-space
    // bounding box (with 10% padding) so the image and path both zoom into that region.
    const viewportDimensions = useMemo(() => {
        if (
            selectionStartIndex == null ||
            selectionEndIndex == null ||
            !effectiveDimensions
        )
            return effectiveDimensions;

        const selectedX = telemetryData.posX.slice(
            selectionStartIndex,
            selectionEndIndex + 1,
        );
        const selectedZ = telemetryData.posZ.slice(
            selectionStartIndex,
            selectionEndIndex + 1,
        );
        const [minX, maxX] = d3.extent(selectedX);
        const [minZ, maxZ] = d3.extent(selectedZ);

        if (
            minX == null ||
            maxX == null ||
            minZ == null ||
            maxZ == null ||
            minX === maxX ||
            minZ === maxZ
        )
            return effectiveDimensions;

        const padX = (maxX - minX) * 0.1;
        const padZ = (maxZ - minZ) * 0.1;
        const viewLeft = minX - padX;
        const viewTop = minZ - padZ;

        return {
            width: maxX + padX - viewLeft,
            height: maxZ + padZ - viewTop,
            xOffset: -viewLeft,
            yOffset: -viewTop,
        };
    }, [
        selectionStartIndex,
        selectionEndIndex,
        effectiveDimensions,
        telemetryData.posX,
        telemetryData.posZ,
    ]);

    const { renderedWidth, renderedHeight, imageX, imageY } = useMemo(() => {
        if (!viewportDimensions)
            return {
                renderedWidth: 0,
                renderedHeight: 0,
                imageX: 0,
                imageY: 0,
            };

        // Step 1 — How much would we need to scale the viewport to fill each axis exactly?
        //   If this scale were used alone, the viewport would touch that edge perfectly,
        //   but might overflow the other axis.
        const scaleToFillWidth = fullWidth / viewportDimensions.width;
        const scaleToFillHeight = fullHeight / viewportDimensions.height;

        // Step 2 — Use the smaller of the two scales.
        //   The smaller scale is always the one that is constrained (i.e. would overflow
        //   first). Using it ensures the viewport fits within both axes simultaneously.
        const scale = Math.min(scaleToFillWidth, scaleToFillHeight);

        // Step 3 — Apply the scale to the viewport's natural dimensions.
        //   This gives us the pixel size the viewport will actually be rendered at.
        const renderedWidth = viewportDimensions.width * scale;
        const renderedHeight = viewportDimensions.height * scale;

        // Step 4 — Centre the rendered viewport within the SVG canvas.
        //   Any leftover space is split equally either side.
        const spareWidth = fullWidth - renderedWidth;
        const spareHeight = fullHeight - renderedHeight;
        const imageX = spareWidth / 2;
        const imageY = spareHeight / 2;

        return { renderedWidth, renderedHeight, imageX, imageY };
    }, [fullWidth, fullHeight, viewportDimensions]);

    // xScale / yScale map world-space coordinates (posX, posZ) onto SVG pixels,
    // calibrated to the current viewport (full track or selection bbox).
    //
    // The image was authored so that a point at world position (wx, wz) lands on
    // image pixel  (wx + xOffset,  wz + yOffset).  In other words:
    //   image pixel 0   ↔  world value  -xOffset
    //   image pixel W   ↔  world value   W - xOffset   (W = trackData.width)
    //
    // After the fit-and-centre step, the viewport's left edge maps to SVG pixel imageX
    // and its right edge maps to imageX + renderedWidth — so the d3 range simply
    // follows the already-computed viewport placement.
    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([
                    -(viewportDimensions?.xOffset ?? 0),
                    (viewportDimensions?.width ?? 0) -
                        (viewportDimensions?.xOffset ?? 0),
                ])
                .range([imageX, imageX + renderedWidth]),
        [viewportDimensions, imageX, renderedWidth],
    );

    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([
                    -(viewportDimensions?.yOffset ?? 0),
                    (viewportDimensions?.height ?? 0) -
                        (viewportDimensions?.yOffset ?? 0),
                ])
                .range([imageY, imageY + renderedHeight]),
        [viewportDimensions, imageY, renderedHeight],
    );

    // Project the full image's world-space bounds through the (possibly zoomed) scales.
    // When zoomed, the image extends beyond the SVG canvas; the SVG viewport clips it.
    const actualImageBounds = useMemo(() => {
        if (!effectiveDimensions) return null;
        const left = xScale(-effectiveDimensions.xOffset);
        const top = yScale(-effectiveDimensions.yOffset);
        const right = xScale(
            effectiveDimensions.width - effectiveDimensions.xOffset,
        );
        const bottom = yScale(
            effectiveDimensions.height - effectiveDimensions.yOffset,
        );
        return { x: left, y: top, width: right - left, height: bottom - top };
    }, [effectiveDimensions, xScale, yScale]);

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
            <TrackDisplayMenu
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                hasComparisonLap={!!secondaryTelemetryData}
            />
            <svg
                style={{ position: "absolute", top: 0, left: 0 }}
                width={fullWidth}
                height={fullHeight}
            >
                {trackData && actualImageBounds && (
                    <>
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
                                    x={actualImageBounds.x}
                                    y={actualImageBounds.y}
                                    width={actualImageBounds.width}
                                    height={actualImageBounds.height}
                                />
                            </mask>
                        </defs>

                        {/*
                            This rect is the same size and position as the image.
                            The mask cuts it into the shape of the track.
                        */}
                        <rect
                            x={actualImageBounds.x}
                            y={actualImageBounds.y}
                            width={actualImageBounds.width}
                            height={actualImageBounds.height}
                            fill="darkgray"
                            mask="url(#track-mask)"
                        />
                    </>
                )}
                {/* TODO: Add position data for primary lap fallback */}
                <TrackPath
                    variant={displayVariant}
                    positionData={primaryPositionData}
                    trackSegmentData={activeSegmentData}
                    xScale={xScale}
                    yScale={yScale}
                />

                {secondaryTelemetryData && (
                    <TrackPath
                        variant="plain"
                        positionData={secondaryPositionData}
                        xScale={xScale}
                        yScale={yScale}
                        secondary
                    />
                )}
                <TrackCrosshair
                    xScale={xScale}
                    yScale={yScale}
                    telemetryData={telemetryData}
                />
            </svg>
        </Box>
    );
};

export { TrackDisplay };
