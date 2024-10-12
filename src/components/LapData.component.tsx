import { useState } from "react";
import GraphDisplay from "./GraphDisplay.component";
import TrackDisplay from "./TrackDisplay.component";
import Graph from "./Graph.component";

const LapData = ({ selectedLap }) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  return (
    <div className="card" id="LapDataContainer">
      <>{selectedLap && true}</>
      {selectedLap ? (
        <>
          {/* <GraphDisplay
            {...{ selectedLap, selectedPoint, setSelectedPoint }}
          ></GraphDisplay> */}
          <Graph {...{ selectedLap, selectedPoint, setSelectedPoint }}></Graph>
          <TrackDisplay
            id="lapDisplay"
            {...{ selectedLap, selectedPoint, setSelectedPoint }}
          ></TrackDisplay>
        </>
      ) : (
        <>Select a Lap to Get Started</>
      )}
    </div>
  );
};

export default LapData;
