import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

const GraphDisplay = ({ selectedLap, ...props }) => {

    // NB THIS IS WRONG - CLEAN UP THE INCOMING DATA to move the last dp into the next lap...forever! 
    const [saniData, setSaniData] = useState(null)
    const graphRef = useRef(null)

    const gHeight = 200
    const gWidth = 500

    useEffect(() => {
        setSaniData(selectedLap.lap_data.sort((a, b) => a.distance - b.distance))
        
    }, [selectedLap])

    useEffect(() => {
        if (saniData) {

            const margins = { top: 5, left: 30, bottom: 20, right: 5 }
            const height = 200 - margins.top - margins.bottom
            const width = 500 - margins.left - margins.right
            const svg = d3.select(graphRef.current)
                .style('border', '1px solid black')

            svg.selectAll("*").remove()

            const maxSpeed = Number(d3.max(saniData, data => data.speed))

            const xScale = d3.scaleLinear()
                .domain(d3.extent(saniData, data => data.distance))
                .range([0, width])
            svg.append("g")
                .attr("transform", `translate(${margins.left}, ${gHeight - margins.bottom})`)
                .call(d3.axisBottom(xScale))


            const yScale = d3.scaleLinear()
                // .domain([0, maxSpeed])
                .domain(d3.extent(saniData, data => data.speed))
                .range([height, 0])
            svg.append("g")
                .attr("transform", `translate(${margins.left}, ${margins.top})`)
                .call(d3.axisLeft(yScale)
                    .ticks(4))

            const lineGenerator = d3.line()
                .x(d => xScale(d.distance))
                .y(d => yScale(d.speed))

            const g = svg.append("g")
                .attr("transform", `translate(${margins.left}, ${margins.top})`)

            g.append("path")
                .datum(saniData)
                .attr("d", lineGenerator)
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 2)
                .attr('fill', "none")
        }
    }, [saniData])

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
            <h3>Speed</h3>
            <svg ref={graphRef} height={gHeight} width={gWidth}></svg>
        </div>
    )
}

export default GraphDisplay;