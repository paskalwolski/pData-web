export interface LapData {
    sessionId?: string
    lapNumber: number
    lapTime: string
    isValid: boolean
    isPit: boolean
    lapData: object
    sessionData: SessionData
}

export interface SessionData {
    driver: string
    car: string
    track: string
    sessionTime: string
    sessionType: SessionType
    trackSession: boolean
}

export type SessionType = "RACE" | "PRACTICE" | "QUALIFYING" | "HOTLAP"

