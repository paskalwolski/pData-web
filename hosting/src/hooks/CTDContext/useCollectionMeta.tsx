import { useCallback, useEffect, useState } from "react";
import { ENTITIES, Entity, EntityMetadata } from "../../types";
import { collection, CollectionReference, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useCTDContext } from "./useCTDContext";

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

const useMetaName = () => {
    const ctdContext = useCTDContext();

    const useEntityName = (entity: Entity) =>
        useCallback(
            (id: string) => ctdContext[entity]?.nameMap?.[id] ?? id,
            [entity],
        );

    const getCarName = useEntityName("cars");
    const getDriverName = useEntityName("drivers");
    const getTrackName = useEntityName("tracks");

    return { useEntityName, getCarName, getDriverName, getTrackName };
};

export { useEntityMeta, useMetaName };
