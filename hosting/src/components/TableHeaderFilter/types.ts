import { SESSION_TYPE_LABELS } from "../../helpers/fieldLabelMappers";

export interface AutocompleteOption {
    id: string;
    label?: string;
}

export type AutocompleteCollection = "drivers" | "tracks" | "cars";

export const FieldNameCollectionMapping: Record<
    string,
    AutocompleteCollection
> = {
    driverName: "drivers",
    carName: "cars",
    trackName: "tracks",
};

const sessionTypeOptions: AutocompleteOption[] = Object.entries(
    SESSION_TYPE_LABELS,
).map(([id, label]) => ({ id, label }));

export const StaticFieldOptions: Record<string, AutocompleteOption[]> = {
    sessionType: sessionTypeOptions,
};
