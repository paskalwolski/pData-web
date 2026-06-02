import { Timestamp } from "firebase/firestore";

export type SessionType = "RACE" | "PRACTICE" | "QUALIFYING" | "HOTLAP";

export interface SessionData {
    driver: string;
    car: string;
    track: string;
    sessionTime: string;
    sessionType: SessionType;
    trackSession: boolean;
}

export interface LapData {
    lapId: string;
    sessionId?: string;
    lapNumber: number;
    lapTime: number;
    lapTimestamp: Timestamp;
    isValid: boolean;
    isPit: boolean;
    expiresAt?: Timestamp;
    sessionData: SessionData;
}

export type TelemetryDataSet = Array<number | undefined>;

export interface TrackPositionData {
    x: number | null;
    z: number | null;
}

export interface TrackSegment {
    data: TrackPositionData[];
    type: TrackSegmentType;
    indexStart?: number;
    indexEnd?: number;
}

export type TrackSegmentType = "positive" | "negative" | "neutral";

export type TrackDisplayMode = "pedals" | "delta" | "lines";

export interface TelemetryData {
    brake?: TelemetryDataSet;
    gas?: TelemetryDataSet;
    gear?: TelemetryDataSet;
    lapTime?: TelemetryDataSet;
    rpm?: TelemetryDataSet;
    speed?: TelemetryDataSet;
    steer?: TelemetryDataSet;
    ers?: TelemetryDataSet;
    posX?: TelemetryDataSet;
    posY?: TelemetryDataSet;
    posZ?: TelemetryDataSet;
}

export interface TrackData {
    height: number;
    width: number;
    xOffset: number;
    yOffset: number;
    url: string;
    margin: number;
}
