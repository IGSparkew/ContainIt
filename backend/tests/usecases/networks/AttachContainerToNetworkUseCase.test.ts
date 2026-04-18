import { describe, it, expect, beforeEach } from 'vitest';
import { AttachContainerToNetworkUseCase } from '../../../src/application/usecases/networks/impl/AttachContainerToNetworkUseCase.js';
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

describe('AttachContainerToNetworkUseCase', () => {
    let networkRepo: INetworkRepository;
    let instanceRepo: IInstanceRepository;
    let dockerPort: IDockerPort;
    let usecase: AttachContainerToNetworkUseCase;

    beforeEach(() => {
        networkRepo = makeNetworkRepoMock();
        instanceRepo = makeInstanceRepoMock();
        dockerPort = makeDockerPortMock();
        usecase = new AttachContainerToNetworkUseCase(networkRepo, instanceRepo, dockerPort);
    });

    it('throws when network not found', async () => {
        (networkRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('net-missing', 'inst-1')).rejects.toThrow(/Network.*not found/);
    });

    it('throws when instance not found', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork());
        (instanceRepo.getById as any).mockReturnValue(undefined);
        await expect(usecase.execute('net-1', 'inst-missing')).rejects.toThrow(/Instance.*not found/);
    });

    it('throws when instance already attached', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork({ instance: ['inst-1'] }));
        (instanceRepo.getById as any).mockReturnValue(makeInstance({ id: 'inst-1' }));
        await expect(usecase.execute('net-1', 'inst-1')).rejects.toThrow(/already attached/);
    });

    it('connects container then attaches via repo', async () => {
        (networkRepo.getById as any).mockReturnValue(makeNetwork({ dockerId: 'd-1', instance: [] }));
        (instanceRepo.getById as any).mockReturnValue(makeInstance({ id: 'inst-1', containerId: 'c-1' }));

        await usecase.execute('net-1', 'inst-1');

        expect(dockerPort.connectContainer).toHaveBeenCalledWith('d-1', 'c-1');
        expect(networkRepo.attachContainer).toHaveBeenCalledWith('net-1', 'inst-1');
    });
});
