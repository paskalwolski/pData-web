import { useCallback, useEffect, useState } from "react";
import { CacheValidState, ENTITIES, Entity, EntityMetadata } from "../types";
import {
    collection,
    CollectionReference,
    doc,
    getDocFromCache,
    getDocFromServer,
    getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useCTDContext } from "../context/CTDContext/useCTDContext";

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

const useEntityMeta = (): [
    Record<Entity, EntityMetadata | undefined>,
    boolean,
] => {
    const [meta, setMeta] =
        useState<Record<Entity, EntityMetadata | undefined>>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const metaCollection = collection(
            db,
            "meta",
        ) as CollectionReference<EntityMetadata>;
        async function getMeta() {
            const metaDocs = await getDocs(metaCollection).then((d) => d.docs);
            if (!cancelled) {
                const metaDocMap = Object.fromEntries(
                    metaDocs.map((d) => [d.id, d.data()]),
                );
                const entityMetaMap = Object.fromEntries(
                    ENTITIES.map((e) => [e, metaDocMap?.[e]]),
                ) as Record<Entity, EntityMetadata | undefined>;
                setMeta(entityMetaMap);
                setLoading(false);
            }
        }
        getMeta();

        return () => {
            cancelled = true;
        };
    }, []);

    return [meta, loading] as const;
};

const useMetaName = (entity: Entity) => {
    const CTDContext = useCTDContext();

    return useCallback(
        (trackId: string) => CTDContext[entity]?.nameMap?.[trackId] ?? trackId,
        [CTDContext, entity],
    );
};

export { useCollectionMetadataState, useEntityMeta, useMetaName };
