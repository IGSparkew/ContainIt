export interface IDeleteNetworkUseCase {
    execute(id: string): Promise<void>;
}
