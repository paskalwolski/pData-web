import { Button, Paper, Stack, Typography, useTheme } from "@mui/material";
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
import { CarSpinner } from "../components/CarSpinner";
import { useLocation } from "wouter";

interface Props {
    sessionId: string;
}

const SessionDataPage = ({ sessionId }: Props) => {
    const { palette } = useTheme();
    const [, navigate] = useLocation();
    const [sessionData, loadingSession] = useSession(sessionId);

    const { saveSession, saving, error: saveError } = useSaveSession();
    const [saveTriggered, setSaveTriggered] = useState(false);

    const [aggregateTelemetry, loadingAggregateTelemetry] =
        useAggregateTelemetry(
            sessionId,
            sessionData?.aggregateStatus === "completed",
        );

    const [selectedLapId, setSelectedLapId] = useState<string | null>(null);
    const [hoveredLapId, setHoveredLapId] = useState<string | null>(null);

    const isBestLapSelected =
        sessionData?.lapData.find((l) => l.id === selectedLapId)?.lapTime ===
        sessionData?.bestLapTime;

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
        <CarSpinner />
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
                            selected={lap.id === selectedLapId}
                            onSelect={(l) =>
                                setSelectedLapId(
                                    l.id === selectedLapId ? null : l.id,
                                )
                            }
                            onHover={(l) => setHoveredLapId(l?.id ?? null)}
                            onCompareLap={(l) => navigate(`/laps/${l.id}`)}
                        />
                    );
                })}
            </Stack>
            <SessionLapTimeChart
                laps={preparedLapData}
                hoverLapId={hoveredLapId}
            />
            <Paper>
                <Stack m={1} p={2} spacing={1}>
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
                            <CarSpinner
                                heading={
                                    sessionData?.aggregateStatus[0].toUpperCase() +
                                    sessionData.aggregateStatus.slice(1) +
                                    " session data calculation"
                                }
                                subheading={
                                    "Your session data is being calculated and will immediately show when completed"
                                }
                            />
                        )}
                    </Stack>
                    {loadingAggregateTelemetry ? (
                        <CarSpinner />
                    ) : (
                        aggregateTelemetry && (
                            <SessionAggregateTelemetry
                                aggregateTelemetry={aggregateTelemetry}
                                trackId={sessionData.track}
                                selectedLapId={selectedLapId}
                                isBestLap={isBestLapSelected}
                            />
                        )
                    )}
                </Stack>
            </Paper>
        </>
    );
};

export default SessionDataPage;
