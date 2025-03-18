// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useMemo, useState, useRef } from "react";
import TrackLine from "./TrackLine.component";
import { bufferDomain } from "./utils";

import TrackImage from "../../assets/map.png";

const Track = ({
    primaryLap,
    secondaryLap,
    selectedPoint,
    setSelectedPoint,
    graphRange,
}) => {
    const [focusPos, setFocusPos] = useState(null);
    const [transform, setTransform] = useState(d3.zoomIdentity);
    const [viewBox, setViewBox] = useState("0 0 0 0");

    const IMG_WIDTH = 2173 + 20;
    const IMG_HEIGHT = 597 + 20;
    const X_OFFSET = 1176.15710449219;
    const Y_OFFSET = 301.185638427734;

    const [height, setHeight] = useState(500);
    const [width, setWidth] = useState(500);
    const trackContainer = useRef();

    const aspect = IMG_HEIGHT / IMG_WIDTH;

    const getTrackContainerSize = () => {
        const newDim = trackContainer.current.clientWidth;
        setWidth(newDim);
        setHeight(newDim);
    };

    useEffect(() => {
        // detect 'width' and 'height' on render
        getTrackContainerSize();
        // listen for resize changes, and detect dimensions again when they change
        window.addEventListener("resize", getTrackContainerSize);
        // cleanup event listener
        return () =>
            window.removeEventListener("resize", getTrackContainerSize);
    }, []);

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
    }, [primaryLap.lapId, secondaryLap?.lapId, JSON.stringify(graphRange)]);

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
    }, [primaryLap.lapId, secondaryLap?.lapId, JSON.stringify(graphRange)]);

    const xScale = useMemo(() => {
        // return d3.scaleLinear().domain(boundingDomains[0]).range([0, width]);
        // if (aspect>=1){ xoffset=} else {xoffset=0})
        const xOffset = aspect > 1 ? height * aspect : 0;
        return d3
            .scaleLinear()
            .domain([0 - X_OFFSET, IMG_WIDTH - X_OFFSET])
            .range([0, width]);
    }, [width, height]);

    const yScale = useMemo(() => {
        // return d3.scaleLinear().domain(boundingDomains[1]).range([0, height]);
        const yOffset = aspect < 1 ? width * aspect : 0;
        return d3
            .scaleLinear()
            .domain([0 - Y_OFFSET, IMG_HEIGHT - Y_OFFSET])
            .range([
                height * 0.5 - yOffset * 0.5,
                height * 0.5 + yOffset * 0.5,
            ]);
    }, [width, height]);

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

    useEffect(() => {
        console.log("GRAN: ", graphRange);
        // Selection Context
        const start = graphRange[0];
        // TODO: Why adjust for last meter?
        const end = graphRange[1];

        const startPos = primaryLap.lap_data[start];
        let minX = startPos.pos[0];
        let maxX = startPos.pos[0];
        let minY = startPos.pos[2];
        let maxY = startPos.pos[2];

        console.log("BASE", minX, maxX, minY, maxY);

        primaryLap.lap_data.slice(start, end).map((lapData, i) => {
            const [posX, _, posY] = lapData.pos;
            if (posX < minX) {
                minX = posX;
            }
            if (posX > maxX) {
                maxX = posX;
            }
            if (posY < minY) {
                minY = posY;
            }
            if (posY > maxY) {
                maxY = posY;
            }
        });

        console.log("BOUND", minX, maxX, minY, maxY);
        
        const scaledXStart = xScale(minX);
        const scaledYStart = yScale(minY);

        const scaledXEnd = xScale(maxX);
        const scaledYEnd = yScale(maxY);

        // Normalise to increasing values
        const normalXStart = Math.min(scaledXStart, scaledXEnd);
        const normalYStart = Math.min(scaledYStart, scaledYEnd);
        const normalWidth = Math.abs(scaledXEnd - scaledXStart);
        const normalHeight = Math.abs(scaledYEnd - scaledYStart);

        console.log(
            "VB: ",
            `${normalXStart} ${normalYStart} ${normalWidth} ${normalHeight}`
        );

        setViewBox(
            `${normalXStart} ${normalYStart} ${normalWidth} ${normalHeight}`
        );
    }, [JSON.stringify(graphRange), height, width]);

    return (
        <>
            <div id="trackContainer" ref={trackContainer}>
                <svg
                    width={width}
                    height={height}
                    style={{ margin: "10px" }}
                    onWheel={handleZoom}
                    viewBox={viewBox}
                >
                    <image
                        href={TrackImage}
                        width={width}
                        height={height}
                    />
                    <g
                    // transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k}, ${transform.k})`}
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
        </>
    );
};

export default Track;
