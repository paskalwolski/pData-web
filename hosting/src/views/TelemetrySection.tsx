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
            <Stack spacing={1} flex={1} minWidth={0}>
                <TelemetryChart data={lapTelemetry.speed} lapId={lapId} />
                <TelemetryChart data={lapTelemetry.gas} lapId={lapId} />
                <TelemetryChart data={lapTelemetry.brake} lapId={lapId} />
                <TelemetryChart data={lapTelemetry.steer} lapId={lapId} />
                <TelemetryChart data={lapTelemetry.ers} lapId={lapId} />
                <TelemetryChart data={lapTelemetry.gear} lapId={lapId} />
                <TelemetryChart data={lapTelemetry.rpm} lapId={lapId} />
            </Stack>
            <Box display="flex" flex={1} sx={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
                <Typography flex={1}>Track Map Goes Here</Typography>
            </Box>
        </Stack>
    );
};
