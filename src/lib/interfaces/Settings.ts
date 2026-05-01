import type Theme from "./Theme";
import type Stage from "./Stage";
import type {TimeType} from "../types/TimeType";

export default interface Settings {
    name: string;
    stages: Stage[];
    theme: Theme;
    activeStage: number;
    currentStageTime: number;

    showSettings: TimeType[];
    deltaTime: number;
    deltaTimeShowSetting: TimeType;


    appVersion: string;
}

