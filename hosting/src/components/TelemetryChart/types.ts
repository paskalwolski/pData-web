import { TelemetryMutator } from "../../helpers/telemetryMutators";
import { TelemetryDataSet } from "../../types";

export type TelemetryChartProps = {
    title: string;
    data: TelemetryDataSet;
    secondaryData?: TelemetryDataSet;
    valueFormatter?: (v: number) => string | number;
    mode?: TelemetryMode;
    rawData?: TelemetryDataSet;
    mutators?: TelemetryMutator[];
    slots?: Slots;
};

type TitleProps = {title: string}

export interface Slots {
    title?: React.ComponentType<TitleProps>;
    primaryValue?: React.ComponentType<TelemetryValueDisplayProps>;
    secondaryValue?: React.ComponentType<TelemetryValueDisplayProps>;
    deltaValue?: React.ComponentType<TelemetryValueDisplayProps>;
}

export type SlotVariant = "primary" | "secondary" | "delta";

export type TelemetryValueDisplayProps = Pick<
    TelemetryChartProps,
    "valueFormatter"
> & {
    primaryValue?: number;
    secondaryValue?: number;
    deltaValue?: number;
    variant: SlotVariant;
    index: number;
    color?: string;
};

export type TelemetryMode = "normal" | "stepped" | "delta";