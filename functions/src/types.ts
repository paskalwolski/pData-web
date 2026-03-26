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
  lapData: Array<object>;
  sessionData: SessionData;
}

export interface TelemetryData {
  brake?: Array<number | undefined>;
  gas?: Array<number | undefined>;
  gear?: Array<number | undefined>;
  lapTime?: Array<number | undefined>;
  rpm?: Array<number | undefined>;
  speed?: Array<number | undefined>;
  steer?: Array<number | undefined>;
  ers?: Array<number | undefined>;
  posX?: Array<number | undefined>;
  posY?: Array<number | undefined>;
  posZ?: Array<number | undefined>;
}

export interface SessionReturn {
  sessionId: string;
  lapId: string;
}
