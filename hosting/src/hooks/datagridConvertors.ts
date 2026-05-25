import { GridSortModel } from "@mui/x-data-grid";
import { orderBy } from "firebase/firestore";

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

const lapSortConvertor = createSortConvertor(lapFieldMapping);

export {createSortConvertor, lapSortConvertor}