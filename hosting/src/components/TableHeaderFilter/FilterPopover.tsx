import { Box, Popover } from "@mui/material";
import { GridFilterItem } from "@mui/x-data-grid";
import { FilterControl } from "./FilterControl";
import { useFiltering } from "../../hooks/useFiltering";
import { useCallback, useMemo } from "react";
import { GridStateColDef } from "@mui/x-data-grid/internals";

interface Props {
    anchor: Element | null;
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement>>;
    colDef: GridStateColDef;
    fieldFilter: GridFilterItem;
}

export const FilterPopover = ({
    anchor,
    setAnchor,
    colDef,
    fieldFilter,
}: Props) => {
    const { addFilterItem, replaceFilterItem, removeFilterItem } =
        useFiltering();

    const defaultFilter: GridFilterItem = useMemo(
        () => ({
            field: colDef.field,
            operator: colDef.type === "string" ? "isAnyOf" : "=",
            value: undefined,
        }),
        [colDef.field, colDef.type],
    );

    const effectiveFilter = fieldFilter ?? defaultFilter;

    const handleSaveFilter = useCallback(
        (filter: GridFilterItem) => {
            const isArray = Array.isArray(filter.value);
            const hasValue = isArray ? filter.value.length > 0 : !!filter.value;
            if (filter.id) {
                // Existing filter
                if (hasValue) {
                    // Update existing filter
                    replaceFilterItem(filter);
                } else {
                    // Remove existing filter
                    removeFilterItem(filter.id);
                }
                return;
            }
            // New Filter
            if (hasValue) {
                // Add new filter
                addFilterItem(filter);
            }
        },
        [addFilterItem, removeFilterItem, replaceFilterItem],
    );

    const handleFilterChange = useCallback(
        (value: unknown) => {
            const updatedFilter = { ...effectiveFilter, value };
            handleSaveFilter(updatedFilter);
        },
        [effectiveFilter, handleSaveFilter],
    );

    const handlePopoverClose = useCallback(() => {
        setAnchor(null);
    }, [setAnchor]);

    return (
        <Popover
            open={Boolean(anchor)}
            anchorEl={anchor}
            onClose={handlePopoverClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Box p={1}>
                {colDef.type === "boolean" ? (
                    <>No Bool Filter... yet</>
                ) : (
                    <FilterControl
                        fieldLabel={colDef.headerName}
                        field={colDef.field}
                        filter={fieldFilter}
                        onChange={handleFilterChange}
                    />
                )}
            </Box>
        </Popover>
    );
};
