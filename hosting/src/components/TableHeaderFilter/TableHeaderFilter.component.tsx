import { Box, IconButton, Popover, Stack, Typography } from "@mui/material";
import { GridColumnHeaderParams, GridFilterItem } from "@mui/x-data-grid";
import { useRef, useState } from "react";
import { TbFilter, TbFilterFilled, TbFilterDown } from "react-icons/tb";
import { FilterControl } from "./FilterControl";
import { AutocompleteCollection } from "./types";

interface Props {
    params: GridColumnHeaderParams;
}

export const TableHeaderFilter = ({ params }: Props) => {
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
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Box p={1}>
                    {params.colDef.type === "boolean" ? (
                        <>No Bool Filter... yet</>
                    ) : (
                        <FilterControl
                            fieldLabel={params.colDef.headerName}
                            field={params.field as AutocompleteCollection}
                        />
                    )}
                </Box>
            </Popover>
        </Stack>
    );
};
