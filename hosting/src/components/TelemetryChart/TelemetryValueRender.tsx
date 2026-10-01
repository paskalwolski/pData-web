import { Typography } from "@mui/material";
import { SeriesReadoutProps } from "./types";

type TelemetryValueRenderProps = Pick<
    SeriesReadoutProps,
    "value" | "color" | "valueFormatter"
>;

export const TelemetryValueRender = ({
    valueFormatter,
    value,
    color,
}: TelemetryValueRenderProps) => {
    return (
        <Typography color={color} sx={{ minWidth: "8ch", textAlign: "right" }}>
            {isFinite(value) && value != null
                ? (valueFormatter?.(value) ?? value)
                : "-"}
        </Typography>
    );
};
