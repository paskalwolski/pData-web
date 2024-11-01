// @ts-nocheck
import { useState, useEffect } from "react";
import "./App.css";

import LapData from "./components/LapData.component";
import LapSelector from "./components/LapSelector.component";
import EventSelector from "./components/EventSelector.component";
import SessionSelector from "./components/SessionSelector.component";

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
    useEffect(() => {
        setPrimaryLap(null);
    }, [primaryEventData]);
    useEffect(() => {
        setSecondaryLap(null);
    }, [secondaryEventData]);

    return (
        <div style={{ maxHeight: "100vh", overflow: "auto" }}>
            <div
                className="card"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flexShrink: 0,
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
                                gap: "10px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexGrow: 1,
                                    overflowX: "scroll",
                                    maxWidth:
                                        primaryEventData && secondaryEventData
                                            ? "50%"
                                            : "100%",
                                }}
                            >
                                <LapSelector
                                    {...{
                                        eventData: primaryEventData,
                                        selectLap: setPrimaryLap,
                                        selectedLap: primaryLap,
                                        isComparison:
                                            primaryLap && secondaryLap
                                                ? true
                                                : false,
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexGrow: 1,
                                    overflowX: "scroll",
                                    maxWidth:
                                        primaryEventData && secondaryEventData
                                            ? "50%"
                                            : "100%",
                                }}
                            >
                                {secondaryEventData && (
                                    <LapSelector
                                        {...{
                                            eventData: secondaryEventData,
                                            selectLap: setSecondaryLap,
                                            selectedLap: secondaryLap,
                                            isComparison:
                                                primaryLap && secondaryLap
                                                    ? true
                                                    : false,
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
                        {/* <EventSelector setEvent={setPrimaryEventData} /> */}
                        <SessionSelector setSession={setPrimaryEventData} />
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
        </div>
    );
}

export default App;
