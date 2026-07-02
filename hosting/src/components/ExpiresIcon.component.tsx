import { Box, Tooltip, useTheme } from "@mui/material";
import { Timestamp } from "firebase/firestore";
import { TbClockX } from "react-icons/tb";

interface Props {
    expiresAt: Timestamp;
}

export const ExpiresIcon = ({ expiresAt }: Props) => {
    const { palette } = useTheme();

    return (
        <Box
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            height="stretch"
        >
            <Tooltip
                title={`Automatically expires on ${expiresAt.toDate().toLocaleString("en-fr", { dateStyle: "short", timeStyle: "short" })}`}
            >
                <TbClockX color={palette.warning.main} />
            </Tooltip>
        </Box>
    );
};
