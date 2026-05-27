import { IconButton, Stack, Typography } from "@mui/material";
import { GridColumnHeaderParams } from "@mui/x-data-grid";
import { useMemo, useRef, useState } from "react";
import { TbFilter, TbFilterFilled, TbFilterDown } from "react-icons/tb";
import { useFiltering } from "../../hooks/useFiltering";
import { FilterPopover } from "./FilterPopover";

interface Props {
    params: GridColumnHeaderParams;
}

export const TableHeaderFilter = ({ params }: Props) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const headerRef = useRef(undefined);

    const { filterItems } = useFiltering();

    const fieldFilter = useMemo(
        () => filterItems.find((f) => f.field === params.field),
        [filterItems, params.field],
    );

    const iconSx = {
        visibility: fieldFilter || anchor ? "visible" : "hidden",
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
                ) : fieldFilter ? (
                    <TbFilterFilled size={16} />
                ) : (
                    <TbFilter size={16} />
                )}
            </IconButton>
            <FilterPopover
                anchor={anchor}
                setAnchor={setAnchor}
                colDef={params.colDef}
                fieldFilter={fieldFilter}
            />
        </Stack>
    );
};
