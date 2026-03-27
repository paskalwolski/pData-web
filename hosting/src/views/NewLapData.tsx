import { Stack, Typography } from "@mui/material";

interface NewLapDataProps {
    lapId: string;
}

export const NewLapData = ({ lapId }: NewLapDataProps) => {
    // const [lapData, isLoadingLapData] = useLap(lapId);

    return (
        <Stack>
            <Typography>{lapId}</Typography>;
        </Stack>
    );
};
