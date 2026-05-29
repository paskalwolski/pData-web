import { Stack } from "@mui/material";
import { TelemetryValueDisplayProps } from "../TelemetryChart/types";
import { WheelIcon } from "../Icons";
import { TelemetryValueRender } from "../TelemetryChart/TelemetryValueRender";

export const SteeringAngleDisplay = ({
    variant,
    primaryValue,
    secondaryValue,
    valueFormatter,
    color,
}: TelemetryValueDisplayProps) => {
    const targetValue = variant === "secondary" ? secondaryValue : primaryValue;
    return (
        <Stack direction="row" width="100%" alignItems="center" spacing={1}>
            <TelemetryValueRender
                value={targetValue}
                color={color}
                valueFormatter={valueFormatter}
            />
            <WheelIcon color={color} rotate={targetValue} />
        </Stack>
    );
};
