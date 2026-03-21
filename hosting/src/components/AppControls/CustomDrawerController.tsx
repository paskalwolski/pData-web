import { MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { TbKeyframesFilled, TbKeyframes, TbKeyframe } from "react-icons/tb";

interface CustomDrawerControllerProps {
    isDrawerOpen: boolean;
    toggleDrawerOpen: () => void;
    isLabelShown?: boolean;
}

const CustomDrawerController = ({
    isDrawerOpen,
    toggleDrawerOpen,
    isLabelShown,
}: CustomDrawerControllerProps) => {
    const [isMouseOver, setMouseOver] = useState(false);

    return (
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
                <TbKeyframesFilled />
            ) : (
                <TbKeyframe />
            )}
            {isLabelShown && <Typography variant="h6">pData</Typography>}
        </MenuItem>
    );
};

export { CustomDrawerController };
