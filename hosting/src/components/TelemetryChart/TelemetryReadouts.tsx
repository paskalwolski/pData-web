import { useCallback } from "react";
import { deltaFormatter as baseDeltaFormatter } from "../../helpers/telemetryValueFormatter";
import { TelemetryValueRender } from "./TelemetryValueRender";
import { ChartSeries, SeriesReadoutProps, ValueFormatter } from "./types";

interface Props {
    series: ChartSeries[];
    delta: boolean;
    deltaReadout?: React.ComponentType<SeriesReadoutProps> | false;
    index: number | undefined;
    valueFormatter?: ValueFormatter;
}

const TelemetryReadouts = ({
    series,
    delta,
    deltaReadout,
    index,
    valueFormatter,
}: Props) => {
    const deltaFormatter = useCallback(
        (v: number) => baseDeltaFormatter(valueFormatter?.(v) ?? v),
        [valueFormatter],
    );

    const [a, b] = series;
    const aValue = a?.data[index];
    const bValue = b?.data[index];
    const deltaValue =
        aValue != null && bValue != null ? aValue - bValue : undefined;

    const DeltaReadout =
        deltaReadout === false
            ? undefined
            : (deltaReadout ?? TelemetryValueRender);

    return (
        <>
            {series.map((s) => {
                if (s.readout === false) return null;
                const Readout = s.readout ?? TelemetryValueRender;
                return (
                    <Readout
                        key={s.id}
                        value={s.data[index]}
                        color={s.readoutColor ?? s.color}
                        valueFormatter={valueFormatter}
                    />
                );
            })}
            {delta && a && b && DeltaReadout && (
                <DeltaReadout
                    value={deltaValue}
                    valueFormatter={deltaFormatter}
                />
            )}
        </>
    );
};

export { TelemetryReadouts };
