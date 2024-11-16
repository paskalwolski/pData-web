import { useEffect, useState } from "react";

import { initializeApp } from "firebase/app";
import {
    getFirestore,
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
} from "firebase/firestore";
import { millisToRaceDuration } from "../utils";
import SessionSelectorActions from "./SessionSelectorAction.component";

const firebaseConfig = {
    apiKey: "AIzaSyDnFq6i1fT8dfPCNNO6HD9Fo05RtZDBQmk",
    authDomain: "tidy-jetty-437707-n7.firebaseapp.com",
    projectId: "tidy-jetty-437707-n7",
    storageBucket: "tidy-jetty-437707-n7.firebasestorage.app",
    messagingSenderId: "888243745906",
    appId: "1:888243745906:web:085e1c0b74f595ba4c7eeb",
};

const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);

const SessionSelector = ({
    setSession,
    track,
    car,
    setSelecting,
    isPrimary,
    required,
}) => {
    const [filteredSessions, setFilteredSessions] = useState(null);
    const [sessionCount, setSessionCount] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [filterByCar, setFilterByCar] = useState(false);

    useEffect(() => {
        const getAvailableSessions = async () => {
            setFilteredSessions(null);
            const sessionCol = collection(db, "sessions");
            // Get the total session count info
            const count = getCountFromServer(sessionCol).then(
                (sessionCountSnap) => {
                    setSessionCount(sessionCountSnap.data().count);
                }
            );
            // Start building the actual session query
            let sessionQuery = query(
                sessionCol,
                orderBy("sessionTime", "desc"),
                limit(10)
            );
            if (track) {
                sessionQuery = query(sessionQuery, where("track", "==", track));
            }
            if (filterByCar) {
                sessionQuery = query(sessionQuery, where("car", "==", car));
            }
            const sessionSnapshot = getDocs(sessionQuery);
            const [_, sessionSnap] = await Promise.all([
                count,
                sessionSnapshot,
            ]);
            const sessionList = [];
            sessionSnap.forEach((session) => {
                sessionList.push({ id: session.id, ...session.data() });
            });
            setFilteredSessions(sessionList);
        };

        getAvailableSessions();
    }, [filterByCar]);

    useEffect(() => {
        if (!selectedSessionId) {
            return;
        }
        const selectedSession = filteredSessions.reduce((s, ss) =>
            s.id === selectedSessionId ? s : ss
        );

        const lapCollection = collection(db, "laps");
        let lapQuery = query(
            lapCollection,
            where("session", "==", selectedSessionId),
            orderBy("lap_number", "asc")
        );

        const handleSelectedSessionId = async () => {
            const laps = await getDocs(lapQuery);
            const lapList = [];
            laps.forEach((lap) => {
                lapList.push(lap.data());
            });
            setSession({
                ...selectedSession,
                laps: lapList,
                sessionId: selectedSessionId,
            });
            setSelecting && setSelecting(false);
        };
        handleSelectedSessionId();
    }, [selectedSessionId]);

    const handleSessionDelete = async (sessionId) => {
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
        setFilteredSessions(
            filteredSessions.filter((session) => session.id != sessionId)
        );
    };

    const handleSessionTrim = async (sessionId) => {
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

        setFilteredSessions(
            filteredSessions.map((session) => {
                if (session.id == sessionId) {
                    return { ...session, lapCount: 1 };
                } else {
                    return session;
                }
            })
        );

        await Promise.all([sessionUpdate, ...lapDeletes]);
    };

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
                        {filteredSessions.map((session, i) => {
                            return (
                                <div
                                    className="card sessionSelect"
                                    id={session.id}
                                    key={session.id}
                                    onClick={(e) => {
                                        if (isPrimary) {
                                        }
                                        setSelectedSessionId(
                                            e.currentTarget.id
                                        );
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
                    <em>
                        Showing {filteredSessions.length} of {sessionCount}{" "}
                        Sessions
                    </em>
                </>
            )}
        </div>
    );
};

export default SessionSelector;
