import { SteeringAngleDisplay } from "../CustomTelemetry/SteeringAngleDisplay";
import { invert, movingAverage, round } from "../../helpers/telemetryMutators";
import {
    ersFormatter,
    gearFormatter,
    pedalFormatter,
    rpmFormatter,
    slipFormatter,
    speedFormatter,
    steerFormatter,
} from "../../helpers/telemetryValueFormatter";
import { TelemetryChannel, TelemetryChannelConfig } from "./types";
import { GearDeltaDisplay } from "../CustomTelemetry/GearDeltaDisplay";

const STEER_MUTATORS = [invert] as const;
const GEAR_MUTATORS = [round] as const;
const SLIP_SMOOTHING_WINDOW_M = 30;
const SLIP_MUTATORS = [movingAverage(SLIP_SMOOTHING_WINDOW_M)] as const;

export const CHANNEL_CONFIG: Partial<
    Record<TelemetryChannel, TelemetryChannelConfig>
> = {
    speed: { title: "Speed", valueFormatter: speedFormatter },
    gas: { title: "Gas", valueFormatter: pedalFormatter },
    brake: { title: "Brake", valueFormatter: pedalFormatter },
    steer: {
        title: "Steering",
        valueFormatter: steerFormatter,
        mutators: STEER_MUTATORS,
        readout: SteeringAngleDisplay,
    },
    ers: { title: "ERS Deployment (Joules)", valueFormatter: ersFormatter },
    gear: {
        title: "Gear",
        valueFormatter: gearFormatter,
        stepped: true,
        deltaReadout: GearDeltaDisplay,
        mutators: GEAR_MUTATORS,
    },
    rpm: { title: "RPM", valueFormatter: rpmFormatter },
    frontSlip: {
        title: "Front Slip Ratio",
        mutators: SLIP_MUTATORS,
        valueFormatter: slipFormatter,
    },
    rearSlip: {
        title: "Rear Slip Ratio",
        mutators: SLIP_MUTATORS,
        valueFormatter: slipFormatter,
    },
};

export const CHANNEL_ORDER: TelemetryChannel[] = [
    "speed",
    "gas",
    "brake",
    "steer",
    "ers",
    "gear",
    "rpm",
    "frontSlip",
    "rearSlip",
];
