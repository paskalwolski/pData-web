import { AppBar, Box, MenuItem, Toolbar, Typography } from "@mui/material";
import { Link } from "wouter";
import { useState } from "react";
import { TbKeyframes, TbKeyframe, TbKeyframesFilled } from "react-icons/tb";

interface AppControlBarProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
}

const AppControlBar = ({
    isDrawerOpen,
    toggleDrawerOpen,
}: AppControlBarProps) => {
    const [isMouseOver, setMouseOver] = useState(false);
    return (
        <AppBar position="static">
            <Toolbar variant="dense" disableGutters>
                <Box display="flex" alignSelf="stretch">
                    <MenuItem
                        onMouseEnter={() => setMouseOver(true)}
                        onMouseLeave={() => setMouseOver(false)}
                        onClick={() => toggleDrawerOpen()}
                    >
                        {isMouseOver ? (
                            isDrawerOpen ? (
                                <TbKeyframesFilled />
                            ) : (
                                <TbKeyframes />
                            )
                        ) : isDrawerOpen ? (
                            <TbKeyframes />
                        ) : (
                            <TbKeyframe />
                        )}
                    </MenuItem>
                </Box>
                <MenuItem>
                    <Link href="/" asChild>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1, textAlign: "left" }}
                        >
                            pData
                        </Typography>
                    </Link>
                </MenuItem>
            </Toolbar>
        </AppBar>
    );
};

export { AppControlBar };
