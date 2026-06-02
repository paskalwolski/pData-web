import {
    Box,
    Paper,
    Stack,
    Typography,
    IconButton,
    Divider,
    ToggleButtonGroup,
    ToggleButton,
    alpha,
    useTheme,
} from "@mui/material";
import { TbSettingsOff, TbSettings } from "react-icons/tb";
import { useOpeneable } from "../../hooks/useOpenable";
import { TrackDisplayMode } from "../../types";
import { useCallback, useEffect } from "react";

interface Props {
    displayMode: TrackDisplayMode;
    setDisplayMode: (mode: TrackDisplayMode) => void;
    hasComparisonLap: boolean;
}

const TrackDisplayMenu = ({
    displayMode,
    setDisplayMode,
    hasComparisonLap = false,
}: Props) => {
    const { isOpen, handleOpen, handleClose } = useOpeneable();

    const { palette } = useTheme();

    const handleSegmentModeClick = useCallback(
        (_, v: TrackDisplayMode) => v && setDisplayMode(v),
        [setDisplayMode],
    );

    useEffect(() => {
        if (!hasComparisonLap) {
            setDisplayMode("pedals");
        }
    }, [hasComparisonLap, setDisplayMode]);

    return isOpen ? (
        <Box
            onClick={handleClose}
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 9,
                backgroundColor: alpha(palette.background.default, 0.6),
            }}
        >
            <Paper
                elevation={10}
                onClick={(e) => e.stopPropagation()}
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    height: "100%",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Stack height={1} spacing={1} width="200px" p={1}>
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Typography>Track Config</Typography>
                        <IconButton onClick={handleClose}>
                            <TbSettingsOff />
                        </IconButton>
                    </Stack>
                    <Divider />
                    <Typography variant="overline">Segment Mode</Typography>
                    <ToggleButtonGroup
                        orientation="vertical"
                        value={displayMode}
                        exclusive
                        onChange={handleSegmentModeClick}
                    >
                        <ToggleButton value="pedals">Pedals</ToggleButton>
                        <ToggleButton value="lines">Racing Line</ToggleButton>
                        <ToggleButton
                            value="delta"
                            disabled={!hasComparisonLap}
                        >
                            Delta
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Paper>
        </Box>
    ) : (
        <IconButton
            onClick={handleOpen}
            sx={{ position: "absolute", top: 8, right: 8, zIndex: 11 }}
        >
            <TbSettings />
        </IconButton>
    );
};

export { TrackDisplayMenu };
