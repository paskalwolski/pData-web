import { Box, useTheme } from "@mui/material";
import { CarSpinnerIcon } from "./Icons";

export const CarSpinner = () => {
    const { palette } = useTheme();
    return (
        <Box display="flex" alignItems="center" justifyContent="center">
            <CarSpinnerIcon
                size={128}
                color={palette.secondary.contrastText}
                spinnerColor={palette.primary.main}
            />
        </Box>
    );
};
