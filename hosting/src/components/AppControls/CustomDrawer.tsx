import {
    Divider,
    Drawer,
    List,
    MenuItem,
    MenuItemProps,
    Stack,
    Typography,
} from "@mui/material";
import React from "react";
import { Link } from "wouter";
interface CustomerDrawerProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
}

interface DrawerMenuItemProps extends Exclude<MenuItemProps, "onclick"> {
    children: React.ReactNode;
}

const CustomDrawer = ({
    isDrawerOpen,
    toggleDrawerOpen,
}: CustomerDrawerProps) => {
    const DrawerMenuItem = React.memo<DrawerMenuItemProps>(
        ({ children, ...props }) => (
            <MenuItem {...props} onClick={toggleDrawerOpen}>
                {children}
            </MenuItem>
        ),
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
