import { useState } from "react";

const LapCard = ({ lapData, isFastestLap, ...props }) => {
    const getLapClass = (lap) => {
        let classname = "card";
        if (isFastestLap) {
            classname += " fastest";
        }
        if (lap.discard) {
            classname += " discard";
        }
        if (lap.invalid) {
            classname += " invalid";
        } else if (lap.pit_lap) {
            classname += " pit";
        } else {
            // Last option valid
            classname += " valid";
        }
        return classname;
    };

    return (
        <div
            className={getLapClass(lapData)}
            onClick={lapData.discard ? null : props?.onClick}
        >
            {lapData.lap_number + 1}
        </div>
    );
};

export default LapCard;
