import { TelemetryDataSet } from "../../types";

export interface AggregateSeries {
    data: TelemetryDataSet;
    color: string;
    label?: string;
    stepped?: boolean;
}

export type AggregateTelemetryChartProps = {
    title: string;
    data: AggregateSeries[];
    minSeries: TelemetryDataSet;
    maxSeries: TelemetryDataSet;
    valueFormatter?: (v: number) => string | number;
    elevation?: number;
};
