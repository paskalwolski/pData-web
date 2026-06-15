import { TelemetryData } from "../../types";

interface BrakeEvent {
    dStart: number;
    dEnd: number;
    dPeak: number;
    peak: number;
    values: number[];
    pValues: PositionValue[];
}

interface PositionValue {
    posX: number;
    posZ: number;
    heading: number;
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

    const positionData = calculatePositionData(lapTelemetry);

    // TODO: Encapsulate for a specific Event type
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
                const pValues = positionData.slice(dStart, dEnd);

                brakeEvents.push({
                    dStart,
                    dEnd,
                    dPeak,
                    peak,
                    values,
                    pValues,
                });
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
        const pValues = positionData.slice(dStart, dEnd);
        brakeEvents.push({ dStart, dEnd, dPeak, peak, values, pValues });
    }

    brakeEvents.forEach((b) => console.log(b));
};

const calculatePositionData = (
    lapTelemetry: TelemetryData,
): PositionValue[] => {
    const xs = lapTelemetry.posX ?? [];
    const zs = lapTelemetry.posZ ?? [];
    const result: PositionValue[] = [];
    let lastHeading = 0;

    for (let i = 0; i < xs.length; i++) {
        const x0 = (xs[i] ?? 0) as number;
        const z0 = (zs[i] ?? 0) as number;
        const x1 = (xs[i + 1] ?? x0) as number;
        const z1 = (zs[i + 1] ?? z0) as number;
        const dx = x1 - x0;
        const dz = z1 - z0;
        const heading = dx !== 0 || dz !== 0 ? Math.atan2(dx, dz) : lastHeading;
        lastHeading = heading;
        result.push({ posX: x0, posZ: z0, heading });
    }

    return result;
};
