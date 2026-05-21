import { useMemo } from "react";
import { TelemetryDataSet } from "../types";
import TelemetryChart from "../components/TelemetryChart";

const formatMillis = (t: number) => (t / 1000).toFixed(3) + "s";

interface Props {
    primaryLapData: TelemetryDataSet;
    secondaryLapData: TelemetryDataSet;
}
const TimeDeltaChart = ({ primaryLapData, secondaryLapData }: Props) => {
    const effectiveTimeDelta = useMemo(
        () =>
            primaryLapData.map((t, i) => {
                const t2 = secondaryLapData[i];
                return t && t2 ? t - t2 : undefined;
            }),
        [primaryLapData, secondaryLapData],
    );

    return (
        <TelemetryChart
            title={"Time Delta"}
            data={effectiveTimeDelta}
            valueFormatter={formatMillis}
            mode="delta"
        />
    );
};

export { TimeDeltaChart };
