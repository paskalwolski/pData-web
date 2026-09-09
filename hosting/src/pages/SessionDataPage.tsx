import {
    Box,
    Card,
    CardActionArea,
    Stack,
    Typography,
    useTheme,
} from "@mui/material";
import { SessionInfo } from "../components/SessionInfo.component";
import { useSession } from "../hooks/useSessions";
import { InfoCardValue } from "../components/InfoCardValue.component";
import { TbNumber } from "react-icons/tb";
import { BiStopwatch } from "react-icons/bi";
import { formatDuration } from "../helpers/formatDuration";

interface Props {
    sessionId: string;
}

export const SessionDataPage = ({ sessionId }: Props) => {
    const { palette } = useTheme();
    const [sessionData, loadingSession] = useSession(sessionId);
    return loadingSession ? (
        <Typography>Loading...</Typography>
    ) : (
        <>
            <SessionInfo sessionData={sessionData} variant="normal" />
            <Stack direction="row" overflow="auto" spacing={1} px={1}>
                {sessionData.lapData.map((lap, i) => {
                    const resolvedColor =
                        lap.lapTime === sessionData.bestLapTime
                            ? palette.purple.main
                            : lap.isPit
                              ? palette.blue.main
                              : !lap.isValid
                                ? palette.red.main
                                : palette.green.main;

                    return (
                        <Box display="flex" flex={1} key={`session-lap-${i}`}>
                            <Card
                                elevation={3}
                                color={resolvedColor}
                                sx={{
                                    flex: 1,
                                    border: 1,
                                    borderColor: resolvedColor,
                                }}
                            >
                                <CardActionArea
                                    onClick={() =>
                                        console.log("Lap", lap.lapNumber)
                                    }
                                >
                                    <Box>
                                        <Stack flex={1} my={0.5}>
                                            <InfoCardValue
                                                Icon={TbNumber}
                                                value={lap.lapNumber}
                                            />
                                            <InfoCardValue
                                                Icon={BiStopwatch}
                                                value={formatDuration(
                                                    lap.lapTime,
                                                )}
                                            />
                                        </Stack>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Box>
                    );
                })}
            </Stack>
        </>
    );
};
