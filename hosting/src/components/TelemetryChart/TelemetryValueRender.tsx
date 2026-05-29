import { Typography } from "@mui/material";
import { TelemetryChartProps } from "./types";

type TelemetryValueRenderProps = Pick<TelemetryChartProps, "valueFormatter"> & {
    value?: number;
    color?: string;
};

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
