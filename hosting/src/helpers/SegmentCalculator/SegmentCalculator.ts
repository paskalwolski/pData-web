import { TelemetryData } from "../../types";

interface BrakeEvent {
    dStart: number;
    dEnd: number;
    dPeak: number;
    peak: number;
    values: number[];
}

export const calculateLapSegments = (lapTelemetry: TelemetryData) => {
    // Brake Event Calculation
    const BRAKE_THRESHOLD = 0.05;
    const brakeEvents: BrakeEvent[] = [];

    let dStart = 0;
    let dEnd = 0;
    let dPeak = 0;
    let peak = 0;
    let values = [];

    let isActiveBraking = false;

    lapTelemetry.brake.forEach((b, i) => {
        if (b === undefined || b === null) {
            return;
        }
        if (isActiveBraking) {
            // Check below threshold
            if (b < BRAKE_THRESHOLD) {
                // End the active brake event
                dEnd = i;
                isActiveBraking = false;
                brakeEvents.push({ dStart, dEnd, dPeak, peak, values });
                values = [];
            } else {
                values.push(b);
                if (b > peak) {
                    peak = b;
                    dPeak = i;
                }
            }
        } else {
            // Check above threshold
            if (b > BRAKE_THRESHOLD) {
                isActiveBraking = true;
                dStart = i;
                values.push(b);
            }
        }
    });
    if (isActiveBraking) {
        // Close the activeBraking event
        dEnd = lapTelemetry.brake.length;
        brakeEvents.push({ dStart, dEnd, dPeak, peak, values });
    }

    brakeEvents.forEach((b) => console.log(b));
};
