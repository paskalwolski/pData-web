import { TelemetryDataSet } from "../types";

export type TelemetryMutator = (data: TelemetryDataSet) => TelemetryDataSet;

const invert: TelemetryMutator = (data) => data.map((d) => -d);

export { invert };
