import {
    Box,
    Card,
    Divider,
    List,
    MenuItem,
    Slide,
    Stack,
} from "@mui/material";

interface CustomerDrawerProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
}

const CustomDrawer = ({ isDrawerOpen }: CustomerDrawerProps) => {
    if (!isDrawerOpen) {
        return;
    }

    return (
        <Slide in timeout={200} direction="right">
            <Card square elevation={4} sx={{ boxShadow: "none" }}>
                <Box width="200px" mr={2} display="flex">
                    <Stack direction="column" flexGrow={1}>
                        <List>
                            <MenuItem>Laps</MenuItem>
                            <MenuItem>Sessions</MenuItem>
                            <Divider />
                        </List>
                    </Stack>
                </Box>
            </Card>
        </Slide>
    );
};

export { CustomDrawer };
