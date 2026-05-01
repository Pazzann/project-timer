import type Settings from "../interfaces/Settings";
import {getColorThemes} from "./getColorThemes";

const defaultSettings: Settings = {
    theme: {
        colorTheme: getColorThemes()[5],
        timerType: "radial",
        fontFamily: "Segoe UI",
        buttonStyle: "default",
        iconPack: "default"
    },
    name: "Default Timer",
    stages: [
        {id: "Default1", time: 15000, type: "allow-overlap", index: 0},
        {id: "Default2", time: 15000, type: "allow-overlap", index: 1},
        {id: "Default3", time: 5000, type: "allow-overlap", index: 2},

    ],
    showSettings: ["h", "m", "s", "ms"],
    deltaTime: 100,
    deltaTimeShowSetting: "ms",
    currentStageTime: 0,
    activeStage: 0,
    appVersion: "2.0.0"
}

export function getDefaultSettings() {
    return JSON.parse(JSON.stringify(defaultSettings)) as Settings;
}