// @ts-nocheck
import { useEffect, useState } from "react";
import Graph from "./Graph/Graph.component";
import Track from "./Track/Track.component";


const LapData = ({ primaryLap, secondaryLap }) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [graphRange, setGraphRange] = useState(null);

    useEffect(() => {
        resetGraphZoom();
    }, [primaryLap, secondaryLap]);

    const resetGraphZoom = () => {
        if (primaryLap) {
            setGraphRange([0, primaryLap.lap_data.length]);
        }
    };

    return (
        <div className="card" id="LapDataContainer">
            {graphRange ? (
                <>
                    <div
                        id="graphContainer"
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <div
                            id={"graphDetails"}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <b>{graphRange[0]}m</b>
                            <div
                                id="selectionDetails"
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    alignItems: "center",
                                }}
                            >
                                <button
                                    id={"resetButton"}
                                    onClick={resetGraphZoom}
                                >
                                    Reset
                                </button>
                                <b>
                                    Distance:{" "}
                                    {selectedPoint ? selectedPoint : "-"}
                                </b>
                            </div>
                            <b>{graphRange[1]}m</b>
                        </div>
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
