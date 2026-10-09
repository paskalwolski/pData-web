import { Box, Typography, useTheme } from "@mui/material";
import { CarSpinnerIcon } from "./Icons";

interface Props {
    heading?: string;
    subheading?: string;
}

export const CarSpinner = ({ heading, subheading }: Props) => {
    const { palette } = useTheme();
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding={4}
        >
            <CarSpinnerIcon
                size={128}
                color={palette.secondary.contrastText}
                spinnerColor={palette.primary.main}
            />
            {heading && <Typography>{heading}</Typography>}
            {subheading && (
                <Typography variant="caption">{subheading}</Typography>
            )}
        </Box>
    );
};
