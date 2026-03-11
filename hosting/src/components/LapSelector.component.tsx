import LapCard from "./LapCard.component";

const LapSelector = ({ sessionData, selectLap, selectedLap, isComparison }) => {
    const sanitizeLap = (lap) => {
        if (!lap.lap_data[0]) {
            // First data entry is empty - try find the next valid one
            let lapTracker = 1;
            while (!lap?.lap_data[lapTracker]) {
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

    const getTimeDelta = (time, id) => {
        if (selectedLap) {
            if (id == selectedLap.lapId) {
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
            {sessionData.laps.map((lap, i) => {
                return (
                    <LapCard
                        key={lap.lapId}
                        {...{
                            lapData: lap,
                            isFastestLap:
                                lap?.lap_number === sessionData.fastestLap, //TODO: Change the fastest lap storage
                            isSelected: lap.lapId== selectedLap?.lapId,
                            timeDisplay: lap.discard
                                ? null
                                : getTimeDelta(lap?.lap_time, lap?.lapId),
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
