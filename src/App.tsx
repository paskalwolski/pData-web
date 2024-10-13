import { useState, useEffect } from "react";
import "./App.css";

import { exampleData } from "./assets/data";
import LapCard from "./components/LapCard.component";
import LapData from "./components/LapData.component";

function App() {
    const eventData = exampleData;
    const [selectedLap, setSelectedLap] = useState(null);

    useEffect(() => {
        if (selectedLap !== null) {
            console.log(`Selected Lap ${selectedLap.lap_number}`);
        }
    }, [selectedLap]);

    const sanitizeLap = (lap) => {
        lap.lap_data.sort((a, b) => a.distance - b.distance);
        return lap;
    };

    return (
        <>
            <h1>
                {eventData.car} on {eventData.track} - {eventData.eventTime}
            </h1>
            <div className="card" id="lapSelector">
                {eventData.laps.map((lap, i) => {
                    return (
                        <LapCard
                            key={i}
                            {...{
                                lapData: lap,
                                isFastestLap:
                                    lap?.lap_number === eventData.fastestLap,
                            }}
                            onClick={() => {
                                setSelectedLap(sanitizeLap(lap));
                            }}
                        />
                    );
                })}
            </div>
            <LapData {...{ selectedLap }} />
        </>
    );
}

export default App;
