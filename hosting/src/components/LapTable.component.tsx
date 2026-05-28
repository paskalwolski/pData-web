import {
    DataGrid,
    GridColDef,
    GridEventListener,
    GridFilterItem,
    GridFilterModel,
    GridLogicOperator,
    GridPaginationModel,
} from "@mui/x-data-grid";
import { useLapTableData } from "../hooks/useLaps";
import type { LapData } from "../types";
import { formatDuration } from "../helpers/formatDuration";
import { Timestamp } from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import { TbClockX } from "react-icons/tb";
import { Box, useTheme } from "@mui/material";
import { GridSortModel } from "@mui/x-data-grid";
import { TableHeaderFilter } from "./TableHeaderFilter";
import { FilteringProvider, useFiltering } from "../hooks/useFiltering";

const getRowId = (row: LapData) => row.lapId;

const CUSTOM_HEADER: Partial<GridColDef<LapData>> = {
    renderHeader: (params) => <TableHeaderFilter params={params} />,
    headerAlign: "left",
};

interface Props {
    onLapSelect: (lapId: string) => void;
    defaultSortBy?: "time" | "date";
    strictFilterItems?: Array<GridFilterItem>;
}

const LapTableDataGrid = ({
    onLapSelect,
    defaultSortBy = "date",
    strictFilterItems,
}: Props) => {
    const { palette } = useTheme();

    const [pagination, setPagination] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });
    const handlePaginationChange = (paginationModel: GridPaginationModel) =>
        setPagination((prevPagination) =>
            paginationModel.pageSize === prevPagination.pageSize
                ? paginationModel
                : { ...paginationModel, page: 0 },
        );

    const defaultSortModel: GridSortModel =
        defaultSortBy === "date"
            ? [{ field: "lapTimestamp", sort: "desc" }]
            : [
                  {
                      field: "lapTime",
                      sort: "asc",
                  },
              ];
    const [sorting, setSorting] = useState<GridSortModel>(defaultSortModel);
    const handleSortingChange = (newSortModel: GridSortModel) =>
        setSorting(newSortModel.length > 0 ? newSortModel : defaultSortModel);

    const { filterItems } = useFiltering();

    const filtering: GridFilterModel = useMemo(
        () => ({
            logicOperator: GridLogicOperator.And,
            items: [...filterItems, ...(strictFilterItems ?? [])],
        }),
        [filterItems, strictFilterItems],
    );

    const [lapTableData, rowCount, isLoadingLapTableData] = useLapTableData({
        pagination,
        sorting,
        filtering,
    });

    const handleLapSelect: GridEventListener<"rowClick"> = useCallback(
        ({ row }) => onLapSelect(row.lapId),
        [onLapSelect],
    );

    const columns: GridColDef<LapData>[] = useMemo(
        () => [
            {
                field: "lapTime",
                headerName: "Time",
                sortable: true,
                sortingOrder: ["asc", null],
                valueFormatter: formatDuration,
                minWidth: 150,
            },
            {
                field: "trackName",
                headerName: "Track",
                sortable: false,
                valueGetter: (_, row) => row.sessionData.track,
                minWidth: 200,
                ...CUSTOM_HEADER,
            },
            {
                field: "carName",
                headerName: "Car",
                sortable: false,
                valueGetter: (_, row) => row?.sessionData.car,
                minWidth: 250,
                ...CUSTOM_HEADER,
            },
            {
                field: "driverName",
                headerName: "Driver",
                sortable: false,
                valueGetter: (_, row: LapData) => row?.sessionData.driver,
                minWidth: 200,
                ...CUSTOM_HEADER,
            },
            {
                field: "lapTimestamp",
                headerName: "Date",
                valueFormatter: (value: Timestamp) => {
                    return value.toDate().toLocaleString("en-fr", {
                        dateStyle: "short",
                    });
                },
                minWidth: 160,
                sortingOrder: ["desc", null],
            },
            {
                field: "expiresAt",
                headerName: "Expires",
                minWidth: 110,
                width: 110,
                type: "boolean",
                sortable: false,
                valueGetter: (value) => !!value,
                renderCell: ({ value }) =>
                    value && (
                        <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            height="stretch"
                        >
                            <TbClockX color={palette.warning.main} />
                        </Box>
                    ),
                ...CUSTOM_HEADER,
            },
        ],
        [palette],
    );

    return (
        <DataGrid
            rows={lapTableData}
            columns={columns}
            getRowId={getRowId}
            loading={isLoadingLapTableData}
            rowCount={rowCount ?? -1}
            onRowClick={handleLapSelect}
            paginationMode="server"
            paginationModel={pagination}
            pageSizeOptions={[5, 10, 25]}
            onPaginationModelChange={handlePaginationChange}
            sortingMode="server"
            sortModel={sorting}
            onSortModelChange={handleSortingChange}
            disableColumnMenu
            disableColumnFilter
        />
    );
};

const LapTable = (props: Props) => (
    <FilteringProvider>
        <LapTableDataGrid {...props} />
    </FilteringProvider>
);

export { LapTable };
