export type TelemetryValueFormatter = (v: number) => string;

const pedalFormatter: TelemetryValueFormatter = (v) => (v * 100).toFixed(0);

const speedFormatter: TelemetryValueFormatter = (v) => `${v.toFixed(0)}km/h`;

const steerFormatter: TelemetryValueFormatter = (v) =>
    `${Math.abs(v).toFixed(0)}° ${v === 0 ? "" : v < 0 ? "R" : "L"}`;

const ersFormatter: TelemetryValueFormatter = (v) =>
    `${(v / 1000).toFixed(2)}MJ`;

const rpmFormatter: TelemetryValueFormatter = (v) => `${v.toFixed(0)}RPM`;

const slipFormatter: TelemetryValueFormatter = (v) => `${v.toFixed(2)}`;

const gearFormatter = (v: number) => {
    if (v === 0) return "R";
    if (v === 1) return "N";
    return v - 1;
};

const deltaFormatter = (v: number | string) => `∆ ${v}`;

export {
    deltaFormatter,
    pedalFormatter,
    speedFormatter,
    steerFormatter,
    ersFormatter,
    rpmFormatter,
    slipFormatter,
    gearFormatter,
};
