import { useEffect, useState } from "react";
import { SessionData } from "../types";
import {
    collection,
    CollectionReference,
    doc,
    DocumentSnapshot,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryConstraint,
} from "firebase/firestore";
import { db } from "../firebase";

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
        let cancelled = false;

        async function getSession() {
            const snapshot = (await getDoc(
                doc(db, "test_sessions", sessionId),
            )) as DocumentSnapshot<SessionData>;
            if (!cancelled && snapshot.exists) {
                setSession(snapshot.data());
                setLoading(false);
            }
        }
        getSession();

        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    return [session, loading] as const;
};

export { useLatestSessions, useSession };
