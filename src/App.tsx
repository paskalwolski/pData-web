// @ts-nocheck
import { useState, useEffect } from "react";
import "./App.css";

import LapData from "./components/LapData.component";
import LapSelector from "./components/LapSelector.component";
import EventSelector from "./components/EventSelector.component";
import SessionSelector from "./components/SessionSelector.component";

import {
    TbArrowAutofitRight,
    TbArrowsDiff,
    TbListSearch,
    TbPlaylistAdd,
    TbPlaylistX,
} from "react-icons/tb";

function App() {
    const [primaryEventData, setPrimaryEventData] = useState(null);
    const [isSelectingPrimary, setSelectingPrimary] = useState(true);
    const [isSelectingSecondary, setSelectingSecondary] = useState(false);
    const [secondaryEventData, setSecondaryEventData] = useState(null);
    const [primaryLap, setPrimaryLap] = useState(null);
    const [secondaryLap, setSecondaryLap] = useState(null);

    useEffect(() => {
        if (primaryLap !== null) {
            console.log(`Primary Lap ${primaryLap.lapId}`);
        }
    }, [primaryLap]);
    useEffect(() => {
        if (secondaryLap !== null) {
            console.log(`Secondary Lap ${secondaryLap.lapId}`);
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
                    padding: "1em 0.4em",
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
                                gap: "5px",
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
                                    setSelectingPrimary(!isSelectingPrimary);
                                }}
                            >
                                <TbListSearch />
                            </button>
                            {!isSelectingPrimary && !secondaryEventData && (
                                <button
                                    style={{
                                        fontSize: "large",
                                        padding: "3px 3px",
                                        display: "flex",
                                        alignItems: "center",
                                        margin: "2px",
                                    }}
                                    onClick={() => {
                                        setSecondaryEventData(primaryEventData);
                                    }}
                                >
                                    <TbArrowAutofitRight />
                                </button>
                            )}
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
                            {primaryEventData &&
                                secondaryEventData &&
                                !isSelectingPrimary &&
                                !isSelectingSecondary && (
                                    <button
                                        style={{
                                            fontSize: "large",
                                            padding: "3px 3px",
                                            display: "flex",
                                            alignItems: "center",
                                            margin: "2px",
                                        }}
                                        onClick={() => {
                                            const [temp_prim, temp_sec] = [
                                                primaryEventData,
                                                secondaryEventData,
                                            ];
                                            const [lap_prim, lap_sec] = [
                                                primaryLap,
                                                secondaryLap,
                                            ];
                                            setPrimaryEventData(temp_sec);
                                            setSecondaryEventData(temp_prim);
                                            setPrimaryLap(lap_sec);
                                            setSecondaryLap(lap_prim);
                                        }}
                                    >
                                        <TbArrowsDiff />
                                    </button>
                                )}
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
                            </div>
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
                                    onClick={() => setSecondaryEventData(null)}
                                >
                                    <TbPlaylistX />
                                </button>
                            )}
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
