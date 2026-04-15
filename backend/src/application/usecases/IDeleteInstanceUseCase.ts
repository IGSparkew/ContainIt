

export interface IDeleteInstanceUseCase {
    execute(id: string, keepVolume: boolean) : void;
}