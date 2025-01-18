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
            let lastValid = 0;
            const fakeLapData = secondaryLap.lap_data.map((lt, i) => {
                let timedelta = Number(
                    (
                        (primaryLap.lap_data[Number(i)].lapTime - lt.lapTime) /
                        1000
                    ).toFixed(2) // Limit the delta to 2 precision points, but keep it as a number
                ); // Convert deltas to millis correctly
                timedelta = timedelta < 1 ? timedelta : lastValid;
                lastValid = timedelta;

                return {
                    timedelta: timedelta,
                    distance: i,
                };
            });
            return {
                lap_number: primaryLap.lap_number + secondaryLap.lap_number, // Fake number so that it changes if either lapnum changes
                lap_data: fakeLapData,
            };
        } else {
            return { lap_number: 0, lap_data: [] };
        }
    }, [primaryLap?.lap_number, secondaryLap?.lap_number]);

    return (
        <div className="card" id="LapDataContainer">
            {graphRange ? (
                <>
                    <div
                        id="graphSectionContainer"
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 3,
                            flexShrink: 1,
                            maxWidth: "60%",
                        }}
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
                    <div
                        id="trackSectionContainer"
                        style={{
                            flexGrow: 4,
                            maxWidth: "40%",
                        }}
                    >
                        <Track
                            {...{
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
                                graphRange,
                            }}
                        ></Track>
                    </div>
                </>
            ) : (
                <>Select a Lap to Get Started</>
            )}
        </div>
    );
};

export default LapData;
