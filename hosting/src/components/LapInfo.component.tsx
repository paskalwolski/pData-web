import { Stack } from "@mui/material";
import { LapData } from "../types";
import { InfoCardValue } from "./InfoCardValue.component";
import { TbArrowCapsule, TbCar, TbHelmet, TbRoad } from "react-icons/tb";
import { BiStopwatch } from "react-icons/bi";
import { formatDuration } from "../helpers/formatDuration";
import { useMetaName } from "../hooks/CTDContext/useCollectionMeta";
import { ExpiresIcon } from "./ExpiresIcon.component";

interface Props {
    lapData: LapData;
    isShowingSessionData?: boolean;
    isComparison?: boolean;
}

const LapInfo = ({
    lapData,
    isShowingSessionData = false,
    isComparison = false,
}: Props) => {
    const { getDriverName, getTrackName, getCarName } = useMetaName();

    return (
        <Stack flex={1} p={1}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <InfoCardValue
                    Icon={BiStopwatch}
                    value={formatDuration(lapData.lapTime)}
                />
                {lapData.expiresAt && (
                    <ExpiresIcon expiresAt={lapData.expiresAt} />
                )}
            </Stack>
            <InfoCardValue
                Icon={TbHelmet}
                value={getDriverName(lapData.sessionData.driver)}
            />
            {isShowingSessionData && (
                <InfoCardValue
                    Icon={TbRoad}
                    value={getTrackName(lapData.sessionData.track)}
                />
            )}
            {(isComparison || isShowingSessionData) && (
                <InfoCardValue
                    Icon={TbCar}
                    value={getCarName(lapData.sessionData.car)}
                />
            )}
            {lapData.sessionId && isShowingSessionData && !isComparison && (
                <InfoCardValue
                    Icon={TbArrowCapsule}
                    value={lapData.lapNumber}
                    // TODO: Add suffix SessionType
                />
            )}
        </Stack>
    );
};

export { LapInfo };
