import type {OverlapBehaviour} from "../types/OverlapBehaviour";

export default interface StageSettings {
    overlapBehaviour: OverlapBehaviour;
    canGoNegative: boolean;
}