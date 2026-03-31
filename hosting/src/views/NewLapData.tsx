import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { useLap } from "../hooks/useLaps";
import { SessionInfo } from "../components/SessionInfo.component";
import { TelemetrySection } from "./TelemetrySection";
import { useRoute } from "wouter";
import { TbAB, TbABOff, TbRoad } from "react-icons/tb";
import { useCallback } from "react";
import { navigate } from "wouter/use-browser-location";
import { LapInfo } from "../components/LapInfo.component";
import { InfoCardValue } from "../components/InfoCardValue.component";

interface NewLapDataProps {
    lapId: string;
    secondaryLapId?: string;
}

export const NewLapData = ({ lapId, secondaryLapId }: NewLapDataProps) => {
    const [lapData, isLoadingLapData] = useLap(lapId);
    const [secondaryLapData, isLoadingSecondaryLapData] =
        useLap(secondaryLapId);

    const [hasComparisonLap] = useRoute("/laps/:lapId/compare/:secondaryId");

    const removeSecondaryLap = useCallback(() => {
        navigate(`/laps/${lapId}`);
    }, [lapId]);

    return (
        <Stack spacing={1} width={1}>
            <Paper>
                <Stack width={1} direction="row" justifyContent="space-between">
                    {isLoadingLapData ? (
                        <Typography>Loading...</Typography>
                    ) : hasComparisonLap ? (
                        <Stack p={1} spacing={1} flex={1}>
                            <InfoCardValue
                                Icon={TbRoad}
                                value={lapData.sessionData.track}
                            />
                            <Stack
                                direction="row"
                                flex={1}
                                justifyContent="space-between"
                            >
                                <LapInfo lapData={lapData} isComparison />
                                <Divider orientation="vertical" />
                                {isLoadingSecondaryLapData ? (
                                    <Typography>Loading...</Typography>
                                ) : (
                                    secondaryLapData && (
                                        <LapInfo
                                            lapData={secondaryLapData}
                                            isComparison
                                        />
                                    )
                                )}
                            </Stack>
                        </Stack>
                    ) : (
                        <SessionInfo sessionData={lapData.sessionData} />
                    )}
                    <Stack
                        m={1}
                        alignItems="center"
                        justifyContent="space-around"
                    >
                        <Button variant="outlined">
                            <TbAB />
                        </Button>
                        {hasComparisonLap && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={removeSecondaryLap}
                            >
                                <TbABOff />
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Paper>
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
