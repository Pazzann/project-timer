import type Settings from "../interfaces/Settings";
import {getColorThemes} from "./getColorThemes";
import packageJson from '../../../package.json' with { type: 'json' };

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
        {id: "Default1", time: 15000, index: 0, settings:{overlapBehaviour: "allow-overlap", canGoNegative: false}},
        {id: "Default2", time: 15000, index: 1, settings:{overlapBehaviour: "allow-overlap", canGoNegative: false}},
        {id: "Default3", time: 5000,  index: 2, settings:{overlapBehaviour: "allow-overlap", canGoNegative: false}},

    ],
    showSettings: ["h", "m", "s", "ms"],
    deltaTime: 100,
    deltaTimeShowSetting: "ms",
    currentStageTime: 0,
    activeStage: 0,
    appVersion: packageJson.version
}

export function getDefaultSettings() {
    return JSON.parse(JSON.stringify(defaultSettings)) as Settings;
}