import { SessionType } from "../types";

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
    RACE: "Race",
    PRACTICE: "Practice",
    QUALIFY: "Qualifying",
    HOTLAP: "Hotlap",
};

export const getSessionTypeLabel = (sessionType: SessionType) =>
    SESSION_TYPE_LABELS[sessionType];
