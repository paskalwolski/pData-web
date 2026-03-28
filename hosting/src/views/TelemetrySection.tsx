import { Stack, Typography } from "@mui/material";
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
            </Stack>
            <Typography flex={1}>Track Map Goes Here</Typography>
        </Stack>
    );
};
