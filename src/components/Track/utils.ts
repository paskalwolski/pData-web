export const bufferDomain = (domain) => [
    domain[0] - Math.abs(0.01 * domain[0]), // Make sure negative values are reduced
    domain[1] + Math.abs(domain[1] * 0.01),
]; // Expand by ~10%
