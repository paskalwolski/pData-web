import { GridFilterModel, GridSortModel } from "@mui/x-data-grid";
import { orderBy, where } from "firebase/firestore";

const createSortConvertor = (fieldMapping: Record<string, string>) => (sorting: GridSortModel ) => sorting.map(sortItem => orderBy(fieldMapping[sortItem.field], sortItem.sort))

// TODO: Link this more strongly to the colDef or models
const lapFieldMapping = {
    lapTime: "lapTime",
    trackName: "sessionData.track",
    carName: "sessionData.car",
    driverName: "sessionData.driver",
    lapTimestamp: "lapTimestamp",
    expiresAt: "expiresAt",
};
const filterOperatorMapping = {
    'isAnyOf': 'in',
    '=': '=='
}

const lapSortConvertor = createSortConvertor(lapFieldMapping);

const createFilterConvertor = (fieldMapping: Record<string, string>) => (filtering: GridFilterModel) => filtering.items.map(f => (where(fieldMapping[f.field], filterOperatorMapping[f.operator], Array.isArray(f.value) ? f.value.map(v => v.id) : f.value)))

const lapFilterConvertor = createFilterConvertor(lapFieldMapping);

export {createSortConvertor, lapSortConvertor, lapFilterConvertor}