import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteNetworkUseCase } from '../../../src/application/usecases/networks/impl/DeleteNetworkUseCase.js';
import type { INetworkRepository } from '../../../src/application/repositories/INetworkRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import { makeNetworkRepoMock, makeDockerPortMock, makeNetwork } from '../../helpers/mocks.js';

describe('DeleteNetworkUseCase', () => {
    let networkRepo: INetworkRepository;
    let dockerPort: IDockerPort;
    let usecase: DeleteNetworkUseCase;

    beforeEach(() => {
        networkRepo = makeNetworkRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new DeleteNetworkUseCase(networkRepo, dockerPort);
    });

    it('throws when network not found', async () => {
        (networkRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('missing')).rejects.toThrow(/not found/);
    });

    it('throws when network still has connected containers', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork({ instance: ['a', 'b'] }));
        await expect(usecase.execute('net-1')).rejects.toThrow(/still connected/);
        expect(dockerPort.removeNetwork).not.toHaveBeenCalled();
    });

    it('removes docker network then repo entry', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork({ id: 'net-1', dockerId: 'd-1', instance: [] }));

        await usecase.execute('net-1');

        expect(dockerPort.removeNetwork).toHaveBeenCalledWith('d-1');
        expect(networkRepo.remove).toHaveBeenCalledWith('net-1');
    });
});
