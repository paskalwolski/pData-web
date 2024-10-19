// @ts-nocheck
import { useState, useEffect } from "react";
import "./App.css";

import LapData from "./components/LapData.component";
import LapSelector from "./components/LapSelector.component";
import EventSelector from "./components/EventSelector.component";

function App() {
    const [primaryEventData, setPrimaryEventData] = useState(null);
    const [isSelectingSecondary, setSelectingSecondary] = useState(false);
    const [secondaryEventData, setSecondaryEventData] = useState(null);
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
                            {secondaryEventData && <button>Swap Events</button>}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {secondaryEventData && (
                                    <LapSelector
                                        {...{
                                            eventData: secondaryEventData,
                                            onClick: setSecondaryLap,
                                        }}
                                    />
                                )}
                                <button
                                    className="card"
                                    style={{
                                        fontSize: "x-large",
                                        padding: "3px 3px",
                                        display: "flex",
                                        alignItems: "center",
                                        margin: "2px",
                                    }}
                                    onClick={() => setSelectingSecondary(true)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <h3>Welcome to pData</h3>
                        <EventSelector setEvent={setPrimaryEventData} />
                    </div>
                )}
            </div>
            {isSelectingSecondary && (
                <EventSelector
                    {...{
                        setEvent: setSecondaryEventData,
                        existingEventData: primaryEventData,
                        setSelectingSecondary,
                    }}
                />
            )}
            {primaryEventData && <LapData {...{ primaryLap, secondaryLap }} />}
        </>
    );
}

export default App;
