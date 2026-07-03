import { Typography } from "@mui/material";
import { SessionInfo } from "../components/SessionInfo.component";
import { useSession } from "../hooks/useSessions";

interface Props {
    sessionId: string;
}

export const SessionDataPage = ({ sessionId }: Props) => {
    const [sessionData, loading] = useSession(sessionId);
    return loading ? (
        <Typography>Loading...</Typography>
    ) : (
        <SessionInfo sessionData={sessionData} variant="normal" />
    );
};
