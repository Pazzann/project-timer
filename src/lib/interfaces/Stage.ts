import type {OverlapBehaviour} from "../types/OverlapBehaviour";
import type StageSettings from "./StageSettings";

export default interface Stage {
    title: string;
    settings: StageSettings;
    time: number;
    index: number;
}