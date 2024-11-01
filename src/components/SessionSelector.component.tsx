import { useEffect, useState } from "react";

import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    orderBy,
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

const SessionSelector = ({ setSession, track }) => {
    const [availableSessions, setAvailableSessions] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    useEffect(() => {
        const getAvailableSessions = async () => {
            console.log("Got DB", db.app.name);
            const sessionCol = collection(db, "sessions");
            const sessionSnapshot = await getDocs(sessionCol);
            console.log("Got Docs:", sessionSnapshot.size);
            const sessionList = [];
            sessionSnapshot.forEach((session) => {
                sessionList.push({ id: session.id, ...session.data() });
            });
            console.log("Ready to set data");
            console.log(sessionList);
            setAvailableSessions(sessionList);
        };

        getAvailableSessions();
    }, []);

    useEffect(() => {
        if (!selectedSessionId) {
            return;
        }
        const selectedSession = availableSessions.reduce((s, ss) =>
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
                lapList.push(lap.data());
            });
            setSession({ ...selectedSession, laps: lapList });
        };
        handleSelectedSessionId();
    }, [selectedSessionId]);

    return (
        <div className="card">
            {availableSessions &&
                availableSessions.map((session, i) => {
                    return (
                        <div
                            className="card"
                            id={session.id}
                            key={session.id}
                            onClick={(e) => {
                                console.log("Selecting", e.currentTarget.id);
                                setSelectedSessionId(e.currentTarget.id);
                            }}
                            style={{ width: "100%", alignItems: "center" }}
                        >
                            <h5 style={{ margin: "0.5em 1em" }}>
                                {session.sessionType.toUpperCase()}
                            </h5>{" "}
                            {session.track}: {session.car} -
                            {session.sessionTime}({session.id})
                        </div>
                    );
                })}
        </div>
    );
};

export default SessionSelector;
