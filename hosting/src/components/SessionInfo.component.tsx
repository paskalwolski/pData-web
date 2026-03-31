import { Box, Grid } from "@mui/material";
import { SessionData } from "../types";
import {
    TbArrowCapsule,
    TbCalendar,
    TbCar,
    TbHelmet,
    TbRoad,
} from "react-icons/tb";
import { InfoCardValue } from "./InfoCardValue.component";

type Variant = "wide" | "small" | "normal";
const VARIANT_COLUMN_MAPPING: Record<Variant, number> = {
    wide: 4,
    normal: 3,
    small: 11,
};

interface SessionInfoCardProps {
    sessionData: SessionData;
    isComparison?: boolean;
    variant?: Variant;
}

const SessionInfo = ({
    sessionData,
    variant = "normal",
    isComparison = false,
}: SessionInfoCardProps) => {
    const formattedDate = new Date(
        sessionData.sessionTime,
    ).toLocaleDateString();
    return (
        <Box m={1}>
            <Grid container columns={VARIANT_COLUMN_MAPPING[variant]}>
                <Grid size={1}>
                    <InfoCardValue Icon={TbRoad} value={sessionData.track} />
                </Grid>
                {!isComparison && (
                    <>
                        <Grid size={1}>
                            <InfoCardValue
                                Icon={TbCalendar}
                                value={formattedDate}
                            />
                        </Grid>
                        <Grid size={1}>
                            <InfoCardValue
                                Icon={TbHelmet}
                                value={sessionData.driver}
                            />
                        </Grid>
                        <Grid size={1}>
                            <InfoCardValue
                                Icon={TbCar}
                                value={sessionData.car}
                            />
                        </Grid>
                        <Grid size={1}>
                            <InfoCardValue
                                Icon={TbArrowCapsule}
                                value={sessionData.sessionType}
                                // TODO: Suffix Session Type
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        </Box>
    );
};
export { SessionInfo };
