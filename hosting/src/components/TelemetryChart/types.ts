import { TelemetryMutator } from "../../helpers/telemetryMutators";
import { TelemetryData, TelemetryDataSet } from "../../types";

export type ValueFormatter = (v: number) => string | number;

export interface SeriesReadoutProps {
    value?: number;
    color?: string;
    valueFormatter?: ValueFormatter;
}

/** Per-channel defaults; explicit chart props and series fields win. */
export interface TelemetryChannelConfig {
    title: string;
    valueFormatter?: ValueFormatter;
    mutators?: readonly TelemetryMutator[];
    /** Default for every series. */
    stepped?: boolean;
    /** Default for every series. */
    readout?: React.ComponentType<SeriesReadoutProps> | false;
    deltaReadout?: React.ComponentType<SeriesReadoutProps> | false;
}

export interface ChartSeries extends Partial<TelemetryChannelConfig> {
    id: string;
    data: TelemetryDataSet;
    color: string;
    dashed?: boolean;
    hidden?: boolean;
    gapped?: boolean;
    // Targeting TelemetryChannelConfig settings for override
    readoutColor?: string;
}

export interface ChartBand {
    id: string;
    min: TelemetryDataSet;
    max: TelemetryDataSet;
    color: string;
    opacity?: number;
}

export interface ChartReferenceLine {
    id: string;
    /** Y value (in data units) the horizontal line is drawn at. */
    value: number;
    color: string;
    dashed?: boolean;
}

export type TelemetryChannel = keyof Pick<
    TelemetryData,
    | "speed"
    | "gas"
    | "brake"
    | "steer"
    | "ers"
    | "gear"
    | "rpm"
    | "frontSlip"
    | "rearSlip"
>;

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
    /** Horizontal lines drawn across the plot area. */
    referenceLines?: ChartReferenceLine[];
    /** Show `series[0] - series[1]` after the series readouts. Defaults to true. */
    delta?: boolean;
    valueFormatter?: ValueFormatter;
    mutators?: TelemetryMutator[];
    slots?: Slots;
    elevation?: number;
};
