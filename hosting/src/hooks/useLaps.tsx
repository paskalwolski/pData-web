import { useEffect, useMemo, useRef, useState } from "react";
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
    QueryConstraint,
    where,
    documentId,
    startAfter,
    getCountFromServer,
    DocumentSnapshot,
    endBefore,
} from "firebase/firestore";
import { LapData, TelemetryData } from "../types";
import { GridFilterModel, GridPaginationModel } from "@mui/x-data-grid";
import { GridSortModel } from "@mui/x-data-grid";
import { lapFilterConvertor, lapSortConvertor } from "./datagridConvertors";

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

interface LatestLapsOpts {
    trackId?: string;
    fetchLimit?: number;
    exclude?: string;
}
const useLatestLaps = ({ trackId, fetchLimit, exclude }: LatestLapsOpts = {}): [
    Array<LapData> | undefined,
    boolean,
] => {
    const [latestLaps, setLatestLaps] = useState<Array<LapData> | undefined>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let cancelled = false;
        async function fetchLatestLaps() {
            const queryConstraints: QueryConstraint[] = [
                orderBy("lapTimestamp", "desc"),
                limit(fetchLimit ?? 5),
            ];
            if (trackId) {
                queryConstraints.push(
                    where("sessionData.track", "==", trackId),
                );
            }
            if (exclude) {
                queryConstraints.push(where(documentId(), "!=", exclude));
            }
            const q = query(collection(db, "test_laps"), ...queryConstraints);

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
    }, [exclude, fetchLimit, trackId]);

    return [latestLaps, loading];
};

interface LapTableDataProps {
    pagination: GridPaginationModel;
    sorting: GridSortModel;
    filtering: GridFilterModel;
    excludeLaps?: Array<string>;
}

const useLapTableData = ({
    pagination,
    sorting,
    filtering,
    excludeLaps,
}: LapTableDataProps) => {
    const [loadedLaps, setLoadedLaps] = useState<LapData[]>();

    const firebaseSorting = useMemo(() => lapSortConvertor(sorting), [sorting]);

    const firebaseFiltering = useMemo(
        () => lapFilterConvertor(filtering),
        [filtering],
    );

    const excludeFilters = useMemo(
        () =>
            (excludeLaps?.length ?? 0 > 0)
                ? where(
                      documentId(),
                      "not-in",
                      excludeLaps.filter((l) => Boolean(l)),
                  )
                : undefined,
        [excludeLaps],
    );

    const boundaryDocs =
        useRef<[DocumentSnapshot, DocumentSnapshot]>(undefined);
    const selectedPage = useRef(0);
    const [totalLapCount, setTotalLapCount] = useState(-1);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        async function fetchLatestLaps() {
            const queryConstraints: QueryConstraint[] = [
                ...firebaseSorting,
                ...firebaseFiltering,
            ];
            if (excludeFilters) {
                queryConstraints.push(excludeFilters);
            }
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
                collection(db, "test_laps"),
                ...queryConstraints,
            );
            const lapQuery = query(
                collection(db, "test_laps"),
                ...queryConstraints,
                ...paginationConstraints,
            );

            const awaitLapData = getDocs(lapQuery).then((snap) => {
                if (!cancelled) {
                    const laps = snap.docs.map(
                        (doc) => ({ ...doc.data(), lapId: doc.id }) as LapData,
                    );
                    setLoadedLaps(laps);
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
                        setTotalLapCount(snap.data().count);
                    }
                },
            );

            await Promise.all([awaitTotalCount, awaitLapData]);
            if (!cancelled) {
                setLoading(false);
            }
        }
        fetchLatestLaps();
        return () => {
            cancelled = true;
        };
    }, [pagination, firebaseSorting, firebaseFiltering, excludeFilters]);

    return [loadedLaps, totalLapCount, loading] as const;
};

export { useLap, useLapTableData, useLapTelemetry, useLatestLaps };
