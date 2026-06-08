import {
    Divider,
    Drawer,
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
        <MenuItem
            {...props}
            onClick={(e) => {
                toggleDrawerOpen();
                props.onClick?.(e);
            }}
        >
            {children}
        </MenuItem>
    );

    return (
        <Drawer open={isDrawerOpen} onClose={toggleDrawerOpen}>
            <Stack direction="column" flexGrow={1} width={200}>
                <List>
                    <DrawerMenuItem>
                        <Link href="/" asChild>
                            <Typography>Home</Typography>
                        </Link>
                    </DrawerMenuItem>
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
        </Drawer>
    );
};

export { CustomDrawer };
