import { Divider, Drawer, List, MenuItem, Stack } from "@mui/material";
import { Link } from "wouter";

interface CustomerDrawerProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
}

const CustomDrawer = ({
    isDrawerOpen,
    toggleDrawerOpen,
}: CustomerDrawerProps) => (
    <Drawer open={isDrawerOpen} onClose={toggleDrawerOpen}>
        <Stack direction="column" flexGrow={1} width={200}>
            <List>
                <MenuItem component={Link} href="/" onClick={toggleDrawerOpen}>
                    Home
                </MenuItem>
                <Divider />
                <MenuItem
                    component={Link}
                    href="/laps"
                    onClick={toggleDrawerOpen}
                >
                    Laps
                </MenuItem>
                <MenuItem onClick={toggleDrawerOpen}>Sessions</MenuItem>
                <Divider />
            </List>
        </Stack>
    </Drawer>
);

export { CustomDrawer };
