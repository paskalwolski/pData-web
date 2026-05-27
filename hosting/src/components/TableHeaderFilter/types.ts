export interface AutocompleteOption {
    id: string;
    label?: string;
}

export type AutocompleteCollection = "drivers" | "tracks" | "cars";

export const FieldNameCollectionMapping: Record<string, AutocompleteCollection> = {
    driverName: "drivers",
    carName: "cars",
    trackName: "tracks",
};