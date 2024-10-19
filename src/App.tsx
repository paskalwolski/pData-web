import { useState, useEffect } from "react";
import "./App.css";

import { exampleData } from "./assets/data";
import LapCard from "./components/LapCard.component";
import LapData from "./components/LapData.component";
import LapSelector from "./components/LapSelector.component";
import EventSelector from "./components/EventSelector.component";

function App() {
    const [primaryEventData, setPrimaryEventData] = useState(null);
    const [secondaryEventData, setSecondaryEventData] = useState(exampleData);
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

    return (
        <>
            <div
                className="card"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                {primaryEventData ? (
                    <>
                        <b>
                            {primaryEventData.car} on {primaryEventData.track}
                        </b>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <LapSelector
                                {...{
                                    eventData: primaryEventData,
                                    onClick: setPrimaryLap,
                                }}
                            />
                            {secondaryEventData && (
                                <LapSelector
                                    {...{
                                        eventData: secondaryEventData,
                                        onClick: setSecondaryLap,
                                    }}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div>
                        <h3>Welcome to pData</h3>
                        <EventSelector setEvent={setPrimaryEventData} />
                    </div>
                )}
            </div>

            {primaryEventData && <LapData {...{ primaryLap, secondaryLap }} />}
        </>
    );
}

export default App;
