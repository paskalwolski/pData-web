import { useMemo } from "react";
import { useTheme } from "@mui/material";
import { TelemetryData } from "../../types";
import TelemetryChart, { ChartSeries } from "../TelemetryChart";
import { useChartDeltaSegments } from "../../hooks/useDeltaSegments";

const formatMillis = (t: number) => (t / 1000).toFixed(3) + "s";

interface Props {
    primaryData: TelemetryData;
    secondaryData: TelemetryData;
}
const TimeDeltaChart = ({ primaryData, secondaryData }: Props) => {
    const { palette } = useTheme();
    const [
        rawDeltaData,
        { positive: positiveDeltaData, negative: negativeDeltaData },
    ] = useChartDeltaSegments(primaryData, secondaryData);

    const series = useMemo<ChartSeries[]>(
        () => [
            {
                id: "delta",
                data: rawDeltaData,
                color: palette.text.primary,
                hidden: true,
            },
            {
                id: "positive",
                data: positiveDeltaData,
                color: palette.success.dark,
                readout: false,
            },
            {
                id: "negative",
                data: negativeDeltaData,
                color: palette.error.dark,
                readout: false,
            },
        ],
        [rawDeltaData, positiveDeltaData, negativeDeltaData, palette],
    );

    return (
        <TelemetryChart
            title={"Time Delta"}
            series={series}
            delta={false}
            valueFormatter={formatMillis}
        />
    );
};

export { TimeDeltaChart };
