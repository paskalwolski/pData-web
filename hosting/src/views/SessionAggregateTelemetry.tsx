import { Stack, useTheme } from "@mui/material";
import AggregateTelemetryChart from "../components/AggregateTelemetryChart";
import { AggregateChannelDoc, TelemetryData } from "../types";
import {
    ersFormatter,
    pedalFormatter,
    rpmFormatter,
    speedFormatter,
    steerFormatter,
    gearFormatter,
} from "../helpers/telemetryValueFormatter";
import { invert, TelemetryMutator } from "../helpers/telemetryMutators";
import { useLapTelemetry } from "../hooks/useLaps";

interface Props {
    aggregateTelemetry: Record<string, AggregateChannelDoc>;
    selectedLapId?: string;
}

const STEER_MUTATORS = [invert];

const CHANNEL_CONFIG: Record<
    string,
    {
        title: string;
        valueFormatter: (v: number) => string | number;
        stepped?: boolean;
        mutators?: TelemetryMutator[];
    }
> = {
    speed: { title: "Speed", valueFormatter: speedFormatter },
    gas: { title: "Gas", valueFormatter: pedalFormatter },
    brake: { title: "Brake", valueFormatter: pedalFormatter },
    steer: {
        title: "Steering",
        valueFormatter: steerFormatter,
        mutators: STEER_MUTATORS,
    },
    ers: { title: "ERS Deployment (Joules)", valueFormatter: ersFormatter },
    gear: { title: "Gear", valueFormatter: gearFormatter, stepped: true },
    rpm: { title: "RPM", valueFormatter: rpmFormatter },
};

const CHANNEL_ORDER = ["speed", "gas", "brake", "steer", "ers", "gear", "rpm"];

const applyMutators = (
    data: AggregateChannelDoc[keyof AggregateChannelDoc],
    mutators?: TelemetryMutator[],
) => (mutators ?? []).reduce((d, m) => m(d), data);

export const SessionAggregateTelemetry = ({
    aggregateTelemetry,
    selectedLapId,
}: Props) => {
    const { palette } = useTheme();
    const channels = CHANNEL_ORDER.filter((key) => aggregateTelemetry[key]);
    const [lapTelemetry] = useLapTelemetry(selectedLapId);

    return (
        <Stack gap={1}>
            {channels.map((key) => {
                const config = CHANNEL_CONFIG[key];
                const channel = aggregateTelemetry[key];
                const lapSeries = lapTelemetry?.[key as keyof TelemetryData];
                return (
                    <AggregateTelemetryChart
                        key={key}
                        title={config.title}
                        data={[
                            {
                                label: "mean",
                                data: applyMutators(
                                    channel.mean,
                                    config.mutators,
                                ),
                                color: palette.secondary.main,
                                stepped: config.stepped,
                            },
                            ...(lapSeries
                                ? [
                                      {
                                          label: "lap",
                                          data: applyMutators(
                                              lapSeries,
                                              config.mutators,
                                          ),
                                          color: palette.primary.dark,
                                          stepped: config.stepped,
                                      },
                                  ]
                                : []),
                        ]}
                        minSeries={applyMutators(channel.min, config.mutators)}
                        maxSeries={applyMutators(channel.max, config.mutators)}
                        valueFormatter={config.valueFormatter}
                        elevation={4}
                    />
                );
            })}
        </Stack>
    );
};
