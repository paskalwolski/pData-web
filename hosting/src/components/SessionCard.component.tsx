import { Box, Card, CardActionArea, Stack } from "@mui/material";
import { SessionData } from "../types";
import { useCallback } from "react";
import { InfoCardValue } from "./InfoCardValue.component";
import {
    TbArrowCapsule,
    TbCar,
    TbClockX,
    TbHelmet,
    TbRoad,
    TbTag,
} from "react-icons/tb";
import { useMetaName } from "../hooks/CTDContext/useCollectionMeta";

interface Props {
    sessionData: SessionData;
    onClick?: (sessionId: string) => undefined;
}

export const SessionCard = ({ sessionData, onClick }: Props) => {
    const handleClick = useCallback(
        () => onClick?.(sessionData.sessionId),
        [onClick, sessionData.sessionId],
    );

    const { getDriverName, getTrackName, getCarName } = useMetaName();

    return (
        <Card elevation={3} sx={{ m: 1, minWidth: "200px", maxWidth: 0.2 }}>
            <CardActionArea onClick={handleClick}>
                <Stack flex={1} p={1}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <InfoCardValue
                            Icon={TbTag}
                            value={sessionData.sessionType}
                        />
                        {sessionData.expiresAt && (
                            <Box pr={1}>
                                <TbClockX />
                            </Box>
                        )}
                    </Stack>
                    <InfoCardValue
                        Icon={TbHelmet}
                        value={getDriverName(sessionData.driver)}
                    />
                    <InfoCardValue
                        Icon={TbArrowCapsule}
                        value={`${sessionData.validLaps ?? "?"} / ${sessionData.laps ?? "?"}`}
                    />
                    <InfoCardValue
                        Icon={TbRoad}
                        value={getTrackName(sessionData.track)}
                    />
                    <InfoCardValue
                        Icon={TbCar}
                        value={getCarName(sessionData.car)}
                    />
                </Stack>
            </CardActionArea>
        </Card>
    );
};
