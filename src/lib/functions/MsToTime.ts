export function MsToTime(s: number, showSett: string[]): string {

    // Pad to 2 or 3 digits, default is 2
    function pad(n: number,  z: number = 2): string {
        n = +n;
        return ('00' + n).slice(-z);
    }

    let ms = s % 1000/10;
    s = (s - ms* 10) / 1000;
    ms = Math.floor(ms);
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    return (showSett.includes("h") ? pad(hrs) + 'h' : "") +
            (showSett.includes("m") ?  pad(mins) + 'm' : "") +
            (showSett.includes("s") ?  pad(secs) + "s" : "") +
            (showSett.includes("ms") ?  pad(ms) + "ms": "");
}