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

    const [entityCollectionState, isLoadingEntityState] =
        useCollectionMetadataState();

    useEffect(() => {
        let cancelled = false;

        if (!field) {
            setOptions([]);
            setLoading(false);
            return;
        }

        async function fetchFilterOptions() {
            if (isLoadingEntityState) {
                return;
            }

            const shouldFetchFieldDocs = entityCollectionState[field];
            const fieldDocGetter = shouldFetchFieldDocs
                ? getDocsFromServer(collection(db, field))
                : getDocsFromCache(collection(db, field)).catch(() =>
                      getDocsFromServer(collection(db, field)),
                  );
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
    }, [entityCollectionState, field, isLoadingEntityState]);

    return [options, loading];
};

export { useAutocompleteOptions };
