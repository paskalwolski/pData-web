import { useState } from "react";
import LapCard from "./LapCard.component";
import { millisToRaceDuration } from "../utils";

const LapSelector = ({ eventData, selectLap, selectedLap }) => {
    const [selectedLapNumber, setSelectedLapNumber] = useState(null);
    const sanitizeLap = (lap) => {
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
            return i;
        }
        // selectedLap or fastest lap? Show time
        // no selectedLap? show time
        // otherwsise, show delta
        if (selectedLap) {
            if (i === selectedLap.lap_number || i === eventData.fastestLap) {
                const displayTime = millisToRaceDuration(time);
                return displayTime;
            } else {
                const comparisonTime = selectedLap.lap_time;
                const delta = (comparisonTime - time) / 1000;
                if (delta < 0) {
                    return `${delta.toFixed(3)}`;
                } else {
                    return `+${delta.toFixed(3)}`;
                }
            }
        } else {
            const displayTime = millisToRaceDuration(time);
            return displayTime;
        }
    };

    return (
        <div style={{ display: "flex" }}>
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
                                : getTimeDelta(lap?.lap_time, i),
                        }}
                        onClick={() => {
                            setSelectedLapNumber(lap.lap_number);
                            selectLap(sanitizeLap(lap));
                        }}
                    />
                );
            })}
        </div>
    );
};
export default LapSelector;
