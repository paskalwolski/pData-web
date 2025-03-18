// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useMemo, useState, useRef } from "react";
import TrackLine from "./TrackLine.component";

import TrackImage from "../../assets/map.png";

const Track = ({
    primaryLap,
    secondaryLap,
    selectedPoint,
    setSelectedPoint,
    graphRange,
}) => {
    const [focusPos, setFocusPos] = useState(null);
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

    const getRange = (bound: number, offset: number) => {
        if (offset != 0) {
            // This axis needs to be centered
            return [(bound - offset) * 0.5, (bound + offset) * 0.5];
        } else {
            // No centering needed - returning full range
            return [0, bound];
        }
    };

    const xScale = useMemo(() => {
        const xOffset = aspect > 1 ? height * aspect : 0;
        return (
            d3
                .scaleLinear()
                .domain([0 - X_OFFSET, IMG_WIDTH - X_OFFSET])
                // .range([0, width]);
                .range(getRange(width, xOffset))
        );
    }, [width, height]);

    const yScale = useMemo(() => {
        const yOffset = aspect < 1 ? width * aspect : 0;
        return (
            d3
                .scaleLinear()
                .domain([0 - Y_OFFSET, IMG_HEIGHT - Y_OFFSET])
                // .range([
                //     height * 0.5 - yOffset * 0.5,
                //     height * 0.5 + yOffset * 0.5,
                // ]);
                .range(getRange(height, yOffset))
        );
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
                    <image href={TrackImage} width={width} height={height} />
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
