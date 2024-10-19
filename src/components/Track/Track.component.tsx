import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";
import TrackLine from "./TrackLine.component";

const Track = ({
    primaryLap,
    secondaryLap,
    selectedPoint,
    setSelectedPoint,
    graphRange,
}) => {
    const [focusPos, setFocusPos] = useState(null);
    const [transform, setTransform] = useState(d3.zoomIdentity);

    const height = 500;
    const width = 500;

    const xDomain = useMemo(() => {
        const dom = d3.extent(
            primaryLap.lap_data.slice(graphRange[0], graphRange[1]),
            (data) => data.pos[0]
        );
        if (secondaryLap) {
            const secDom = d3.extent(
                secondaryLap.lap_data.slice(graphRange[0], graphRange[1]),
                (data) => data.pos[0]
            );
            dom[0] = d3.min([dom[0], secDom[0]]);
            dom[1] = d3.max([dom[1], secDom[1]]);
        }
        return dom;
    }, [
        primaryLap.lap_number,
        secondaryLap?.lap_number,
        JSON.stringify(graphRange),
    ]);

    const yDomain = useMemo(() => {
        const dom = d3.extent(
            primaryLap.lap_data.slice(graphRange[0], graphRange[1]),
            (data) => data.pos[2]
        );
        if (secondaryLap) {
            const secDom = d3.extent(
                secondaryLap.lap_data.slice(graphRange[0], graphRange[1]),
                (data) => data.pos[2]
            );
            dom[0] = d3.min([dom[0], secDom[0]]);
            dom[1] = d3.max([dom[1], secDom[1]]);
        }
        return dom;
    }, [
        primaryLap.lap_number,
        secondaryLap?.lap_number,
        JSON.stringify(graphRange),
    ]);

    // TODO:
    const boundingDomains = useMemo(() => {
        // Taking both domains, figure out which one covers a larger area - and apply the same
        // 'zone' to keep a square aspect
        const xDomRange = Number(xDomain[1]) - Number(xDomain[0]);
        const yDomRange = Number(yDomain[1]) - Number(yDomain[0]);
        if (xDomRange > yDomRange) {
            // X is bounding - convert y to use the same aspect
            const shift = Math.round(xDomRange / 2);
            const midYPoint = Number(yDomain[0]) + Math.round(yDomRange / 2);
            const boundYDomain = [midYPoint - shift, midYPoint + shift];
            return [xDomain, boundYDomain];
        } else if (yDomRange > xDomRange) {
            // Y is bounding
            const shift = Math.round(yDomRange / 2);
            const midXPoint = Number(xDomain[0]) + Math.round(xDomRange / 2);
            const boundXDomain = [midXPoint - shift, midXPoint + shift];
            return [boundXDomain, yDomain];
        } else {
            // THey're miraculously the same
            return [xDomain, yDomain];
        }
    }, [JSON.stringify(xDomain), JSON.stringify(yDomain)]);

    // Confirm aspect Ratio
    // useEffect(() => {
    //     const a =
    //         (boundingDomains[0][1] - boundingDomains[0][0]) /
    //         (boundingDomains[1][1] - boundingDomains[1][0]);
    //     console.log("Aspect: ", a);
    // }, [JSON.stringify(boundingDomains)]);

    const xScale = useMemo(() => {
        return d3.scaleLinear().domain(boundingDomains[0]).range([0, width]);
    }, [JSON.stringify(boundingDomains)]);

    const yScale = useMemo(() => {
        return d3.scaleLinear().domain(boundingDomains[1]).range([0, height]);
    }, [JSON.stringify(boundingDomains)]);

    const setFocus = useMemo(
        // Factory which returns a function
        () => (i) => {
            setSelectedPoint(i);
            const d = primaryLap.lap_data[i];
            setFocusPos([xScale(d.pos[0]), yScale(d.pos[2])]);
        },
        [xScale, yScale]
    );

    const handleZoom = (e: React.WheelEvent<SVGSVGElement>) => {
        //     console.log(e.deltaY < 0 ? "Zooming In" : "Zooming Out");
        //     const delta = e.deltaY < 0 ? 1.01 : 0.99;
        //     const newK = transform.k * delta;
        //     const svg = e.currentTarget as SVGElement;
        //     const boundingRect = svg.getBoundingClientRect();
        //     const svgX = e.clientX - boundingRect.left;
        //     const svgY = e.clientY - boundingRect.top;
        //     const newX = svgX - transform.x * delta;
        //     const newY = svgY - transform.y * delta;
        //     setTransform({ k: newK, x: newX, y: newY });
    };

    useEffect(() => {
        if (!selectedPoint) {
            setFocusPos(null);
            return;
        }
        setFocus(selectedPoint);
    }, [selectedPoint]);

    return (
        <div>
            <svg
                width={width}
                height={height}
                style={{ margin: "10px" }}
                onWheel={handleZoom}
            >
                <g
                    transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k}, ${transform.k})`}
                >
                    {secondaryLap && ( // Ensure the secondary lap is rendered below
                        <TrackLine
                            {...{
                                data: secondaryLap.lap_data,
                                xScale,
                                yScale,
                                setFocus,
                                secondary: true,
                            }}
                        />
                    )}
                    <TrackLine
                        {...{
                            data: primaryLap.lap_data,
                            xScale,
                            yScale,
                            setFocus,
                            secondary: false,
                        }}
                    />
                    {focusPos && (
                        <circle
                            r={3}
                            fill={"red"}
                            stroke={"red"}
                            strokeWidth={2}
                            cx={focusPos[0]}
                            cy={focusPos[1]}
                        />
                    )}
                </g>
            </svg>
        </div>
    );
};

export default Track;
