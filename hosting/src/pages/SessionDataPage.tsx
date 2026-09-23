import { Stack, Typography, useTheme } from "@mui/material";
import { SessionInfo } from "../components/SessionInfo.component";
import { useSession } from "../hooks/useSessions";
import { SessionLapCard } from "../components/SessionLapCard.component";
import SessionLapTimeChart from "../components/SessionLapTimeChart";

interface Props {
    sessionId: string;
}

export const SessionDataPage = ({ sessionId }: Props) => {
    const { palette } = useTheme();
    const [sessionData, loadingSession] = useSession(sessionId);
    return loadingSession ? (
        <Typography>Loading...</Typography>
    ) : (
        <>
            <SessionInfo sessionData={sessionData} variant="normal" />
            <Stack direction="row" overflow="auto" spacing={1} px={1}>
                {sessionData.lapData.map((lap, i) => {
                    const resolvedColor =
                        lap.lapTime === sessionData.bestLapTime
                            ? palette.purple.main
                            : lap.isPit
                              ? palette.blue.main
                              : !lap.isValid
                                ? palette.red.main
                                : palette.green.main;

                    return (
                        <SessionLapCard
                            key={`session-lap-${i}`}
                            lap={lap}
                            color={resolvedColor}
                        />
                    );
                })}
            </Stack>
            <SessionLapTimeChart laps={sessionData.lapData} />
        </>
    );
};
