import { useEffect, useState } from "react";
import { ENTITIES, Entity, EntityMetadata } from "../types";
import { doc, getDocFromCache, getDocFromServer } from "firebase/firestore";
import { db } from "../firebase";

const useCollectionMetadataState = () => {
    const [data, setData] = useState<Record<Entity, boolean>>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const metaDocRef = doc(db, "meta", "lastUpdatedAt");
        async function fetchMetadataCollection() {
            const cachedMetadata = await getDocFromCache(metaDocRef)
                .then((d) =>
                    d.exists() ? (d.data() as Partial<EntityMetadata>) : {},
                )
                .catch(() => ({}));

            const remoteMetadata = await getDocFromServer(metaDocRef)
                .then((d) =>
                    d.exists() ? (d.data() as Partial<EntityMetadata>) : {},
                )
                .catch(() => ({}));

            if (!cancelled) {
                setData(
                    Object.fromEntries(
                        ENTITIES.map((e) => [
                            e,
                            // Remote value preset
                            remoteMetadata?.[e] === undefined ||
                                // Value in remote equals value in cache
                                remoteMetadata[e]?.toMillis() !==
                                    cachedMetadata?.[e]?.toMillis(),
                        ]),
                    ) as Record<Entity, boolean>,
                );
                setLoading(false);
            }
        }
        fetchMetadataCollection();

        return () => {
            cancelled = true;
        };
    }, []);

    return [data, loading] as const;
};

export { useCollectionMetadataState };
