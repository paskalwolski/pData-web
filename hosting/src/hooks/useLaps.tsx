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
    getDocsFromCache,
    getDocsFromServer,
} from "firebase/firestore";
import { LapData, TelemetryData } from "../types";

const useLap = (lapId: string): [LapData | undefined, boolean] => {
    const [lapData, setLapData] = useState<LapData | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!lapId) {
            setLoading(false);
            setLapData(undefined);
            return;
        }
        // Mark if we want to keep the result
        let cancelled = false;

        async function fetchLap() {
            const snapshot = await getDoc(doc(db, "test_laps", lapId));
            // Only write if we want to keep the result
            if (snapshot.exists() && !cancelled) {
                setLapData({
                    ...snapshot.data(),
                    lapId: snapshot.id,
                } as LapData);
                setLoading(false);
            }
        }

        fetchLap();
        return () => {
            // Cleanup: Discard the result
            cancelled = true;
        };
    }, [lapId]);

    return [lapData, loading];
};

const useLapTelemetry = (
    lapId: string,
): [TelemetryData | undefined, boolean] => {
    const [telemetryData, setTelemetryData] = useState<
        TelemetryData | undefined
    >();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        if (!lapId) {
            setLoading(false);
            setTelemetryData(undefined);
            return;
        }

        async function fetchLapTelemetry() {
            const telemetryCollectionRef = collection(
                db,
                "test_laps",
                lapId,
                "telemetry",
            );
            let telemetryDocsSnapshot = await getDocsFromCache(
                telemetryCollectionRef,
            );
            if (telemetryDocsSnapshot.empty && !cancelled) {
                telemetryDocsSnapshot = await getDocsFromServer(
                    telemetryCollectionRef,
                );
            }
            if (!telemetryDocsSnapshot.empty && !cancelled) {
                setTelemetryData(
                    telemetryDocsSnapshot.docs.reduce(
                        (acc, tDoc) => ({
                            ...acc,
                            [tDoc.id]: tDoc.data().data,
                        }),
                        {},
                    ),
                );
                setLoading(false);
            }
        }

        fetchLapTelemetry();
        return () => {
            cancelled = true;
        };
    }, [lapId]);

    return [telemetryData, loading];
};

const useLatestLaps = (
    fetchLimit?: number,
): [Array<LapData> | undefined, boolean] => {
    const [latestLaps, setLatestLaps] = useState<Array<LapData> | undefined>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let cancelled = false;
        async function fetchLatestLaps() {
            const q = query(
                collection(db, "test_laps"),
                orderBy("sessionData.sessionTime", "desc"),
                limit(fetchLimit ?? 5),
            );

            const snapshot = await getDocs(q);
            const laps = snapshot.docs.map(
                (doc) => ({ ...doc.data(), lapId: doc.id }) as LapData,
            );
            if (!cancelled) {
                setLatestLaps(laps);
                setLoading(false);
            }
        }
        fetchLatestLaps();
        return () => {
            cancelled = true;
        };
    }, [fetchLimit]);

    return [latestLaps, loading];
};

export { useLap, useLapTelemetry, useLatestLaps };
