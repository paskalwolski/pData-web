import { useEffect, useRef, useState } from "react";

const useContainerSize = () => {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
            setHeight(entry.contentRect.height);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return [containerRef, width, height] as const;
};

export { useContainerSize };
