import { useState, useEffect } from "react";
import "./App.css";

import LapData from "./components/LapData.component";
import LapSelector from "./components/LapSelector.component";
import SessionSelector from "./components/SessionSelector.component";

import {
    TbArrowAutofitRight,
    TbArrowsDiff,
    TbListSearch,
    TbPlaylistAdd,
    TbPlaylistX,
} from "react-icons/tb";
import { useLatestLaps } from "./hooks/useLaps";

function OldHomepage() {
    // Instead of having top-level state, extract this to a SessionProvider + SessionContext
    // And then use hooks to get data where needed ie. {primaryData, primaryLap, secondaryData} = useSessionData()
    const [primarySessionData, setPrimarySessionData] = useState(undefined);
    const [isSelectingPrimary, setSelectingPrimary] = useState(true);
    const [isSelectingSecondary, setSelectingSecondary] = useState(false);
    const [secondarySessionData, setSecondarySessionData] = useState(null);
    const [primaryLap, setPrimaryLap] = useState(null);
    const [secondaryLap, setSecondaryLap] = useState(null);

    const [latestLaps, isLoadingLatestLaps] = useLatestLaps();

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
    }, [primarySessionData?.sessionId]);
    useEffect(() => {
        setSecondaryLap(null);
    }, [secondarySessionData?.sessionId]);
    useEffect(() => {
        setSelectingSecondary(false);
    }, [isSelectingPrimary]);

    return (
        <div style={{ height: "100vh", maxHeight: "100vh", overflow: "auto" }}>
            {primarySessionData && (
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
                    <b>
                        {primarySessionData.car} ({primarySessionData.driver})
                        {secondarySessionData &&
                            `vs ${secondarySessionData.car} (${secondarySessionData.driver})`}
                        on {primarySessionData.track}
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
                        {!isSelectingPrimary && !secondarySessionData && (
                            <button
                                style={{
                                    fontSize: "large",
                                    padding: "3px 3px",
                                    display: "flex",
                                    alignItems: "center",
                                    margin: "2px",
                                }}
                                onClick={() => {
                                    setSecondarySessionData(primarySessionData);
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
                                    primarySessionData && secondarySessionData
                                        ? "50%"
                                        : "100%",
                            }}
                        >
                            <LapSelector
                                {...{
                                    sessionData: primarySessionData,
                                    selectLap: setPrimaryLap,
                                    selectedLap: primaryLap,
                                    isComparison:
                                        primaryLap && secondaryLap
                                            ? true
                                            : false,
                                }}
                            />
                        </div>
                        {primarySessionData &&
                            secondarySessionData &&
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
                                            primarySessionData,
                                            secondarySessionData,
                                        ];
                                        const [lap_prim, lap_sec] = [
                                            primaryLap,
                                            secondaryLap,
                                        ];
                                        setPrimarySessionData(temp_sec);
                                        setSecondarySessionData(temp_prim);
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
                                    primarySessionData && secondarySessionData
                                        ? "50%"
                                        : "100%",
                            }}
                        >
                            {secondarySessionData && (
                                <LapSelector
                                    {...{
                                        sessionData: secondarySessionData,
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
                                    setSelectingSecondary(!isSelectingSecondary)
                                }
                            >
                                {secondarySessionData ? (
                                    <TbListSearch />
                                ) : (
                                    <TbPlaylistAdd />
                                )}
                            </button>
                        )}
                        {secondarySessionData && (
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
                                onClick={() => setSecondarySessionData(null)}
                            >
                                <TbPlaylistX />
                            </button>
                        )}
                    </div>
                </div>
            )}
            {/* TODO: Hoist this to a component so when we revisit, the query is remade */}
            {isLoadingLatestLaps
                ? "Loading..."
                : latestLaps.length > 0
                  ? `Latest Laps: ${latestLaps.map((lap) => lap.lapNumber)}`
                  : "No Laps registered"}
            {isSelectingPrimary && (
                <SessionSelector
                    setSession={setPrimarySessionData}
                    setSelecting={setSelectingPrimary}
                    car={secondarySessionData?.car ?? null}
                    track={secondarySessionData?.track ?? null}
                    required={primarySessionData == null}
                />
            )}
            {isSelectingSecondary && (
                <SessionSelector
                    setSession={setSecondarySessionData}
                    track={primarySessionData.track}
                    car={primarySessionData.car}
                    setSelecting={setSelectingSecondary}
                    required={false}
                />
            )}
            {primaryLap && (
                <LapData
                    {...{
                        primaryLap,
                        secondaryLap,
                        trackName: primarySessionData.track,
                    }}
                />
            )}
        </div>
    );
}

export default OldHomepage;
