import {
    Box,
    Card,
    CardActionArea,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { useLatestLaps } from "../hooks/useLaps";
import { useLocation } from "wouter";
import { LapInfo } from "../components/LapInfo.component";

const Homepage = () => {
    const [latestLaps, isLoadingLatestLaps] = useLatestLaps({ fetchLimit: 10 });
    const [, navigate] = useLocation();
    const handleSelectLap = (lapId: string) => {
        navigate(`/laps/${lapId}`);
    };

    return (
        <Stack gap={1} my={1}>
            <Paper>
                <Box p={1}>
                    <Typography variant="h5">Latest Laps</Typography>
                </Box>
                <Divider />
                {isLoadingLatestLaps ? (
                    <Typography>Loading...</Typography>
                ) : latestLaps ? (
                    <Stack direction="row" overflow="auto" spacing={1} px={1}>
                        {latestLaps.map((lap) => (
                            <Box
                                display="flex"
                                flexGrow={1}
                                py={1}
                                key={`lap-${lap.sessionData.driver}-${lap.sessionData.sessionTime}-${lap.lapNumber}`}
                            >
                                <Card>
                                    <CardActionArea
                                        onClick={() =>
                                            handleSelectLap(lap.lapId)
                                        }
                                    >
                                        <Paper elevation={3}>
                                            <Box padding={1}>
                                                <LapInfo
                                                    lapData={lap}
                                                    isShowingSessionData
                                                />
                                            </Box>
                                        </Paper>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2">No available laps</Typography>
                )}
            </Paper>
            <Paper>
                <Box p={1}>
                    <Typography variant="h5">Latest Sessions</Typography>
                </Box>
                <Divider />
                <Typography variant="body2">No available sessions</Typography>
            </Paper>
        </Stack>
    );
};

export { Homepage };
