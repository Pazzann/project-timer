import type {StageType} from "./StageTypes";

export default interface Stage {
    id: string;
    type: StageType;
    time: number;
    index: number;
}