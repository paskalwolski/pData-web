import { Stack } from "@mui/material";
import { SeriesReadoutProps } from "../TelemetryChart/types";
import { TelemetryValueRender } from "../TelemetryChart/TelemetryValueRender";
import { round } from "lodash";

const gearDeltaFormatter = (v: number) => round(v);

export const GearDeltaDisplay = ({
    value,
    color,
}: Exclude<SeriesReadoutProps, "valueFormatter">) => {
    const targetValue = value * -1;
    return (
        <Stack direction="row" width="100%" alignItems="center" spacing={1}>
            <TelemetryValueRender
                value={targetValue}
                color={color}
                valueFormatter={gearDeltaFormatter}
            />
        </Stack>
    );
};
