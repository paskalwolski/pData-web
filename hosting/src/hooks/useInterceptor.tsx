import { TelemetryDataSet } from "../types";

const createInterceptor =
    (
        xScale: d3.ScaleLinear<number, number, never>,
        yScale: d3.ScaleLinear<number, number, never>,
        dataset: TelemetryDataSet,
    ) =>
    (index: number) => [yScale(dataset[index]), xScale(index)];

export { createInterceptor };
