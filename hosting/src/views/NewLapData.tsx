import { Stack, Typography } from "@mui/material";
import { useLap } from "../hooks/useLaps";
import { SessionInfoCard } from "../components/SessionInfoCard.component";
import { TelemetrySection } from "./TelemetrySection";

interface NewLapDataProps {
    lapId: string;
}

export const NewLapData = ({ lapId }: NewLapDataProps) => {
    const [lapData, isLoadingLapData] = useLap(lapId);
    return isLoadingLapData ? (
        <Typography>Loading...</Typography>
    ) : (
        <Stack>
            <SessionInfoCard sessionData={lapData.sessionData} />
            <TelemetrySection lapId={lapId} />
        </Stack>
    );
};
