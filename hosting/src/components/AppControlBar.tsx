import { AppBar, Box, MenuItem, Toolbar, Typography } from "@mui/material";
import { useState } from "react";
import {
    TbKeyframe,
    TbKeyframeFilled,
    TbKeyframes,
    TbKeyframesFilled,
} from "react-icons/tb";
import { Link } from "wouter";

const AppControlBar = () => {
    const [mouseOver, setMouseOver] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <AppBar position="static">
            <Toolbar variant="dense" disableGutters>
                <Box display="flex" alignSelf="stretch">
                    <MenuItem
                        onMouseOver={() => setMouseOver(true)}
                        onMouseLeave={() => setMouseOver(false)}
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        color="inherit"
                    >
                        {drawerOpen ? (
                            mouseOver ? (
                                <TbKeyframesFilled />
                            ) : (
                                <TbKeyframes />
                            )
                        ) : mouseOver ? (
                            <TbKeyframeFilled />
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
