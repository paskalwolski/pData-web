import {
    Box,
    Paper,
    Stack,
    Typography,
    IconButton,
    Divider,
    ToggleButtonGroup,
    ToggleButton,
    Checkbox,
    FormControlLabel,
    FormGroup,
    alpha,
    useTheme,
} from "@mui/material";
import { TbSettingsOff, TbSettings } from "react-icons/tb";
import { useOpeneable } from "../../hooks/useOpenable";
import {
    TrackDisplayMode,
    TrackMarkerType,
    TrackMarkerVisibility,
} from "../../types";
import { useCallback, useEffect } from "react";

interface Props {
    displayMode: TrackDisplayMode;
    setDisplayMode: (mode: TrackDisplayMode) => void;
    hasComparisonLap: boolean;
    markerVisibility: TrackMarkerVisibility;
    onMarkerVisibilityChange: (
        key: keyof TrackMarkerVisibility,
        visible: boolean,
    ) => void;
}

const MARKER_TYPE_LABELS: Record<TrackMarkerType, string> = {
    apex: "Apexes",
    fullThrottle: "Full throttle",
};

const TrackDisplayMenu = ({
    displayMode,
    setDisplayMode,
    hasComparisonLap = false,
    markerVisibility,
    onMarkerVisibilityChange,
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
                    <Divider />
                    <Typography variant="overline">Markers</Typography>
                    <FormGroup>
                        {(
                            Object.keys(MARKER_TYPE_LABELS) as TrackMarkerType[]
                        ).map((markerType) => (
                            <FormControlLabel
                                key={markerType}
                                label={MARKER_TYPE_LABELS[markerType]}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={markerVisibility[markerType]}
                                        onChange={(e) =>
                                            onMarkerVisibilityChange(
                                                markerType,
                                                e.target.checked,
                                            )
                                        }
                                    />
                                }
                            />
                        ))}
                        <FormControlLabel
                            label="Comparison lap"
                            disabled={!hasComparisonLap}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={markerVisibility.secondary}
                                    onChange={(e) =>
                                        onMarkerVisibilityChange(
                                            "secondary",
                                            e.target.checked,
                                        )
                                    }
                                />
                            }
                        />
                    </FormGroup>
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
