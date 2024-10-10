import * as d3 from "d3"
import { useEffect, useRef } from "react"


const LapData = ({ selectedLap, ...props }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (selectedLap) {
            const svg = d3.select(svgRef.current)
                .append("g")
                .attr('width', 520)
                .attr('height', 520)
                .style('border', '1px solid black')

            const xScale = d3.scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, data => data.pos[0]))
                .range([0, 500])
            const yScale = d3.scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, data => data.pos[2]))
                .range([0, 500])

            const lineGenerator = d3.line()
                .x((d) => xScale(d.pos[0]))
                .y((d) => yScale(d.pos[2]))
                .curve(d3.curveCatmullRom);

            const colorGen = (n) => {
                let gas, brake;
                ({ gas, brake } = n)
                if (gas != 0 && brake != 0) {
                    return `#000000`
                } else if (gas) {
                    return d3.hsl(120, 1, 1 - (gas * 0.5)).formatHex8()
                } else if (brake) {
                    return d3.hsl(0, 1, 1 - (brake * 0.5)).formatHex8()
                } else {
                    return "#FFFFFF"
                }
            }

            svg.select("g").remove();

            const g = svg.append("g")
            selectedLap.lap_data.reduce((o, n, i) => {

                const colour = colorGen(o)
                console.log(colour)

                g.append("path")
                    .datum([o, n])
                    .attr("d", lineGenerator)
                    .attr("fill", 'none')
                    .attr("stroke", colour)
                    .attr('stroke-width', 5)
                    .attr('data-id', i-1)
                    .on('mouseover', () => {
                        console.log(`Distance ${o.distance}`)
                    })

                // move onto the next point
                return n;
            })
            // svg.append('path')
            //     .datum(selectedLap.lap_data)
            //     .attr('fill', "none")
            //     .attr("d", lineGenerator)
            //     .attr('stroke', 'steelblue')
            //     .attr('stroke-width', 6)
        }
    }, [selectedLap])

    return (
        <div className="card" id={props?.id}>
            {selectedLap ?
                <>
                    <div>Lap Number {selectedLap.lap_number}</div>
                    <svg ref={svgRef} id='graph' height={520} width={520}></svg>
                </>
                :
                <>Select a Lap to Get Started</>}
        </div>
    )
}

export default LapData;