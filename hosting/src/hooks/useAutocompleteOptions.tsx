import { useEffect, useState } from "react";
import {
    AutocompleteCollection,
    AutocompleteOption,
} from "../components/TableHeaderFilter";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Allow 'let' so that we maintain this value until page refresh
// eslint-disable-next-line prefer-const
let cachedOptions: Record<
    AutocompleteCollection,
    AutocompleteOption[] | undefined
> = { drivers: undefined, tracks: undefined, cars: undefined };

const useAutocompleteOptions = (
    field: AutocompleteCollection,
): [AutocompleteOption[], boolean] => {
    const [options, setOptions] = useState<AutocompleteOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        if (!field) {
            setOptions([]);
            setLoading(false);
            return;
        }

        async function fetchFilterOptions() {
            if (cachedOptions[field]) {
                setOptions(cachedOptions[field]);
                setLoading(false);
                return;
            }

            const snapshot = await getDocs(collection(db, field));
            const optionValues = snapshot.docs.map((d) => ({
                id: d.id,
                label: d.id,
            }));
            cachedOptions[field] = optionValues;
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
    }, [field]);

    return [options, loading];
};

export { useAutocompleteOptions };
