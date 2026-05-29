import { useCallback, useMemo } from "react";
import { TelemetryLine } from "./TelemetryLine.component";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { TelemetryCrosshair } from "./TelemetryCrosshair";
import { TelemetryChartProps, TelemetryValueDisplayProps } from "./types";
import { TelemetryValueRender } from "./TelemetryValueRender";
import { deltaFormatter as baseDeltaFormatter } from "../../helpers/telemetryValueFormatter";

const EMPTY_ARRAY = [] as const;

const TelemetryChart = ({
    title,
    data,
    secondaryData,
    valueFormatter,
    mode = "normal",
    rawData,
    mutators,
    slots,
}: TelemetryChartProps) => {
    const { palette } = useTheme();

    const height = 200;
    const [containerRef, width] = useContainerSize();

    const mutatedPrimaryData = useMemo(
        () => (mutators ?? EMPTY_ARRAY).reduce((d, m) => m(d), data),
        [mutators, data],
    );
    const mutatedSecondaryData = useMemo(
        () =>
            secondaryData
                ? (mutators ?? EMPTY_ARRAY).reduce(
                      (d, m) => m(d),
                      secondaryData,
                  )
                : undefined,
        [mutators, secondaryData],
    );
    const mutatedRawData = useMemo(
        () =>
            rawData
                ? (mutators ?? EMPTY_ARRAY).reduce((d, m) => m(d), rawData)
                : undefined,
        [mutators, rawData],
    );

    const targetData = mutatedRawData ?? mutatedPrimaryData;

    const yDomain = useMemo(
        () =>
            d3.extent([
                ...d3.extent(mutatedPrimaryData),
                ...d3.extent(mutatedSecondaryData ?? [undefined, undefined]),
            ]),
        [mutatedPrimaryData, mutatedSecondaryData],
    );

    const {
        selectedIndex,
        setSelectedIndex,
        highlightStartIndex,
        setHighlightStartIndex,
        highlightEndIndex,
        setHighlightEndIndex,
        selectionStartIndex,
        selectionEndIndex,
        setSelectionStartIndex,
        setSelectionEndIndex,
    } = useTelemetryPointContext();

    const xDomain = useMemo(
        () =>
            selectionStartIndex != null && selectionEndIndex != null
                ? [selectionStartIndex, selectionEndIndex]
                : [0, mutatedPrimaryData.length],
        [mutatedPrimaryData.length, selectionStartIndex, selectionEndIndex],
    );

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([0, width]),
        [width, xDomain],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

    const selectedYValue = mutatedPrimaryData[selectedIndex];
    const secondaryYValue = mutatedSecondaryData?.[selectedIndex];
    const diffYValue =
        selectedYValue != null && secondaryYValue != null
            ? selectedYValue - secondaryYValue
            : undefined;

    const getIndexFromEvent = useCallback(
        (e: React.MouseEvent) => {
            const x0 = xScale.invert(d3.pointer(e)[0]);
            const x = Number(x0.toFixed(0));
            return xDomain[0] <= x && x <= xDomain[1] ? x : null;
        },
        [xScale, xDomain],
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const x = getIndexFromEvent(e);
            if (x == null) return;
            setHighlightStartIndex(x);
            setHighlightEndIndex(undefined);
        },
        [getIndexFromEvent, setHighlightStartIndex, setHighlightEndIndex],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const x = getIndexFromEvent(e);
            setSelectedIndex(x ?? undefined);
            if (highlightStartIndex != null && x != null)
                setHighlightEndIndex(x);
        },
        [
            getIndexFromEvent,
            setSelectedIndex,
            highlightStartIndex,
            setHighlightEndIndex,
        ],
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            if (highlightStartIndex == null) return;
            const x = getIndexFromEvent(e) ?? highlightStartIndex;
            setHighlightStartIndex(undefined);
            setHighlightEndIndex(undefined);
            if (x === highlightStartIndex) {
                setSelectionStartIndex(undefined);
                setSelectionEndIndex(undefined);
            } else {
                setSelectionStartIndex(Math.min(highlightStartIndex, x));
                setSelectionEndIndex(Math.max(highlightStartIndex, x));
            }
        },
        [
            getIndexFromEvent,
            highlightStartIndex,
            setSelectionStartIndex,
            setSelectionEndIndex,
            setHighlightStartIndex,
            setHighlightEndIndex,
        ],
    );

    const handleMouseLeave = useCallback(
        (e: React.MouseEvent) => {
            setSelectedIndex(null);
            if (highlightStartIndex == null) return;
            setSelectionStartIndex(highlightStartIndex);
            const x = getIndexFromEvent(e) ?? highlightEndIndex;
            setSelectionStartIndex(Math.min(highlightStartIndex, x));
            setSelectionEndIndex(Math.max(highlightStartIndex, x));
            setHighlightStartIndex(undefined);
            setHighlightEndIndex(undefined);
        },
        [
            setSelectedIndex,
            highlightEndIndex,
            highlightStartIndex,
            setSelectionStartIndex,
            getIndexFromEvent,
            setSelectionEndIndex,
            setHighlightStartIndex,
            setHighlightEndIndex,
        ],
    );

    const deltaFormatter = useCallback(
        (v?: number) => baseDeltaFormatter(valueFormatter(v)),
        [valueFormatter],
    );

    const slotProps: Omit<TelemetryValueDisplayProps, "variant"> = {
        index: selectedIndex,
        valueFormatter,
        primaryValue: selectedYValue,
        secondaryValue: secondaryYValue,
        deltaValue: diffYValue,
    };

    return (
        <Paper>
            <Stack spacing={1} margin={1}>
                <Stack width={1} justifyContent="space-between" direction="row">
                    <Stack justifyContent="start" direction="row" spacing={1}>
                        {slots?.title !== false &&
                            (slots?.title ? (
                                <slots.title title={title} />
                            ) : (
                                <Typography>{title}</Typography>
                            ))}
                        {slots?.primaryValue !== false &&
                            (slots?.primaryValue ? (
                                <slots.primaryValue
                                    variant="primary"
                                    color={palette.primary.light}
                                    {...slotProps}
                                />
                            ) : (
                                <TelemetryValueRender
                                    value={selectedYValue}
                                    valueFormatter={valueFormatter}
                                    color={palette.primary.light}
                                />
                            ))}
                        {secondaryData && (
                            <>
                                {slots?.secondaryValue !== false &&
                                    (slots?.secondaryValue ? (
                                        <slots.secondaryValue
                                            variant="secondary"
                                            color={palette.secondary.light}
                                            {...slotProps}
                                        />
                                    ) : (
                                        <TelemetryValueRender
                                            value={secondaryYValue}
                                            valueFormatter={valueFormatter}
                                            color={palette.secondary.light}
                                        />
                                    ))}
                                {slots?.deltaValue !== false &&
                                    (slots?.deltaValue ? (
                                        <slots.deltaValue
                                            variant="delta"
                                            {...slotProps}
                                        />
                                    ) : (
                                        <TelemetryValueRender
                                            value={diffYValue}
                                            valueFormatter={deltaFormatter}
                                        />
                                    ))}
                            </>
                        )}
                    </Stack>
                    {isFinite(selectedIndex) && selectedIndex != null && (
                        <Typography>{selectedIndex}m</Typography>
                    )}
                </Stack>
                <Box ref={containerRef}>
                    <svg width={width} height={height}>
                        {highlightStartIndex != null && (
                            <rect
                                fill={palette.info.light}
                                stroke={palette.info.light}
                                rx={2}
                                ry={2}
                                fillOpacity={0.3}
                                x={xScale(
                                    Math.min(
                                        highlightStartIndex,
                                        highlightEndIndex ??
                                            selectedIndex ??
                                            highlightStartIndex,
                                    ),
                                )}
                                y={yScale.range()[1]}
                                height={height}
                                width={Math.abs(
                                    xScale(
                                        highlightEndIndex ??
                                            selectedIndex ??
                                            highlightStartIndex,
                                    ) - xScale(highlightStartIndex),
                                )}
                            />
                        )}
                        <TelemetryLine
                            data={mutatedPrimaryData}
                            xScale={xScale}
                            yScale={yScale}
                            stepped={mode === "stepped"}
                            color={
                                mode === "delta"
                                    ? palette.success.dark
                                    : undefined
                            }
                        />
                        {secondaryData && (
                            <TelemetryLine
                                data={mutatedSecondaryData}
                                xScale={xScale}
                                yScale={yScale}
                                stepped={mode === "stepped"}
                                color={
                                    mode === "delta"
                                        ? palette.error.dark
                                        : undefined
                                }
                                secondary={mode !== "delta"}
                            />
                        )}
                        <TelemetryCrosshair
                            xScale={xScale}
                            yScale={yScale}
                            data={targetData}
                        />
                        <rect
                            style={{
                                pointerEvents: "all",
                                cursor: "crosshair",
                            }}
                            fill="none"
                            height={height}
                            width={width}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        />
                    </svg>
                </Box>
            </Stack>
        </Paper>
    );
};

export { TelemetryChart };
