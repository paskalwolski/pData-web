import GraphDisplay from "./GraphDisplay.component";
import TrackDisplay from "./TrackDisplay.component";

const LapData = ({ selectedLap }) => {

    return (
        <div className="card" id="LapDataContainer">
            <>{selectedLap && true}</>
            {selectedLap ?
                <>
                    <GraphDisplay {...{ selectedLap }}></GraphDisplay>
                    <TrackDisplay id='lapDisplay' {...{ selectedLap }}></TrackDisplay>
                </>
                :
                <>Select a Lap to Get Started</>
            }
        </div>
    )
}

export default LapData;