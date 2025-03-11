// @ts-nocheck
import * as d3 from "d3";
import { useEffect, useMemo, useState, useRef } from "react";
import TrackLine from "./TrackLine.component";
import { bufferDomain } from "./utils";

import TrackImage from "../../assets/vhe_interlagos gp.png";

const Track = ({
    primaryLap,
    secondaryLap,
    selectedPoint,
    setSelectedPoint,
    graphRange,
}) => {
    const [focusPos, setFocusPos] = useState(null);
    const [transform, setTransform] = useState(d3.zoomIdentity);

    const [height, setHeight] = useState(500);
    const [width, setWidth] = useState(500);
    const trackContainer = useRef();

    const rawImage = new Image();
    rawImage.src = TrackImage;
    console.log(rawImage.naturalWidth, rawImage.naturalHeight);
    const [imgWidth, imgHeight] = [
        rawImage.naturalWidth,
        rawImage.naturalHeight,
    ];

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
    }, [
        primaryLap.lapId,
        secondaryLap?.lapId,
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
        primaryLap.lapId,
        secondaryLap?.lapId,
        JSON.stringify(graphRange),
    ]);

    // TODO:
    const boundingDomains = useMemo(() => {
        // Taking both domains, figure out which one covers a larger area - and apply the same
        // 'zone' to keep a square aspect
        let selectedDomains = [xDomain, yDomain];
        const xDomRange = Number(xDomain[1]) - Number(xDomain[0]);
        const yDomRange = Number(yDomain[1]) - Number(yDomain[0]);
        if (xDomRange > yDomRange) {
            // X is bounding - convert y to use the same aspect
            const shift = Math.round(xDomRange / 2);
            const midYPoint = Number(yDomain[0]) + Math.round(yDomRange / 2);
            const boundYDomain = [midYPoint - shift, midYPoint + shift];
            selectedDomains = [xDomain, boundYDomain];
        } else if (yDomRange > xDomRange) {
            // Y is bounding
            const shift = Math.round(yDomRange / 2);
            const midXPoint = Number(xDomain[0]) + Math.round(xDomRange / 2);
            const boundXDomain = [midXPoint - shift, midXPoint + shift];
            selectedDomains = [boundXDomain, yDomain];
        }
        // If they're miraculously the same, use the original domains
        const bufferedDomains = selectedDomains.map((d) => bufferDomain(d));
        return bufferedDomains;
    }, [JSON.stringify(xDomain), JSON.stringify(yDomain)]);

    // Confirm aspect Ratio
    // useEffect(() => {
    //     const a =
    //         (boundingDomains[0][1] - boundingDomains[0][0]) /
    //         (boundingDomains[1][1] - boundingDomains[1][0]);
    //     console.log("Aspect: ", a);
    // }, [JSON.stringify(boundingDomains)]);

    const preScale 

    const xScale = useMemo(() => {
        return d3.scaleLinear().domain(boundingDomains[0]).range([0, width]);
        // return d3.scaleLinear().domain([0, imgWidth]).range([0, imgWidth]);
    }, [JSON.stringify(boundingDomains), width, height]);

    const yScale = useMemo(() => {
        return d3.scaleLinear().domain(boundingDomains[1]).range([0, height]);
    }, [JSON.stringify(boundingDomains), width, height]);

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

    console.log(TrackImage);

    return (
        <>
            <div id="trackContainer" ref={trackContainer}>
                <svg
                    width={width}
                    height={height}
                    // style={{ margin: "10px" }}
                    onWheel={handleZoom}
                >
                    <image href={TrackImage} width={width} height={height} />
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
        </>
    );
};

export default Track;
