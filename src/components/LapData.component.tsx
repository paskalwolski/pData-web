import GraphDisplay from "./GraphDisplay.component";
import TrackDisplay from "./TrackDisplay.component";

const LapData = ({ selectedLap }) => {

    return (
        <div className="card">
            <>{selectedLap && true}</>
            {selectedLap ?
                <>
                    <TrackDisplay id='lapDisplay' {...{ selectedLap }}></TrackDisplay>
                    <GraphDisplay {...{ selectedLap }}></GraphDisplay>
                </>
                :
                <>Select a Lap to Get Started</>
            }
        </div>
    )
}

export default LapData;