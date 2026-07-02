import { Card, CardActionArea, Stack } from "@mui/material";
import { SessionData } from "../types";
import { useCallback } from "react";
import { InfoCardValue } from "./InfoCardValue.component";
import { TbArrowCapsule, TbCar, TbHelmet, TbRoad, TbTag } from "react-icons/tb";
import { useMetaName } from "../hooks/CTDContext/useCollectionMeta";
import { ExpiresIcon } from "./ExpiresIcon.component";

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
        <Card elevation={3} sx={{ m: 1, minWidth: "300px" }}>
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
                            <ExpiresIcon expiresAt={sessionData.expiresAt} />
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
