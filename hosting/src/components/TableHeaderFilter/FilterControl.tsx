import { Autocomplete, Box, Paper, TextField } from "@mui/material";
import { GridFilterItem } from "@mui/x-data-grid";
import { useState } from "react";
import { useAutocompleteOptions } from "../../hooks/useAutocompleteOptions";
import { FieldNameCollectionMapping } from "./types";

interface Props {
    fieldLabel: string;
    field: string;
}

export const FilterControl = ({ field, fieldLabel }: Props) => {
    const [options, isLoading] = useAutocompleteOptions(
        FieldNameCollectionMapping[field],
    );

    const [localFilter, setLocalFilter] = useState<Partial<GridFilterItem>>({
        field,
        operator: undefined,
    });

    return (
        <Paper sx={{ padding: 1 }}>
            <Box minWidth="400px">
                <Autocomplete
                    options={options}
                    filterSelectedOptions
                    multiple
                    value={localFilter.value}
                    renderInput={(params) => (
                        <TextField {...params} label={fieldLabel} />
                    )}
                    loading={isLoading}
                />
            </Box>
        </Paper>
    );
};
