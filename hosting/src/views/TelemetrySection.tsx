import { Box, Stack, Typography } from "@mui/material";
import { useLapTelemetry } from "../hooks/useLaps";
import TelemetryChart from "../components/TelemetryChart";

interface Props {
    lapId: string;
}

export const TelemetrySection = ({ lapId }: Props) => {
    const [lapTelemetry, isLoading] = useLapTelemetry(lapId);
    return isLoading ? (
        <Typography>Loading telemetry...</Typography>
    ) : (
        <Stack direction="row">
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
            <Box display="flex" flex={1} sx={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
                <Typography flex={1}>Track Map Goes Here</Typography>
            </Box>
        </Stack>
    );
};
