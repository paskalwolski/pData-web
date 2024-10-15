import { useState } from "react";
import GraphDisplay from "./GraphDisplay.component";
import TrackDisplay from "./TrackDisplay.component";
import Graph from "./Graph.component";
import Track from "./Track.component";

const LapData = ({ primaryLap, secondaryLap }) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    return (
        <div className="card" id="LapDataContainer">
            {primaryLap ? (
                <>
                    {/* <GraphDisplay
            {...{ primaryLap, selectedPoint, setSelectedPoint }}
          ></GraphDisplay> */}
                    <div
                        id="graphContainer"
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <Graph
                            {...{
                                targets: [{ target: "speed" }],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
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
                            }}
                            ></Graph>
                        <Graph
                            {...{
                                targets: [{ target: "steer", color: "purple" }],
                                primaryLap,
                                secondaryLap,
                                selectedPoint,
                                setSelectedPoint,
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
                            }}
                        ></Graph>
                    </div>
                    <Track
                        {...{ primaryLap, secondaryLap, selectedPoint, setSelectedPoint }}
                    ></Track>
                </>
            ) : (
                <>Select a Lap to Get Started</>
            )}
        </div>
    );
};

export default LapData;
