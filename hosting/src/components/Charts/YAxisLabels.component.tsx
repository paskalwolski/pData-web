import * as d3 from "d3";
import { Typography, useTheme } from "@mui/material";

interface YAxisLabelsProps {
    yScale: d3.ScaleLinear<number, number, never>;
    min: number;
    max: number;
    width: number;
    leftPadding: number;
    padding: number;
    tick?: (min: number, max: number) => number[];
    subTick?: (min: number, max: number) => number[];
    formatLabel?: (v: number) => string;
}

const defaultTick = (min: number, max: number) => [min, max];

const defaultSubTick = (min: number, max: number) => {
    const ticks: number[] = [];
    for (let t = Math.ceil(min / 1000) * 1000; t <= max; t += 1000) {
        ticks.push(t);
    }
    return ticks;
};

const YAxisLabels = ({
    yScale,
    min,
    max,
    width,
    leftPadding,
    padding,
    tick = defaultTick,
    subTick = defaultSubTick,
    formatLabel,
}: YAxisLabelsProps) => {
    const { palette } = useTheme();

    const tickValues = tick(min, max);
    const subTickValues = subTick(min, max);

    return (
        <>
            {subTickValues.map((t) => (
                <line
                    key={`sub-${t}`}
                    x1={leftPadding}
                    x2={width - padding}
                    y1={yScale(t)}
                    y2={yScale(t)}
                    stroke={palette.divider}
                    strokeWidth={1}
                />
            ))}
            {tickValues.map((t) => (
                <Typography
                    key={`tick-${t}`}
                    component="text"
                    variant="caption"
                    x={leftPadding - 6}
                    y={yScale(t)}
                    textAnchor="end"
                    dominantBaseline={t === max ? "hanging" : "auto"}
                    fill={palette.text.secondary}
                >
                    {formatLabel?.(t) ?? t}
                </Typography>
            ))}
        </>
    );
};

export { YAxisLabels };
