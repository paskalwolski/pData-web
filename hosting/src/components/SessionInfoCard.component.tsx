import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { SessionData } from "../types";
import { TbCalendar, TbCar, TbHelmet, TbRoad } from "react-icons/tb";
import { IconType } from "react-icons";
import { BiStopwatch } from "react-icons/bi";

type Variant = "wide" | "small" | "normal";
const VARIANT_COLUMN_MAPPING: Record<Variant, number> = {
    wide: 4,
    normal: 3,
    small: 11,
};

interface SessionInfoCardProps {
    sessionData: SessionData;
    variant?: Variant;
}

interface CardValueProps {
    Icon?: IconType;
    label?: string;
    value: string;
}
const CardValue = ({ Icon, label, value }: CardValueProps) => (
    <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={2}
        px={2}
    >
        <Box display="flex">
            {Icon && <Icon />}
            {label && <Typography>{label}:</Typography>}
        </Box>
        <Typography>{value}</Typography>
    </Stack>
);

const SessionInfoCard = ({
    sessionData,
    variant = "normal",
}: SessionInfoCardProps) => {
    const formattedDate = new Date(
        sessionData.sessionTime,
    ).toLocaleDateString();
    return (
        <Paper>
            <Box m={2}>
                <Grid container columns={VARIANT_COLUMN_MAPPING[variant]}>
                    <Grid size={1}>
                        <CardValue Icon={TbHelmet} value={sessionData.driver} />
                    </Grid>
                    <Grid size={1}>
                        <CardValue Icon={TbCar} value={sessionData.car} />
                    </Grid>
                    <Grid size={1}>
                        <CardValue Icon={TbRoad} value={sessionData.track} />
                    </Grid>
                    <Grid size={1}>
                        <CardValue
                            Icon={BiStopwatch}
                            value={sessionData.sessionType}
                        />
                    </Grid>
                    <Grid size={1}>
                        <CardValue Icon={TbCalendar} value={formattedDate} />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};
export { SessionInfoCard };
