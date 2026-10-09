import { navigate } from "wouter/use-browser-location";
import { LapTable } from "../components/LapTable.component";

const LapSelectorPage = () => {
    const handleLapSelect = (lapId: string) => {
        navigate(`/laps/${lapId}`);
    };
    return <LapTable defaultSortBy="date" onLapSelect={handleLapSelect} />;
};

export default LapSelectorPage;
