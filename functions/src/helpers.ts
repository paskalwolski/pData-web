import {TelemetryDataSet} from './types';

// A channel the car doesn't report: empty, all null, or one value for the whole lap
export const isConstantSeries = (
  series: TelemetryDataSet | undefined,
): boolean => {
  if (!series || series.length === 0) {
    return true;
  }
  return series.every(value => value === series[0]);
};
