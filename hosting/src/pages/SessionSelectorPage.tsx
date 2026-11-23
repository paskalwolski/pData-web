import { navigate } from "wouter/use-browser-location";
import { SessionTable } from "../components/SessionTable.component";

const SessionSelectorPage = () => {
    const handleSessionSelect = (sessionId: string) => {
        navigate(`/sessions/${sessionId}`);
    };
    return (
        <SessionTable
            defaultSortBy="date"
            onSessionSelect={handleSessionSelect}
        />
    );
};

export default SessionSelectorPage;
