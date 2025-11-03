import type {StageType} from "../types/StageTypes";

export default interface Stage {
    id: string;
    type: StageType;
    time: number;
    index: number;
}