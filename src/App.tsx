import { useState, useEffect } from 'react'
import './App.css'



import { exampleData } from './assets/data'
import LapCard from './components/LapCard.component';

function App() {
  const eventData = exampleData;
  const [selectedLap, setSelectedLap] = useState(null);

  useEffect(() => {
    if (selectedLap){
      console.log(`Selected Lap ${selectedLap.lap_number}`)
    }
  }, [selectedLap])

  return (
    <>
      <h1>{eventData.car} on {eventData.track} - {eventData.eventTime}</h1>
      <div>
        {eventData.laps.map((lap, i) => {
          return <LapCard key={i} {...{ lapData: lap, isFastestLap: lap.lap_number === eventData.fastestLap }} onClick={() => {setSelectedLap(lap)}}/>
        })}
      </div>
    </>
  )
}

export default App
