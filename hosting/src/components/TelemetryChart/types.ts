import { TelemetryMutator } from "../../helpers/telemetryMutators";
import { TelemetryData, TelemetryDataSet } from "../../types";

export type ValueFormatter = (v: number) => string | number;

export interface SeriesReadoutProps {
    value?: number;
    color?: string;
    valueFormatter?: ValueFormatter;
}

export interface ChartSeries {
    id: string;
    data: TelemetryDataSet;
    color: string;
    /** Readout text color; defaults to `color`. */
    readoutColor?: string;
    label?: string;
    stepped?: boolean;
    dashed?: boolean;
    /** Not drawn, but still feeds the y-domain and readouts. */
    hidden?: boolean;
    /** Defaults to a plain value readout; `false` hides it. */
    readout?: React.ComponentType<SeriesReadoutProps> | false;
}

export interface ChartBand {
    id: string;
    min: TelemetryDataSet;
    max: TelemetryDataSet;
    color: string;
    opacity?: number;
}

export type TelemetryChannel = keyof Pick<
    TelemetryData,
    "speed" | "gas" | "brake" | "steer" | "ers" | "gear" | "rpm"
>;

/** Per-channel defaults; explicit chart props and series fields win. */
export interface TelemetryChannelConfig {
    title: string;
    valueFormatter: ValueFormatter;
    mutators?: TelemetryMutator[];
    /** Default for every series. */
    stepped?: boolean;
    /** Default for every series. */
    readout?: React.ComponentType<SeriesReadoutProps>;
}

type TitleProps = { title: string };

export interface Slots {
    title?: React.ComponentType<TitleProps> | false;
}

export type TelemetryChartProps = {
    /** Pulls title, formatter, mutators and series defaults from `CHANNEL_CONFIG`. */
    channel?: TelemetryChannel;
    title?: string;
    series: ChartSeries[];
    bands?: ChartBand[];
    /** Show `series[0] - series[1]` after the series readouts. Defaults to true. */
    delta?: boolean;
    valueFormatter?: ValueFormatter;
    mutators?: TelemetryMutator[];
    slots?: Slots;
    elevation?: number;
};
