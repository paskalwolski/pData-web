
export type SessionType = "RACE" | "PRACTICE" | "QUALIFYING" | "HOTLAP"

export interface SessionPayload {
    eventTime: string
    driver: string
    sessionTime: string
    track: string
    car: string
    sessionType: SessionType
    keepAllLaps: boolean
}

export interface FastestLapRef {
    lapId: string
    lapTime: string
}

export interface LapPayload {
    sessionId?: string
    lapNumber: number
    lapTime: string
    lapData: Lap
    isValid: boolean
    isPit: boolean
}

export interface SessionReturn {
    sessionId: string
    lapId: string
}

export interface Lap {
    lapTime: string

}
