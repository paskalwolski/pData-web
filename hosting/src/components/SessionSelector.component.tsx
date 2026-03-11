import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    getCountFromServer,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
    startAfter,
    endBefore,
} from "firebase/firestore";
import { millisToRaceDuration } from "../utils";
import SessionSelectorActions from "./SessionSelectorAction.component";

const SessionSelector = ({
    setSession,
    track,
    car,
    setSelecting,
    required,
}) => {
    const pageSize = 10;
    const [filteredSessions, setFilteredSessions] = useState(null);
    const [sessionCount, setSessionCount] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [filterByCar, setFilterByCar] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [maxPageNumber, setMaxPageNumber] = useState(0);
    const [firstSession, setFirstSession] = useState(null);
    const [lastSession, setLastSession] = useState(null);

    const getAvailableSessions = useCallback(
        async (startAt = null, endAt = null) => {
            setFilteredSessions(null);
            const sessionCol = collection(db, "sessions");
            // // Get the total session count info
            // const sessionCountSnap = await getCountFromServer(sessionCol);
            // const count = sessionCountSnap.data().count;
            // setSessionCount(count);

            // Start building the actual session query
            let sessionQuery = query(
                sessionCol,
                orderBy("sessionTime", "desc")
            );
            if (track) {
                sessionQuery = query(sessionQuery, where("track", "==", track));
            }
            if (filterByCar) {
                sessionQuery = query(sessionQuery, where("car", "==", car));
            }
            const availableCount = await (
                await getCountFromServer(sessionQuery)
            ).data().count;
            setSessionCount(availableCount);
            setMaxPageNumber(Math.floor(availableCount - 1 / pageSize));

            if (startAt) {
                sessionQuery = query(sessionQuery, startAfter(startAt));
            }
            if (endAt) {
                sessionQuery = query(sessionQuery, endBefore(endAt));
            }
            sessionQuery = query(sessionQuery, limit(pageSize));
            const sessionSnap = await getDocs(sessionQuery);

            const sessionList = [];
            sessionSnap.forEach((session) => {
                sessionList.push({ id: session.id, ...session.data() });
            });
            setFilteredSessions(sessionList);
            setFirstSession(sessionSnap.docs[0]);
            setLastSession(sessionSnap.docs[sessionSnap.size - 1]);
        },
        [car, filterByCar, track]
    );

    const handlePageBack = useCallback(() => {
        if (pageNumber == 0) {
            // Shouldn't have been able to click - exiting
            return;
        }
        setPageNumber(pageNumber - 1);
        getAvailableSessions(null, firstSession);
    }, [firstSession, getAvailableSessions, pageNumber]);

    const handlePageForward = useCallback(() => {
        if (pageNumber == maxPageNumber) {
            // Shouldn't have been able to click - exiting
            return;
        }
        setPageNumber(pageNumber + 1);
        getAvailableSessions(lastSession, null);
    }, [getAvailableSessions, lastSession, maxPageNumber, pageNumber]);

    useEffect(() => {
        getAvailableSessions();
    }, [filterByCar, getAvailableSessions]);

    useEffect(() => {
        if (!selectedSessionId) {
            return;
        }
        const selectedSession = filteredSessions.reduce((s, ss) =>
            s.id === selectedSessionId ? s : ss
        );

        const lapCollection = collection(db, "laps");
        const lapQuery = query(
            lapCollection,
            where("session", "==", selectedSessionId),
            orderBy("lap_number", "asc")
        );

        const handleSelectedSessionId = async () => {
            const laps = await getDocs(lapQuery);
            const lapList = [];
            laps.forEach((lap) => {
                lapList.push({ ...lap.data(), lapId: lap.id });
            });
            setSession({
                ...selectedSession,
                laps: lapList,
                sessionId: selectedSessionId,
            });
            if (setSelecting) {
                setSelecting(false);
            }
        };
        handleSelectedSessionId();
    }, [filteredSessions, selectedSessionId, setSelecting, setSession]);

    const handleSessionDelete = useCallback(
        async (sessionId) => {
            console.log("Deleting", sessionId);

            const lapCollection = collection(db, "laps");
            const lapQuery = query(
                lapCollection,
                where("session", "==", sessionId)
            );
            const lapSnapshot = await getDocs(lapQuery);
            const lapDeletes = lapSnapshot.docs.map((lapSnap) =>
                deleteDoc(doc(lapCollection, lapSnap.id))
            );
            const sessionCollection = collection(db, "sessions");
            const sessionDelete = deleteDoc(doc(sessionCollection, sessionId));

            await Promise.all([...lapDeletes, sessionDelete]);
            console.log("Deleted Session Details");
            // Trigger Session Reload
            getAvailableSessions(firstSession);
        },
        [firstSession, getAvailableSessions]
    );

    const handleSessionTrim = useCallback(
        async (sessionId) => {
            console.log("Trimming", sessionId);

            const sessionCollection = collection(db, "sessions");
            const sessionDoc = doc(sessionCollection, sessionId);
            const sessionSnap = await getDoc(sessionDoc);
            const sessionData = sessionSnap.data();
            const fastestLapNumber = sessionData?.fastestLap;
            const sessionUpdate = updateDoc(sessionDoc, { lapCount: 1 });

            const lapCollection = collection(db, "laps");
            const lapQuery = query(
                lapCollection,
                where("session", "==", sessionId),
                where("lap_number", "!=", fastestLapNumber)
            );
            const lapSnapshot = await getDocs(lapQuery);
            const lapDeletes = lapSnapshot.docs.map((lapSnap) =>
                deleteDoc(doc(lapCollection, lapSnap.id))
            );

            await Promise.all([sessionUpdate, ...lapDeletes]);
            // Trigger Session Reload
            getAvailableSessions(firstSession);
        },
        [firstSession, getAvailableSessions]
    );

    return (
        <div
            className="card"
            style={{
                flexDirection: "column",
                flex: 1,
                alignItems: "center",
                maxHeight: "100em",
            }}
        >
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <div
                    style={{
                        alignSelf: "start",
                        padding: "0.2em 1em 0.2em 1em",
                    }}
                >
                    {track
                        ? `Select a session for ${track}:`
                        : "Select a Session:"}
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginRight: "1em",
                    }}
                >
                    {car && (
                        <div style={{ margin: "0 1em" }}>
                            <input
                                id="carFilterCheck"
                                type={"checkBox"}
                                onChange={() => setFilterByCar(!filterByCar)}
                            />
                            <label htmlFor="carFilterCheck">
                                Filter by Car
                            </label>
                        </div>
                    )}
                    {!required && (
                        <button onClick={() => setSelecting(false)}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>
            {filteredSessions && (
                <>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            overflowY: "auto",
                            minHeight: "100px",
                            width: "100%",
                            alignItems: "center",
                        }}
                    >
                        {filteredSessions.map((session) => {
                            return (
                                <div
                                    className="card sessionSelect"
                                    id={session.id}
                                    key={session.id}
                                    onClick={() => {
                                        setSelectedSessionId(session.id);
                                    }}
                                    style={{
                                        width: "90%",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <h4 style={{ margin: "0.5em 1em" }}>
                                            {session.sessionType.toUpperCase()}
                                        </h4>
                                        <h5 className="pill pit">
                                            {session.track}
                                        </h5>
                                        <h5 className="pill invalid">
                                            {session.car}
                                        </h5>
                                        <h5 className="pill valid">
                                            {session?.driver ??
                                                "Unknown Driver"}
                                        </h5>
                                        <h5 className="pill fastest">
                                            {millisToRaceDuration(
                                                session?.fastestLapTime
                                            ) ?? "Unknown Time"}
                                        </h5>
                                        <h5 className="pill warn">
                                            {session?.lapCount ?? 0} Laps
                                        </h5>
                                    </div>
                                    <div
                                        style={{
                                            marginRight: "0.4em",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <SessionSelectorActions
                                            sessionId={session.id}
                                            trimAction={handleSessionTrim}
                                            deleteAction={handleSessionDelete}
                                        />
                                        {/* <SessionSelectorAction
                                            sessionId={session.id}
                                            Icon={TbWindowMinimize}
                                            action={handleSessionTrim}
                                            title={"Trim Slower Laps"}
                                        />
                                        <button
                                            className="sessionDetail icon"
                                            onClick={handleSessionDelete}
                                            title="Delete Session"
                                        >
                                            <TbTrashXFilled />
                                        </button> */}
                                        <div style={{ margin: "0.2em" }}>
                                            {session.sessionTime
                                                .toDate()
                                                .toLocaleDateString("en-za")}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        {pageNumber > 0 && (
                            <button onClick={handlePageBack}>Back</button>
                        )}
                        <em>
                            Showing {pageNumber * pageSize + 1} to{" "}
                            {filteredSessions.length} of {sessionCount} Sessions
                        </em>
                        {pageNumber < maxPageNumber && (
                            <button onClick={handlePageForward}>Forward</button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SessionSelector;
