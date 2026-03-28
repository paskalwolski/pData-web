import { useEffect, useRef, useState } from "react";

const useContainerWidth = () => {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return [containerRef, width] as const;
};

export { useContainerWidth };
