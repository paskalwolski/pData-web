import { TelemetryDataSet } from "../types";
import { round as mathRound } from "lodash";

export type TelemetryMutator = (data: TelemetryDataSet) => TelemetryDataSet;

const invert: TelemetryMutator = (data) => data.map((d) => -d);

const round: TelemetryMutator = (data) => data.map((d) => mathRound(d, 0));

export { invert, round };
