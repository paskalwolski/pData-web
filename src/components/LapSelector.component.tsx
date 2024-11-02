import { useState } from "react";
import LapCard from "./LapCard.component";
import { millisToRaceDuration } from "../utils";

const LapSelector = ({ eventData, selectLap, selectedLap, isComparison }) => {
    const sanitizeLap = (lap) => {
        if (!lap.lap_data[0]) {
            // First data entry is empty - try find the next valid one
            let lapTracker = 1;
            while (lap.lap_data[lapTracker]) {
                lapTracker++;
            }
            // Found a non-Null entry! Use it
            lap.lap_data[0] = lap.lap_data[lapTracker];
        }
        lap.lap_data.reduce((oLap, nLap, i) => {
            if (!nLap) {
                lap.lap_data[i] = oLap;
                return oLap;
            }
            return nLap;
        });
        return lap;
    };

    const getTimeDelta = (time, i) => {
        if (!time) {
            // Show only the lap number
            return i;
        }
        if (selectedLap) {
            if (i == selectedLap.lap_number) {
                // Don't show a zero delta
                return null;
            }
            const delta = (time - selectedLap.lap_time) / 1000;
            return delta > 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3);
        }
        // No selected lap - don't show the gap
        return null;
    };

    return (
        <div
            style={{
                display: "flex",
            }}
        >
            {eventData.laps.map((lap, i) => {
                return (
                    <LapCard
                        key={i}
                        {...{
                            lapData: lap,
                            isFastestLap:
                                lap?.lap_number === eventData.fastestLap,
                            isSelected: lap.lap_number == selectedLap,
                            timeDisplay: lap.discard
                                ? null
                                : getTimeDelta(lap?.lap_time, lap?.lap_number),
                        }}
                        onClick={() => {
                            selectLap(sanitizeLap(lap));
                        }}
                    />
                );
            })}
        </div>
    );
};
export default LapSelector;
