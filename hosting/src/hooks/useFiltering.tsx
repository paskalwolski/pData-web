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
    replaceFilterItem: (filterItem: GridFilterItem) => void;
}

const FilteringContext = createContext<FilteringContext>({
    filterItems: [],
    addFilterItem: () => undefined,
    removeFilterItem: () => undefined,
    replaceFilterItem: () => undefined,
    clearFilterItems: () => undefined,
});

const FilteringProvider = ({ children }: { children: React.ReactNode }) => {
    const [filterItems, setFilterItems] = useState<GridFilterItem[]>([]);
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

    const replaceFilterItem = useCallback(
        (filterItem: GridFilterItem) =>
            setFilterItems((existingItems) =>
                existingItems.map((f) =>
                    f.id === filterItem.id ? filterItem : f,
                ),
            ),
        [],
    );

    const clearFilterItems = useCallback(() => setFilterItems([]), []);

    const effectiveValue = useMemo(
        () => ({
            filterItems,
            addFilterItem,
            clearFilterItems,
            removeFilterItem,
            replaceFilterItem,
        }),
        [
            addFilterItem,
            filterItems,
            removeFilterItem,
            replaceFilterItem,
            clearFilterItems,
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
