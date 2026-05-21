import { Box, Paper, Stack, Typography } from "@mui/material";
import { useLapTelemetry } from "../hooks/useLaps";
import TelemetryChart from "../components/TelemetryChart";
import { useTrackData } from "../hooks/useTracks";
import { TrackDisplay } from "../components/Track/TrackDisplay.component";
import { TelemetryPointProvider } from "../hooks/useTelemetryPoint";
import {
    ersFormatter,
    pedalFormatter,
    rpmFormatter,
    speedFormatter,
    steerFormatter,
} from "../helpers/telemetryValueFormatter";
import { TimeDeltaChart } from "./TimeDeltaChart";

interface Props {
    lapId: string;
    secondaryLapId: string;
    trackId: string;
}

export const LapTelemetry = ({ lapId, secondaryLapId, trackId }: Props) => {
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
            <TelemetryPointProvider>
                <Stack gap={1} flex={1} minWidth={0}>
                    {lapTelemetry && secondaryTelemetry && (
                        <TimeDeltaChart
                            primaryLapData={lapTelemetry.lapTime}
                            secondaryLapData={secondaryTelemetry.lapTime}
                        />
                    )}
                    <TelemetryChart
                        title="Speed"
                        data={lapTelemetry.speed}
                        secondaryData={secondaryTelemetry?.speed}
                        valueFormatter={speedFormatter}
                    />
                    <TelemetryChart
                        title="Gas"
                        data={lapTelemetry.gas}
                        secondaryData={secondaryTelemetry?.gas}
                        valueFormatter={pedalFormatter}
                    />
                    <TelemetryChart
                        title="Brake"
                        data={lapTelemetry.brake}
                        secondaryData={secondaryTelemetry?.brake}
                        valueFormatter={pedalFormatter}
                    />
                    <TelemetryChart
                        title="Steering"
                        data={lapTelemetry.steer}
                        secondaryData={secondaryTelemetry?.steer}
                        valueFormatter={steerFormatter}
                    />
                    <TelemetryChart
                        title="ERS Deployment (Joules)"
                        data={lapTelemetry.ers}
                        secondaryData={secondaryTelemetry?.ers}
                        valueFormatter={ersFormatter}
                    />
                    <TelemetryChart
                        title="Gear"
                        data={lapTelemetry.gear}
                        secondaryData={secondaryTelemetry?.gear}
                        mode="stepped"
                    />
                    <TelemetryChart
                        title="RPM"
                        data={lapTelemetry.rpm}
                        secondaryData={secondaryTelemetry?.rpm}
                        valueFormatter={rpmFormatter}
                    />
                </Stack>
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        alignSelf: "flex-start",
                        flex: 1,
                        maxWidth: "1200px",
                    }}
                >
                    <Paper>
                        <Box sx={{ width: "100%", height: "100vh" }}>
                            <TrackDisplay
                                telemetryData={lapTelemetry}
                                secondaryTelemetryData={secondaryTelemetry}
                                trackData={trackData}
                            />
                        </Box>
                    </Paper>
                </Box>
            </TelemetryPointProvider>
        </Stack>
    );
};
