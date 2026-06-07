import { navigate } from "wouter/use-browser-location";
import { LapTable } from "../components/LapTable.component";

export const LapSelectorPage = () => {
    const handleLapSelect = (lapId: string) => {
        navigate(`/laps/${lapId}`);
    };
    return <LapTable defaultSortBy="date" onLapSelect={handleLapSelect} />;
};
