import {
    DataGrid,
    GridColDef,
    GridEventListener,
    GridFilterItem,
    GridFilterModel,
    GridLogicOperator,
    GridPaginationModel,
    GridSortModel,
} from "@mui/x-data-grid";
import { Timestamp } from "firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Tooltip } from "@mui/material";
import { useSessionTableData } from "../hooks/useSessions";
import type { SessionData } from "../types";
import { formatDuration } from "../helpers/formatDuration";
import { TableHeaderFilter } from "./TableHeaderFilter";
import {
    FilteringProvider,
    useFiltering,
} from "../hooks/FilterContext/useFiltering";
import { useMetaName } from "../hooks/CTDContext/useCollectionMeta";
import { ExpiresIcon } from "./ExpiresIcon.component";

// NOTE: This component mirrors `LapTable.component.tsx` - the pagination,
// sorting and filtering state handling is identical and only the columns and
// data hook differ. It can be abstracted into a generic `EntityTable` that
// takes columns, a data hook, a row id getter and default sort models.

const getRowId = (row: SessionData) => row.sessionId;

const EMPTY_ARRAY = [] as const;

const CUSTOM_HEADER: Partial<GridColDef<SessionData>> = {
    renderHeader: (params) => <TableHeaderFilter params={params} />,
    headerAlign: "left",
};

interface Props {
    onSessionSelect: (sessionId: string) => void;
    defaultSortBy?: "time" | "date";
    strictFilterItems?: Array<GridFilterItem>;
}

const SessionTableDataGrid = ({
    onSessionSelect,
    defaultSortBy = "date",
    strictFilterItems,
}: Props) => {
    const { getTrackName, getCarName, getDriverName } = useMetaName();

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
            ? [{ field: "sessionTime", sort: "desc" }]
            : [{ field: "bestLapTime", sort: "asc" }];
    const [sorting, setSorting] = useState<GridSortModel>(defaultSortModel);
    const handleSortingChange = (newSortModel: GridSortModel) =>
        setSorting(newSortModel.length > 0 ? newSortModel : defaultSortModel);

    const { filterItems, upsertFilterItem, setStrictFilterIds } =
        useFiltering();

    useEffect(() => {
        setStrictFilterIds(
            (strictFilterItems ?? EMPTY_ARRAY).map((i) => {
                // Ensure we register this filter with the filterItems
                upsertFilterItem(i);
                return i.id;
            }),
        );
    }, [setStrictFilterIds, strictFilterItems, upsertFilterItem]);

    const filtering: GridFilterModel = useMemo(
        () => ({
            logicOperator: GridLogicOperator.And,
            items: [...filterItems],
        }),
        [filterItems],
    );

    const [sessionTableData, rowCount, isLoadingSessionTableData] =
        useSessionTableData({ pagination, sorting, filtering });

    const handleSessionSelect: GridEventListener<"rowClick"> = useCallback(
        ({ row }) => onSessionSelect(row.sessionId),
        [onSessionSelect],
    );

    const columns: GridColDef<SessionData>[] = useMemo(
        () => [
            {
                field: "bestLapTime",
                headerName: "Fastest Lap",
                sortable: true,
                sortingOrder: ["asc", null],
                valueFormatter: (value) => formatDuration(value),
                minWidth: 150,
            },
            {
                field: "trackName",
                headerName: "Track",
                sortable: false,
                valueGetter: (_, row) => getTrackName(row?.track),
                minWidth: 200,
                ...CUSTOM_HEADER,
            },
            {
                field: "carName",
                headerName: "Car",
                sortable: false,
                valueGetter: (_, row) => getCarName(row?.car),
                minWidth: 250,
                ...CUSTOM_HEADER,
            },
            {
                field: "driverName",
                headerName: "Driver",
                sortable: false,
                valueGetter: (_, row) => getDriverName(row?.driver),
                minWidth: 200,
                ...CUSTOM_HEADER,
            },
            {
                field: "sessionTime",
                headerName: "Date",
                // sessionTime is an ISO date string rather than a Timestamp
                valueFormatter: (value: string) =>
                    new Date(value).toLocaleString("en-fr", {
                        dateStyle: "short",
                    }),
                minWidth: 160,
                sortingOrder: ["desc", null],
                renderCell: ({ value, formattedValue }) => (
                    <Tooltip
                        title={new Date(value).toLocaleString("en-fr", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    >
                        <span>{formattedValue}</span>
                    </Tooltip>
                ),
            },
            {
                field: "expiresAt",
                headerName: "Expires",
                description:
                    "Sessions will auto-expire unless they are saved. Saved sessions will not expire.",
                minWidth: 110,
                width: 110,
                type: "boolean",
                sortable: false,
                valueGetter: (value) => !!value,
                renderCell: ({ row, value }) =>
                    value && (
                        <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                            height="stretch"
                        >
                            <ExpiresIcon
                                expiresAt={row.expiresAt as Timestamp}
                            />
                        </Box>
                    ),
                ...CUSTOM_HEADER,
            },
        ],
        [getCarName, getDriverName, getTrackName],
    );

    return (
        <DataGrid
            rows={sessionTableData}
            columns={columns}
            getRowId={getRowId}
            loading={isLoadingSessionTableData}
            rowCount={rowCount ?? -1}
            onRowClick={handleSessionSelect}
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

const SessionTable = (props: Props) => (
    <FilteringProvider>
        <SessionTableDataGrid {...props} />
    </FilteringProvider>
);

export { SessionTable };
