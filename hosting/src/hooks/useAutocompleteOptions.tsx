import { useEffect, useState } from "react";
import { AutocompleteOption } from "../components/TableHeaderFilter";
import {
    collection,
    getDocsFromCache,
    getDocsFromServer,
} from "firebase/firestore";
import { db } from "../firebase";
import { Entity } from "../types";
import { useCollectionMetadataState } from "./useCollectionMeta";

const useAutocompleteOptions = (
    field: Entity,
): [AutocompleteOption[], boolean] => {
    const [options, setOptions] = useState<AutocompleteOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [cacheState, isLoadingCacheState] = useCollectionMetadataState(field);

    useEffect(() => {
        let cancelled = false;

        if (!field) {
            setOptions([]);
            setLoading(false);
            return;
        }

        async function fetchFilterOptions() {
            if (isLoadingCacheState) {
                return;
            }
            const cacheValid = cacheState === "valid";
            console.log(cacheValid);
            const fieldDocGetter = cacheValid
                ? getDocsFromCache(collection(db, field)).catch(() =>
                      getDocsFromServer(collection(db, field)),
                  )
                : getDocsFromServer(collection(db, field));
            const fieldDocs = await fieldDocGetter;
            const optionValues = fieldDocs.docs.map((d) => ({
                id: d.id,
                label: d.data()?.name ?? d.id,
            }));

            if (!cancelled) {
                setOptions(optionValues);
                setLoading(false);
            }
        }

        fetchFilterOptions();
        return () => {
            // Cleanup: Discard the result
            cancelled = true;
        };
    }, [field, cacheState, isLoadingCacheState]);

    return [options, loading];
};

export { useAutocompleteOptions };
