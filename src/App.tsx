// @ts-nocheck
import { useState, useEffect } from "react";
import "./App.css";

import LapData from "./components/LapData.component";
import LapSelector from "./components/LapSelector.component";
import EventSelector from "./components/EventSelector.component";
import SessionSelector from "./components/SessionSelector.component";

import { TbListSearch, TbPlaylistAdd, TbPlaylistX } from "react-icons/tb";

function App() {
    const [primaryEventData, setPrimaryEventData] = useState(null);
    const [isSelectingPrimary, setSelectingPrimary] = useState(true);
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
    }, [primaryEventData?.sessionId]);
    useEffect(() => {
        setSecondaryLap(null);
    }, [secondaryEventData?.sessionId]);
    useEffect(() => {
        setSelectingSecondary(false);
    }, [isSelectingPrimary]);

    return (
        <div style={{ height: "100vh", maxHeight: "100vh", overflow: "auto" }}>
            <div
                className="card"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    padding: "1em",
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
                                <button
                                    style={{
                                        fontSize: "large",
                                        padding: "3px 3px",
                                        display: "flex",
                                        alignItems: "center",
                                        margin: "2px",
                                    }}
                                    onClick={() => {
                                        setSelectingPrimary(
                                            !isSelectingPrimary
                                        );
                                    }}
                                >
                                    <TbListSearch />
                                </button>
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
                                    justifyContent: "end",
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
                                            isSecondary: true,
                                            isComparison:
                                                primaryLap && secondaryLap
                                                    ? true
                                                    : false,
                                        }}
                                    />
                                )}
                                {!isSelectingPrimary && (
                                    <button
                                        style={{
                                            fontSize: "large",
                                            padding: "3px 3px",
                                            display: "flex",
                                            alignItems: "center",
                                            margin: "2px",
                                        }}
                                        onClick={() =>
                                            setSelectingSecondary(
                                                !isSelectingSecondary
                                            )
                                        }
                                    >
                                        {secondaryEventData ? (
                                            <TbListSearch />
                                        ) : (
                                            <TbPlaylistAdd />
                                        )}
                                    </button>
                                )}
                                {secondaryEventData && (
                                    <button
                                        style={{
                                            fontSize: "large",
                                            padding: "3px 3px",
                                            display: "flex",
                                            alignItems: "center",
                                            margin: "2px",
                                            backgroundColor: "darkred",
                                            color: "whitesmoke",
                                        }}
                                        onClick={() =>
                                            setSecondaryEventData(null)
                                        }
                                    >
                                        <TbPlaylistX />
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <h1 style={{ color: "whitesmoke" }}>
                            Welcome to pData
                        </h1>
                    </div>
                )}
            </div>
            {isSelectingPrimary && (
                <SessionSelector
                    setSession={setPrimaryEventData}
                    setSelecting={setSelectingPrimary}
                    car={secondaryEventData?.car ?? null}
                    track={secondaryEventData?.track ?? null}
                    isPrimary={true}
                    required={primaryEventData == null}
                />
            )}
            {isSelectingSecondary && (
                <SessionSelector
                    setSession={setSecondaryEventData}
                    track={primaryEventData.track}
                    car={primaryEventData.car}
                    setSelecting={setSelectingSecondary}
                />
            )}
            {primaryLap && <LapData {...{ primaryLap, secondaryLap }} />}
        </div>
    );
}

export default App;
