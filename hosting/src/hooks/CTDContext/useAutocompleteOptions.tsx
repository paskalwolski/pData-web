import { useEffect, useState } from "react";
import { AutocompleteOption } from "../../components/TableHeaderFilter";

import { Entity } from "../../types";
import { useCTDContext } from "./useCTDContext";

const useAutocompleteOptions = (
    field: Entity,
): [AutocompleteOption[], boolean] => {
    const [options, setOptions] = useState<AutocompleteOption[]>([]);

    const { loading, ...ctdContext } = useCTDContext();

    useEffect(() => {
        let cancelled = false;

        if (!field) {
            setOptions([]);
            return;
        }

        async function fetchFilterOptions() {
            if (loading || cancelled) {
                return;
            }
            const metaName = ctdContext?.[field];
            const autocompleteOptions = Object.entries(metaName.nameMap).map(
                ([id, label]) => ({ id, label }),
            );
            setOptions(autocompleteOptions);
            return () => {
                // Cleanup: Discard the result
                cancelled = true;
            };
        }
        fetchFilterOptions();
    }, [ctdContext, field, loading]);

    return [options, loading];
};

export { useAutocompleteOptions };
