import type {OverlapBehaviour} from "../types/OverlapBehaviour";
import type StageSettings from "./StageSettings";

export default interface Stage {
    id: string;
    settings: StageSettings;
    time: number;
    index: number;
}