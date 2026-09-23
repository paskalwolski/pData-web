import { Box, Card, CardActionArea, Stack } from "@mui/material";
import { TbNumber } from "react-icons/tb";
import { BiStopwatch } from "react-icons/bi";
import { LapInfo } from "../types";
import { InfoCardValue } from "./InfoCardValue.component";
import { formatDuration } from "../helpers/formatDuration";

interface Props {
    lap: LapInfo;
    color: string;
}

const SessionLapCard = ({ lap, color }: Props) => (
    <Box display="flex" flex={1}>
        <Card
            elevation={3}
            color={color}
            sx={{
                flex: 1,
                border: 1,
                borderColor: color,
            }}
        >
            <CardActionArea onClick={() => console.log("Lap", lap.lapNumber)}>
                <Box>
                    <Stack flex={1} my={0.5}>
                        <InfoCardValue Icon={TbNumber} value={lap.lapNumber} />
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

export { SessionLapCard };
