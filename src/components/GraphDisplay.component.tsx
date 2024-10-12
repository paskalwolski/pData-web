import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

const GraphDisplay = ({ selectedLap, ...props }) => {
  // NB THIS IS WRONG - CLEAN UP THE INCOMING DATA to move the last dp into the next lap...forever!
  const [saniData, setSaniData] = useState(null);
  const graphRef = useRef(null);

  const gHeight = 200;
  const gWidth = 500;

  useEffect(() => {
    setSaniData(selectedLap.lap_data.sort((a, b) => a.distance - b.distance));
  }, [selectedLap]);

  useEffect(() => {
    if (saniData) {
      // Setup of svg 'constants'
      const margins = { top: 0, left: 30, bottom: 0, right: 5 };
      const height = 200 - margins.top - margins.bottom;
      const width = 450 - margins.left - margins.right;
      const svg = d3
        .select(graphRef.current)
        .style("border", "1px solid black");

      // Clear all previous
      svg.selectAll("*").remove();

      // Set up X Scale
      const xScale = d3
        .scaleLinear()
        .domain(d3.extent(saniData, (data) => data.distance))
        .range([0, width]);
      // svg.append("g")
      //     .attr("transform", `translate(${margins.left}, ${gHeight - margins.bottom})`)
      //     .classed("axis", true)
      //     .call(d3.axisBottom(xScale)
      //         .ticks(8))

      // Set up Y Scale and Axis
      const domain = d3.extent(selectedLap.lap_data, (data) => data.speed);
      const bufferedDomain = [domain[0] * 0.8, domain[1] * 1.1]; // Expand by ~10%
      const yScale = d3
        .scaleLinear()
        // .domain([0, maxSpeed])
        .domain(bufferedDomain)
        .range([height, 0]);
      svg
        .append("g")
        .attr("transform", `translate(${margins.left}, ${margins.top})`)
        .classed("axis", true)
        .call(d3.axisLeft(yScale).ticks(4));

      // Create the chart graphics area
      const g = svg
        .append("g")
        .attr("transform", `translate(${margins.left}, ${margins.top})`);
      // Line Generator Function
      const lineGenerator = d3
        .line()
        .x((d) => xScale(Number(d.distance).toFixed(0)))
        .y((d) => yScale(d.speed));
      // Create the line
      g.append("path")
        .datum(saniData)
        .attr("d", lineGenerator)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("fill", "none");

      // Declare focus point
      const focusPoint = g
        .append("circle")
        .style("opacity", 0)
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("r", 5);

      const mouseover = () => {
        focusPoint.style("opacity", 1);
      };
      const mousemove = (e) => {
        const x0 = xScale.invert(d3.pointer(e)[0]);
        const i = bisector(saniData, x0);
        drawFocus(i);
      };
      const mouseout = () => {
        focusPoint.style("opacity", 0);
      };
      // Find Y intercept
      const bisector = d3.bisector((d) => d.distance).left;
      // Draw the focus point
      const drawFocus = (i) => {
        const selectedData = saniData[i];
        focusPoint
          .attr("cx", xScale(selectedData.distance))
          .attr("cy", yScale(selectedData.speed));
      };
      // Create Mouse Capture layer
      g.append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);
    }
  }, [saniData]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h3>Speed</h3>
      <svg ref={graphRef} height={gHeight} width={gWidth}></svg>
    </div>
  );
};

export default GraphDisplay;
