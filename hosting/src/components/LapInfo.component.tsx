import { Stack } from "@mui/material";
import { LapData } from "../types";
import { InfoCardValue } from "./InfoCardValue.component";
import {
    TbArrowCapsule,
    TbCar,
    TbClockX,
    TbHelmet,
    TbRoad,
} from "react-icons/tb";
import { BiStopwatch } from "react-icons/bi";
import { formatDuration } from "../helpers/formatDuration";

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
    return (
        <Stack>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
            >
                <InfoCardValue
                    Icon={BiStopwatch}
                    value={formatDuration(lapData.lapTime)}
                />
                {lapData.expiresAt && <TbClockX />}
            </Stack>
            <InfoCardValue Icon={TbHelmet} value={lapData.sessionData.driver} />
            {isShowingSessionData && (
                <InfoCardValue
                    Icon={TbRoad}
                    value={lapData.sessionData.track}
                />
            )}
            {(isComparison || isShowingSessionData) && (
                <InfoCardValue Icon={TbCar} value={lapData.sessionData.car} />
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
