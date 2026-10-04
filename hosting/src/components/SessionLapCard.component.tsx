import { alpha, Box, Card, CardActionArea, Stack } from "@mui/material";
import { TbNumber } from "react-icons/tb";
import { BiStopwatch } from "react-icons/bi";
import { LapInfo } from "../types";
import { InfoCardValue } from "./InfoCardValue.component";
import { formatDuration } from "../helpers/formatDuration";

interface Props {
    lap: LapInfo;
    color: string;
    selected?: boolean;
    onSelect?: (lap: LapInfo) => void;
    onHover?: (lap: LapInfo | null) => void;
}

const SessionLapCard = ({ lap, color, selected, onSelect, onHover }: Props) => {
    const selectable = !lap.isPit && lap.isValid;

    return (
        <Box
            display="flex"
            flex={1}
            onMouseEnter={() => onHover?.(lap)}
            onMouseLeave={() => onHover?.(null)}
        >
            <Card
                elevation={selected ? 8 : 3}
                color={color}
                sx={{
                    flex: 1,
                    border: 1,
                    borderColor: color,
                    backgroundColor: selected ? alpha(color, 0.6) : undefined,
                }}
            >
                <CardActionArea
                    disabled={!selectable}
                    onClick={() => onSelect?.(lap)}
                >
                    <Box>
                        <Stack flex={1} my={0.5}>
                            <InfoCardValue
                                Icon={TbNumber}
                                value={lap.lapNumber}
                            />
                            <InfoCardValue
                                Icon={BiStopwatch}
                                value={formatDuration(lap.lapTime)}
                            />
                        </Stack>
                    </Box>
                </CardActionArea>
            </Card>
        </Box>
    );
};

export { SessionLapCard };
