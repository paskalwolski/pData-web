import { Stack, useTheme } from "@mui/material";
import TelemetryChart, { CHANNEL_ORDER } from "../components/TelemetryChart";
import { AggregateChannelDoc } from "../types";
import { useLapTelemetry } from "../hooks/useLaps";
import { TelemetryPointProvider } from "../hooks/TelemetryPointContext/useTelemetryPoint";
import React from "react";

interface Props {
    aggregateTelemetry: Record<string, AggregateChannelDoc>;
    selectedLapId?: string;
    isBestLap?: boolean;
}

export const SessionAggregateTelemetry = React.memo(
    ({ aggregateTelemetry, selectedLapId, isBestLap }: Props) => {
        const { palette } = useTheme();
        const channels = CHANNEL_ORDER.filter((key) => aggregateTelemetry[key]);
        const [lapTelemetry, loadingTelemetry] = useLapTelemetry(selectedLapId);

        return (
            <TelemetryPointProvider>
                <Stack gap={1}>
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
                                                      : palette.secondary.main,
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
            </TelemetryPointProvider>
        );
    },
);
