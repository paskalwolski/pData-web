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
import { useCallback, useState } from "react";
import { navigate } from "wouter/use-browser-location";

const getRowId = (row: LapData) => row.lapId;
const columns: GridColDef<LapData>[] = [
    { field: "lapTime", headerName: "Time", valueFormatter: formatDuration },
    {
        field: "trackName",
        headerName: "Track",
        valueGetter: (_, row) => row.sessionData.track,
        width: 250,
    },
    {
        field: "carName",
        headerName: "Car",
        valueGetter: (_, row) => row?.sessionData.car,
        width: 250,
    },
    {
        field: "driverName",
        headerName: "Driver",
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
    },
];

interface Props {
    onLapSelect?: (lapId: string) => undefined;
}

const LapTable = ({ onLapSelect }: Props) => {
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
    const [lapTableData, rowCount, isLoadingLapTableData] = useLapTableData({
        pagination,
    });

    const navigateToLap = (lapId: string) => {
        navigate(`/laps/${lapId}`);
    };

    const handleLapSelect: GridEventListener<"rowClick"> = useCallback(
        ({ row }) =>
            onLapSelect ? onLapSelect(row.lapId) : navigateToLap(row.lapId),
        [onLapSelect],
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
        />
    );
};

export { LapTable };
