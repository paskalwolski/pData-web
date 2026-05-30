import { SVGProps } from "react";

interface WheelIconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    rotate: number;
}

export const WheelIcon = ({
    size = "1em",
    color = "currentColor",
    rotate = 0,
    ...props
}: WheelIconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        style={{ transform: `rotate(${rotate}deg)` }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M64 0C99.3462 0 128 28.6538 128 64C128 99.3462 99.3462 128 64 128C28.6538 128 0 99.3462 0 64C0 28.6538 28.6538 0 64 0ZM64 12C35.2812 12 12 35.2812 12 64C12 92.7188 35.2812 116 64 116C92.7188 116 116 92.7188 116 64C116 35.2812 92.7188 12 64 12Z"
            fill={color}
        />
        <circle cx="64" cy="64" r="16" fill={color} />
        <path d="M64 64L64 116" stroke={color} stroke-width="12" />
        <path d="M12 64L116 64" stroke={color} stroke-width="16" />
    </svg>
);
