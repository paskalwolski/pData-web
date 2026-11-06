import {
    alpha,
    Box,
    Card,
    CardActionArea,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
} from "@mui/material";
import { useState } from "react";
import { MdMoreVert } from "react-icons/md";
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
    onCompareLap?: (lap: LapInfo) => void;
}

const SessionLapCard = ({
    lap,
    color,
    selected,
    onSelect,
    onHover,
    onCompareLap,
}: Props) => {
    const selectable = !lap.isPit && lap.isValid && !lap.dropped;
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const closeMenu = () => setMenuAnchor(null);

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
                    borderStyle: lap.dropped ? "dashed" : undefined,
                    position: "relative",
                    "&:hover .lap-options-button": { opacity: 1 },
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
                {selectable && (
                    <>
                        <IconButton
                            size="small"
                            aria-label="Lap options"
                            onClick={(e) => setMenuAnchor(e.currentTarget)}
                            className="lap-options-button"
                            sx={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                opacity: menuAnchor ? 1 : 0,
                                transition: "opacity 0.15s",
                                "&:focus-visible": { opacity: 1 },
                            }}
                        >
                            <MdMoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={menuAnchor}
                            open={!!menuAnchor}
                            onClose={closeMenu}
                        >
                            <MenuItem
                                onClick={() => {
                                    closeMenu();
                                    onSelect?.(lap);
                                }}
                            >
                                Select in Session
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    closeMenu();
                                    onCompareLap?.(lap);
                                }}
                            >
                                Compare to Lap
                            </MenuItem>
                            <Divider />
                        </Menu>
                    </>
                )}
            </Card>
        </Box>
    );
};

export { SessionLapCard };
