import {
    Card,
    Divider,
    List,
    MenuItem,
    Stack,
    Typography,
} from "@mui/material";
import { Link } from "wouter";

interface CustomerDrawerProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
}

const CustomDrawer = ({
    isDrawerOpen,
    toggleDrawerOpen,
}: CustomerDrawerProps) => {
    const DrawerMenuItem = ({ children, ...props }) => (
        <MenuItem {...props} onClick={toggleDrawerOpen}>
            {children}
        </MenuItem>
    );
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
                    <DrawerMenuItem>
                        <Link href="/laps" asChild>
                            <Typography>Laps</Typography>
                        </Link>
                    </DrawerMenuItem>
                    <DrawerMenuItem>Sessions</DrawerMenuItem>
                    <Divider />
                </List>
            </Stack>
        </Card>
    );
};

export { CustomDrawer };
