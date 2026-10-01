import { useCallback, useMemo } from "react";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useTelemetryPointContext } from "../../hooks/TelemetryPointContext/useTelemetryPoint";
import { TelemetryCrosshair } from "./TelemetryCrosshair";
import { TelemetryReadouts } from "./TelemetryReadouts";
import { Band } from "./Band.component";
import { TelemetryChartProps } from "./types";
import { Line, YAxisLabels } from "../Charts";
import { TelemetryDataSet } from "../../types";
import { CHANNEL_CONFIG } from "./channels";

const EMPTY_ARRAY = [] as const;

const TelemetryChart = ({
    channel,
    title: titleProp,
    series,
    bands,
    delta = true,
    valueFormatter: valueFormatterProp,
    mutators: mutatorsProp,
    slots,
    elevation,
}: TelemetryChartProps) => {
    const { palette } = useTheme();

    const config = channel ? CHANNEL_CONFIG[channel] : undefined;
    const title = titleProp ?? config?.title;
    const valueFormatter = valueFormatterProp ?? config?.valueFormatter;
    const mutators = mutatorsProp ?? config?.mutators;

    const height = 200;
    const leftPadding = 50;
    const [containerRef, width] = useContainerSize();

    const mutate = useCallback(
        (data: TelemetryDataSet) =>
            (mutators ?? EMPTY_ARRAY).reduce((d, m) => m(d), data),
        [mutators],
    );

    const mutatedSeries = useMemo(
        () =>
            series.map((s) => ({
                ...s,
                stepped: s.stepped ?? config?.stepped,
                readout: s.readout ?? config?.readout,
                data: mutate(s.data),
            })),
        [series, mutate, config],
    );
    const mutatedBands = useMemo(
        () =>
            (bands ?? EMPTY_ARRAY).map((b) => ({
                ...b,
                min: mutate(b.min),
                max: mutate(b.max),
            })),
        [bands, mutate],
    );

    const length = useMemo(
        () =>
            Math.max(
                0,
                ...mutatedSeries.map((s) => s.data.length),
                ...mutatedBands.map((b) =>
                    Math.max(b.min.length, b.max.length),
                ),
            ),
        [mutatedSeries, mutatedBands],
    );

    const yDomain = useMemo(
        () => {
            const sets: TelemetryDataSet[] = [
                ...mutatedSeries.map((s) => s.data),
                ...mutatedBands.flatMap((b) => [b.min, b.max]),
            ];
            return d3.extent(sets.flatMap((d) => d3.extent(d)));
        },
        [mutatedSeries, mutatedBands],
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
                : [0, Math.max(length - 1, 0)],
        [length, selectionStartIndex, selectionEndIndex],
    );

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([leftPadding, width]),
        [width, xDomain],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

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
            setSelectedIndex(undefined);
            if (highlightStartIndex == null) return;
            const x =
                getIndexFromEvent(e) ??
                highlightEndIndex ??
                highlightStartIndex;
            setHighlightStartIndex(undefined);
            setHighlightEndIndex(undefined);
            if (x === highlightStartIndex) return;
            setSelectionStartIndex(Math.min(highlightStartIndex, x));
            setSelectionEndIndex(Math.max(highlightStartIndex, x));
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

    const highlightEnd =
        highlightEndIndex ?? selectedIndex ?? highlightStartIndex;

    return (
        <Paper elevation={elevation}>
            <Stack spacing={1} margin={1}>
                <Stack width={1} justifyContent="space-between" direction="row">
                    <Stack justifyContent="start" direction="row" spacing={1}>
                        {title &&
                            slots?.title !== false &&
                            (slots?.title ? (
                                <slots.title title={title} />
                            ) : (
                                <Typography>{title}</Typography>
                            ))}
                        <TelemetryReadouts
                            series={mutatedSeries}
                            delta={delta}
                            index={selectedIndex}
                            valueFormatter={valueFormatter}
                        />
                    </Stack>
                    {selectedIndex != null && isFinite(selectedIndex) && (
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
                                    Math.min(highlightStartIndex, highlightEnd),
                                )}
                                y={yScale.range()[1]}
                                height={height}
                                width={Math.abs(
                                    xScale(highlightEnd) -
                                        xScale(highlightStartIndex),
                                )}
                            />
                        )}
                        <YAxisLabels
                            yScale={yScale}
                            min={yDomain[0]}
                            max={yDomain[1]}
                            width={width}
                            leftPadding={leftPadding}
                            padding={0}
                            subTick={(min, max) =>
                                d3.scaleLinear().domain([min, max]).ticks(5)
                            }
                            formatLabel={(v) =>
                                String(valueFormatter?.(v) ?? v)
                            }
                        />
                        {mutatedBands.map((b) => (
                            <Band
                                key={b.id}
                                xScale={xScale}
                                yScale={yScale}
                                min={b.min}
                                max={b.max}
                                color={b.color}
                                opacity={b.opacity}
                            />
                        ))}
                        {/* Reversed so the first series draws on top */}
                        {[...mutatedSeries].reverse().map(
                            (s) =>
                                !s.hidden && (
                                    <Line
                                        key={s.id}
                                        data={s.data}
                                        xScale={xScale}
                                        yScale={yScale}
                                        stepped={s.stepped}
                                        color={s.color}
                                        dashed={s.dashed}
                                    />
                                ),
                        )}
                        <TelemetryCrosshair
                            xScale={xScale}
                            yScale={yScale}
                            series={mutatedSeries}
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
