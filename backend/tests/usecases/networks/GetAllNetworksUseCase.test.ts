import { describe, it, expect } from 'vitest';
import { GetAllNetworksUseCase } from '../../../src/application/usecases/networks/impl/GetAllNetworksUseCase.js';
import { makeNetworkRepoMock, makeNetwork } from '../../helpers/mocks.js';

describe('GetAllNetworksUseCase', () => {
    it('returns all networks from the repository', () => {
        const repo = makeNetworkRepoMock();
        const list = [makeNetwork({ id: 'a' }), makeNetwork({ id: 'b' })];
        (repo.getAll as any).mockReturnValue(list);

        const result = new GetAllNetworksUseCase(repo).execute();

        expect(result).toEqual(list);
    });

    it('returns empty array when no networks', () => {
        const repo = makeNetworkRepoMock();
        expect(new GetAllNetworksUseCase(repo).execute()).toEqual([]);
    });
});
