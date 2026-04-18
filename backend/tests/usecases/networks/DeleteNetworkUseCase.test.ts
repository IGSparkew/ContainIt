import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteNetworkUseCase } from '../../../src/application/usecases/networks/impl/DeleteNetworkUseCase.js';
import type { INetworkRepository } from '../../../src/application/repositories/INetworkRepository.js';
import type { IInstanceRepository } from '../../../src/application/repositories/IInstanceRepository.js';
import type { IDockerPort } from '../../../src/application/repositories/IDockerPort.js';
import {
    makeNetworkRepoMock,
    makeInstanceRepoMock,
    makeDockerPortMock,
    makeNetwork,
    makeInstance,
} from '../../helpers/mocks.js';

describe('DeleteNetworkUseCase', () => {
    let networkRepo: INetworkRepository;
    let instanceRepo: IInstanceRepository;
    let dockerPort: IDockerPort;
    let usecase: DeleteNetworkUseCase;

    beforeEach(() => {
        networkRepo = makeNetworkRepoMock();
        instanceRepo = makeInstanceRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new DeleteNetworkUseCase(networkRepo, instanceRepo, dockerPort);
    });

    it('throws when network not found', async () => {
        (networkRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('missing')).rejects.toThrow(/not found/);
    });

    it('throws when network has real containers still connected', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork({ instance: ['c-1'] }));
        (instanceRepo.getAll as any).mockReturnValue([makeInstance({ containerId: 'c-1' })]);

        await expect(usecase.execute('net-1')).rejects.toThrow(/still connected/);
        expect(dockerPort.removeNetwork).not.toHaveBeenCalled();
    });

    it('removes docker network then repo entry when no containers', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork({ id: 'net-1', dockerId: 'd-1', instance: [] }));

        await usecase.execute('net-1');

        expect(dockerPort.removeNetwork).toHaveBeenCalledWith('d-1');
        expect(networkRepo.remove).toHaveBeenCalledWith('net-1');
    });

    it('cleans ghost references before deleting', async () => {
        (networkRepo.getById as any).mockReturnValue(
            makeNetwork({ id: 'net-1', dockerId: 'd-1', instance: ['ghost-1', 'ghost-2'] })
        );
        (instanceRepo.getAll as any).mockReturnValue([]);

        await usecase.execute('net-1');

        expect(networkRepo.update).toHaveBeenCalledWith('net-1', { instance: [] });
        expect(dockerPort.removeNetwork).toHaveBeenCalledWith('d-1');
        expect(networkRepo.remove).toHaveBeenCalledWith('net-1');
    });

    it('blocks deletion when mix of real and ghost containers — real still connected', async () => {
        (networkRepo.getById as any).mockReturnValue(
            makeNetwork({ instance: ['ghost-1', 'c-real'] })
        );
        (instanceRepo.getAll as any).mockReturnValue([makeInstance({ containerId: 'c-real' })]);

        await expect(usecase.execute('net-1')).rejects.toThrow(/still connected/);
        expect(networkRepo.update).not.toHaveBeenCalled();
    });
});
