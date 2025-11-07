import type ColorTheme from "../interfaces/ColorTheme";

export function getColorThemes(): ColorTheme[] {
    return [
        {
            backgroundCol: "#021526",
            primaryColor: "#3f6c7a",
            secondaryColor: "#03346E",
            timerSecondaryColor: "#6EACDA",
            textColor: "#E2E2B6",
            name: "Space",
        },
        {
            backgroundCol: "#F0F0F0",
            primaryColor: "#4CAF50",
            secondaryColor: "#388E3C",
            timerSecondaryColor: "#81C784",
            textColor: "#212121",
            name: "Forest",
        },
        {
            backgroundCol: "#2C3E50",
            primaryColor: "#E74C3C",
            secondaryColor: "#C0392B",
            timerSecondaryColor: "#EC7063",
            textColor: "#ECF0F1",
            name: "Crimson",
        },
        {
            backgroundCol: "#cbeef3",
            primaryColor: "#f49cbb",
            secondaryColor: "#880d1e",
            timerSecondaryColor: "#f26a8d",
            textColor: "#df3755",
            name: "Sakura",
        },
        {
            backgroundCol: "#e7f0dc",
            primaryColor: "#a5be9a",
            secondaryColor: "#597445",
            timerSecondaryColor: "#bfd7a2",
            textColor: "#004000",
            name: "Grass",
        },
    ];
}