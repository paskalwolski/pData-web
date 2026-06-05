import { useEffect, useState } from "react";
import { CacheValidState, Entity, EntityMetadata } from "../types";
import {
    collection,
    doc,
    getDocFromCache,
    getDocFromServer,
} from "firebase/firestore";
import { db } from "../firebase";

const useCollectionMetadataState = (entity: Entity) => {
    const [cacheState, setCacheState] = useState<CacheValidState>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const metaDocRef = doc(collection(db, "meta"), entity);
        async function fetchMetadataCollection() {
            const cachedMetadata = await getDocFromCache(metaDocRef)
                .then(
                    (d) =>
                        (d.exists() ? d.data() : {}) as Partial<EntityMetadata>,
                )
                .catch(() => ({}) as Partial<EntityMetadata>);

            const remoteMetadata = await getDocFromServer(metaDocRef)
                .then(
                    (d) =>
                        (d.exists() ? d.data() : {}) as Partial<EntityMetadata>,
                )
                .catch(() => ({}) as Partial<EntityMetadata>);

            if (!cancelled) {
                setCacheState(
                    remoteMetadata.lastUpdated?.toMillis() ===
                        cachedMetadata?.lastUpdated?.toMillis()
                        ? "valid"
                        : "invalid",
                );
                setLoading(false);
            }
        }
        fetchMetadataCollection();

        return () => {
            cancelled = true;
        };
    }, [entity]);

    return [cacheState, loading] as const;
};

export { useCollectionMetadataState };
