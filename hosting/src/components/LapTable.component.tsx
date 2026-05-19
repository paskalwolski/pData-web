import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useLatestLaps } from "../hooks/useLaps";
import type { LapData } from "../types";
import { formatDuration } from "../helpers/formatDuration";
import { Timestamp } from "firebase/firestore";

const getRowId = (row: LapData) => row.lapId;
const columns: GridColDef<LapData>[] = [
    { field: "lapId", headerName: "Lap ID" },
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
            return value.toDate().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
        },
        width: 160,
    },
];

const LapTable = () => {
    const [lapData, isLoadingLapData] = useLatestLaps();

    return (
        <DataGrid
            rows={lapData}
            columns={columns}
            getRowId={getRowId}
            loading={isLoadingLapData}
        />
    );
};

export { LapTable };
