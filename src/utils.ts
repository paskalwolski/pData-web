export const millisToRaceDuration = (millis) => {
    let minutes = Math.floor(millis / 60000);
    let seconds = Math.floor((millis % 60000) / 1000);
    let milliseconds = millis % 1000;

    // Format the seconds to always have two digits
    let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

    // Format the milliseconds to always have three digits
    let formattedMilliseconds = milliseconds.toString().padStart(3, "0");

    return `${minutes}:${formattedSeconds}.${formattedMilliseconds}`;
};
