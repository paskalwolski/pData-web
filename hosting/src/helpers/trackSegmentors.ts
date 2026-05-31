import { TelemetryData, TrackPositionData, TrackSegment, TrackSegmentType } from "../types";

const BLIP_THRESHOLD = 5;

const getTrackPedalSegmentType = (
    gas: number | undefined,
    brake: number | undefined,
): TrackSegmentType | undefined => {
    if (gas === undefined && brake === undefined) return undefined;
    const b = brake ?? 0;
    const g = gas ?? 0;
    if (b > 0) return "negative";
    if (g > 0) return "positive";
    return "neutral";
};



export const prepareTrackPedalSegments = (telemetryData: TelemetryData): TrackSegment[] => {
    const rawSegments: TrackSegment[] = [];
    let currentSegmentPositionData: TrackPositionData[] = [];
    let currentSegmentType: TrackSegmentType | undefined = undefined;
    let indexStart = 0;

    telemetryData.posX.forEach((_, i) => {
        const calculatedSegmentType = getTrackPedalSegmentType(
            telemetryData.gas[i],
            telemetryData.brake[i],
        );
        const trackPositionData: TrackPositionData = {
            x: telemetryData.posX[i],
            z: telemetryData.posZ[i],
        };

        if (currentSegmentType === undefined) {
            currentSegmentType = calculatedSegmentType;
        }

        // Undefined means no pedal data for this point — absorb into current segment
        const effectiveType = calculatedSegmentType ?? currentSegmentType;

        const isLastPoint = i === telemetryData.posX.length - 1;
        const isTypeChange = effectiveType !== currentSegmentType;

        if (isTypeChange || isLastPoint) {
            currentSegmentPositionData.push(trackPositionData);
            if (currentSegmentType !== undefined) {
                rawSegments.push({
                    data: currentSegmentPositionData,
                    type: currentSegmentType,
                    indexStart,
                    indexEnd: i,
                });
            }
            if (!isLastPoint) {
                currentSegmentPositionData = [trackPositionData];
                indexStart = i;
                currentSegmentType = effectiveType;
            }
        } else {
            currentSegmentPositionData.push(trackPositionData);
        }
    });

    // Merge blip segments into their predecessor so brief coasts/double-pedal
    // don't create visual noise
    const merged: TrackSegment[] = [];
    for (const seg of rawSegments) {
        if (
            seg.indexEnd - seg.indexStart < BLIP_THRESHOLD &&
            merged.length > 0
        ) {
            const prev = merged[merged.length - 1];
            prev.data = [...prev.data, ...seg.data.slice(1)];
            prev.indexEnd = seg.indexEnd;
        } else {
            merged.push({ ...seg, data: [...seg.data] });
        }
    }

    return merged;
};