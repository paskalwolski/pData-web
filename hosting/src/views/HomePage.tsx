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
import { TbClockX } from "react-icons/tb";
import { useLocation } from "wouter";

const Homepage = () => {
    const [latestLaps, isLoadingLatestLaps] = useLatestLaps(10);
    const [, navigate] = useLocation();
    const handleSelectLap = (lapId: string) => {
        navigate(`/laps/${lapId}`);
    };

    return (
        <Stack gap={1} my={1}>
            <Paper>
                <Typography variant="h5">Latest Fast Laps</Typography>
                <Divider />
                {isLoadingLatestLaps ? (
                    <Typography>Loading...</Typography>
                ) : latestLaps ? (
                    <Stack direction="row" overflow="auto" spacing={1}>
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
                                        <Stack gap={1} px={2} py={1}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                px={2}
                                                py={1}
                                            >
                                                <Typography>
                                                    {lap?.sessionData?.driver}
                                                </Typography>
                                                {lap.expiresAt && <TbClockX />}
                                            </Stack>
                                            <Typography>
                                                {lap?.sessionData.sessionTime}
                                            </Typography>
                                            <Typography>
                                                {lap.lapTime}
                                            </Typography>
                                            <Typography>
                                                {lap?.sessionData?.track}
                                            </Typography>
                                            <Typography>
                                                {lap?.sessionData?.car}
                                            </Typography>
                                            <Typography>
                                                {lap?.sessionData.sessionType}
                                            </Typography>
                                            <Typography>
                                                {lap?.sessionId}
                                            </Typography>
                                        </Stack>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="body2">No available laps</Typography>
                )}
            </Paper>
            <Card>
                <Typography variant="h5">Latest Sessions</Typography>
                <Divider />
                <Typography variant="body2">No available sessions</Typography>
            </Card>
        </Stack>
    );
};

export { Homepage };
