import { useMemo } from "react";
import * as d3 from "d3";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Line, YAxisLabels } from "../Charts";
import { MinMaxBand } from "./MinMaxBand.component";
import { AggregateTelemetryChartProps } from "./types";

const AggregateTelemetryChart = ({
    title,
    data,
    minSeries,
    maxSeries,
    valueFormatter,
    elevation,
}: AggregateTelemetryChartProps) => {
    const height = 200;
    const leftPadding = 50;
    const [containerRef, width] = useContainerSize();

    const length = useMemo(
        () =>
            Math.max(
                minSeries.length,
                maxSeries.length,
                ...data.map((s) => s.data.length),
            ),
        [data, minSeries, maxSeries],
    );

    const xDomain = useMemo(() => [0, length], [length]);

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([leftPadding, width]),
        [width, xDomain],
    );

    const yDomain = useMemo(
        () =>
            d3.extent([
                ...d3.extent(minSeries),
                ...d3.extent(maxSeries),
                ...data.flatMap((s) => d3.extent(s.data)),
            ]),
        [data, minSeries, maxSeries],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

    return (
        <Paper elevation={elevation}>
            <Stack spacing={1} margin={1}>
                <Stack width={1} direction="row" spacing={1}>
                    <Typography>{title}</Typography>
                </Stack>
                <Box ref={containerRef}>
                    <svg width={width} height={height}>
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
                        <MinMaxBand
                            xScale={xScale}
                            yScale={yScale}
                            minSeries={minSeries}
                            maxSeries={maxSeries}
                        />
                        {data.map((series, i) => (
                            <Line
                                key={series.label ?? i}
                                data={series.data}
                                xScale={xScale}
                                yScale={yScale}
                                stepped={series.stepped}
                                color={series.color}
                            />
                        ))}
                    </svg>
                </Box>
            </Stack>
        </Paper>
    );
};

export { AggregateTelemetryChart };
