import { createContext, useContext, useState } from "react";

interface TelemetryPointContextValue {
    selectedIndex: number | undefined;
    setSelectedIndex: (point: number | undefined) => void;
    selectionStartIndex: number | undefined;
    setSelectionStartIndex: (point: number | undefined) => void;
    selectionEndIndex: number | undefined;
    setSelectionEndIndex: (point: number | undefined) => void;
}

const TelemetryPointContext = createContext<TelemetryPointContextValue>({
    selectedIndex: undefined,
    setSelectedIndex: () => {},
    selectionStartIndex: undefined,
    setSelectionStartIndex: () => {},
    selectionEndIndex: undefined,
    setSelectionEndIndex: () => {},
});

const TelemetryPointProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
        undefined,
    );
    const [selectionStartIndex, setSelectionStartIndex] = useState<
        number | undefined
    >();
    const [selectionEndIndex, setSelectionEndIndex] = useState<
        number | undefined
    >();

    const contextValue = {
        selectedIndex,
        setSelectedIndex,
        selectionStartIndex,
        setSelectionStartIndex,
        selectionEndIndex,
        setSelectionEndIndex,
    };

    return (
        <TelemetryPointContext.Provider value={contextValue}>
            {children}
        </TelemetryPointContext.Provider>
    );
};

const useTelemetryPointContext = () => useContext(TelemetryPointContext);

export { TelemetryPointProvider, useTelemetryPointContext };
