import { Autocomplete, Box, Paper, TextField } from "@mui/material";
import { GridFilterItem } from "@mui/x-data-grid";
import { useAutocompleteOptions } from "../../hooks/CTDContext/useAutocompleteOptions";
import { AutocompleteCollection, FieldNameCollectionMapping } from "./types";
import React, { useCallback } from "react";

interface Props {
    fieldLabel: string;
    field: string;
    filter?: GridFilterItem;
    onChange: (value: []) => void;
    disabled?: boolean;
}

export const FilterControl = ({
    field,
    fieldLabel,
    filter,
    onChange,
    disabled,
}: Props) => {
    const [options, isLoading] = useAutocompleteOptions(
        FieldNameCollectionMapping[field as AutocompleteCollection],
    );

    const handleChange = useCallback(
        (e: React.SyntheticEvent, v: []) => onChange(v),
        [onChange],
    );

    return (
        <Paper sx={{ padding: 1 }}>
            <Box minWidth="400px">
                <Autocomplete
                    options={options}
                    filterSelectedOptions
                    multiple
                    value={filter?.value ?? []}
                    renderInput={(params) => (
                        <TextField {...params} label={fieldLabel} />
                    )}
                    loading={isLoading}
                    onChange={handleChange}
                    disabled={disabled}
                />
            </Box>
        </Paper>
    );
};
