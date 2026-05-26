import { Box, IconButton, Popover, Stack, Typography } from "@mui/material";
import { GridColumnHeaderParams, GridFilterItem } from "@mui/x-data-grid";
import { useRef, useState } from "react";
import { TbFilter, TbFilterFilled, TbFilterDown } from "react-icons/tb";

interface Props {
    params: GridColumnHeaderParams;
}

const TableHeaderFilter = ({ params }: Props) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const headerRef = useRef(undefined);

    // TODO: Replace with context functions
    const [localFilter, setLocalFilter] = useState<GridFilterItem>();

    const iconSx = {
        visibility: localFilter || anchor ? "visible" : "hidden",
        ".MuiDataGrid-columnHeader:hover &": { visibility: "visible" },
    };

    return (
        <Stack
            direction="row"
            alignItems="center"
            width="100%"
            flex={1}
            justifyContent="start"
            ref={headerRef}
            role="button"
        >
            <Typography
                variant="body2"
                overflow="hidden"
                textOverflow="ellipsis"
                noWrap
            >
                {params.colDef.headerName}
            </Typography>
            <IconButton
                sx={iconSx}
                onClick={() => setAnchor(headerRef.current)}
            >
                {anchor ? (
                    <TbFilterDown size={16} />
                ) : localFilter ? (
                    <TbFilterFilled size={16} />
                ) : (
                    <TbFilter size={16} />
                )}
            </IconButton>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Box p={1}>
                    This is where my filtering would go... IF I HAD ANY
                </Box>
            </Popover>
        </Stack>
    );
};

export { TableHeaderFilter };
