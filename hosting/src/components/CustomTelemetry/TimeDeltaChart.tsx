import { useMemo } from "react";
import { TelemetryDataSet } from "../../types";
import TelemetryChart from "../TelemetryChart";
import { TelemetryValueDisplayProps } from "../TelemetryChart/types";
import { TelemetryValueRender } from "../TelemetryChart/TelemetryValueRender";

const formatMillis = (t: number) => (t / 1000).toFixed(3) + "s";

interface Props {
    primaryLapData: TelemetryDataSet;
    secondaryLapData: TelemetryDataSet;
}
const TimeDeltaChart = ({ primaryLapData, secondaryLapData }: Props) => {
    const [negativeDeltaData, positiveDeltaData, rawData] = useMemo(() => {
        const smoothingWindow = 10;

        const rawDeltas = primaryLapData.map((t, i) => {
            const t2 = secondaryLapData[i];
            const delta = t != null && t2 != null ? t - t2 : undefined;
            return delta;
        });

        const negativeDelta: Array<number | undefined> = [];
        const positiveDelta: Array<number | undefined> = [];
        let lastDeltaNegative = true;
        const smoothedDeltas = rawDeltas.map((delta, i) => {
            const window = rawDeltas
                .slice(
                    Math.max(0, i - smoothingWindow),
                    Math.min(rawDeltas.length, i + smoothingWindow),
                )
                .filter((v): v is number => v != null);
            // Least Squares Regression for slope at this area
            const n = window.length;
            const sumX = (n * (n - 1)) / 2;
            const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
            const sumY = window.reduce((a, b) => a + b, 0);
            const sumXY = window.reduce((acc, y, i) => acc + i * y, 0);
            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            const fittedDelta =
                n > 1 ? slope * ((n - 1) / 2) + intercept : delta;
            // End of LSR
            // Apply hysteresis/threshold to catch near-0 fluctuations
            const prevNegative = lastDeltaNegative;
            if (Math.abs(slope) >= 0.3) lastDeltaNegative = slope <= 0;
            const flipped = prevNegative !== lastDeltaNegative;
            if (lastDeltaNegative) {
                negativeDelta.push(fittedDelta);
                positiveDelta.push(flipped ? fittedDelta : undefined);
            } else {
                negativeDelta.push(flipped ? fittedDelta : undefined);
                positiveDelta.push(fittedDelta);
            }
            return fittedDelta;
        });

        return [negativeDelta, positiveDelta, smoothedDeltas];
    }, [primaryLapData, secondaryLapData]);

    return (
        <TelemetryChart
            title={"Time Delta"}
            data={negativeDeltaData}
            secondaryData={positiveDeltaData}
            valueFormatter={formatMillis}
            mode="delta"
            rawData={rawData}
            slots={{
                primaryValue: false,
                secondaryValue: false,
                deltaValue: TimeDeltaValue,
            }}
        />
    );
};

const TimeDeltaValue = ({
    primaryValue,
    secondaryValue,
    valueFormatter,
}: TelemetryValueDisplayProps) => {
    const deltaValue = primaryValue ?? secondaryValue;
    return (
        <TelemetryValueRender
            valueFormatter={valueFormatter}
            value={deltaValue}
        />
    );
};

export { TimeDeltaChart };
