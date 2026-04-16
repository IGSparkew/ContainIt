import { Stats } from "../../domain/models/stats.js";

export interface IGetInstanceStatsUseCase {
    execute(id: string): Promise<Stats>;
}
