import { millisToRaceDuration } from "../utils";

const LapCard = ({
    lapData,
    isFastestLap,
    isSelected,
    timeDisplay,
    ...props
}) => {
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
            className={`${getLapClass(lapData)} ${isSelected && "selected"}`}
            onClick={lapData.discard ? null : props?.onClick}
            style={{ flexDirection: "column" }}
        >
            <div>{millisToRaceDuration(lapData.lap_time)}</div>
            <div>{timeDisplay}</div>
        </div>
    );
};

export default LapCard;
