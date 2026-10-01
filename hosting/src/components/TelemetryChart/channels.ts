import { SteeringAngleDisplay } from "../CustomTelemetry/SteeringAngleDisplay";
import { invert } from "../../helpers/telemetryMutators";
import {
    ersFormatter,
    gearFormatter,
    pedalFormatter,
    rpmFormatter,
    speedFormatter,
    steerFormatter,
} from "../../helpers/telemetryValueFormatter";
import { TelemetryChannel, TelemetryChannelConfig } from "./types";

const STEER_MUTATORS = [invert];

export const CHANNEL_CONFIG: Record<TelemetryChannel, TelemetryChannelConfig> =
    {
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
        gear: { title: "Gear", valueFormatter: gearFormatter, stepped: true },
        rpm: { title: "RPM", valueFormatter: rpmFormatter },
    };

export const CHANNEL_ORDER: TelemetryChannel[] = [
    "speed",
    "gas",
    "brake",
    "steer",
    "ers",
    "gear",
    "rpm",
];
