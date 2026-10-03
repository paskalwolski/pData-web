import { Paper, Typography } from "@mui/material";
import { VisibleLap } from "./LapSelectionLayer";
import { formatDuration } from "../../helpers/formatDuration";

const TOOLTIP_WIDTH = 110;
const TOOLTIP_HEIGHT = 56;
const TOOLTIP_GAP = 10;

interface Props {
    lap: VisibleLap;
    x: number;
    y: number;
    width: number;
    height: number;
    status: string;
}

const Tooltip = ({ lap, x, y, width, height, status }: Props) => {
    const tooltipX =
        x + TOOLTIP_GAP + TOOLTIP_WIDTH > width
            ? x - TOOLTIP_GAP - TOOLTIP_WIDTH
            : x + TOOLTIP_GAP;
    const tooltipY = Math.min(
        Math.max(y - TOOLTIP_HEIGHT / 2, 0),
        height - TOOLTIP_HEIGHT,
    );

    return (
        <Paper
            variant="outlined"
            sx={{
                position: "absolute",
                left: tooltipX,
                top: tooltipY,
                width: TOOLTIP_WIDTH,
                padding: 0.5,
                pointerEvents: "none",
            }}
        >
            <Typography variant="body2" fontWeight="bold">
                Lap {lap.lapNumber}
            </Typography>
            <Typography variant="body2">
                {formatDuration(lap.lapTime)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {status}
            </Typography>
        </Paper>
    );
};

export { Tooltip };
