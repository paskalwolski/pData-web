import { useCallback, useEffect, useState } from "react";
import { AggregateChannelDoc, SessionData } from "../types";
import {
    collection,
    CollectionReference,
    doc,
    getDocs,
    getDocsFromCache,
    getDocsFromServer,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";

interface LatestSessionsProps {
    fetchLimit: number;
}

const useLatestSessions = ({
    fetchLimit,
}: LatestSessionsProps): [SessionData[], boolean] => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let cancelled = false;
        const targetCollection = collection(
            db,
            "test_sessions",
        ) as CollectionReference<SessionData>;

        const queryConstraints: QueryConstraint[] = [
            orderBy("sessionTime", "desc"),
            limit(fetchLimit ?? 10),
        ];

        async function getLatestSessions() {
            const q = query(targetCollection, ...queryConstraints);
            const docs = await getDocs(q).then((d) => d.docs);
            if (!cancelled) {
                const labeledDocs = docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setSessions(labeledDocs);
                setLoading(false);
            }
        }
        getLatestSessions();

        return () => {
            cancelled = true;
        };
    }, [fetchLimit]);

    return [sessions, loading] as const;
};

const useSession = (sessionId: string) => {
    const [session, setSession] = useState<SessionData>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onSnapshot(
            doc(db, "test_sessions", sessionId),
            (snapshot) => {
                if (snapshot.exists()) {
                    setSession(snapshot.data() as SessionData);
                }
                setLoading(false);
            },
        );

        return unsubscribe;
    }, [sessionId]);

    return [session, loading] as const;
};

const useAggregateTelemetry = (sessionId: string, enabled: boolean) => {
    const [channels, setChannels] =
        useState<Record<string, AggregateChannelDoc>>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        let cancelled = false;
        setLoading(true);

        async function getAggregateTelemetry() {
            const aggregateCollectionRef = collection(
                db,
                "test_sessions",
                sessionId,
                "aggregateTelemetry",
            ) as CollectionReference<AggregateChannelDoc>;
            let snapshot = await getDocsFromCache(aggregateCollectionRef);
            if (snapshot.empty && !cancelled) {
                snapshot = await getDocsFromServer(aggregateCollectionRef);
            }
            const docs = snapshot.docs;
            if (!cancelled) {
                setChannels(
                    Object.fromEntries(docs.map((d) => [d.id, d.data()])),
                );
                setLoading(false);
            }
        }
        getAggregateTelemetry();

        return () => {
            cancelled = true;
        };
    }, [sessionId, enabled]);

    return [channels, loading] as const;
};

const useSaveSession = () => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>();

    const saveSession = useCallback(
        // TODO: Examine the keepAllLaps tag - when is this necessary?
        async (id: string, keepAllLaps = false): Promise<boolean> => {
            setSaving(true);
            setError(undefined);
            try {
                await httpsCallable(
                    functions,
                    "saveSession",
                )({
                    id,
                    keepAllLaps,
                });
                return true;
            } catch (e) {
                setError((e as Error).message);
                return false;
            } finally {
                setSaving(false);
            }
        },
        [],
    );

    return { saveSession, saving, error } as const;
};

export { useLatestSessions, useSession, useAggregateTelemetry, useSaveSession };
