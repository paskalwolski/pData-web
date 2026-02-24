export const millisToRaceDuration = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    const milliseconds = millis % 1000;

    // Format the seconds to always have two digits
    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    // Format the milliseconds to always have three digits
    const formattedMilliseconds = milliseconds.toString().padStart(3, "0");

    return `${minutes}:${formattedSeconds}.${formattedMilliseconds}`;
};
