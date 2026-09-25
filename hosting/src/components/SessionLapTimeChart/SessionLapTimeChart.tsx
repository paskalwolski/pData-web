import { useMemo } from "react";
import * as d3 from "d3";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Line } from "../Charts";
import { LapInfo } from "../../types";
import { Scatter } from "../Charts";

interface Props {
    laps: (LapInfo & { color: string })[];
}

const SessionLapTimeChart = ({ laps }: Props) => {
    const { palette } = useTheme();

    const height = 200;
    const [containerRef, width] = useContainerSize();

    const data = useMemo(() => laps.map((lap) => lap.lapTime), [laps]);

    const scatterData = useMemo(
        () =>
            laps.map((l, i) => ({
                x: i,
                y: l.lapTime,
                z: l.color,
            })),

        [laps],
    );

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([0, data.length - 1])
                .range([0, width]),
        [width, data.length],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(d3.extent(data)).range([height, 0]),
        [data],
    );

    return (
        <Paper>
            <Stack spacing={1} margin={1} padding={2}>
                <Typography>Laptimes</Typography>
                <Box ref={containerRef}>
                    <svg width={width} height={height}>
                        <Line
                            data={data}
                            xScale={xScale}
                            yScale={yScale}
                            stepped
                            color={palette.primary.dark}
                        />
                        <Scatter
                            data={scatterData}
                            xScale={xScale}
                            yScale={yScale}
                        />
                    </svg>
                </Box>
            </Stack>
        </Paper>
    );
};

export { SessionLapTimeChart };
