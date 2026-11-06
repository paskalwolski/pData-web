export type SessionType = 'RACE' | 'PRACTICE' | 'QUALIFYING' | 'HOTLAP';

export interface FastestLapRef {
  lapId: string;
  lapTime: string;
}

export interface SessionData {
  driver: string;
  car: string;
  track: string;
  sessionTime: string;
  sessionType: SessionType;
  trackSession: boolean;
}

export interface SessionDetail extends SessionData {
  lapData: SessionLapDetail[];
  bestLapTime: number;
  aggregateStatus?: AggregateStatus;
  validLaps?: number;
}

export type AggregateStatus =
  | 'not_ready'
  | 'ready'
  // Laps were auto-cleaned before aggregation; aggregate is blocked
  | 'unavailable'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';
export type TelemetryIndicator = 'min' | 'max' | 'mean';
export type TelemetryChannel = keyof TelemetryData;

export interface TelemetryChannelDoc {
  data: TelemetryDataSet;
}

export interface AggregateChannelDoc {
  min: TelemetryDataSet;
  max: TelemetryDataSet;
  mean: TelemetryDataSet;
}

export interface AggregateSessionPayload {
  sessionId: string;
}

export interface LapPayload {
  sessionId?: string;
  lapNumber: number;
  lapTime: string;
  isValid: boolean;
  isPit: boolean;
  lapData: TelemetryData;
  sessionData: SessionData;
}
export type TelemetryDataSet = Array<number | null>;

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

export interface SessionReturn {
  sessionId: string;
  lapId: string;
}

export interface SessionLapDetail {
  id?: string;
  isPit: boolean;
  isValid: boolean;
  lapNumber: number;
  lapTime?: string;
  dropped?: boolean;
}

export interface CloseSessionPayload {
  sessionId: string;
}

export interface SaveSessionPayload {
  id: string;
  keepAllLaps?: boolean;
}

interface SectionData {
  name: string;
  start: number;
  end: number;
}

export interface TrackPayloadData {
  trackData: TrackData;
  sectionData: Array<SectionData>;
  mapData: MapData;
}

interface MapData {
  height: number;
  width: number;
  margin: number;
  xOffset: number;
  yOffset: number;
  image: string;
}

interface TrackData {
  trackLength: number;
  trackName: string;
}
export interface TrackPayload {
  trackId: string;
  trackData: TrackPayloadData;
}
