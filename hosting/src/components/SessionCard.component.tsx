import { Card, CardActionArea, Stack } from "@mui/material";
import { SessionData } from "../types";
import { useCallback } from "react";
import { InfoCardValue } from "./InfoCardValue.component";
import { TbArrowCapsule, TbCar, TbHelmet, TbRoad } from "react-icons/tb";
import { useMetaName } from "../hooks/CTDContext/useCollectionMeta";
import { ExpiresIcon } from "./ExpiresIcon.component";
import { formatDuration } from "../helpers/formatDuration";
import { BiStopwatch } from "react-icons/bi";

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
        <Card elevation={3} sx={{ width: "300px" }}>
            <CardActionArea onClick={handleClick}>
                <Stack flex={1} py={1}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        pr={1}
                    >
                        <InfoCardValue
                            Icon={TbArrowCapsule}
                            value={`${sessionData.sessionType} - ${sessionData?.validLaps ?? "?"}/${sessionData.lapCount ?? "?"} laps`}
                        />
                        {sessionData.expiresAt && (
                            <ExpiresIcon expiresAt={sessionData.expiresAt} />
                        )}
                    </Stack>
                    <InfoCardValue
                        Icon={TbRoad}
                        value={getTrackName(sessionData.track)}
                    />
                    <InfoCardValue
                        Icon={TbCar}
                        value={getCarName(sessionData.car)}
                    />
                    <InfoCardValue
                        Icon={BiStopwatch}
                        value={formatDuration(sessionData.bestLapTime)}
                    />
                    <InfoCardValue
                        Icon={TbHelmet}
                        value={getDriverName(sessionData.driver)}
                    />
                </Stack>
            </CardActionArea>
        </Card>
    );
};
