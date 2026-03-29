import { Button, Stack, Typography } from "@mui/material";
import { useLap } from "../hooks/useLaps";
import { SessionInfoCard } from "../components/SessionInfoCard.component";
import { TelemetrySection } from "./TelemetrySection";
import { useRoute } from "wouter";
import { TbAB, TbABOff } from "react-icons/tb";
import { useCallback } from "react";
import { navigate } from "wouter/use-browser-location";

interface NewLapDataProps {
    lapId: string;
    secondaryLapId?: string;
}

export const NewLapData = ({ lapId, secondaryLapId }: NewLapDataProps) => {
    const [lapData, isLoadingLapData] = useLap(lapId);
    const [secondaryLapData, isLoadingSecondaryLapData] =
        useLap(secondaryLapId);

    const [hasSecondaryLap] = useRoute("/laps/:lapId/compare/:secondaryId");

    const removeSecondaryLap = useCallback(() => {
        navigate(`/laps/${lapId}`);
    }, [lapId]);

    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={1}>
                {isLoadingLapData ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <SessionInfoCard sessionData={lapData.sessionData} />
                )}
                {isLoadingSecondaryLapData ? (
                    <Typography>Loading...</Typography>
                ) : (
                    secondaryLapData && (
                        <SessionInfoCard
                            sessionData={secondaryLapData.sessionData}
                        />
                    )
                )}
                {isLoadingLapData || isLoadingSecondaryLapData ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <Stack spacing={1} justifyContent="space-evenly">
                        <Button variant="contained">
                            <TbAB />
                        </Button>
                        {hasSecondaryLap && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={removeSecondaryLap}
                            >
                                <TbABOff />
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>
            {isLoadingLapData || isLoadingSecondaryLapData ? (
                <Typography>Loading...</Typography>
            ) : (
                <TelemetrySection
                    trackId={lapData.sessionData.track}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
            )}
        </Stack>
    );
};
