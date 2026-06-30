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

export interface LapPayload {
  sessionId?: string;
  lapNumber: number;
  lapTime: string;
  isValid: boolean;
  isPit: boolean;
  lapData: TelemetryData;
  sessionData: SessionData;
}
export type TelemetryDataSet = Array<number | undefined>;

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

interface SessionLapDetail {
  id: string;
  isPit: boolean;
  isValid: boolean;
  lapTime?: string;
}

export interface CloseSessionPayload {
  sessionId: string;
  lapData: SessionLapDetail[];
  bestTime: string;
  trackSession: boolean;
}

export interface SaveSessionPayload {
  id: string;
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
