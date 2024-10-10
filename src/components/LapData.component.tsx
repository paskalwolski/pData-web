import * as d3 from "d3"
import { useEffect, useRef } from "react"


const LapData = ({ selectedLap, ...props }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!selectedLap) return
        const minX = selectedLap.lap_data.reduce((d, min) => d.pos[0] < min.pos[0] ? d : min)
        const minY = selectedLap.lap_data.reduce((d, min) => d.pos[1] < min.pos[1] ? d : min)
        console.log("Minx", minX.pos[0], "MinY", minY.pos[1])
    }, [selectedLap])

    useEffect(() => {
        if (selectedLap) {
            const svg = d3.select(svgRef.current)
                .append("g")
                .attr('width', 500)
                .attr('height', 500)
                .style('border', '1px solid black')

            const xScale = d3.scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, data => data.pos[0]))
                .range([0, 500])
            const yScale = d3.scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, data => data.pos[1]))
                .range([0, 500])

            const lineGenerator = d3.line()
                .x((d) => xScale(d.pos[0]))
                .y((d) => yScale(d.pos[1]))
                .curve(d3.curveCatmullRom);

            svg.selectAll("*").remove();

            svg.append('path')
                .datum(selectedLap.lap_data)
                .attr("d", lineGenerator)
                .attr('fill', null)
                .attr('stroke', 'steelblue')
                .attr('strokewidth', 5)
        }
    }, [selectedLap])

    return (
        <div className="card" id={props?.id}>
            {selectedLap ?
                <>
                    <div>Lap Number {selectedLap.lap_number}</div>
                    <svg ref={svgRef} id='graph' width={600} height={600}></svg>
                </>
                :
                <>Select a Lap to Get Started</>}
        </div>
    )
}

export default LapData;