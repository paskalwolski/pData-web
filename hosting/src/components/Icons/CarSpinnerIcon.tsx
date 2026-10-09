import { SVGProps } from "react";

interface CarSpinnerIconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    spinnerColor?: string;
    markColor?: string;
    duration?: number;
}

export const CarSpinnerIcon = ({
    size = "1em",
    color = "currentColor",
    spinnerColor = color,
    duration = 1,
    ...props
}: CarSpinnerIconProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 98.751 98.75"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        {/* Car body, facing right. The curve around the rear wheel is a single arc of
            radius 8.5 centred on the wheel, joined tangentially to the body's lower edge. */}
        <g fill={color}>
            <path d="M19.998 56.709 A8.5 8.5 0 0 0 16.628 46.666 L32.827 39.445 H42.976 c0.604 0 1.094 0.49 1.094 1.095 v1.438 c0 0.604 -0.489 1.095 -1.094 1.095 h-0.72 v0.997 h1.841 c0.579 0 1.096 0.371 1.277 0.921 L45.521 45.43 c3.351 -0.271 4.945 2.294 6.62 2.294 l1.131 -1.361 c0.674 -0.813 1.706 -1.241 2.758 -1.144 c0.32 0.03 0.661 0.094 1.008 0.211 l0.635 2.294 c0 0 5.759 -0.335 13.245 -0.066 c-1.648 1.537 -2.687 3.72 -2.687 6.146 c0 0.24 -0.039 5.32 -0.039 5.32 h-49.383 C19.785 57.936 19.727 57.462 19.998 56.709 z" />
            <path d="M85.056 53.801 c0 -1.928 -0.659 -3.699 -1.753 -5.12 C89.087 49.487 94.707 50.83 98.751 53.047 c0 1.176 -5.168 0.019 -5.168 2.448 H97.57 c0.402 0 0.728 0.325 0.728 0.728 v2.172 c0 0.402 -0.325 0.729 -0.728 0.729 h-9.969 c-0.403 0 -0.729 -0.326 -0.729 -0.729 v-3.354 h-1.922 c0.009 -0.062 0.024 -0.121 0.032 -0.185 C85.031 54.485 85.056 54.135 85.056 53.801 z" />
            <path d="M1.813 38.084 H12.467 c1.003 0 1.815 0.812 1.815 1.814 v2.376 c0 0.48 -0.191 0.942 -0.531 1.282 L11.892 45.303 A8.5 8.5 0 0 0 3.511 53.802 V54.135 H0 V39.899 C-0.001 38.896 0.812 38.084 1.813 38.084 z" />
        </g>

        {/* Rear wheel: spins */}
        <g transform="translate(12.011 53.802)">
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur={`${duration}s`}
                repeatCount="indefinite"
                additive="sum"
            />
            <circle r="6.866" fill={color} />
            {/* Concentric arc marker, 240 degrees, centred at the top (outer r=6, inner r=4) */}
            <path
                d="M -5.196 3 A 6 6 0 1 1 5.196 3 L 3.464 2 A 4 4 0 1 0 -3.464 2 Z"
                fill={spinnerColor}
            />
        </g>

        {/* Front wheel: plain, static */}
        <g transform="translate(76.645 53.802)">
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to={360}
                dur={`${duration}s`}
                repeatCount="indefinite"
                additive="sum"
            />
            <circle r="6.866" fill={color} />
            {/* Concentric arc marker, 240 degrees, centred at the top (outer r=6, inner r=4) */}
            <path
                d="M -5.196 3 A 6 6 0 1 1 5.196 3 L 3.464 2 A 4 4 0 1 0 -3.464 2 Z"
                fill={spinnerColor}
            />
        </g>
    </svg>
);
