import { Card, Divider, List, MenuItem, Stack } from "@mui/material";

interface CustomerDrawerProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
}

const CustomDrawer = ({ isDrawerOpen }: CustomerDrawerProps) => {
    return (
        <Card
            square
            elevation={4}
            sx={{
                boxShadow: "none",
                width: isDrawerOpen ? "200px" : "0px",
                overflowX: "hidden",
                transition: "width 0.3s ease",
                flexShrink: 0,
            }}
        >
            <Stack direction="column" flexGrow={1}>
                <List>
                    <Divider />
                    <MenuItem>Laps</MenuItem>
                    <MenuItem>Sessions</MenuItem>
                    <Divider />
                </List>
            </Stack>
        </Card>
    );
};

export { CustomDrawer };
