import { useMemo } from "react";
import { useTheme } from "@mui/material";
import { TelemetryData } from "../../types";
import TelemetryChart, {
    ChartReferenceLine,
    ChartSeries,
} from "../TelemetryChart";
import { useTelemetryPointContext } from "../../hooks/TelemetryPointContext/useTelemetryPoint";
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
                gapped: true,
            },
            {
                id: "negative",
                data: negativeDeltaData,
                color: palette.error.dark,
                readout: false,
                gapped: true,
            },
        ],
        [rawDeltaData, positiveDeltaData, negativeDeltaData, palette],
    );

    const { selectionStartIndex } = useTelemetryPointContext();
    const startValue =
        selectionStartIndex != null
            ? rawDeltaData[selectionStartIndex]
            : undefined;
    const referenceLines = useMemo<ChartReferenceLine[]>(
        () =>
            startValue != null && isFinite(startValue)
                ? [
                      {
                          id: "selection-start",
                          value: startValue,
                          color: palette.text.secondary,
                          dashed: true,
                      },
                  ]
                : [],
        [startValue, palette],
    );

    return (
        <TelemetryChart
            title={"Time Delta"}
            series={series}
            referenceLines={referenceLines}
            delta={false}
            valueFormatter={formatMillis}
        />
    );
};

export { TimeDeltaChart };
