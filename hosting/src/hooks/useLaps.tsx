import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    getDoc,
    doc,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
} from "firebase/firestore";
import { LapData } from "../types";

const useLap = (lapId: string): [LapData | undefined, boolean] => {
    const [lap, setLap] = useState<LapData | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mark if we want to keep the result
        let cancelled = false;

        async function fetchLap() {
            const snapshot = await getDoc(doc(db, "test_laps", lapId));
            // Only write if we want to keep the result
            if (snapshot.exists() && !cancelled) {
                setLap(snapshot.data() as LapData);
                setLoading(false);
            }
        }

        fetchLap();
        return () => {
            // Cleanup: Discard the result
            cancelled = true;
        };
    }, [lapId]);

    return [lap, loading];
};

const useLatestLaps = (): [Array<LapData> | undefined, boolean] => {
    const [latestLaps, setLatestLaps] = useState<Array<LapData> | undefined>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let cancelled = false;
        async function fetchLatestLaps() {
            const q = query(
                collection(db, "test_laps"),
                orderBy("sessionTime"),
                limit(5),
            );

            const snapshot = await getDocs(q);
            console.log(snapshot.docs);
            const laps = snapshot.docs.map((doc) => doc.data() as LapData);
            if (!cancelled) {
                setLatestLaps(laps);
                setLoading(false);
            }
        }
        fetchLatestLaps();
        return () => {
            cancelled = true;
        };
    }, []);

    return [latestLaps, loading];
};

export { useLap, useLatestLaps };
