import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AggregateChannelDoc, SessionData } from "../types";
import {
    collection,
    CollectionReference,
    doc,
    DocumentSnapshot,
    endBefore,
    getCountFromServer,
    getDocs,
    getDocsFromCache,
    getDocsFromServer,
    limit,
    onSnapshot,
    orderBy,
    query,
    QueryConstraint,
    startAfter,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";
import { GridFilterModel, GridPaginationModel } from "@mui/x-data-grid";
import { GridSortModel } from "@mui/x-data-grid";
import {
    sessionFilterConvertor,
    sessionSortConvertor,
} from "../helpers/datagridConvertors";

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

interface SessionTableDataProps {
    pagination: GridPaginationModel;
    sorting: GridSortModel;
    filtering: GridFilterModel;
}

// NOTE: This is a near copy of `useLapTableData` (useLaps.tsx) - only the
// collection, convertors and row mapping differ. It can be abstracted into a
// shared `usePaginatedTableData({ collection, sortConvertor, filterConvertor,
// mapDoc })` hook.
const useSessionTableData = ({
    pagination,
    sorting,
    filtering,
}: SessionTableDataProps) => {
    const [loadedSessions, setLoadedSessions] = useState<SessionData[]>();

    const firebaseSorting = useMemo(
        () => sessionSortConvertor(sorting),
        [sorting],
    );

    const firebaseFiltering = useMemo(
        () => sessionFilterConvertor(filtering),
        [filtering],
    );

    const boundaryDocs =
        useRef<[DocumentSnapshot, DocumentSnapshot]>(undefined);
    const selectedPage = useRef(0);
    const [totalSessionCount, setTotalSessionCount] = useState(-1);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        async function fetchSessions() {
            const queryConstraints: QueryConstraint[] = [
                ...firebaseSorting,
                ...firebaseFiltering,
            ];
            const paginationConstraints: QueryConstraint[] = [
                limit(pagination.pageSize),
            ];

            if (boundaryDocs.current && pagination.page !== 0) {
                if (pagination.page < selectedPage.current) {
                    paginationConstraints.push(
                        endBefore(boundaryDocs.current[0]),
                    );
                }
                if (pagination.page > selectedPage.current) {
                    paginationConstraints.push(
                        startAfter(boundaryDocs.current[1]),
                    );
                }
            }

            const countQuery = query(
                collection(db, "test_sessions"),
                ...queryConstraints,
            );
            const sessionQuery = query(
                collection(db, "test_sessions"),
                ...queryConstraints,
                ...paginationConstraints,
            );

            const awaitSessionData = getDocs(sessionQuery).then((snap) => {
                if (!cancelled) {
                    const sessions = snap.docs.map(
                        (d) =>
                            ({ ...d.data(), sessionId: d.id }) as SessionData,
                    );
                    setLoadedSessions(sessions);
                    boundaryDocs.current = [
                        snap.docs[0],
                        snap.docs[snap.docs.length - 1],
                    ];
                    selectedPage.current = pagination.page;
                }
            });
            const awaitTotalCount = getCountFromServer(countQuery).then(
                (snap) => {
                    if (!cancelled) {
                        setTotalSessionCount(snap.data().count);
                    }
                },
            );

            await Promise.all([awaitTotalCount, awaitSessionData]);
            if (!cancelled) {
                setLoading(false);
            }
        }
        fetchSessions();
        return () => {
            cancelled = true;
        };
    }, [pagination, firebaseSorting, firebaseFiltering]);

    return [loadedSessions, totalSessionCount, loading] as const;
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

export {
    useLatestSessions,
    useSession,
    useSessionTableData,
    useAggregateTelemetry,
    useSaveSession,
};
