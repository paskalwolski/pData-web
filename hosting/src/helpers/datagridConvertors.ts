import { GridFilterModel, GridSortModel } from "@mui/x-data-grid";
import { documentId, orderBy, where } from "firebase/firestore";

const createSortConvertor =
    (fieldMapping: Record<string, string>) => (sorting: GridSortModel) =>
        sorting.map((sortItem) =>
            orderBy(fieldMapping[sortItem.field], sortItem.sort),
        );

// TODO: Link this more strongly to the colDef or models
const lapFieldMapping = {
    lapTime: "lapTime",
    trackName: "sessionData.track",
    carName: "sessionData.car",
    driverName: "sessionData.driver",
    lapTimestamp: "lapTimestamp",
    expiresAt: "expiresAt",
};
// Sessions store driver/car/track at the top level of the document (laps nest
// them under `sessionData`).
const sessionFieldMapping = {
    bestLapTime: "bestLapTime",
    trackName: "track",
    carName: "car",
    driverName: "driver",
    sessionTime: "sessionTime",
    expiresAt: "expiresAt",
    // sessionType: "sessionType",
};
const filterOperatorMapping = {
    isAnyOf: "in",
    "=": "==",
    "!=": "!=",
};

const DOCUMENT_REF = "this_document_reference";

const lapSortConvertor = createSortConvertor(lapFieldMapping);

const createFilterConvertor = (fieldMapping: Record<string, string>) => {
    const effectiveFieldMapping = {
        ...fieldMapping,
        [DOCUMENT_REF]: documentId(),
    };
    return (filtering: GridFilterModel) =>
        filtering.items.map((f) =>
            where(
                effectiveFieldMapping?.[f.field] ?? f.field,
                filterOperatorMapping[f.operator],
                Array.isArray(f.value) ? f.value.map((v) => v.id) : f.value,
            ),
        );
};

const lapFilterConvertor = createFilterConvertor(lapFieldMapping);

const sessionSortConvertor = createSortConvertor(sessionFieldMapping);
const sessionFilterConvertor = createFilterConvertor(sessionFieldMapping);

export {
    DOCUMENT_REF,
    createSortConvertor,
    lapSortConvertor,
    lapFilterConvertor,
    sessionSortConvertor,
    sessionFilterConvertor,
};
