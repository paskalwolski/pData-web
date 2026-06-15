import { TelemetryData, TelemetryDataSet } from "../../types";

interface Event {
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
    const positionData = calculatePositionData(lapTelemetry);

    const brakeEvents = calculateEventSegments(
        lapTelemetry.brake,
        (i, lapTelemetry) => lapTelemetry[i] > 0.05,
        positionData,
    );
};

const calculateEventSegments = (
    lapTelemetry: TelemetryDataSet,
    thresholdFunction: (i: number, telemetry: TelemetryDataSet) => boolean,
    positionData: PositionValue[],
): Event[] => {
    /** 
    @param lapTelemetry: 
    @param thresholdFunction: Callback which resolves the event status. This should return True when an event should start, and False when an event should end
    **/
    const events: Event[] = [];

    let dStart = 0;
    let dEnd = 0;
    let dPeak = 0;
    let peak = 0;
    let values = [];

    let isActiveEvent = false;

    // TODO: Encapsulate for a specific Event type
    lapTelemetry.forEach((v, i) => {
        if (v === undefined || v === null) {
            return;
        }
        if (isActiveEvent) {
            // Check below threshold
            if (!thresholdFunction(i, lapTelemetry)) {
                // End the active brake event
                dEnd = i;
                isActiveEvent = false;
                const pValues = positionData.slice(dStart, dEnd);

                events.push({
                    dStart,
                    dEnd,
                    dPeak,
                    peak,
                    values,
                    pValues,
                });
                values = [];
            } else {
                values.push(v);

                if (v > peak) {
                    peak = v;
                    dPeak = i;
                }
            }
        } else {
            // Check above threshold
            if (thresholdFunction(i, lapTelemetry)) {
                isActiveEvent = true;
                dStart = i;
                values.push(v);
            }
        }
    });
    if (isActiveEvent) {
        // Close the activeBraking event
        dEnd = lapTelemetry.length;
        const pValues = positionData.slice(dStart, dEnd);
        events.push({ dStart, dEnd, dPeak, peak, values, pValues });
    }

    return events;
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
