import type {TimerType} from "../types/TimerType";

export default interface Theme {
    backgroundCol: string;
    primaryColor: string;
    secondaryColor: string;
    timerSecondaryColor: string;
    textColor: string;
    timerType: TimerType;
}