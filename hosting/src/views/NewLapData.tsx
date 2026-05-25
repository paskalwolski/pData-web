import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { useLap } from "../hooks/useLaps";
import { SessionInfo } from "../components/SessionInfo.component";
import { LapTelemetry } from "./LapTelemetry";
import { useRoute } from "wouter";
import { TbAB, TbABOff, TbRoad } from "react-icons/tb";
import { useCallback, useMemo } from "react";
import { navigate } from "wouter/use-browser-location";
import { LapInfo } from "../components/LapInfo.component";
import { InfoCardValue } from "../components/InfoCardValue.component";
import { useOpeneable } from "../hooks/useOpenable";
import { LapTable } from "../components/LapTable.component";

interface NewLapDataProps {
    lapId: string;
    secondaryLapId?: string;
}

export const NewLapData = ({ lapId, secondaryLapId }: NewLapDataProps) => {
    const { palette } = useTheme();
    const [lapData, isLoadingLapData] = useLap(lapId);
    const [secondaryLapData, isLoadingSecondaryLapData] =
        useLap(secondaryLapId);
    const { isOpen, handleOpen, handleClose } = useOpeneable();

    const [hasComparisonLap] = useRoute("/laps/:lapId/compare/:secondaryId");

    const handleComparisonLapSelect = useCallback(
        (comparisonLapId: string) => {
            navigate(`/laps/${lapId}/compare/${comparisonLapId}`);
            handleClose();
        },
        [handleClose, lapId],
    );

    const removeComparisonLap = useCallback(() => {
        navigate(`/laps/${lapId}`);
    }, [lapId]);

    const excludeLaps = useMemo(
        () => [lapId, secondaryLapId],
        [lapId, secondaryLapId],
    );

    return (
        <>
            <Stack spacing={1} width={1}>
                <Paper>
                    <Stack
                        width={1}
                        direction="row"
                        justifyContent="space-between"
                    >
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
                                    spacing={1}
                                >
                                    <Paper
                                        sx={{
                                            flex: 1,
                                            backgroundColor:
                                                palette.primary.dark,
                                        }}
                                    >
                                        <LapInfo
                                            lapData={lapData}
                                            isComparison
                                        />
                                    </Paper>
                                    <Divider orientation="vertical" />
                                    {isLoadingSecondaryLapData ? (
                                        <Typography>Loading...</Typography>
                                    ) : (
                                        secondaryLapData && (
                                            <Paper
                                                sx={{
                                                    flex: 1,
                                                    backgroundColor:
                                                        palette.secondary.dark,
                                                }}
                                            >
                                                <LapInfo
                                                    lapData={secondaryLapData}
                                                    isComparison
                                                />
                                            </Paper>
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
                            <Button variant="outlined" onClick={handleOpen}>
                                <TbAB />
                            </Button>
                            {hasComparisonLap && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={removeComparisonLap}
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
                    <LapTelemetry
                        trackId={lapData.sessionData.track}
                        lapId={lapId}
                        secondaryLapId={secondaryLapId}
                    />
                )}
            </Stack>

            {!isLoadingLapData && (
                <Dialog
                    onClose={handleClose}
                    open={isOpen}
                    fullWidth
                    maxWidth="lg"
                >
                    <DialogTitle>Select Comparison Lap</DialogTitle>
                    <Box height="80vh">
                        <LapTable
                            onLapSelect={handleComparisonLapSelect}
                            defaultSortBy="time"
                            excludeLaps={excludeLaps}
                        />
                    </Box>
                </Dialog>
            )}
        </>
    );
};
