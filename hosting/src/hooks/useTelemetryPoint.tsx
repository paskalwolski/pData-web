import { createContext, useContext, useState } from "react";

interface TelemetryPointContextValue {
    selectedIndex: number | undefined;
    setSelectedIndex: (point: number | undefined) => void;
}

const TelemetryPointContext = createContext<TelemetryPointContextValue>({
    selectedIndex: undefined,
    setSelectedIndex: () => {},
});

const TelemetryPointProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [selectedIndex, setSelectedIndex] = useState<number | undefined>(
        undefined,
    );

    return (
        <TelemetryPointContext.Provider
            value={{ selectedIndex, setSelectedIndex }}
        >
            {children}
        </TelemetryPointContext.Provider>
    );
};

const useTelemetryPointContext = () => useContext(TelemetryPointContext);

export { TelemetryPointProvider, useTelemetryPointContext };
