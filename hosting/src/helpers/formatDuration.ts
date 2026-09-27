const formatDuration = (ms: number, opts?: { milliPrecision?: number }): string => {
    const milliPrecision = opts?.milliPrecision ?? 3;
    const unit = 10 ** (3 - milliPrecision);
    const rounded = Math.round(ms / unit) * unit;

    const minutes = Math.floor(rounded / 60000);
    const seconds = Math.floor((rounded % 60000) / 1000);

    let value = `${minutes}:${String(seconds).padStart(2, "0")}`;
    if (milliPrecision > 0) {
        const millis = Math.floor((rounded % 1000) / unit);
        value += `.${String(millis).padStart(milliPrecision, "0")}`;
    }

    return value;
};

export { formatDuration };
