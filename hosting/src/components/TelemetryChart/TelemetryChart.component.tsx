import { useCallback, useMemo } from "react";
import { TelemetryLine } from "./TelemetryLine.component";
import * as d3 from "d3";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useTelemetryPointContext } from "../../hooks/useTelemetryPoint";
import { TelemetryDataSet } from "../../types";
import { TelemetryInterceptor } from "./TelemetryInterceptor";

interface TelemetryChartProps {
    title: string;
    data: TelemetryDataSet;
    secondaryData: TelemetryDataSet;
    stepped?: boolean;
}

const TelemetryChart = ({
    title,
    data,
    secondaryData,
    stepped = false,
}: TelemetryChartProps) => {
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

    const xDomain = useMemo(() => [0, data.length], [data.length]);

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([0, width]),
        [width, xDomain],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

    const { selectedIndex, setSelectedIndex } = useTelemetryPointContext();

    const selectedYValue = data[selectedIndex];

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const x0 = xScale.invert(d3.pointer(e)[0]);
            const x = Number(x0.toFixed(0));
            if (xDomain[0] <= x && x <= xDomain[1]) {
                setSelectedIndex(x);
            } else {
                setSelectedIndex(null);
            }
        },
        [setSelectedIndex, xScale, xDomain],
    );

    const handleMouseLeave = useCallback(
        () => setSelectedIndex(null),
        [setSelectedIndex],
    );

    return (
        <Paper>
            <Stack spacing={1} margin={1}>
                <Box width={1} flex={1} display="flex" justifyContent="center">
                    <Stack width={1} alignItems="start">
                        <Typography>{title}</Typography>
                        <Box flex={1}>
                            <Typography>
                                {isFinite(selectedYValue)
                                    ? selectedYValue
                                    : "-"}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                <Box ref={containerRef}>
                    <svg width={width} height={height}>
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
                        <TelemetryInterceptor
                            xScale={xScale}
                            yScale={yScale}
                            data={data}
                        />
                        <rect
                            style={{ pointerEvents: "all" }}
                            fill="none"
                            height={height}
                            width={width}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        />
                    </svg>
                </Box>
            </Stack>
        </Paper>
    );
};

export { TelemetryChart };
