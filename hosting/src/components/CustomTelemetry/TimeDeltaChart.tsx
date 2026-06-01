import { TelemetryData } from "../../types";
import TelemetryChart from "../TelemetryChart";
import { TelemetryValueDisplayProps } from "../TelemetryChart/types";
import { TelemetryValueRender } from "../TelemetryChart/TelemetryValueRender";
import { useChartDeltaSegments } from "../../hooks/useDeltaSegments";

const formatMillis = (t: number) => (t / 1000).toFixed(3) + "s";

interface Props {
    primaryData: TelemetryData;
    secondaryData: TelemetryData;
}
const TimeDeltaChart = ({ primaryData, secondaryData }: Props) => {
    const [
        rawDeltaData,
        { positive: negativeDeltaData, negative: positiveDeltaData },
    ] = useChartDeltaSegments(primaryData, secondaryData);

    return (
        <TelemetryChart
            title={"Time Delta"}
            data={negativeDeltaData}
            secondaryData={positiveDeltaData}
            valueFormatter={formatMillis}
            mode="delta"
            rawData={rawDeltaData}
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
