import { createContext, useContext, useMemo } from "react";
import { EntityMetadata } from "../../types";
import { useEntityMeta } from "../../hooks/useCollectionMeta";

interface CTDContext {
    tracks: EntityMetadata | undefined;
    drivers: EntityMetadata | undefined;
    cars: EntityMetadata | undefined;
    loading: boolean;
}

const DEFAULT_CTD_CONTEXT: CTDContext = {
    drivers: undefined,
    cars: undefined,
    tracks: undefined,
    loading: true,
};

const CTDContext = createContext<CTDContext>(DEFAULT_CTD_CONTEXT);

const CTDProvider = ({ children }: { children: React.ReactNode }) => {
    const [entityMetaMap, loading] = useEntityMeta();

    const effectiveValue = useMemo(
        () => (loading ? DEFAULT_CTD_CONTEXT : { ...entityMetaMap, loading }),
        [entityMetaMap, loading],
    );

    return (
        <CTDContext.Provider value={effectiveValue}>
            {children}
        </CTDContext.Provider>
    );
};

const useCTDContext = () => useContext(CTDContext);

// eslint-disable-next-line react-refresh/only-export-components
export { CTDProvider, useCTDContext };
