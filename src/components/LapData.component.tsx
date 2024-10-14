import { useState } from "react";
import GraphDisplay from "./GraphDisplay.component";
import TrackDisplay from "./TrackDisplay.component";
import Graph from "./Graph.component";
import Track from "./Track.component";

const LapData = ({ selectedLap }) => {
    const [selectedPoint, setSelectedPoint] = useState(null);
    return (
        <div className="card" id="LapDataContainer">
            {selectedLap ? (
                <>
                    {/* <GraphDisplay
            {...{ selectedLap, selectedPoint, setSelectedPoint }}
          ></GraphDisplay> */}
                    <div
                        id="graphContainer"
                        style={{ display: "flex", flexDirection: "column" }}
                    >
                        <Graph
                            {...{
                                targets: [{ target: "speed" }],
                                selectedLap,
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
                                selectedLap,
                                selectedPoint,
                                setSelectedPoint,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [
                                    { target: "steer", color: "purple" },
                                ],
                                selectedLap,
                                selectedPoint,
                                setSelectedPoint,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [
                                    { target: "rpm", color: "steelblue" },
                                ],
                                selectedLap,
                                selectedPoint,
                                setSelectedPoint,
                            }}
                        ></Graph>
                        <Graph
                            {...{
                                targets: [
                                    { target: "gear", color: "steelblue" },
                                ],
                                selectedLap,
                                selectedPoint,
                                setSelectedPoint,
                            }}
                        ></Graph>
                    </div>
                    <Track
                        {...{ selectedLap, selectedPoint, setSelectedPoint }}
                    ></Track>
                </>
            ) : (
                <>Select a Lap to Get Started</>
            )}
        </div>
    );
};

export default LapData;
