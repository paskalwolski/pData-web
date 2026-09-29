import {
    Button,
    CircularProgress,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { SessionInfo } from "../components/SessionInfo.component";
import {
    useAggregateTelemetry,
    useSaveSession,
    useSession,
} from "../hooks/useSessions";
import { SessionLapCard } from "../components/SessionLapCard.component";
import SessionLapTimeChart from "../components/SessionLapTimeChart";
import { useCallback, useMemo, useState } from "react";
import { LapInfo } from "../types";
import { SessionAggregateTelemetry } from "../views/SessionAggregateTelemetry";

interface Props {
    sessionId: string;
}

export const SessionDataPage = ({ sessionId }: Props) => {
    const { palette } = useTheme();
    const [sessionData, loadingSession] = useSession(sessionId);

    const { saveSession, saving, error: saveError } = useSaveSession();
    const [saveTriggered, setSaveTriggered] = useState(false);

    const [aggregateTelemetry] = useAggregateTelemetry(
        sessionId,
        sessionData?.aggregateStatus === "completed",
    );

    const handleSave = useCallback(async () => {
        if (await saveSession(sessionId)) {
            setSaveTriggered(true);
        }
    }, [saveSession, sessionId]);

    const resolveLapColor = useCallback(
        (lap: LapInfo) => {
            if (loadingSession) {
                return undefined;
            }
            return lap.lapTime === sessionData.bestLapTime
                ? palette.purple.main
                : lap.isPit
                  ? palette.blue.main
                  : !lap.isValid
                    ? palette.red.main
                    : palette.green.main;
        },
        [
            loadingSession,
            palette.blue.main,
            palette.green.main,
            palette.purple.main,
            palette.red.main,
            sessionData?.bestLapTime,
        ],
    );

    const preparedLapData = useMemo(
        (): (LapInfo & { color: string })[] =>
            sessionData?.lapData.map((l) => ({
                ...l,
                color: resolveLapColor(l),
            })),
        [sessionData?.lapData, resolveLapColor],
    );
    return loadingSession ? (
        <Typography>Loading...</Typography>
    ) : (
        <>
            <SessionInfo sessionData={sessionData} variant="normal" />
            <Stack direction="row" overflow="auto" spacing={1} px={1}>
                {preparedLapData.map((lap, i) => {
                    return (
                        <SessionLapCard
                            key={`session-lap-${i}`}
                            lap={lap}
                            color={lap.color}
                        />
                    );
                })}
            </Stack>
            <SessionLapTimeChart laps={preparedLapData} />
            <Paper>
                <Stack m={1} p={2}>
                    <Typography>Session Aggregate Data</Typography>
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        spacing={1}
                    >
                        {sessionData.aggregateStatus === "ready" &&
                            !saveTriggered && (
                                <Stack
                                    alignItems="center"
                                    justifyContent="center"
                                    spacing={1}
                                >
                                    <Button
                                        variant="contained"
                                        loading={saving}
                                        onClick={handleSave}
                                    >
                                        Save Session
                                    </Button>
                                    {saveError && (
                                        <Typography color="error">
                                            {saveError}
                                        </Typography>
                                    )}
                                </Stack>
                            )}
                        {(sessionData.aggregateStatus === "pending" ||
                            sessionData.aggregateStatus === "processing") && (
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                spacing={1}
                            >
                                <CircularProgress size={24} />
                                <Typography variant="caption">
                                    Processing telemetry data - it will show
                                    here as soon as it&apos;s ready.
                                </Typography>
                            </Stack>
                        )}
                        <Typography variant="caption">
                            Aggregate status: {sessionData.aggregateStatus}
                        </Typography>
                        {aggregateTelemetry && (
                            <Typography variant="caption">
                                Channels loaded:{" "}
                                {Object.keys(aggregateTelemetry).length}
                            </Typography>
                        )}
                    </Stack>
                    {aggregateTelemetry && (
                        <SessionAggregateTelemetry
                            aggregateTelemetry={aggregateTelemetry}
                        />
                    )}
                </Stack>
            </Paper>
        </>
    );
};
