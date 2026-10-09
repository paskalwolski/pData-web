import { Box, Paper, Stack, useTheme } from "@mui/material";
import { useLapTelemetry } from "../hooks/useLaps";
import TelemetryChart, { CHANNEL_ORDER } from "../components/TelemetryChart";
import { useTrackData } from "../hooks/useTracks";
import { TrackDisplay } from "../components/Track/TrackDisplay.component";
import { TelemetryPointProvider } from "../hooks/TelemetryPointContext/useTelemetryPoint";
import { TimeDeltaChart } from "../components/CustomTelemetry/TimeDeltaChart";
import { CarSpinner } from "../components/CarSpinner";

interface Props {
    lapId: string;
    secondaryLapId: string;
    trackId: string;
}

export const LapTelemetry = ({ lapId, secondaryLapId, trackId }: Props) => {
    const { palette } = useTheme();
    const [lapTelemetry, isLoadingTelemetry] = useLapTelemetry(lapId);
    const [secondaryTelemetry, isLoadingSecondaryTelemetry] =
        useLapTelemetry(secondaryLapId);
    const [trackData, isLoadingTrackData] = useTrackData(trackId);

    return isLoadingTelemetry ||
        isLoadingSecondaryTelemetry ||
        isLoadingTrackData ? (
        <CarSpinner />
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
                    {CHANNEL_ORDER.map((key) => {
                        const primarySeries = lapTelemetry?.[key];
                        const secondarySeries = secondaryTelemetry?.[key];
                        if (!primarySeries) return null;
                        return (
                            <TelemetryChart
                                key={key}
                                channel={key}
                                series={[
                                    {
                                        id: "primary",
                                        data: primarySeries,
                                        color: palette.primary.dark,
                                        readoutColor: palette.primary.light,
                                    },
                                    ...(secondarySeries
                                        ? [
                                              {
                                                  id: "secondary",
                                                  data: secondarySeries,
                                                  color: palette.secondary.dark,
                                                  readoutColor:
                                                      palette.secondary.light,
                                                  dashed: true,
                                              },
                                          ]
                                        : []),
                                ]}
                            />
                        );
                    })}
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
