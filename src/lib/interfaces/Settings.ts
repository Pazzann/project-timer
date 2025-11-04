import type Theme from "./Theme";
import type Stage from "./Stage";

export default interface Settings {
    name: string;
    stages: Stage[];
    theme: Theme;
    activeStage: number;
    currentStageTime: number;
    showSettings: string[];
}

