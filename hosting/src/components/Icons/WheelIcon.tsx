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
            d="M64 0C99.3462 0 128 28.6538 128 64C128 99.3462 99.3462 128 64 128C28.6538 128 0 99.3462 0 64C0 28.6538 28.6538 0 64 0ZM64 11C35.1339 11 11.7334 34.4005 11.7334 63.2666C11.7334 92.1327 35.1339 115.533 64 115.533C92.8661 115.533 116.267 92.1327 116.267 63.2666C116.267 34.4005 92.8661 11 64 11Z"
            fill={color}
        />
        <circle cx="64" cy="64" r="13.8667" fill={color} />
        <line
            x1="11.7333"
            y1="64.2667"
            x2="116.267"
            y2="64.2667"
            stroke={color}
            strokeWidth="8"
        />
        <line
            x1="63.7333"
            y1="64"
            x2="63.7333"
            y2="116.267"
            stroke={color}
            strokeWidth="8"
        />
    </svg>
);
