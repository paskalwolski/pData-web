// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useMemo, useState, useRef } from "react";
import TrackLine from "./TrackLine.component";

// import TrackImage from "../../assets/map.png";

const Track = ({
    primaryLap,
    secondaryLap,
    trackData,
    selectedPoint,
    setSelectedPoint,
    graphRange,
}) => {
    const [focusPos, setFocusPos] = useState(null);

    const margin = 10;
    const [containerHeight, setContainerHeight] = useState(500);
    const [containerWidth, setContainerWidth] = useState(500);

    const [width, setWidth] = useState(containerWidth - margin);
    const [height, setHeight] = useState(containerHeight - margin);

    const [viewBox, setViewBox] = useState(`0 0 ${width} ${height}`);

    // Extract track values, adding fixed margins
    const IMG_WIDTH = Number(trackData.width ?? width);
    const IMG_HEIGHT = Number(trackData.height ?? height);
    const X_OFFSET = Number(trackData.xOffset ?? 0);
    const Y_OFFSET = Number(trackData?.yOffset ?? 0);
    const IMG_URL = trackData?.url ?? "";

    const trackContainer = useRef();

    const aspect = IMG_HEIGHT / IMG_WIDTH;

    const getTrackContainerSize = () => {
        const newDim = trackContainer.current.clientWidth;
        setContainerWidth(newDim);
        setContainerHeight(newDim);
    };

    useEffect(() => {
        setHeight(containerHeight - 2 * margin);
        // console.log("SETHEIGHT", containerHeight, containerHeight - 2 * margin);
    }, [containerHeight]);
    useEffect(() => {
        setWidth(containerWidth - 2 * margin);
        // console.log("SETWIDTH", containerWidth, containerWidth - 2 * margin);
    }, [containerWidth]);

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
    }, [width, height, aspect, IMG_WIDTH]);

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
    }, [width, height, aspect, IMG_HEIGHT]);

    const setFocus = useMemo(
        // Factory which returns a function
        () => (i) => {
            setSelectedPoint(i);
            const d = primaryLap.lap_data[i];
            setFocusPos([xScale(d.pos[0]), yScale(d.pos[2])]);
        },
        [xScale, yScale]
    );

    // const handleZoom = (e: React.WheelEvent<SVGSVGElement>) => {
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
    // };

    useEffect(() => {
        if (!selectedPoint) {
            setFocusPos(null);
            return;
        }
        setFocus(selectedPoint);
    }, [selectedPoint]);

    useEffect(() => {
        // Selection Context
        const start = graphRange[0];
        // TODO: Why adjust for last meter?
        const end = graphRange[1];

        const startPos = primaryLap.lap_data[start];
        let minX = startPos.pos[0];
        let maxX = startPos.pos[0];
        let minY = startPos.pos[2];
        let maxY = startPos.pos[2];

        primaryLap.lap_data.slice(start, end).map((lapData) => {
            const [posX, posY] = [lapData.pos[0], lapData.pos[2]];
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

        // Add MARGIN to the viewbox
        minX -= margin;
        minY -= margin;
        maxX += margin;
        maxY += margin;

        // console.log("BOUND", minX, maxX, minY, maxY);

        const scaledXStart = xScale(minX);
        const scaledYStart = yScale(minY);

        const scaledXEnd = xScale(maxX);
        const scaledYEnd = yScale(maxY);

        // Normalise to increasing values
        const normalXStart = Math.min(scaledXStart, scaledXEnd);
        const normalYStart = Math.min(scaledYStart, scaledYEnd);
        const normalWidth = Math.abs(scaledXEnd - scaledXStart);
        const normalHeight = Math.abs(scaledYEnd - scaledYStart);

        // console.log(
        //     "VB: ",
        //     `${normalXStart} ${normalYStart} ${normalWidth} ${normalHeight}`
        // );

        setViewBox(
            `${normalXStart} ${normalYStart} ${normalWidth} ${normalHeight}`
        );
    }, [JSON.stringify(graphRange), height, width]);

    return (
        <>
            <div id="trackContainer" ref={trackContainer}>
                <svg
                    width={containerWidth}
                    height={containerHeight}
                    style={{ margin: "0.1em" }}
                    // onWheel={handleZoom}
                    viewBox={viewBox}
                >
                    <image href={IMG_URL} width={width} height={height} />
                    <g>
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
