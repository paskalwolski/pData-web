import { useEffect, useState } from "react";
import GraphDisplay from "./GraphDisplay.component";
import TrackDisplay from "./TrackDisplay.component";
import Graph from "./Graph/Graph.component";
import Track from "./Track/Track.component";

import * as d3 from "d3";

const LapData = ({ primaryLap, secondaryLap }) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [graphRange, setGraphRange] = useState(null);

    useEffect(() => {
        if (primaryLap) {
            setGraphRange([0, primaryLap.lap_data.length]);
        }
    }, [primaryLap, secondaryLap]);
    return (
        <div className="card" id="LapDataContainer">
            {graphRange ? (
                <>
                    <div
                        id="graphContainer"
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        {/* {secondaryLap && (
                            <TimingGraph
                                {...{
                                    targets: [{ target: "lapTime" }],
                                    primaryLap,
                                    secondaryLap,
                                    selectedPoint,
                                    setSelectedPoint,
                                    graphRange,
                                    setGraphRange,
                                }}
                            />
                        )} */}
                        <Graph
                            {...{
                                targets: [{ target: "speed", color: "blue" }],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
                                graphRange,
                                setGraphRange,
                                fixed: 0,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [
                                    { target: "gas", color: "green" },
                                    { target: "brake", color: "red" },
                                ],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
                                graphRange,
                                setGraphRange,
                                fixed: 2,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [{ target: "steer", color: "purple" }],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
                                graphRange,
                                setGraphRange,
                                fixed: 0,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [
                                    { target: "rpm", color: "steelblue" },
                                ],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
                                graphRange,
                                setGraphRange,
                                fixed: 0,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [
                                    { target: "gear", color: "steelblue" },
                                ],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
                                graphRange,
                                setGraphRange,
                                fixed: 0,
                            }}
                            stepped
                        ></Graph>
                    </div>
                    <Track
                        {...{
                            primaryLap,
                            secondaryLap,
                            selectedPoint,
                            setSelectedPoint,
                            graphRange,
                        }}
                    ></Track>
                </>
            ) : (
                <>Select a Lap to Get Started</>
            )}
        </div>
    );
};

export default LapData;
