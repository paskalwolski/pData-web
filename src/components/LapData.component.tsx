const LapData = ({selectedLap, ...props}) => {
    return (
        <div className="card" id={props?.id}>
            {selectedLap ? 
            <div>Lap Number {selectedLap.lap_number}</div>
            :
            <>Select a Lap to Get Started</>}
        </div>
    )
}

export default LapData;