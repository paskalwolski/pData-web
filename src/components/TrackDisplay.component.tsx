import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"


const TrackDisplay = ({ selectedLap, ...props }) => {
    const svgRef = useRef(null);

    const [isSecondaryLap, setSecondaryLap] = useState(false)

    const handleSecondaryLap = () => {
        const neededState = !isSecondaryLap
        if (neededState) {
            d3.selectAll("path")
                .classed("secondary", true)
        } else {
            d3.selectAll("path")
                .classed("secondary", false)
        }

        setSecondaryLap(!isSecondaryLap)
    }

    useEffect(() => {
        if (selectedLap) {
            const svg = d3.select(svgRef.current)
                .attr('width', 320)
                .attr('height', 320)
                .style('border', '1px solid black')
            // TODO: limit this cleanup to this graph
            d3.selectAll("g").selectAll("path").remove()

            const xScale = d3.scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, data => data.pos[0]))
                .range([0, 300])
            const yScale = d3.scaleLinear()
                .domain(d3.extent(selectedLap.lap_data, data => data.pos[2]))
                .range([0, 300])

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
            
            

            const g = svg.append("g")
            selectedLap.lap_data.reduce((o, n, i) => {

                const colour = colorGen(o)

                g.append("path")
                    .datum([o, n])
                    .attr("d", lineGenerator)
                    .attr("fill", 'none')
                    .attr("stroke", colour)
                    .attr('stroke-width', 3)
                    .attr('data-id', i - 1)
                    .on('mouseover', () => {
                        console.log(`Distance ${o.distance}`)
                    })

                // move onto the next point
                return n;
            })
        }
    }, [selectedLap])

    return (
        <div style={{display: "flex", flexDirection: "column", flexBasis: 1, flexGrow: 0}}>
            <input id='tempSecondLapCheck' type="checkbox" checked={isSecondaryLap} onChange={handleSecondaryLap}></input>
            <label htmlFor='tempSecondLapCheck'>Secondary Lap</label>
            <svg ref={svgRef} id='graph' height={320} width={320}></svg>
        </div>
    )
}

export default TrackDisplay;