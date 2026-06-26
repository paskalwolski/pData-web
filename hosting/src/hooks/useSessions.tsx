import { useEffect, useState } from "react";
import { SessionData } from "../types";
import { collection, CollectionReference, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const useLatestSessions = (): [SessionData[], boolean] => {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const metaCollection = collection(
            db,
            "meta",
        ) as CollectionReference<SessionData>;
        async function getMeta() {
            const docs = await getDocs(metaCollection).then((d) => d.docs);
            if (!cancelled) {
                const labeledDocs = docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                setSessions(labeledDocs);
                setLoading(false);
            }
        }
        getMeta();

        return () => {
            cancelled = true;
        };
    }, []);

    return [sessions, loading] as const;
};

export { useLatestSessions };
