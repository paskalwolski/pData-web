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
  lapData: object;
  sessionData: SessionData;
}

export interface SessionReturn {
  sessionId: string;
  lapId: string;
}
