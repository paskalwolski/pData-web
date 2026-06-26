import { Stack, Box, Typography, SxProps, Theme } from "@mui/material";
import { IconType } from "react-icons";

interface CardValueProps {
    Icon?: IconType;
    label?: string;
    value: string | number;
    sx?: SxProps<Theme>;
    // TODO: Add muted suffix
}
const InfoCardValue = ({ Icon, label, value, sx }: CardValueProps) => (
    <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
        px={1}
        sx={sx}
    >
        <Box display="flex">
            {Icon && <Icon />}
            {label && <Typography>{label}:</Typography>}
        </Box>
        <Typography
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
        >
            {value}
        </Typography>
    </Stack>
);

export { InfoCardValue };
