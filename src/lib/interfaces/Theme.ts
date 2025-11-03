export default interface Theme {
    backgroundCol: string;
    primaryColor: string;
    secondaryColor: string;
    timerSecondaryColor: string;
    textColor: string;
    timerType: "radial" | "number" | "linear";
}