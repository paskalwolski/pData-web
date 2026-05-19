import { DataGrid, GridColDef, GridEventListener } from "@mui/x-data-grid";
import { useLatestLaps } from "../hooks/useLaps";
import type { LapData } from "../types";
import { formatDuration } from "../helpers/formatDuration";
import { Timestamp } from "firebase/firestore";
import { useCallback } from "react";
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
            return value.toDate().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            });
        },
        width: 160,
    },
];

interface Props {
    onLapSelect?: (lapId: string) => undefined;
}

const LapTable = ({ onLapSelect }: Props) => {
    const [lapData, isLoadingLapData] = useLatestLaps();

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
            rows={lapData}
            columns={columns}
            getRowId={getRowId}
            loading={isLoadingLapData}
            onRowClick={handleLapSelect}
        />
    );
};

export { LapTable };
