import { Stack } from "@mui/material";
import { SeriesReadoutProps } from "../TelemetryChart/types";
import { WheelIcon } from "../Icons";
import { TelemetryValueRender } from "../TelemetryChart/TelemetryValueRender";

export const SteeringAngleDisplay = ({
    value,
    valueFormatter,
    color,
}: SeriesReadoutProps) => {
    const targetValue = value * -1;
    return (
        <Stack direction="row" width="100%" alignItems="center" spacing={1}>
            <TelemetryValueRender
                value={targetValue}
                color={color}
                valueFormatter={valueFormatter}
            />
            {isFinite(targetValue) && (
                <WheelIcon color={color} rotate={targetValue} />
            )}
        </Stack>
    );
};
