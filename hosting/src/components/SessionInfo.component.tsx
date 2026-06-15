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
import { useMetaName } from "../hooks/CTDContext/useCollectionMeta";
import { useMemo } from "react";

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

    const { getCarName, getDriverName, getTrackName } = useMetaName();

    const driverName = useMemo(
        () => getDriverName(sessionData.driver),
        [getDriverName, sessionData.driver],
    );
    const carName = useMemo(
        () => getCarName(sessionData.car),
        [getCarName, sessionData.car],
    );
    const trackName = useMemo(
        () => getTrackName(sessionData.track),
        [getTrackName, sessionData.track],
    );
    return (
        <Box m={1}>
            <Grid container columns={VARIANT_COLUMN_MAPPING[variant]}>
                <Grid size={1}>
                    <InfoCardValue Icon={TbRoad} value={trackName} />
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
                            <InfoCardValue Icon={TbHelmet} value={driverName} />
                        </Grid>
                        <Grid size={1}>
                            <InfoCardValue Icon={TbCar} value={carName} />
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
