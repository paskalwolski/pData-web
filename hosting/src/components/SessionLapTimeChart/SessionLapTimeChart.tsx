import { useMemo, useState } from "react";
import * as d3 from "d3";
import {
    Box,
    Checkbox,
    FormControlLabel,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { useContainerSize } from "../../hooks/useContainerSize";
import { Line } from "../Charts";
import { LapInfo } from "../../types";
import { Scatter } from "../Charts";
import { YAxisLabels } from "../Charts";
import { formatDuration } from "../../helpers/formatDuration";

interface Props {
    laps: (LapInfo & { color: string })[];
}

const lapTimeLabelFormatter = (v: number) =>
    formatDuration(v, { milliPrecision: 0 });

const SessionLapTimeChart = ({ laps }: Props) => {
    const { palette } = useTheme();

    const height = 300;
    const padding = 8;
    const leftPadding = 36;
    const [containerRef, width] = useContainerSize();

    const [showPitLaps, setShowPitLaps] = useState(true);
    const [showInvalidLaps, setShowInvalidLaps] = useState(true);
    const [showStartLap, setShowStartLap] = useState(true);

    const filteredLaps = useMemo(
        () =>
            laps.filter(
                (lap) =>
                    (showPitLaps || !lap.isPit) &&
                    (showInvalidLaps || lap.isValid) &&
                    (showStartLap || lap.lapNumber !== 1),
            ),
        [laps, showPitLaps, showInvalidLaps, showStartLap],
    );

    const data = useMemo(
        () => filteredLaps.map((lap) => lap.lapTime),
        [filteredLaps],
    );

    const scatterData = useMemo(
        () =>
            filteredLaps.map((l, i) => ({
                x: i,
                y: l.lapTime,
                z: l.color,
            })),

        [filteredLaps],
    );

    const xScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([0, data.length - 1])
                .range([leftPadding, width - padding]),
        [width, data.length],
    );

    const [minTime, maxTime] = useMemo(() => {
        const [min, max] = d3.extent(data);
        return [Math.floor(min / 1000) * 1000, Math.ceil(max / 1000) * 1000];
    }, [data]);

    const yScale = useMemo(
        () =>
            d3
                .scaleLinear()
                .domain([minTime, maxTime])
                .range([height - padding, padding]),
        [minTime, maxTime],
    );

    return (
        <Paper>
            <Stack spacing={1} margin={1} padding={2}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography>Laptimes</Typography>
                    <Stack direction="row">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={showStartLap}
                                    onChange={(e) =>
                                        setShowStartLap(e.target.checked)
                                    }
                                />
                            }
                            label="Start Lap"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={showPitLaps}
                                    onChange={(e) =>
                                        setShowPitLaps(e.target.checked)
                                    }
                                />
                            }
                            label="Pit Laps"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={showInvalidLaps}
                                    onChange={(e) =>
                                        setShowInvalidLaps(e.target.checked)
                                    }
                                />
                            }
                            label="Invalid Laps"
                        />
                    </Stack>
                </Stack>
                <Box ref={containerRef}>
                    <svg width={width} height={height}>
                        <YAxisLabels
                            yScale={yScale}
                            min={minTime}
                            max={maxTime}
                            width={width}
                            leftPadding={leftPadding}
                            padding={padding}
                            formatLabel={lapTimeLabelFormatter}
                        />
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
