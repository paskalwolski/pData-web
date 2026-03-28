import { Stack, Typography } from "@mui/material";
import { useLap } from "../hooks/useLaps";
import { SessionInfoCard } from "../components/SessionInfoCard.component";

interface NewLapDataProps {
    lapId: string;
}

export const NewLapData = ({ lapId }: NewLapDataProps) => {
    const [lapData, isLoadingLapData] = useLap(lapId);
    return (
        <Stack>
            {isLoadingLapData ? (
                <Typography>Loading...</Typography>
            ) : (
                <SessionInfoCard sessionData={lapData.sessionData} />
            )}
        </Stack>
    );
};
