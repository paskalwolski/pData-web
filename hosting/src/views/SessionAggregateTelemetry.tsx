import { Box, Paper, Stack, useTheme } from "@mui/material";
import TelemetryChart, { CHANNEL_ORDER } from "../components/TelemetryChart";
import { AggregateChannelDoc, TelemetryData } from "../types";
import { useLapTelemetry } from "../hooks/useLaps";
import { TelemetryPointProvider } from "../hooks/TelemetryPointContext/useTelemetryPoint";
import { useTrackData } from "../hooks/useTracks";
import { TrackDisplay } from "../components/Track/TrackDisplay.component";
import React, { useMemo } from "react";

interface Props {
    aggregateTelemetry: Record<string, AggregateChannelDoc>;
    trackId: string;
    selectedLapId?: string;
    isBestLap?: boolean;
}

export const SessionAggregateTelemetry = React.memo(
    ({ aggregateTelemetry, trackId, selectedLapId, isBestLap }: Props) => {
        const { palette } = useTheme();
        const channels = CHANNEL_ORDER.filter((key) => aggregateTelemetry[key]);
        const [lapTelemetry, loadingTelemetry] = useLapTelemetry(selectedLapId);
        const [trackData] = useTrackData(trackId);

        // Present the session mean as plain telemetry so TrackDisplay is unaware it's an aggregate.
        const meanTelemetry = useMemo(
            () =>
                Object.fromEntries(
                    Object.entries(aggregateTelemetry).map(([key, doc]) => [
                        key,
                        doc.mean,
                    ]),
                ) as TelemetryData,
            [aggregateTelemetry],
        );

        return (
            <TelemetryPointProvider>
                <Stack direction="row" gap={2}>
                    <Stack gap={1} flex={1} minWidth={0}>
                        {channels.map((key) => {
                            const channel = aggregateTelemetry[key];
                            const lapSeries = lapTelemetry?.[key];
                            return (
                                <TelemetryChart
                                    key={key}
                                    channel={key}
                                    series={[
                                        ...(lapSeries && !loadingTelemetry
                                            ? [
                                                  {
                                                      id: "lap",
                                                      data: lapSeries,
                                                      color: isBestLap
                                                          ? palette.primary.dark
                                                          : palette.secondary
                                                                .main,
                                                  },
                                              ]
                                            : []),
                                        {
                                            id: "mean",
                                            data: channel.mean,
                                            color: palette.blue.light,
                                        },
                                    ]}
                                    bands={[
                                        {
                                            id: "minmax",
                                            min: channel.min,
                                            max: channel.max,
                                            color: palette.blue.main,
                                        },
                                    ]}
                                    elevation={4}
                                />
                            );
                        })}
                    </Stack>
                    {meanTelemetry.posX && meanTelemetry.posZ && (
                        <Box
                            sx={{
                                position: "sticky",
                                top: (theme) => theme.spacing(1),
                                alignSelf: "flex-start",
                                flex: 1,
                                maxWidth: "1200px",
                                height: (theme) =>
                                    `calc(100vh - ${theme.spacing(2)})`,
                            }}
                        >
                            <Paper elevation={4} sx={{ height: "100%" }}>
                                <TrackDisplay
                                    telemetryData={meanTelemetry}
                                    secondaryTelemetryData={lapTelemetry}
                                    trackData={trackData}
                                />
                            </Paper>
                        </Box>
                    )}
                </Stack>
            </TelemetryPointProvider>
        );
    },
);
