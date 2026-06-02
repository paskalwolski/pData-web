import { useTheme } from "@mui/material";
import { TrackSegmentType } from "../types";

const useSegmentTheme = () => {
    const { palette } = useTheme();

    const segmentColorMap: Record<TrackSegmentType, string> = {
        positive: palette.success.main,
        negative: palette.error.main,
        neutral: palette.common.white,
    };

    return segmentColorMap;
};

export { useSegmentTheme };
