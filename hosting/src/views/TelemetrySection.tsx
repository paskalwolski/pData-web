import { Box, Paper, Stack, Typography } from "@mui/material";
import { useLapTelemetry } from "../hooks/useLaps";
import TelemetryChart from "../components/TelemetryChart";
import { useTrackData } from "../hooks/useTracks";
import { TrackDisplay } from "../components/Track/TrackDisplay.component";

interface Props {
    lapId: string;
    trackId: string;
}

export const TelemetrySection = ({ lapId, trackId }: Props) => {
    const [lapTelemetry, isLoadingTelemetry] = useLapTelemetry(lapId);
    const [trackData, isLoadingTrackData] = useTrackData(trackId);

    return isLoadingTelemetry || isLoadingTrackData ? (
        <Typography>Loading Lap Data...</Typography>
    ) : (
        <Stack direction="row" gap={2}>
            <Stack gap={1} flex={1} minWidth={0}>
                <TelemetryChart
                    title="Speed"
                    data={lapTelemetry.speed}
                    lapId={lapId}
                />
                <TelemetryChart
                    title="Gas"
                    data={lapTelemetry.gas}
                    lapId={lapId}
                />
                <TelemetryChart
                    title="Brake"
                    data={lapTelemetry.brake}
                    lapId={lapId}
                />
                <TelemetryChart
                    title="Steering"
                    data={lapTelemetry.steer}
                    lapId={lapId}
                />
                <TelemetryChart
                    title="ERS Deployment (Joules)"
                    data={lapTelemetry.ers}
                    lapId={lapId}
                />
                <TelemetryChart
                    title="Gear"
                    data={lapTelemetry.gear}
                    lapId={lapId}
                />
                <TelemetryChart
                    title="RPM"
                    data={lapTelemetry.rpm}
                    lapId={lapId}
                />
            </Stack>
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    alignSelf: "flex-start",
                    flex: 1,
                }}
            >
                <Paper>
                    <Box sx={{ width: "100%", height: "100vh" }}>
                        <TrackDisplay
                            telemetryData={lapTelemetry}
                            trackData={trackData}
                            lapId={lapId}
                        />
                    </Box>
                </Paper>
            </Box>
        </Stack>
    );
};
