import { Box, Card, CardActionArea, Grid, Typography } from "@mui/material";
import { useLatestLaps } from "../hooks/useLaps";
import { LapInfo } from "./LapInfo.component";

interface Props {
    trackId?: string;
    onClick: (lapId: string) => void;
    excludeLap?: string;
}
const LapSelector = ({ trackId, onClick, excludeLap }: Props) => {
    const [laps, isLoadingLaps] = useLatestLaps({
        trackId,
        fetchLimit: 30,
        exclude: excludeLap,
    });

    return isLoadingLaps ? (
        <Typography>Loading...</Typography>
    ) : (
        <Grid columns={4} container spacing={1} padding={1}>
            {laps.map((lap) => (
                <Grid>
                    <Card>
                        <CardActionArea onClick={() => onClick(lap.lapId)}>
                            <Box display="flex">
                                <LapInfo lapData={lap} isShowingSessionData />
                            </Box>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export { LapSelector };
