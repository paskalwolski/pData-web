const pedalFormatter = (v: number) => (v*100).toFixed(0)

const speedFormatter = (v: number) => `${v.toFixed(0)}km/h`

const steerFormatter = (v: number) => `${v.toFixed(0)}°`

const ersFormatter = (v: number) => `${(v/1000).toFixed(2)}MJ`

const rpmFormatter = (v: number) => `${v.toFixed(0)}RPM`

export {pedalFormatter, speedFormatter, steerFormatter, ersFormatter, rpmFormatter}