const pedalFormatter = (v: number) => (v*100).toFixed(0)

const speedFormatter = (v: number) => `${v.toFixed(0)}km/h`

const steerFormatter = (v: number) => `${Math.abs(v).toFixed(0)}° ${v === 0 ? '' : v < 0 ? 'R' : 'L'}`

const ersFormatter = (v: number) => `${(v/1000).toFixed(2)}MJ`

const rpmFormatter = (v: number) => `${v.toFixed(0)}RPM`

const gearFormatter = (v: number) => {
    if (v === 0) return "R"
    if (v === 1) return "N"
    return v - 1
}

export {pedalFormatter, speedFormatter, steerFormatter, ersFormatter, rpmFormatter, gearFormatter}