import { Box, Paper, Stack, Typography } from "@mui/material";
import { useLapTelemetry } from "../hooks/useLaps";
import TelemetryChart from "../components/TelemetryChart";
import { useTrackData } from "../hooks/useTracks";
import { TrackDisplay } from "../components/Track/TrackDisplay.component";

interface Props {
    lapId: string;
    secondaryLapId: string;
    trackId: string;
}

export const TelemetrySection = ({ lapId, secondaryLapId, trackId }: Props) => {
    const [lapTelemetry, isLoadingTelemetry] = useLapTelemetry(lapId);
    const [secondaryTelemetry, isLoadingSecondaryTelemetry] =
        useLapTelemetry(secondaryLapId);
    const [trackData, isLoadingTrackData] = useTrackData(trackId);

    return isLoadingTelemetry ||
        isLoadingSecondaryTelemetry ||
        isLoadingTrackData ? (
        <Typography>Loading Lap Data...</Typography>
    ) : (
        <Stack direction="row" gap={2}>
            <Stack gap={1} flex={1} minWidth={0}>
                <TelemetryChart
                    title="Speed"
                    data={lapTelemetry.speed}
                    secondaryData={secondaryTelemetry?.speed}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
                <TelemetryChart
                    title="Gas"
                    data={lapTelemetry.gas}
                    secondaryData={secondaryTelemetry?.gas}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
                <TelemetryChart
                    title="Brake"
                    data={lapTelemetry.brake}
                    secondaryData={secondaryTelemetry?.brake}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
                <TelemetryChart
                    title="Steering"
                    data={lapTelemetry.steer}
                    secondaryData={secondaryTelemetry?.steer}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
                <TelemetryChart
                    title="ERS Deployment (Joules)"
                    data={lapTelemetry.ers}
                    secondaryData={secondaryTelemetry?.ers}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
                <TelemetryChart
                    title="Gear"
                    data={lapTelemetry.gear}
                    secondaryData={secondaryTelemetry?.gear}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
                />
                <TelemetryChart
                    title="RPM"
                    data={lapTelemetry.rpm}
                    secondaryData={secondaryTelemetry?.rpm}
                    lapId={lapId}
                    secondaryLapId={secondaryLapId}
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
