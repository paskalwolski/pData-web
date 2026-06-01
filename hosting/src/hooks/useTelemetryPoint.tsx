import { createContext, useContext, useState } from "react";

interface TelemetryPointContextValue {
    selectedIndex: number | undefined;
    setSelectedIndex: (point: number | undefined) => void;
    highlightStartIndex: number | undefined;
    setHighlightStartIndex: (point: number | undefined) => void;
    highlightEndIndex: number | undefined;
    setHighlightEndIndex: (point: number | undefined) => void;
    selectionStartIndex: number | undefined;
    setSelectionStartIndex: (point: number | undefined) => void;
    selectionEndIndex: number | undefined;
    setSelectionEndIndex: (point: number | undefined) => void;
}

const TelemetryPointContext = createContext<TelemetryPointContextValue>({
    selectedIndex: undefined,
    setSelectedIndex: () => {},
    highlightStartIndex: undefined,
    setHighlightStartIndex: () => {},
    highlightEndIndex: undefined,
    setHighlightEndIndex: () => {},
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
    const [highlightStartIndex, setHighlightStartIndex] = useState<
        number | undefined
    >();
    const [highlightEndIndex, setHighlightEndIndex] = useState<
        number | undefined
    >();
    const [selectionStartIndex, setSelectionStartIndex] = useState<
        number | undefined
    >();
    const [selectionEndIndex, setSelectionEndIndex] = useState<
        number | undefined
    >();

    const contextValue = {
        selectedIndex,
        setSelectedIndex,
        highlightStartIndex,
        setHighlightStartIndex,
        highlightEndIndex,
        setHighlightEndIndex,
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

// eslint-disable-next-line react-refresh/only-export-components
export { TelemetryPointProvider, useTelemetryPointContext };
