export interface IDeleteInstanceUseCase {
    execute(id: string, keepVolume: boolean): Promise<void>;
}