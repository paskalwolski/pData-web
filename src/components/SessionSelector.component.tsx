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
} from "firebase/firestore";

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

const SessionSelector = ({ setSession, track, car }) => {
    const [filteredSessions, setFilteredSessions] = useState(null);
    const [sessionCount, setSessionCount] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [filterByCar, setFilterByCar] = useState(false);

    useEffect(() => {
        const getAvailableSessions = async () => {
            console.log("Got DB", db.app.name);
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
            console.log("Got Docs:", sessionSnap.size);
            const sessionList = [];
            sessionSnap.forEach((session) => {
                sessionList.push({ id: session.id, ...session.data() });
            });
            console.log("Ready to set data");
            console.log(sessionList);
            setFilteredSessions(sessionList);
        };

        getAvailableSessions();
    }, []);

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
            setSession({ ...selectedSession, laps: lapList });
        };
        handleSelectedSessionId();
    }, [selectedSessionId]);

    return (
        <div
            className="card"
            style={{
                flexDirection: "column",
                alignItems: "center",
                maxHeight: "50%",
            }}
        >
            <div style={{ alignSelf: "start", padding: "0.2em 1em 0.2em 1em" }}>
                {track ? `Select a session for ${track}:` : "Select a Session:"}
            </div>
            {car && (
                <div>
                    <input
                        id="carFilterCheck"
                        type={"checkBox"}
                        onChange={() => setFilterByCar(!filterByCar)}
                    />
                    <label htmlFor="carFilterCheck">Filter by Car</label>
                </div>
            )}
            {filteredSessions && (
                <>
                    {filteredSessions.map((session, i) => {
                        return (
                            <div
                                className="card"
                                id={session.id}
                                key={session.id}
                                onClick={(e) => {
                                    console.log(
                                        "Selecting",
                                        e.currentTarget.id
                                    );
                                    setSelectedSessionId(e.currentTarget.id);
                                }}
                                style={{
                                    width: "100%",
                                    alignItems: "center",
                                    maxWidth: "96%",
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
                                    <h5 className="pill">{session.track}</h5>
                                    <h5 className="pill">{session.car}</h5>
                                    <h5 className="pill">
                                        {session?.user ?? "Unknown Driver"}
                                    </h5>
                                    <h5 className="pill fastest">
                                        {session?.fastestTime ?? "Unknown Time"}
                                    </h5>
                                </div>
                                <div style={{ marginRight: "1em" }}>
                                    {new Date(
                                        session.sessionTime
                                    ).toLocaleDateString("en-za")}
                                </div>
                            </div>
                        );
                    })}

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
