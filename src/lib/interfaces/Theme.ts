import type {TimerType} from "../types/TimerType";
import type ColorTheme from "./ColorTheme";

export default interface Theme {
    colorTheme: ColorTheme;
    timerType: TimerType;
    //fontsize
    fontFamily: string;
    buttonStyle: "default" | "minimal" | "material" | "glass" | "neumorphism" | "retro";
    iconPack: "default" | "material";
}