import { useCallback, useMemo } from "react";
import { TelemetryLine } from "./TelemetryLine.component";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { TelemetryDataSet } from "../../types";
import { TelemetryCrosshair } from "./TelemetryCrosshair";

interface TelemetryChartProps {
    title: string;
    data: TelemetryDataSet;
    secondaryData: TelemetryDataSet;
    stepped?: boolean;
    valueFormatter?: (v: number) => string;
}

const TelemetryChart = ({
    title,
    data,
    secondaryData,
    valueFormatter,
    stepped = false,
}: TelemetryChartProps) => {
    const { palette } = useTheme();

    const height = 200;
    const [containerRef, width] = useContainerSize();

    const yDomain = useMemo(
        () =>
            d3.extent([
                ...d3.extent(data),
                ...d3.extent(secondaryData ?? [undefined, undefined]),
            ]),
        [data, secondaryData],
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
                : [0, data.length],
        [data.length, selectionStartIndex, selectionEndIndex],
    );

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([0, width]),
        [width, xDomain],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

    const selectedYValue = data[selectedIndex];
    const secondaryYValue = secondaryData?.[selectedIndex];
    const diffYValue =
        selectedYValue && secondaryYValue
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

    return (
        <Paper>
            <Stack spacing={1} margin={1}>
                <Stack width={1} justifyContent="space-between" direction="row">
                    <Stack justifyContent="start" direction="row" spacing={1}>
                        <Typography>{title}</Typography>
                        <Typography
                            color={palette.primary.light}
                            sx={{ minWidth: "8ch", textAlign: "right" }}
                        >
                            {isFinite(selectedYValue) && !!selectedYValue
                                ? (valueFormatter?.(selectedYValue) ??
                                  selectedYValue)
                                : "-"}
                        </Typography>
                        {isFinite(secondaryYValue) && (
                            <Typography
                                color={palette.secondary.light}
                                sx={{ minWidth: "8ch", textAlign: "right" }}
                            >
                                {valueFormatter?.(secondaryYValue) ??
                                    secondaryYValue}
                            </Typography>
                        )}
                        {isFinite(diffYValue) && (
                            <Typography
                                color={palette.info.light}
                                sx={{ minWidth: "8ch", textAlign: "right" }}
                            >
                                ∆ {valueFormatter?.(diffYValue) ?? diffYValue}
                            </Typography>
                        )}
                    </Stack>
                    {isFinite(selectedIndex) && !!selectedIndex && (
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
                            data={data}
                            xScale={xScale}
                            yScale={yScale}
                            stepped={stepped}
                        />
                        {secondaryData && (
                            <TelemetryLine
                                data={secondaryData}
                                xScale={xScale}
                                yScale={yScale}
                                stepped={stepped}
                                secondary
                            />
                        )}
                        <TelemetryCrosshair
                            xScale={xScale}
                            yScale={yScale}
                            data={data}
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
