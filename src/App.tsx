import { useState, useEffect } from "react";
import "./App.css";

import { exampleData } from "./assets/data";
import LapCard from "./components/LapCard.component";
import LapData from "./components/LapData.component";

function App() {
    const eventData = exampleData;
    const [primaryLap, setPrimaryLap] = useState(null);
    const [secondaryLap, setSecondaryLap] = useState(null);

    useEffect(() => {
        if (primaryLap !== null) {
            console.log(`Primary Lap ${primaryLap.lap_number}`);
        }
    }, [primaryLap]);
    useEffect(() => {
        if (secondaryLap !== null) {
            console.log(`Secondary Lap ${secondaryLap.lap_number}`);
        }
    }, [secondaryLap]);

    const sanitizeLap = (lap) => {
        lap.lap_data.sort((a, b) => a.distance - b.distance);
        return lap;
    };

    return (
        <>
            <h1>
                {eventData.car} on {eventData.track} - {eventData.eventTime}
            </h1>
            <div
                className="card"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <div id="primaryLapSelector" style={{ display: "flex" }}>
                    {eventData.laps.map((lap, i) => {
                        return (
                            <LapCard
                                key={i}
                                {...{
                                    lapData: lap,
                                    isFastestLap:
                                        lap?.lap_number ===
                                        eventData.fastestLap,
                                }}
                                onClick={() => {
                                    setPrimaryLap(sanitizeLap(lap));
                                }}
                            />
                        );
                    })}
                </div>
                {primaryLap && (
                    <div id="secondaryLapSelector" style={{ display: "flex" }}>
                        {eventData.laps.map((lap, i) => {
                            return (
                                <LapCard
                                    key={i}
                                    {...{
                                        lapData: lap,
                                        isFastestLap:
                                            lap?.lap_number ===
                                            eventData.fastestLap,
                                    }}
                                    onClick={() => {
                                        setSecondaryLap(sanitizeLap(lap));
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            <LapData {...{ primaryLap, secondaryLap }} />
        </>
    );
}

export default App;
