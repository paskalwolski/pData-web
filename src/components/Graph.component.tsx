import * as d3 from "d3";

const Graph = ({ selectedLap, selectedPoint, setSelectedPoint, ...props }) => {
    const height = 200;
    const width = 500;

    const saniData = selectedLap.lap_data.sort(
        (a, b) => a.distance - b.distance
    );

    const xScale = d3
        .scaleLinear()
        .domain(d3.extent(saniData, (data) => data.distance))
        .range([0, width]);

    const domain = d3.extent(selectedLap.lap_data, (data) => data.speed);
    const bufferedDomain = [domain[0] * 0.8, domain[1] * 1.1]; // Expand by ~10%
    const yScale = d3
        .scaleLinear()
        // .domain([0, maxSpeed])
        .domain(bufferedDomain)
        .range([height, 0]);

    const lineGenerator = d3
        .line()
        .x((d) => xScale(Number(Number(d.distance).toFixed(0))))
        .y((d) => yScale(d.speed));

    const linePath = lineGenerator(saniData);

    return (
        <div>
            <svg width={width} height={height}>
                {/* TODO: Draw the axis? */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="steelblue"
                    strokeWidth={2}
                ></path>
            </svg>
        </div>
    );
};
export default Graph;
