import { useTheme } from "@mui/material";
import { useTelemetryPointContext } from "../../hooks/TelemetryPointContext/useTelemetryPoint";
import { ChartSeries } from "./types";

interface Props {
    series: ChartSeries[];
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
}

const TelemetryCrosshair = ({ xScale, yScale, series }: Props) => {
    const { palette } = useTheme();
    const { selectedIndex } = useTelemetryPointContext();

    if (selectedIndex == null) return null;

    const x = xScale(selectedIndex);

    return (
        <g>
            <line
                x1={x}
                x2={x}
                y1={yScale.range()[0]}
                y2={yScale.range()[1]}
                stroke={palette.info.light}
                strokeWidth={2}
                strokeOpacity={0.4}
            />
            {series.map((s) => {
                const value = s.data[selectedIndex];
                if (s.hidden || value == null || !isFinite(value)) return null;
                return (
                    <circle
                        key={s.id}
                        cx={x}
                        cy={yScale(value)}
                        r={4}
                        fill={s.color}
                        fillOpacity={0.9}
                    />
                );
            })}
        </g>
    );
};

export { TelemetryCrosshair };
