// @ts-nocheck
import { useEffect, useState, useMemo } from "react";
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

    const deltaLap = useMemo(() => {
        if (primaryLap && secondaryLap) {
            // Confirm two laps, then create a fake lap object to plot the delta
            const fakeLapData = secondaryLap.lap_data.map((lt, i) => {
                // console.log("Primary Time", i, primaryLap.lap_data[i].lapTime);
                // console.log("Secondary Time", i, lt.lapTime);
                return {
                    timedelta:
                        (lt.lapTime - primaryLap.lap_data[i].lapTime) / 1000,
                    distance: i,
                };
            });
            return {
                lap_number: primaryLap.lap_number ?? secondaryLap.lap_number,
                lap_data: fakeLapData,
            };
        } else {
            return { lap_data: [] };
        }
    }, [primaryLap?.lap_number, secondaryLap?.lap_number]);

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
                        {secondaryLap && (
                            <Graph
                                {...{
                                    targets: [
                                        {
                                            target: "timedelta",
                                            color: "green",
                                        },
                                    ],
                                    primaryLap: deltaLap,
                                    selectedPoint,
                                    setSelectedPoint,
                                    graphRange,
                                    setGraphRange,
                                    fixed: 3,
                                }}
                            />
                        )}
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
