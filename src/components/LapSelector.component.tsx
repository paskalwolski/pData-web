import { useState } from "react";
import LapCard from "./LapCard.component";

const LapSelector = ({ eventData, selectLap }) => {
    const [selectedLap, setSelectedLap] = useState(null);
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
                        }}
                        onClick={() => {
                            setSelectedLap(lap.lap_number);
                            selectLap(sanitizeLap(lap));
                        }}
                    />
                );
            })}
        </div>
    );
};
export default LapSelector;
