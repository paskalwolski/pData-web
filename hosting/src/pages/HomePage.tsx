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
    const [latestLaps, isLoadingLatestLaps] = useLatestLaps({
        fetchLimit: 10,
        fastLapsOnly: true,
    });
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
                                flex={1}
                                minWidth={"0.2"}
                                maxWidth={"200px"}
                                key={`lap-${lap.sessionData.driver}-${lap.sessionData.sessionTime}-${lap.lapNumber}`}
                            >
                                <Card elevation={3} sx={{ flex: 1, my: 1 }}>
                                    <CardActionArea
                                        onClick={() =>
                                            handleSelectLap(lap.lapId)
                                        }
                                    >
                                        <Box>
                                            <LapInfo
                                                lapData={lap}
                                                isShowingSessionData
                                            />
                                        </Box>
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
