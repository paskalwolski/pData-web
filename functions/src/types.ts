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

export interface CloseSessionPayload {
  sessionId: string;
  lapCount: number;
}
