import { GridFilterItem } from "@mui/x-data-grid";
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

interface FilteringContext {
    filterItems: GridFilterItem[];
    addFilterItem: (filterItem: GridFilterItem) => void;
    removeFilterItem: (filterId: string | number) => void;
    clearFilterItems: () => void;
    upsertFilterItem: (filterItem: GridFilterItem) => void;
    strictFilterIds: Array<string | number>;
    setStrictFilterIds: (filterIds: Array<string | number>) => void;
}

const FilteringContext = createContext<FilteringContext>({
    filterItems: [],
    addFilterItem: () => undefined,
    removeFilterItem: () => undefined,
    upsertFilterItem: () => undefined,
    clearFilterItems: () => undefined,
    strictFilterIds: [],
    setStrictFilterIds: () => undefined,
});

const FilteringProvider = ({ children }: { children: React.ReactNode }) => {
    const [filterItems, setFilterItems] = useState<GridFilterItem[]>([]);
    const [strictFilterIds, setStrictFilterIds] = useState<
        Array<string | number>
    >([]);

    const addFilterItem = useCallback(
        (filterItem: GridFilterItem) =>
            setFilterItems((existingItems) => [
                ...existingItems,
                { id: crypto.randomUUID(), ...filterItem },
            ]),
        [],
    );

    const removeFilterItem = useCallback(
        (filterId: string | number) =>
            setFilterItems((existingItems) =>
                existingItems.filter((f) => f.id !== filterId),
            ),
        [],
    );

    const upsertFilterItem = useCallback((filterItem: GridFilterItem) => {
        setFilterItems((existingItems) => {
            let found = false;
            const updated = existingItems.map((i) => {
                if (i.id === filterItem.id) {
                    found = true;
                    return filterItem;
                }
                return i;
            });
            if (!found) {
                updated.push(filterItem);
            }
            return updated;
        });
    }, []);

    const clearFilterItems = useCallback(() => setFilterItems([]), []);

    const effectiveValue = useMemo(
        () => ({
            filterItems,
            addFilterItem,
            clearFilterItems,
            removeFilterItem,
            upsertFilterItem,
            strictFilterIds,
            setStrictFilterIds,
        }),
        [
            addFilterItem,
            filterItems,
            removeFilterItem,
            upsertFilterItem,
            clearFilterItems,
            strictFilterIds,
        ],
    );

    return (
        <FilteringContext.Provider value={effectiveValue}>
            {children}
        </FilteringContext.Provider>
    );
};

const useFiltering = () => useContext(FilteringContext);

export { FilteringProvider, useFiltering };
