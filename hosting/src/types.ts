import { Timestamp } from "firebase/firestore";

export type SessionType = "RACE" | "PRACTICE" | "QUALIFY" | "HOTLAP";

export interface LapSessionData {
    driver: string;
    car: string;
    track: string;
    sessionTime: string;
    sessionType: SessionType;
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
    sessionData: LapSessionData;
}

export interface LapInfo {
    id?: string;
    isPit: boolean;
    isValid: boolean;
    lapNumber: number;
    lapTime: number;
    dropped?: boolean;
}

export type AggregateStatus =
    | "not_ready"
    | "ready"
    | "unavailable"
    | "pending"
    | "processing"
    | "completed"
    | "failed";

export interface SessionData {
    sessionId: string;
    driver: string;
    car: string;
    track: string;
    sessionTime: string;
    sessionType: SessionType;
    expiresAt: Timestamp | null;
    validLaps: number;
    bestLapTime: number;
    lapData: LapInfo[];
    aggregateStatus?: AggregateStatus;
}

export type TelemetryDataSet = Array<number | undefined>;

export interface AggregateChannelDoc {
    min: TelemetryDataSet;
    max: TelemetryDataSet;
    mean: TelemetryDataSet;
}

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

/** What a marker set marks; marker visibility selects sets by marker type. */
export type TrackMarkerType = "apex" | "fullThrottle";

export interface TrackMarkerConfig {
    /** Line colour (CSS colour value). */
    color: string;
    /** Secondary render flag */
    secondary?: boolean;
    /** Multiplies the marker's base length and width; defaults to 1. */
    scale?: number;
}

/** A named series of track markers: how they look (`style`) and where they are (`data`). */
export interface TrackMarkerSet {
    markerType: TrackMarkerType;
    config: TrackMarkerConfig;
    /** Telemetry indices (≈ metres along the lap). */
    data: number[];
}

/** One toggle per marker type, plus whether the comparison lap's markers are drawn at all. */
export type TrackMarkerVisibility = Record<TrackMarkerType, boolean> & {
    secondary: boolean;
};

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
    frontSlip?: TelemetryDataSet;
    rearSlip?: TelemetryDataSet;
}

export interface TrackData {
    id: string;
    trackData?: TrackInfo;
    mapData?: MapData;
    sectionData?: SectionData[];
}

export interface TrackInfo {
    trackName: string;
    trackLength: number;
}

interface MapData {
    height: number;
    width: number;
    xOffset: number;
    yOffset: number;
    url: string;
    margin: number;
}

interface SectionData {
    name: string;
    start: number;
    end: number;
}

export const ENTITIES = ["drivers", "cars", "tracks"] as const;
export type Entity = (typeof ENTITIES)[number];
export type EntityMetadata = {
    nameMap: Record<string, string>;
};

export interface Apex {
    /** Index into telemetry arrays (≈ metres along the lap) */
    meter: number;
    /** Smoothed (and optionally normalised) |steer| at the apex */
    peak: number;
    startMeter: number;
    endMeter: number;
}
