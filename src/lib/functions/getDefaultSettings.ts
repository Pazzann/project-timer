import type Settings from "../interfaces/Settings";

const defaultSettings: Settings = {
    theme: {
        backgroundCol: "#021526",
        primaryColor: "#3f6c7a",
        secondaryColor: "#03346E",
        timerSecondaryColor: "#6EACDA",
        textColor: "#E2E2B6",
        timerType: "radial",
        fontFamily: "Segoe UI"
    },
    name: "Default Timer",
    stages: [
        {id: "Default1", time: 15000, type: "allow-overlap", index: 0},
        {id: "Default2", time: 15000, type: "allow-overlap", index: 1},
        {id: "Default3", time: 5000, type: "allow-overlap", index: 2},

    ],
    showSettings: ["h", "m", "s", "ms"],
    currentStageTime: 0,
    activeStage: 0
}

export function getDefaultSettings() {
    return JSON.parse(JSON.stringify(defaultSettings)) as Settings;
}