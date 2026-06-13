import { Box, Paper, Stack, Typography } from "@mui/material";
import { useLapTelemetry } from "../hooks/useLaps";
import TelemetryChart from "../components/TelemetryChart";
import { useTrackData } from "../hooks/useTracks";
import { TrackDisplay } from "../components/Track/TrackDisplay.component";
import { TelemetryPointProvider } from "../hooks/TelemetryPointContext/useTelemetryPoint";
import {
    ersFormatter,
    pedalFormatter,
    rpmFormatter,
    speedFormatter,
    steerFormatter,
    gearFormatter,
} from "../helpers/telemetryValueFormatter";
import { TimeDeltaChart } from "../components/CustomTelemetry/TimeDeltaChart";
import { invert } from "../helpers/telemetryMutators";
import { SteeringAngleDisplay } from "../components/CustomTelemetry/SteeringAngleDisplay";

interface Props {
    lapId: string;
    secondaryLapId: string;
    trackId: string;
}

const STEER_MUTATORS = [invert];

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
                        <Box
                            sx={{
                                position: "sticky",
                                top: 0,
                                alignSelf: "flex-start",
                                width: "100%",
                            }}
                        >
                            <TimeDeltaChart
                                primaryData={lapTelemetry}
                                secondaryData={secondaryTelemetry}
                            />
                        </Box>
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
                        mutators={STEER_MUTATORS}
                        slots={{
                            primaryValue: SteeringAngleDisplay,
                            secondaryValue: SteeringAngleDisplay,
                        }}
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
                        valueFormatter={gearFormatter}
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
                        top: (theme) => `${theme.spacing(1)}`,
                        alignSelf: "flex-start",
                        flex: 1,
                        maxWidth: "1200px",
                        mt: 1,
                        height: (theme) => `calc(100vh - ${theme.spacing(2)})`,
                    }}
                >
                    <Paper sx={{ height: "100%" }}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                            }}
                        >
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
