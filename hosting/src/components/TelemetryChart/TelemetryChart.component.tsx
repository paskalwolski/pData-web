import { useMemo } from "react";
import { TelemetryLine } from "./TelemetryLine.component";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Box, Paper, Stack, Typography } from "@mui/material";

interface TelemetryChartProps {
    title: string;
    lapId: string;
    data: Array<number | undefined>;
    stepped?: boolean;
}

const TelemetryChart = ({
    title,
    data,
    stepped = false,
}: TelemetryChartProps) => {
    const height = 200;

    const [containerRef, width] = useContainerSize();

    const yDomain = d3.extent(data);
    const xDomain = useMemo(() => [0, data.length], [data.length]);

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([0, width]),
        [width, xDomain],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

    return (
        <Paper>
            <Stack spacing={1} margin={1}>
                <Box width={1} flex={1} display="flex" justifyContent="center">
                    <Typography>{title}</Typography>
                </Box>
                <Box ref={containerRef}>
                    <svg width={width} height={height}>
                        <TelemetryLine
                            data={data}
                            xScale={xScale}
                            yScale={yScale}
                            stepped={stepped}
                        />
                    </svg>
                </Box>
            </Stack>
        </Paper>
    );
};

export { TelemetryChart };
