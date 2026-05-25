import {
    DataGrid,
    GridColDef,
    GridEventListener,
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

const getRowId = (row: LapData) => row.lapId;

interface Props {
    onLapSelect: (lapId: string) => void;
    defaultSortBy?: "time" | "date";
}

const LapTable = ({ onLapSelect, defaultSortBy = "date" }: Props) => {
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

    const [lapTableData, rowCount, isLoadingLapTableData] = useLapTableData({
        pagination,
        sorting,
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
            },
            {
                field: "trackName",
                headerName: "Track",
                sortable: false,
                valueGetter: (_, row) => row.sessionData.track,
                width: 250,
            },
            {
                field: "carName",
                headerName: "Car",
                sortable: false,
                valueGetter: (_, row) => row?.sessionData.car,
                width: 250,
            },
            {
                field: "driverName",
                headerName: "Driver",
                sortable: false,
                valueGetter: (_, row: LapData) => row?.sessionData.driver,
                width: 200,
            },
            {
                field: "lapTimestamp",
                headerName: "Date",
                valueFormatter: (value: Timestamp) => {
                    return value.toDate().toLocaleString("en-fr", {
                        dateStyle: "short",
                    });
                },
                width: 160,
                sortingOrder: ["desc", null],
            },
            {
                field: "expiresAt",
                headerName: "Expires",
                width: 80,
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
        />
    );
};

export { LapTable };
