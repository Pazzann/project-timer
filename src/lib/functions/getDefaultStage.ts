import type Stage from "../interfaces/Stage";

export default function getDefaultStage(index:number): Stage {
    return {title: "Default", time: 15000,  index: index, settings: {overlapBehaviour: "allow-overlap", canGoNegative: false}};
}