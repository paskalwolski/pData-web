import { useMemo } from "react";
import { TelemetryLine } from "./TelemetryLine.component";
import * as d3 from "d3";
import { useContainerWidth } from "../../hooks/useContainerWidth";

interface TelemetryChartProps {
    lapId: string;
    data: Array<number | undefined>;
    stepped?: boolean;
}

const TelemetryChart = ({ data, stepped = false }: TelemetryChartProps) => {
    const height = 200;

    const [containerRef, width] = useContainerWidth();

    const yDomain = d3.extent(data);
    const xDomain = useMemo(() => [0, data.length], [data.length]);

    // console.log(xDomain, yDomain);

    const xScale = useMemo(
        () => d3.scaleLinear().domain(xDomain).range([0, width]),
        [width, xDomain],
    );

    const yScale = useMemo(
        () => d3.scaleLinear().domain(yDomain).range([height, 0]),
        [height, yDomain],
    );

    return (
        <div id="graphContainer" ref={containerRef}>
            <svg width={width} height={height}>
                <TelemetryLine
                    data={data}
                    xScale={xScale}
                    yScale={yScale}
                    stepped={stepped}
                />
            </svg>
        </div>
    );
};

export { TelemetryChart };
