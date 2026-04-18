import { describe, it, expect } from 'vitest';
import { GetNetworkByIdUseCase } from '../../../src/application/usecases/networks/impl/GetNetworkByIdUseCase.js';
import { makeNetworkRepoMock, makeNetwork } from '../../helpers/mocks.js';

describe('GetNetworkByIdUseCase', () => {
    it('returns the network when found', () => {
        const repo = makeNetworkRepoMock();
        const net = makeNetwork({ id: 'x' });
        (repo.getById as any).mockReturnValue(net);

        expect(new GetNetworkByIdUseCase(repo).execute('x')).toBe(net);
        expect(repo.getById).toHaveBeenCalledWith('x');
    });

    it('throws when not found', () => {
        const repo = makeNetworkRepoMock();
        expect(() => new GetNetworkByIdUseCase(repo).execute('missing')).toThrow(/not found/);
    });
});
